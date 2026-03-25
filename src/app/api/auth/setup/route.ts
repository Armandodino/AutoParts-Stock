import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// GET /api/auth/setup - Vérifier si l'application est initialisée
export async function GET() {
  try {
    const userCount = await db.user.count();
    
    return NextResponse.json({
      success: true,
      data: { initialized: userCount > 0 }
    });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}

// POST /api/auth/setup - Initialiser l'application (créer l'admin par défaut)
export async function POST(request: NextRequest) {
  try {
    const existingUsers = await db.user.count();
    
    if (existingUsers > 0) {
      return NextResponse.json(
        { success: false, error: 'L\'application est déjà initialisée' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, password, name, email } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        name: name || 'Administrateur',
        email: email || undefined,
        role: 'admin'
      }
    });

    // Create default categories
    const defaultCategories = [
      { name: 'Moteur', description: 'Pièces moteur' },
      { name: 'Transmission', description: 'Pièces de transmission' },
      { name: 'Freinage', description: 'Système de freinage' },
      { name: 'Suspension', description: 'Suspension et amortisseurs' },
      { name: 'Électricité', description: 'Pièces électriques' },
      { name: 'Carrosserie', description: 'Pièces de carrosserie' },
      { name: 'Filtres', description: 'Filtres (huile, air, carburant)' },
      { name: 'Échappement', description: 'Système d\'échappement' },
      { name: 'Refroidissement', description: 'Système de refroidissement' },
      { name: 'Éclairage', description: 'Phares et feux' }
    ];

    await db.category.createMany({
      data: defaultCategories
    });

    // Create default settings
    await db.setting.createMany({
      data: [
        { key: 'companyName', value: 'AutoParts Stock', description: 'Nom de l\'entreprise' },
        { key: 'defaultMinStock', value: '5', description: 'Seuil de stock faible par défaut' },
        { key: 'autoBackup', value: 'true', description: 'Sauvegarde automatique activée' },
        { key: 'backupInterval', value: '24', description: 'Intervalle de sauvegarde (heures)' },
        { key: 'currency', value: 'XOF', description: 'Devise' }
      ]
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'Application initialisée avec succès'
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'initialisation' },
      { status: 500 }
    );
  }
}
