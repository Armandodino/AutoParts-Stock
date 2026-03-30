import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des catégories' }, { status: 500 })
  }
}

// POST - Create category
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const category = await db.category.create({
      data: {
        name: data.name,
        description: data.description || null,
        color: data.color || '#6b7280',
        icon: data.icon || null,
        parentId: data.parentId || null
      }
    })
    
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de la catégorie' }, { status: 500 })
  }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    const category = await db.category.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description || null,
        color: data.color || '#6b7280',
        icon: data.icon || null,
        parentId: data.parentId || null
      }
    })
    
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la modification de la catégorie' }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    await db.category.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Catégorie supprimée' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression de la catégorie' }, { status: 500 })
  }
}
