import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - List all vehicle brands with models
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  try {
    const brands = await db.vehicleBrand.findMany({
      where: { isActive: true },
      include: {
        models: {
          where: { isActive: true },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(brands)
  } catch (error) {
    console.error('Error fetching vehicle brands:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des marques' }, { status: 500 })
  }
}

// POST - Create vehicle brand (admin only)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 })
  }
  
  try {
    const data = await request.json()
    
    if (data.type === 'brand') {
      const brand = await db.vehicleBrand.create({
        data: {
          name: data.name.trim(),
          logo: data.logo || null
        }
      })
      return NextResponse.json(brand)
    } else if (data.type === 'model') {
      const model = await db.vehicleModel.create({
        data: {
          name: data.name.trim(),
          brandId: data.brandId,
          yearStart: data.yearStart || null,
          yearEnd: data.yearEnd || null
        },
        include: { brand: true }
      })
      return NextResponse.json(model)
    }
    
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}

// DELETE - Delete vehicle brand or model (admin only)
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    if (type === 'brand') {
      await db.vehicleBrand.delete({ where: { id } })
    } else if (type === 'model') {
      await db.vehicleModel.delete({ where: { id } })
    }
    
    return NextResponse.json({ message: 'Supprimé avec succès' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
