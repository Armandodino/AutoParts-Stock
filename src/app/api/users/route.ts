import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/lib/auth'
import { randomUUID } from 'crypto'

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 })
  }
  
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 })
  }
}

// POST - Create user (admin only)
export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser(request)
  
  if (!currentUser) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 })
  }
  
  try {
    const data = await request.json()
    
    // Input validation
    if (!data.username || typeof data.username !== 'string' || data.username.trim().length < 3) {
      return NextResponse.json({ error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' }, { status: 400 })
    }
    
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ error: 'Email inval' }, { status: 400 })
    }
    
    // Check if username exists
    const existingUsername = await db.user.findUnique({
      where: { username: data.username.toLowerCase() }
    })
    
    if (existingUsername) {
      return NextResponse.json({ error: 'Ce nom d\'utilisateur existe déjà' }, { status: 400 })
    }
    
    // Check if email exists
    const existingEmail = await db.user.findUnique({
      where: { email: data.email.toLowerCase() }
    })
    
    if (existingEmail) {
      return NextResponse.json({ error: 'Cet email existe déjà' }, { status: 400 })
    }
    
    // Generate secure random password if not provided
    const password = data.password || randomUUID().slice(0, 12) + '!Aa'
    
    // Validate password strength if provided
    if (data.password) {
      if (data.password.length < 8) {
        return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
      }
      
      const hasUpper = /[A-Z]/.test(data.password)
      const hasLower = /[a-z]/.test(data.password)
      const hasNumber = /[0-9]/.test(data.password)
      
      if (!hasUpper || !hasLower || !hasNumber) {
        return NextResponse.json({ 
          error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' 
        }, { status: 400 })
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Validate role
    const validRoles = ['admin', 'manager', 'cashier']
    const role = validRoles.includes(data.role) ? data.role : 'cashier'
    
    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        password: hashedPassword,
        name: data.name?.trim() || null,
        role,
        avatar: data.avatar || null,
        isActive: data.isActive ?? true
      }
    })
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: currentUser.id,
          action: 'create',
          entity: 'user',
          entityId: user.id,
          details: `Utilisateur créé: ${user.username}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      generatedPassword: data.password ? undefined : password
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de l\'utilisateur' }, { status: 500 })
  }
}

// PUT - Update user (admin only)
export async function PUT(request: NextRequest) {
  const currentUser = await getCurrentUser(request)
  
  if (!currentUser) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 })
  }
  
  try {
    const data = await request.json()
    
    if (!data.id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    // Prevent deactivating own account
    if (data.id === currentUser.id && data.isActive === false) {
      return NextResponse.json({ error: 'Vous ne pouvez pas désactiver votre propre compte' }, { status: 400 })
    }
    
    const updateData: any = {}
    
    if (data.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return NextResponse.json({ error: 'Email inval' }, { status: 400 })
      }
      
      const existingEmail = await db.user.findFirst({
        where: { 
          email: data.email.toLowerCase(),
          NOT: { id: data.id }
        }
      })
      
      if (existingEmail) {
        return NextResponse.json({ error: 'Cet email existe déjà' }, { status: 400 })
      }
      
      updateData.email = data.email.toLowerCase()
    }
    
    if (data.username) {
      if (data.username.length < 3) {
        return NextResponse.json({ error: 'Le nom d\'utilisateur doit contenir au moins 3 caractères' }, { status: 400 })
      }
      
      const existingUsername = await db.user.findFirst({
        where: { 
          username: data.username.toLowerCase(),
          NOT: { id: data.id }
        }
      })
      
      if (existingUsername) {
        return NextResponse.json({ error: 'Ce nom d\'utilisateur existe déjà' }, { status: 400 })
      }
      
      updateData.username = data.username.toLowerCase()
    }
    
    if (data.name !== undefined) updateData.name = data.name?.trim() || null
    if (data.role) {
      const validRoles = ['admin', 'manager', 'cashier']
      if (validRoles.includes(data.role)) {
        updateData.role = data.role
      }
    }
    if (data.avatar !== undefined) updateData.avatar = data.avatar || null
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    
    if (data.password) {
      if (data.password.length < 8) {
        return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
      }
      
      const hasUpper = /[A-Z]/.test(data.password)
      const hasLower = /[a-z]/.test(data.password)
      const hasNumber = /[0-9]/.test(data.password)
      
      if (!hasUpper || !hasLower || !hasNumber) {
        return NextResponse.json({ 
          error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' 
        }, { status: 400 })
      }
      
      updateData.password = await bcrypt.hash(data.password, 12)
    }
    
    const user = await db.user.update({
      where: { id: data.id },
      data: updateData
    })
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: currentUser.id,
          action: 'update',
          entity: 'user',
          entityId: user.id,
          details: `Utilisateur modifié: ${user.username}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Erreur lors de la modification de l\'utilisateur' }, { status: 500 })
  }
}

// DELETE - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  const currentUser = await getCurrentUser(request)
  
  if (!currentUser) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }
    
    // Prevent self-deletion
    if (id === currentUser.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 })
    }
    
    const user = await db.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }
    
    await db.user.delete({
      where: { id }
    })
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: currentUser.id,
          action: 'delete',
          entity: 'user',
          entityId: id,
          details: `Utilisateur supprimé: ${user.username}`
        }
      })
    } catch (e) {}
    
    return NextResponse.json({ message: 'Utilisateur supprimé' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression de l\'utilisateur' }, { status: 500 })
  }
}
