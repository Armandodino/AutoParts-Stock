import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/alerts - Liste des alertes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const unresolvedOnly = searchParams.get('unresolvedOnly') === 'true';

    const where: { isRead?: boolean; isResolved?: boolean } = {};
    
    if (unreadOnly) {
      where.isRead = false;
    }
    
    if (unresolvedOnly) {
      where.isResolved = false;
    }

    const alerts = await db.alert.findMany({
      where,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        partId: true,
        isRead: true,
        isResolved: true,
        createdAt: true,
        resolvedAt: true,
        part: {
          select: {
            id: true,
            name: true,
            reference: true,
            quantity: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await db.alert.count({
      where: { isRead: false }
    });

    return NextResponse.json({
      success: true,
      data: alerts,
      unreadCount
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des alertes' },
      { status: 500 }
    );
  }
}

// PUT /api/alerts - Marquer les alertes comme lues
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertIds } = body;

    if (action === 'markAllRead') {
      await db.alert.updateMany({
        where: { isRead: false },
        data: { isRead: true }
      });

      return NextResponse.json({
        success: true,
        message: 'Toutes les alertes ont été marquées comme lues'
      });
    }

    if (action === 'markRead' && alertIds?.length) {
      await db.alert.updateMany({
        where: { id: { in: alertIds } },
        data: { isRead: true }
      });

      return NextResponse.json({
        success: true,
        message: 'Alertes marquées comme lues'
      });
    }

    if (action === 'resolve' && alertIds?.length) {
      await db.alert.updateMany({
        where: { id: { in: alertIds } },
        data: { isRead: true, isResolved: true, resolvedAt: new Date() }
      });

      return NextResponse.json({
        success: true,
        message: 'Alertes résolues'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update alerts error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des alertes' },
      { status: 500 }
    );
  }
}
