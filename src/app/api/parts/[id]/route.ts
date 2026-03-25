import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/parts/[id] - Détails d'une pièce
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const part = await db.part.findUnique({
      where: { id },
      include: {
        category: true,
        movements: {
          take: 20,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!part) {
      return NextResponse.json(
        { success: false, error: 'Pièce non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: part
    });
  } catch (error) {
    console.error('Get part error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la pièce' },
      { status: 500 }
    );
  }
}

// PUT /api/parts/[id] - Modifier une pièce
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existingPart = await db.part.findUnique({
      where: { id }
    });

    if (!existingPart) {
      return NextResponse.json(
        { success: false, error: 'Pièce non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si la nouvelle référence existe déjà (si modifiée)
    if (body.reference && body.reference !== existingPart.reference) {
      const refExists = await db.part.findUnique({
        where: { reference: body.reference }
      });

      if (refExists) {
        return NextResponse.json(
          { success: false, error: 'Cette référence existe déjà' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    
    if (body.name) updateData.name = body.name;
    if (body.reference) updateData.reference = body.reference;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.categoryId) updateData.categoryId = body.categoryId;
    if (body.purchasePrice !== undefined) updateData.purchasePrice = parseFloat(body.purchasePrice);
    if (body.sellingPrice !== undefined) updateData.sellingPrice = parseFloat(body.sellingPrice);
    if (body.quantity !== undefined) updateData.quantity = parseInt(body.quantity);
    if (body.minStock !== undefined) updateData.minStock = parseInt(body.minStock);
    if (body.location !== undefined) updateData.location = body.location;
    if (body.barcode !== undefined) updateData.barcode = body.barcode;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const part = await db.part.update({
      where: { id },
      data: updateData,
      include: {
        category: true
      }
    });

    // Vérifier le niveau de stock pour les alertes
    if (part.quantity <= part.minStock && part.isActive) {
      const existingAlert = await db.alert.findFirst({
        where: {
          partId: part.id,
          isResolved: false
        }
      });

      if (!existingAlert) {
        await db.alert.create({
          data: {
            type: part.quantity <= 0 ? 'out_of_stock' : 'low_stock',
            title: part.quantity <= 0 ? 'Rupture de stock' : 'Stock faible',
            message: `La pièce "${part.name}" (${part.reference}) a un stock de ${part.quantity}`,
            partId: part.id
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: part,
      message: 'Pièce modifiée avec succès'
    });
  } catch (error) {
    console.error('Update part error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification de la pièce' },
      { status: 500 }
    );
  }
}

// DELETE /api/parts/[id] - Supprimer une pièce
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const part = await db.part.findUnique({
      where: { id }
    });

    if (!part) {
      return NextResponse.json(
        { success: false, error: 'Pièce non trouvée' },
        { status: 404 }
      );
    }

    // Soft delete - just mark as inactive
    await db.part.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Pièce supprimée avec succès'
    });
  } catch (error) {
    console.error('Delete part error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la pièce' },
      { status: 500 }
    );
  }
}
