import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List stock movements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const type = searchParams.get('type')
    
    const where: any = {}
    
    if (productId) {
      where.productId = productId
    }
    
    if (type) {
      where.type = type
    }
    
    const movements = await db.stockMovement.findMany({
      where,
      include: {
        product: {
          include: {
            category: true,
            unit: true
          }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
    
    return NextResponse.json(movements)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des mouvements de stock' }, { status: 500 })
  }
}

// POST - Create stock movement (manual adjustment)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Create movement
    const movement = await db.stockMovement.create({
      data: {
        productId: data.productId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason || null,
        reference: data.reference || null,
        userId: data.userId || null
      },
      include: {
        product: true,
        user: true
      }
    })
    
    // Update product stock
    const product = await db.product.findUnique({
      where: { id: data.productId }
    })
    
    if (product) {
      let newStock = product.stock
      
      if (data.type === 'entry') {
        newStock += data.quantity
      } else if (data.type === 'exit') {
        newStock -= data.quantity
      } else if (data.type === 'adjustment') {
        newStock = data.quantity // Set to exact value
      }
      
      await db.product.update({
        where: { id: data.productId },
        data: { stock: newStock }
      })
    }
    
    // Log activity
    await db.activity.create({
      data: {
        userId: data.userId,
        action: data.type,
        entity: 'stock',
        entityId: data.productId,
        details: `Mouvement de stock: ${data.type} de ${data.quantity}`
      }
    })
    
    return NextResponse.json(movement)
  } catch (error) {
    console.error('Error creating stock movement:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du mouvement de stock' }, { status: 500 })
  }
}
