import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List notifications
export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })
    
    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des notifications' }, { status: 500 })
  }
}

// POST - Create notification
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const notification = await db.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || 'info'
      }
    })
    
    return NextResponse.json(notification)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création de la notification' }, { status: 500 })
  }
}

// PUT - Mark as read
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (data.markAll) {
      await db.notification.updateMany({
        data: { read: true }
      })
    } else {
      await db.notification.update({
        where: { id: data.id },
        data: { read: true }
      })
    }
    
    return NextResponse.json({ message: 'Notifications marquées comme lues' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
