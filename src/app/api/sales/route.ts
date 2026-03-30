import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - List all sales (requires auth)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const userId = searchParams.get('userId')
    
    const where: any = {}
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    if (userId) {
      where.userId = userId
    }
    
    const sales = await db.sale.findMany({
      where,
      include: {
        client: true,
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
    
    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des ventes' }, { status: 500 })
  }
}

// POST - Create sale (requires auth)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  try {
    const data = await request.json()
    const settings = await db.setting.findFirst()
    
    // Validate items
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: 'Aucun article dans la vente' }, { status: 400 })
    }
    
    // Validate each item
    for (const item of data.items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return NextResponse.json({ error: 'Données d\'article invalides' }, { status: 400 })
      }
    }
    
    // Generate invoice number
    const count = await db.sale.count()
    const invoiceNumber = `${settings?.invoicePrefix || 'FAC'}-${String(count + 1).padStart(6, '0')}`
    
    // Calculate totals
    const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0)
    const taxAmount = settings?.taxEnabled ? subtotal * (settings.taxRate / 100) : 0
    const discount = Math.max(0, parseFloat(data.discount) || 0)
    const total = subtotal + taxAmount - discount
    
    // Validate stock availability
    for (const item of data.items) {
      const product = await db.product.findUnique({
        where: { id: item.productId }
      })
      
      if (!product) {
        return NextResponse.json({ error: `Produit non trouvé: ${item.productId}` }, { status: 400 })
      }
      
      if (product.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Stock insuffisant pour "${product.name}". Disponible: ${product.stock}` 
        }, { status: 400 })
      }
    }
    
    // Create sale
    const sale = await db.sale.create({
      data: {
        invoiceNumber,
        clientId: data.clientId || null,
        userId: user.id,
        subtotal,
        discount,
        tax: taxAmount,
        total,
        paymentMethod: data.paymentMethod || 'cash',
        paymentStatus: data.paymentStatus || 'paid',
        notes: data.notes || null,
        items: {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: Math.max(1, parseInt(item.quantity) || 1),
            unitPrice: Math.max(0, parseFloat(item.unitPrice) || 0),
            discount: Math.max(0, parseFloat(item.discount) || 0),
            total: parseFloat(item.unitPrice) * parseInt(item.quantity)
          }))
        }
      },
      include: {
        client: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    // Update stock and create stock movements
    for (const item of data.items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
      
      await db.stockMovement.create({
        data: {
          productId: item.productId,
          type: 'exit',
          quantity: item.quantity,
          reason: 'Vente',
          reference: sale.id,
          userId: user.id
        }
      })
    }
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: user.id,
          action: 'create',
          entity: 'sale',
          entityId: sale.id,
          details: `Vente créée: ${invoiceNumber}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json(sale)
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de la vente' }, { status: 500 })
  }
}

// PUT - Update sale status (admin/manager only)
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
    
    const sale = await db.sale.update({
      where: { id: data.id },
      data: {
        paymentStatus: data.paymentStatus,
        notes: data.notes
      },
      include: {
        client: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: user.id,
          action: 'update',
          entity: 'sale',
          entityId: sale.id,
          details: `Vente modifiée: ${sale.invoiceNumber}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json(sale)
  } catch (error) {
    console.error('Error updating sale:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification de la vente' }, { status: 500 })
  }
}
