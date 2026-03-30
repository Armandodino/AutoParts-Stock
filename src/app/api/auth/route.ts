import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export interface SessionUser {
  id: string
  username: string
  email: string
  name: string | null
  role: string
}

// Rate limiting - in-memory store
const loginAttempts = new Map<string, { count: number, lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier)
  
  if (!attempts) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }
  
  if (now - attempts.lastAttempt > LOCKOUT_TIME) {
    loginAttempts.delete(identifier)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }
  
  if (attempts.count >= MAX_ATTEMPTS) {
    return { allowed: false, remainingAttempts: 0 }
  }
  
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempts.count }
}

function recordFailedAttempt(identifier: string) {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier)
  
  if (attempts) {
    attempts.count++
    attempts.lastAttempt = now
  } else {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now })
  }
}

function clearAttempts(identifier: string) {
  loginAttempts.delete(identifier)
}

// Get current user from session cookie - Works OFFLINE
export async function getCurrentUser(request: NextRequest): Promise<SessionUser | null> {
  try {
    const sessionToken = request.cookies.get('session_token')?.value
    
    if (!sessionToken) return null
    
    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { user: true }
    })
    
    if (!session || !session.user) return null
    
    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { token: sessionToken } }).catch(() => {})
      return null
    }
    
    return {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role
    }
  } catch {
    return null
  }
}

// Require authentication - returns user or error response
export async function requireAuth(request: NextRequest): Promise<SessionUser | NextResponse> {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorisé - Veuillez vous connecter' },
      { status: 401 }
    )
  }
  
  return user
}

// Require specific role - returns user or error response
export async function requireRole(request: NextRequest, allowedRoles: string[]): Promise<SessionUser | NextResponse> {
  const authResult = await requireAuth(request)
  
  if (authResult instanceof NextResponse) {
    return authResult
  }
  
  const user = authResult as SessionUser
  
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Accès refusé - Permissions insuffisantes' },
      { status: 403 }
    )
  }
  
  return user
}

// GET - Check auth status (offline-compatible)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (user) {
      return NextResponse.json({ 
        authenticated: true, 
        user 
      })
    }
    
    // Check if we need to create default admin
    const users = await db.user.findMany()
    if (users.length === 0) {
      // Create default admin
      const defaultPassword = 'Admin@' + randomUUID().slice(0, 8)
      const hashedPassword = await bcrypt.hash(defaultPassword, 12)
      
      const admin = await db.user.create({
        data: {
          email: 'admin@jooman.local',
          username: 'admin',
          password: hashedPassword,
          name: 'Administrateur',
          role: 'admin',
          isActive: true
        }
      })
      
      return NextResponse.json({ 
        authenticated: false, 
        message: 'Compte administrateur créé',
        defaultCredentials: {
          username: 'admin',
          password: defaultPassword
        }
      })
    }
    
    return NextResponse.json({ authenticated: false })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}

// POST - Login (offline-compatible)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting identifier
    const identifier = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'local'
    
    const rateLimit = checkRateLimit(identifier)
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        error: 'Trop de tentatives. Réessayez dans 15 minutes.' 
      }, { status: 429 })
    }
    
    const { username, password } = await request.json()
    
    // Input validation
    if (!username || !password) {
      return NextResponse.json({ error: 'Identifiants requis' }, { status: 400 })
    }
    
    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Format invalide' }, { status: 400 })
    }
    
    // Find user in local SQLite database (offline)
    const user = await db.user.findUnique({
      where: { username: username.toLowerCase().trim() }
    })
    
    if (!user || !user.isActive) {
      recordFailedAttempt(identifier)
      return NextResponse.json({ 
        error: 'Identifiants incorrects',
        remainingAttempts: rateLimit.remainingAttempts - 1
      }, { status: 401 })
    }
    
    // Verify password with bcrypt (offline)
    const isValid = await bcrypt.compare(password, user.password)
    
    if (!isValid) {
      recordFailedAttempt(identifier)
      return NextResponse.json({ 
        error: 'Identifiants incorrects',
        remainingAttempts: rateLimit.remainingAttempts - 1
      }, { status: 401 })
    }
    
    // Clear rate limit on success
    clearAttempts(identifier)
    
    // Generate session token
    const sessionToken = randomUUID() + randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    
    // Delete old sessions
    await db.session.deleteMany({
      where: { userId: user.id }
    }).catch(() => {})
    
    // Create new session in local database
    await db.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt
      }
    })
    
    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    }).catch(() => {})
    
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive
      }
    })
    
    // Set HTTP-only cookie (secure for offline use)
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur de connexion' }, { status: 500 })
  }
}

// PUT - Change password
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    const { currentPassword, newPassword } = await request.json()
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 })
    }
    
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
    }
    
    // Password strength
    const hasUpper = /[A-Z]/.test(newPassword)
    const hasLower = /[a-z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    
    if (!hasUpper || !hasLower || !hasNumber) {
      return NextResponse.json({ 
        error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' 
      }, { status: 400 })
    }
    
    const fullUser = await db.user.findUnique({
      where: { id: user.id }
    })
    
    if (!fullUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }
    
    const isValid = await bcrypt.compare(currentPassword, fullUser.password)
    
    if (!isValid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 })
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })
    
    return NextResponse.json({ message: 'Mot de passe modifié avec succès' })
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Erreur lors du changement de mot de passe' }, { status: 500 })
  }
}

// DELETE - Logout
export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value
    
    if (sessionToken) {
      await db.session.delete({
        where: { token: sessionToken }
      }).catch(() => {})
    }
    
    const response = NextResponse.json({ message: 'Déconnexion réussie' })
    
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })
    
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la déconnexion' }, { status: 500 })
  }
}
