// Dashboard API Route - v2.0
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/dashboard - Statistiques du tableau de bord
export async function GET() {
  try {
    // Date calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Execute queries sequentially to avoid issues
    // Total parts count
    const totalParts = await db.part.count();
    
    // Active parts count
    const activeParts = await db.part.count({ where: { isActive: true } });
    
    // Parts with their values for total stock value
    const partsWithValue = await db.part.findMany({
      where: { isActive: true },
      select: { quantity: true, purchasePrice: true }
    });
    
    // Out of stock parts count
    const outOfStockParts = await db.part.count({
      where: {
        isActive: true,
        quantity: { lte: 0 }
      }
    });
    
    // Today's movements count
    const todayMovements = await db.movement.count({
      where: { createdAt: { gte: today } }
    });
    
    // Today's entries value
    const todayEntries = await db.movement.aggregate({
      where: {
        type: 'ENTRY',
        createdAt: { gte: today }
      },
      _sum: { totalPrice: true }
    });
    
    // Today's exits value (revenue)
    const todayExits = await db.movement.aggregate({
      where: {
        type: 'EXIT',
        createdAt: { gte: today }
      },
      _sum: { totalPrice: true }
    });
    
    // Monthly exits value (revenue)
    const monthlyExits = await db.movement.aggregate({
      where: {
        type: 'EXIT',
        createdAt: { gte: startOfMonth }
      },
      _sum: { totalPrice: true }
    });
    
    // Last month exits value (for comparison)
    const lastMonthExits = await db.movement.aggregate({
      where: {
        type: 'EXIT',
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { totalPrice: true }
    });
    
    // Recent movements
    const recentMovements = await db.movement.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        part: {
          include: { category: true }
        }
      }
    });
    
    // Active alerts
    const alerts = await db.alert.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        part: true
      }
    });
    
    // Category stats
    const categoriesWithStats = await db.category.findMany({
      include: {
        _count: { select: { parts: { where: { isActive: true } } } },
        parts: {
          where: { isActive: true },
          select: { quantity: true, purchasePrice: true }
        }
      }
    });

    // Calculate total stock value
    const totalValue = partsWithValue.reduce(
      (sum, part) => sum + part.quantity * part.purchasePrice,
      0
    );

    // Get actual low stock count by checking each part
    const lowStockList = await db.part.findMany({
      where: {
        isActive: true,
        quantity: { gt: 0 }
      },
      select: { quantity: true, minStock: true }
    });
    
    const actualLowStock = lowStockList.filter(p => p.quantity <= p.minStock).length;

    // Format category stats
    const categoryStats = categoriesWithStats.map(cat => ({
      categoryId: cat.id,
      categoryName: cat.name,
      partCount: cat._count.parts,
      totalValue: cat.parts.reduce(
        (sum, part) => sum + part.quantity * part.purchasePrice,
        0
      )
    }));

    // Get out of stock parts for alerts
    const outOfStockPartsList = await db.part.findMany({
      where: {
        isActive: true,
        quantity: { lte: 0 }
      },
      take: 10
    });

    // Create out of stock alerts if not exists
    for (const part of outOfStockPartsList) {
      const existingAlert = await db.alert.findFirst({
        where: { partId: part.id, type: 'out_of_stock', isResolved: false }
      });
      if (!existingAlert) {
        await db.alert.create({
          data: {
            type: 'out_of_stock',
            title: 'Rupture de stock',
            message: `La pièce "${part.name}" (${part.reference}) est en rupture de stock`,
            partId: part.id
          }
        });
      }
    }

    const stats = {
      totalParts: activeParts,
      totalValue,
      lowStockCount: actualLowStock,
      outOfStockCount: outOfStockParts,
      todayMovements,
      todayRevenue: todayExits._sum.totalPrice || 0,
      monthlyRevenue: monthlyExits._sum.totalPrice || 0,
      categoryStats,
      recentMovements,
      alerts
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
