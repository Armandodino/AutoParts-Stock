import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/categories - Liste des catégories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: {
        _count: {
          select: { parts: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const categoriesWithCount = categories.map((cat) => ({
      ...cat,
      partCount: cat._count.parts
    }));

    return NextResponse.json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Créer une catégorie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Le nom de la catégorie est requis' },
        { status: 400 }
      );
    }

    const existingCategory = await db.category.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Cette catégorie existe déjà' },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        description
      }
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Catégorie créée avec succès'
    });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la catégorie' },
      { status: 500 }
    );
  }
}
