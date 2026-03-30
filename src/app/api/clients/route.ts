import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - List all clients (requires auth)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
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
    
    const clients = await db.client.findMany({
      where,
      include: {
        _count: {
          select: { sales: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des clients' }, { status: 500 })
  }
}

// POST - Create client (requires auth)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  try {
    const data = await request.json()
    
    // Input validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      return NextResponse.json({ error: 'Le nom du client est requis' }, { status: 400 })
    }
    
    if (data.name.length > 200) {
      return NextResponse.json({ error: 'Le nom est trop long' }, { status: 400 })
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ error: 'Email inval' }, { status: 400 })
    }
    
    const client = await db.client.create({
      data: {
        name: data.name.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        country: data.country?.trim() || null,
        notes: data.notes?.trim() || null
      }
    })
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: user.id,
          action: 'create',
          entity: 'client',
          entityId: client.id,
          details: `Client créé: ${client.name}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json(client)
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du client' }, { status: 500 })
  }
}

// PUT - Update client (requires auth)
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  try {
    const data = await request.json()
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ error: 'Email inval' }, { status: 400 })
    }
    
    const client = await db.client.update({
      where: { id: data.id },
      data: {
        name: data.name?.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        city: data.city?.trim() || null,
        country: data.country?.trim() || null,
        notes: data.notes?.trim() || null
      }
    })
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: user.id,
          action: 'update',
          entity: 'client',
          entityId: client.id,
          details: `Client modifié: ${client.name}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification du client' }, { status: 500 })
  }
}

// DELETE - Delete client (admin/manager only)
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (user.role !== 'admin' && user.role !== 'manager') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    const client = await db.client.findUnique({ where: { id } })
    
    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }
    
    await db.client.delete({ where: { id } })
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: user.id,
          action: 'delete',
          entity: 'client',
          entityId: id,
          details: `Client supprimé: ${client.name}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json({ message: 'Client supprimé' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du client' }, { status: 500 })
  }
}
