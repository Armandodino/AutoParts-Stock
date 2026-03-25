import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/settings - Récupérer tous les paramètres
export async function GET() {
  try {
    const settings = await db.setting.findMany();
    
    // Convertir en objet key-value
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      data: settingsObj
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des paramètres' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Mettre à jour les paramètres
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      await db.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès'
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des paramètres' },
      { status: 500 }
    );
  }
}
