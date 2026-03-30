import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Initialize default categories for auto parts
export async function GET(request: NextRequest) {
  try {
    // Check if already initialized
    const existingCount = await db.category.count()
    if (existingCount > 0) {
      return NextResponse.json({ message: 'Catégories déjà initialisées', count: existingCount })
    }

    // Default auto parts categories
    const categories = [
      { name: 'Moteur', description: 'Pièces moteur', color: '#ef4444', icon: 'engine' },
      { name: 'Freinage', description: 'Système de freinage', color: '#f97316', icon: 'brake' },
      { name: 'Suspension', description: 'Suspension et amortisseurs', color: '#eab308', icon: 'suspension' },
      { name: 'Transmission', description: 'Boîte de vitesses, embrayage', color: '#22c55e', icon: 'transmission' },
      { name: 'Échappement', description: 'Pot d\'échappement, catalyseur', color: '#14b8a6', icon: 'exhaust' },
      { name: 'Refroidissement', description: 'Radiateur, pompe à eau', color: '#0ea5e9', icon: 'cooling' },
      { name: 'Électrique', description: 'Batterie, alternateur, démarreur', color: '#6366f1', icon: 'electrical' },
      { name: 'Filtration', description: 'Filtres à air, huile, carburant', color: '#8b5cf6', icon: 'filter' },
      { name: 'Carrosserie', description: 'Pare-chocs, ailes, portes', color: '#ec4899', icon: 'body' },
      { name: 'Éclairage', description: 'Phares, feux, clignotants', color: '#f43f5e', icon: 'light' },
      { name: 'Intérieur', description: 'Sièges, tableau de bord', color: '#84cc16', icon: 'interior' },
      { name: 'Direction', description: 'Direction assistée, crémaillère', color: '#06b6d4', icon: 'steering' },
      { name: 'Pneumatiques', description: 'Pneus, jantes', color: '#71717a', icon: 'wheel' },
      { name: 'Accessoires', description: 'Accessoires et équipements', color: '#a855f7', icon: 'accessory' }
    ]

    let created = 0
    for (const cat of categories) {
      try {
        await db.category.create({ data: cat })
        created++
      } catch (e) {
        // Skip if exists
      }
    }

    return NextResponse.json({ 
      message: `${created} catégories créées avec succès`,
      categories: categories.map(c => c.name)
    })
  } catch (error) {
    console.error('Error initializing categories:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'initialisation' }, { status: 500 })
  }
}
