import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - List all purchases (requires auth)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  try {
    const purchases = await db.purchase.findMany({
      include: {
        supplier: true,
        user: true,
        items: {
          include: {
            product: {
              include: {
                category: true,
                unit: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    
    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Error fetching purchases:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des achats' }, { status: 500 })
  }
}

// POST - Create purchase (admin/manager only)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (user.role !== 'admin' && user.role !== 'manager') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }
  
  try {
    const data = await request.json()
    const settings = await db.setting.findFirst()
    
    // Validate items
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: 'Aucun article dans l\'achat' }, { status: 400 })
    }
    
    // Generate purchase number
    const count = await db.purchase.count()
    const purchaseNumber = `${settings?.purchasePrefix || 'ACH'}-${String(count + 1).padStart(6, '0')}`
    
    // Calculate totals
    const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0)
    const taxAmount = settings?.taxEnabled ? subtotal * (settings.taxRate / 100) : 0
    const total = subtotal + taxAmount
    
    // Create purchase
    const purchase = await db.purchase.create({
      data: {
        purchaseNumber,
        supplierId: data.supplierId || null,
        userId: user.id,
        subtotal,
        tax: taxAmount,
        total,
        status: data.status || 'pending',
        paymentStatus: data.paymentStatus || 'pending',
        notes: data.notes || null,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: Math.max(1, parseInt(item.quantity) || 1),
            unitPrice: Math.max(0, parseFloat(item.unitPrice) || 0),
            total: parseFloat(item.unitPrice) * parseInt(item.quantity)
          }))
        }
      },
      include: {
        supplier: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    // If received, update stock
    if (data.status === 'received') {
      for (const item of data.items) {
        await db.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
        
        await db.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'entry',
            quantity: item.quantity,
            reason: 'Achat',
            reference: purchase.id,
            userId: user.id
          }
        })
      }
    }
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: user.id,
          action: 'create',
          entity: 'purchase',
          entityId: purchase.id,
          details: `Achat créé: ${purchaseNumber}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Error creating purchase:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de l\'achat' }, { status: 500 })
  }
}

// PUT - Update purchase status (admin/manager only)
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (user.role !== 'admin' && user.role !== 'manager') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }
  
  try {
    const data = await request.json()
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    const previousPurchase = await db.purchase.findUnique({
      where: { id: data.id },
      include: { items: true }
    })
    
    const purchase = await db.purchase.update({
      where: { id: data.id },
      data: {
        status: data.status,
        paymentStatus: data.paymentStatus
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    // If status changed to received, update stock
    if (data.status === 'received' && previousPurchase?.status !== 'received') {
      for (const item of purchase.items) {
        await db.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
        
        await db.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'entry',
            quantity: item.quantity,
            reason: 'Réception achat',
            reference: purchase.id,
            userId: user.id
          }
        })
      }
    }
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: user.id,
          action: 'update',
          entity: 'purchase',
          entityId: purchase.id,
          details: `Achat modifié: ${purchase.purchaseNumber}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json(purchase)
  } catch (error) {
    console.error('Error updating purchase:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification de l\'achat' }, { status: 500 })
  }
}
