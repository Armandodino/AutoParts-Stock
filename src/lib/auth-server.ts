import { db } from '@/lib/db'

export interface SessionUser {
  id: string
  username: string
  email: string
  name: string | null
  role: string
}

// This is a server-side function to get user from session cookie
// For client components, use the /api/auth endpoint instead
export async function getSessionFromToken(token: string): Promise<SessionUser | null> {
  try {
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    })
    
    if (!session || !session.user) return null
    
    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { token } })
      return null
    }
    
    if (!session.user.isActive) return null
    
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
