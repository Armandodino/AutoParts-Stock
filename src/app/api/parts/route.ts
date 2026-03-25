import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET /api/parts - Liste des pièces avec filtres
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const minStock = searchParams.get('minStock') === 'true';
    const outOfStock = searchParams.get('outOfStock') === 'true';
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const where: Prisma.PartWhereInput = {};

    // Filtres
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { reference: { contains: search } },
        { barcode: { contains: search } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (minStock) {
      where.quantity = { lte: Prisma.raw('minStock') };
    }

    if (outOfStock) {
      where.quantity = { lte: 0 };
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [parts, total] = await Promise.all([
      db.part.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      db.part.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: parts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Get parts error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des pièces' },
      { status: 500 }
    );
  }
}

// POST /api/parts - Créer une pièce
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      reference,
      description,
      categoryId,
      purchasePrice,
      sellingPrice,
      quantity,
      minStock,
      location,
      barcode,
      imageUrl
    } = body;

    if (!name || !reference || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Nom, référence et catégorie sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si la référence existe déjà
    const existingPart = await db.part.findUnique({
      where: { reference }
    });

    if (existingPart) {
      return NextResponse.json(
        { success: false, error: 'Cette référence existe déjà' },
        { status: 400 }
      );
    }

    const part = await db.part.create({
      data: {
        name,
        reference,
        description,
        categoryId,
        purchasePrice: parseFloat(purchasePrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        quantity: parseInt(quantity) || 0,
        minStock: parseInt(minStock) || 5,
        location,
        barcode,
        imageUrl
      },
      include: {
        category: true
      }
    });

    // Créer un mouvement initial si quantité > 0
    if (quantity > 0) {
      await db.movement.create({
        data: {
          partId: part.id,
          type: 'ENTRY',
          quantity: parseInt(quantity),
          reason: 'Stock initial',
          unitPrice: parseFloat(purchasePrice) || 0,
          totalPrice: (parseFloat(purchasePrice) || 0) * parseInt(quantity)
        }
      });
    }

    // Vérifier si stock faible pour créer une alerte
    if (part.quantity <= part.minStock) {
      await db.alert.create({
        data: {
          type: part.quantity <= 0 ? 'out_of_stock' : 'low_stock',
          title: part.quantity <= 0 ? 'Rupture de stock' : 'Stock faible',
          message: `La pièce "${part.name}" (${part.reference}) a un stock de ${part.quantity}`,
          partId: part.id
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: part,
      message: 'Pièce créée avec succès'
    });
  } catch (error) {
    console.error('Create part error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la pièce' },
      { status: 500 }
    );
  }
}
