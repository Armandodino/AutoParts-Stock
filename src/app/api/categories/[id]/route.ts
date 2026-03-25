import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/categories/[id] - Détails d'une catégorie
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await db.category.findUnique({
      where: { id },
      include: {
        parts: {
          where: { isActive: true },
          take: 50
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la catégorie' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Modifier une catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    const existingCategory = await db.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si le nouveau nom existe déjà
    if (name && name !== existingCategory.name) {
      const nameExists = await db.category.findUnique({
        where: { name }
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Ce nom de catégorie existe déjà' },
          { status: 400 }
        );
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: name || existingCategory.name,
        description: description !== undefined ? description : existingCategory.description
      }
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Catégorie modifiée avec succès'
    });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification de la catégorie' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { parts: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    if (category._count.parts > 0) {
      return NextResponse.json(
        { success: false, error: 'Impossible de supprimer une catégorie contenant des pièces' },
        { status: 400 }
      );
    }

    await db.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la catégorie' },
      { status: 500 }
    );
  }
}
