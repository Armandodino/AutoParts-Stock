import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - List all products (requires auth)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const lowStock = searchParams.get('lowStock') === 'true'
    const oemSearch = searchParams.get('oem') || ''
    const brandSearch = searchParams.get('brand') || ''
    
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { barcode: { contains: search } },
        { oemNumber: { contains: search } },
        { oemNumbers: { contains: search } }
      ]
    }

    if (oemSearch) {
      where.OR = [
        { oemNumber: { contains: oemSearch } },
        { oemNumbers: { contains: oemSearch } }
      ]
    }

    if (brandSearch) {
      where.brand = { contains: brandSearch }
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        unit: true
      },
      orderBy: { name: 'asc' }
    })
    
    let result = products
    
    if (lowStock) {
      result = products.filter(p => p.stock <= p.minStock)
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des produits' }, { status: 500 })
  }
}

// POST - Create product (admin/manager only)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (user.role !== 'admin' && user.role !== 'manager') {
    return NextResponse.json({ error: 'Accès refusé - Admin ou Manager requis' }, { status: 403 })
  }
  
  try {
    const data = await request.json()
    
    // Input validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      return NextResponse.json({ error: 'Le nom du produit est requis' }, { status: 400 })
    }
    
    if (!data.sku || typeof data.sku !== 'string' || data.sku.trim().length === 0) {
      return NextResponse.json({ error: 'Le SKU est requis' }, { status: 400 })
    }
    
    if (data.name.length > 200) {
      return NextResponse.json({ error: 'Le nom est trop long (max 200 caractères)' }, { status: 400 })
    }
    
    if (data.sku.length > 50) {
      return NextResponse.json({ error: 'Le SKU est trop long (max 50 caractères)' }, { status: 400 })
    }
    
    // Check if SKU already exists
    const existingSku = await db.product.findUnique({
      where: { sku: data.sku.trim() }
    })
    
    if (existingSku) {
      return NextResponse.json({ error: 'Ce SKU existe déjà' }, { status: 400 })
    }
    
    // Check barcode if provided
    if (data.barcode) {
      const existingBarcode = await db.product.findUnique({
        where: { barcode: data.barcode.trim() }
      })
      
      if (existingBarcode) {
        return NextResponse.json({ error: 'Ce code-barres existe déjà' }, { status: 400 })
      }
    }
    
    const product = await db.product.create({
      data: {
        name: data.name.trim(),
        sku: data.sku.trim(),
        barcode: data.barcode?.trim() || null,
        description: data.description?.trim() || null,
        categoryId: data.categoryId || null,
        unitId: data.unitId || null,
        purchasePrice: Math.max(0, parseFloat(data.purchasePrice) || 0),
        sellingPrice: Math.max(0, parseFloat(data.sellingPrice) || 0),
        stock: Math.max(0, parseInt(data.stock) || 0),
        minStock: Math.max(0, parseInt(data.minStock) || 10),
        maxStock: data.maxStock ? Math.max(0, parseInt(data.maxStock)) : null,
        image: data.image || null,
        isActive: data.isActive ?? true,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        // Champs pièces automobiles
        oemNumber: data.oemNumber?.trim() || null,
        oemNumbers: data.oemNumbers?.trim() || null,
        brand: data.brand?.trim() || null,
        compatibility: data.compatibility?.trim() || null,
        warrantyMonths: data.warrantyMonths ? parseInt(data.warrantyMonths) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        location: data.location?.trim() || null
      },
      include: {
        category: true,
        unit: true
      }
    })
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: user.id,
          action: 'create',
          entity: 'product',
          entityId: product.id,
          details: `Produit créé: ${product.name}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Erreur lors de la création du produit' }, { status: 500 })
  }
}

// PUT - Update product (admin/manager only)
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (user.role !== 'admin' && user.role !== 'manager') {
    return NextResponse.json({ error: 'Accès refusé - Admin ou Manager requis' }, { status: 403 })
  }
  
  try {
    const data = await request.json()
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID du produit requis' }, { status: 400 })
    }
    
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name?.trim()
    if (data.sku !== undefined) updateData.sku = data.sku?.trim()
    if (data.barcode !== undefined) updateData.barcode = data.barcode?.trim() || null
    if (data.description !== undefined) updateData.description = data.description?.trim() || null
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null
    if (data.unitId !== undefined) updateData.unitId = data.unitId || null
    if (data.purchasePrice !== undefined) updateData.purchasePrice = Math.max(0, parseFloat(data.purchasePrice) || 0)
    if (data.sellingPrice !== undefined) updateData.sellingPrice = Math.max(0, parseFloat(data.sellingPrice) || 0)
    if (data.minStock !== undefined) updateData.minStock = Math.max(0, parseInt(data.minStock) || 10)
    if (data.maxStock !== undefined) updateData.maxStock = data.maxStock ? Math.max(0, parseInt(data.maxStock)) : null
    if (data.image !== undefined) updateData.image = data.image || null
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate) : null
    // Champs pièces automobiles
    if (data.oemNumber !== undefined) updateData.oemNumber = data.oemNumber?.trim() || null
    if (data.oemNumbers !== undefined) updateData.oemNumbers = data.oemNumbers?.trim() || null
    if (data.brand !== undefined) updateData.brand = data.brand?.trim() || null
    if (data.compatibility !== undefined) updateData.compatibility = data.compatibility?.trim() || null
    if (data.warrantyMonths !== undefined) updateData.warrantyMonths = data.warrantyMonths ? parseInt(data.warrantyMonths) : null
    if (data.weight !== undefined) updateData.weight = data.weight ? parseFloat(data.weight) : null
    if (data.location !== undefined) updateData.location = data.location?.trim() || null
    
    const product = await db.product.update({
      where: { id: data.id },
      data: updateData,
      include: {
        category: true,
        unit: true
      }
    })
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: user.id,
          action: 'update',
          entity: 'product',
          entityId: product.id,
          details: `Produit modifié: ${product.name}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification du produit' }, { status: 500 })
  }
}

// DELETE - Delete product (admin only)
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    const product = await db.product.findUnique({
      where: { id }
    })
    
    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }
    
    await db.product.delete({
      where: { id }
    })
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: user.id,
          action: 'delete',
          entity: 'product',
          entityId: id,
          details: `Produit supprimé: ${product.name}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json({ message: 'Produit supprimé' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression du produit' }, { status: 500 })
  }
}
