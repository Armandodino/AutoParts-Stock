import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET /api/movements - Liste des mouvements avec filtres
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const partId = searchParams.get('partId') || '';
    const type = searchParams.get('type') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const where: Prisma.MovementWhereInput = {};

    if (partId) {
      where.partId = partId;
    }

    if (type) {
      where.type = type as Prisma.EnumMovementTypeFilter['equals'];
    }

    if (startDate) {
      where.createdAt = { ...where.createdAt as Prisma.DateTimeFilter, gte: new Date(startDate) };
    }

    if (endDate) {
      where.createdAt = { ...where.createdAt as Prisma.DateTimeFilter, lte: new Date(endDate) };
    }

    const [movements, total] = await Promise.all([
      db.movement.findMany({
        where,
        include: {
          part: {
            include: {
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      db.movement.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: movements,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Get movements error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des mouvements' },
      { status: 500 }
    );
  }
}

// POST /api/movements - Créer un mouvement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      partId,
      type,
      quantity,
      reason,
      unitPrice,
      supplier,
      customer,
      invoiceRef,
      notes,
      userId
    } = body;

    if (!partId || !type || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Pièce, type et quantité sont requis' },
        { status: 400 }
      );
    }

    const part = await db.part.findUnique({
      where: { id: partId }
    });

    if (!part) {
      return NextResponse.json(
        { success: false, error: 'Pièce non trouvée' },
        { status: 404 }
      );
    }

    const qty = parseInt(quantity);
    const price = parseFloat(unitPrice) || part.purchasePrice;
    const totalPrice = price * qty;

    // Calculer la nouvelle quantité selon le type
    let newQuantity = part.quantity;
    switch (type) {
      case 'ENTRY':
      case 'RETURN':
        newQuantity += qty;
        break;
      case 'EXIT':
        if (part.quantity < qty) {
          return NextResponse.json(
            { success: false, error: `Stock insuffisant. Stock actuel: ${part.quantity}` },
            { status: 400 }
          );
        }
        newQuantity -= qty;
        break;
      case 'ADJUST':
        newQuantity = qty; // Pour l'ajustement, la quantité est le nouveau stock
        break;
    }

    // Créer le mouvement et mettre à jour le stock en transaction
    const movement = await db.$transaction(async (tx) => {
      const newMovement = await tx.movement.create({
        data: {
          partId,
          type,
          quantity: type === 'ADJUST' ? qty - part.quantity : qty,
          reason,
          unitPrice: price,
          totalPrice,
          supplier,
          customer,
          invoiceRef,
          notes,
          userId
        },
        include: {
          part: {
            include: { category: true }
          }
        }
      });

      await tx.part.update({
        where: { id: partId },
        data: { quantity: newQuantity }
      });

      return newMovement;
    });

    // Vérifier le niveau de stock pour les alertes
    if (newQuantity <= part.minStock && part.isActive) {
      const existingAlert = await db.alert.findFirst({
        where: {
          partId: part.id,
          isResolved: false
        }
      });

      if (!existingAlert) {
        await db.alert.create({
          data: {
            type: newQuantity <= 0 ? 'out_of_stock' : 'low_stock',
            title: newQuantity <= 0 ? 'Rupture de stock' : 'Stock faible',
            message: `La pièce "${part.name}" (${part.reference}) a un stock de ${newQuantity}`,
            partId: part.id
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: movement,
      message: 'Mouvement enregistré avec succès'
    });
  } catch (error) {
    console.error('Create movement error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'enregistrement du mouvement' },
      { status: 500 }
    );
  }
}
