import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all suppliers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } }
      ]
    } : {}
    
    const suppliers = await db.supplier.findMany({
      where,
      include: {
        _count: {
          select: { purchases: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(suppliers)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des fournisseurs' }, { status: 500 })
  }
}

// POST - Create supplier
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const supplier = await db.supplier.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        notes: data.notes || null
      }
    })
    
    return NextResponse.json(supplier)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création du fournisseur' }, { status: 500 })
  }
}

// PUT - Update supplier
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    const supplier = await db.supplier.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || null,
        notes: data.notes || null
      }
    })
    
    return NextResponse.json(supplier)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la modification du fournisseur' }, { status: 500 })
  }
}

// DELETE - Delete supplier
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    await db.supplier.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Fournisseur supprimé' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression du fournisseur' }, { status: 500 })
  }
}
