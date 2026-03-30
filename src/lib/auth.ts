import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export interface SessionUser {
  id: string
  username: string
  email: string
  name: string | null
  role: string
}

/**
 * Get current user from session cookie
 * Works OFFLINE - uses local SQLite database
 */
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

/**
 * Require authentication - returns user or 401 response
 * Works OFFLINE
 */
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

/**
 * Require specific role - returns user or 403 response
 * Works OFFLINE
 */
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
