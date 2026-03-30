/**
 * ============================================================================
 * CONNEXION À LA BASE DE DONNÉES
 * ============================================================================
 * 
 * Ce fichier configure la connexion à la base de données via Prisma.
 * On utilise un singleton pour éviter de créer plusieurs connexions.
 */

import { PrismaClient } from '@prisma/client'

// Variable globale pour stocker l'instance Prisma (évite les connexions multiples)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Instance de la base de données
 * Utilise l'instance existante si disponible, sinon en crée une nouvelle
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],  // Affiche les requêtes SQL dans la console (utile pour le débogage)
  })

// En développement, on sauvegarde l'instance dans la variable globale
// pour éviter les reconnexions lors du hot-reload
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
