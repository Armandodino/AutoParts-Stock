// Dashboard Stats API - Fresh Route
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get all parts
    const parts = await db.part.findMany({
      where: { isActive: true },
      select: { 
        quantity: true, 
        purchasePrice: true, 
        sellingPrice: true,
        minStock: true,
        name: true,
        reference: true
      }
    });

    const totalParts = parts.length;
    const totalValue = parts.reduce((sum, p) => sum + (p.quantity * p.purchasePrice), 0);
    const lowStockCount = parts.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length;
    const outOfStockCount = parts.filter(p => p.quantity <= 0).length;

    // Get today's movements
    const todayMovements = await db.movement.count({
      where: { createdAt: { gte: today } }
    });

    // Get today's revenue
    const todayExits = await db.movement.aggregate({
      where: { type: 'EXIT', createdAt: { gte: today } },
      _sum: { totalPrice: true }
    });

    // Get monthly revenue
    const monthlyExits = await db.movement.aggregate({
      where: { type: 'EXIT', createdAt: { gte: startOfMonth } },
      _sum: { totalPrice: true }
    });

    // Get recent movements
    const recentMovements = await db.movement.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        quantity: true,
        totalPrice: true,
        createdAt: true,
        part: {
          select: {
            name: true,
            reference: true,
            category: {
              select: { name: true }
            }
          }
        }
      }
    });

    // Get alerts
    const alerts = await db.alert.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        createdAt: true,
        part: {
          select: {
            name: true,
            reference: true,
            quantity: true
          }
        }
      }
    });

    // Get category stats
    const categories = await db.category.findMany({
      include: {
        parts: {
          where: { isActive: true },
          select: { quantity: true, purchasePrice: true }
        }
      }
    });

    const categoryStats = categories.map(cat => ({
      categoryId: cat.id,
      categoryName: cat.name,
      partCount: cat.parts.length,
      totalValue: cat.parts.reduce((sum, p) => sum + (p.quantity * p.purchasePrice), 0)
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalParts,
        totalValue,
        lowStockCount,
        outOfStockCount,
        todayMovements,
        todayRevenue: todayExits._sum.totalPrice || 0,
        monthlyRevenue: monthlyExits._sum.totalPrice || 0,
        categoryStats,
        recentMovements,
        alerts
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
