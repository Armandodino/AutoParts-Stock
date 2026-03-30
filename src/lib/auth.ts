/**
 * ============================================================================
 * GESTION DE L'AUTHENTIFICATION
 * ============================================================================
 * 
 * Ce fichier contient les fonctions pour vérifier l'authentification
 * des utilisateurs lors des requêtes API.
 * 
 * L'authentification fonctionne avec des sessions stockées en base de données.
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * Représente un utilisateur authentifié
 */
export interface SessionUser {
  id: string
  username: string
  email: string
  name: string | null
  role: string
}

/**
 * Récupère l'utilisateur actuellement connecté à partir du cookie de session
 * 
 * @param request - La requête HTTP entrante
 * @returns L'utilisateur si authentifié, null sinon
 */
export async function getCurrentUser(request: NextRequest): Promise<SessionUser | null> {
  try {
    // Récupérer le token de session dans les cookies
    const sessionToken = request.cookies.get('session_token')?.value
    
    if (!sessionToken) return null
    
    // Chercher la session dans la base de données
    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { user: true }
    })
    
    if (!session || !session.user) return null
    
    // Vérifier si la session n'est pas expirée
    if (session.expiresAt < new Date()) {
      // Supprimer la session expirée
      await db.session.delete({ where: { token: sessionToken } }).catch(() => {})
      return null
    }
    
    // Retourner les informations de l'utilisateur
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
 * Exige que l'utilisateur soit authentifié
 * 
 * @param request - La requête HTTP entrante
 * @returns L'utilisateur authentifié ou une réponse 401
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
 * Exige que l'utilisateur ait un rôle spécifique
 * 
 * @param request - La requête HTTP entrante
 * @param allowedRoles - Liste des rôles autorisés
 * @returns L'utilisateur authentifié ou une réponse 401/403
 */
export async function requireRole(request: NextRequest, allowedRoles: string[]): Promise<SessionUser | NextResponse> {
  const authResult = await requireAuth(request)
  
  // Si ce n'est pas un utilisateur, c'est une réponse d'erreur
  if (authResult instanceof NextResponse) {
    return authResult
  }
  
  const user = authResult as SessionUser
  
  // Vérifier si le rôle de l'utilisateur est autorisé
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Accès refusé - Permissions insuffisantes' },
      { status: 403 }
    )
  }
  
  return user
}
