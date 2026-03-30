import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List all units
export async function GET() {
  try {
    const units = await db.unit.findMany({
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(units)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des unités' }, { status: 500 })
  }
}

// POST - Create unit
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const unit = await db.unit.create({
      data: {
        name: data.name,
        abbreviation: data.abbreviation
      }
    })
    
    return NextResponse.json(unit)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de l\'unité' }, { status: 500 })
  }
}

// DELETE - Delete unit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    await db.unit.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Unité supprimée' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression de l\'unité' }, { status: 500 })
  }
}
