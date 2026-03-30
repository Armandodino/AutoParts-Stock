import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - Get settings (public access for initial load)
export async function GET(request: NextRequest) {
  try {
    let settings = await db.setting.findFirst()
    
    if (!settings) {
      // Create default settings for Côte d'Ivoire
      settings = await db.setting.create({
        data: {
          companyName: 'Mon Entreprise',
          companyAddress: 'Abidjan, Côte d\'Ivoire',
          currency: 'XOF',
          currencySymbol: 'FCFA',
          taxRate: 18.0,
          taxEnabled: true,
          language: 'fr',
          theme: 'system',
          invoicePrefix: 'FAC',
          purchasePrefix: 'ACH',
          demoMode: true
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    // Return default settings if database error
    return NextResponse.json({
      companyName: 'Mon Entreprise',
      companyAddress: 'Abidjan, Côte d\'Ivoire',
      currency: 'XOF',
      currencySymbol: 'FCFA',
      taxRate: 18.0,
      taxEnabled: true,
      language: 'fr',
      theme: 'system',
      invoicePrefix: 'FAC',
      purchasePrefix: 'ACH',
      demoMode: true
    })
  }
}

// PUT - Update settings (admin only)
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé - Admin uniquement' }, { status: 403 })
  }
  
  try {
    const data = await request.json()
    
    // Input validation
    if (data.companyName && data.companyName.length > 100) {
      return NextResponse.json({ error: 'Le nom de l\'entreprise est trop long' }, { status: 400 })
    }
    
    if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 100)) {
      return NextResponse.json({ error: 'Le taux de TVA doit être entre 0 et 100' }, { status: 400 })
    }
    
    let settings = await db.setting.findFirst()
    
    const updateData: any = {
      companyName: data.companyName,
      companyLogo: data.companyLogo || null,
      companyAddress: data.companyAddress || null,
      companyPhone: data.companyPhone || null,
      companyEmail: data.companyEmail || null,
      currency: data.currency,
      currencySymbol: data.currencySymbol,
      taxRate: parseFloat(data.taxRate) || 18.0,
      taxEnabled: data.taxEnabled ?? true,
      language: data.language || 'fr',
      theme: data.theme || 'system',
      invoicePrefix: data.invoicePrefix || 'FAC',
      purchasePrefix: data.purchasePrefix || 'ACH',
      licenseKey: data.licenseKey || null,
      licenseValid: data.licenseValid ?? false,
      licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
      demoMode: data.demoMode ?? true
    }
    
    if (!settings) {
      settings = await db.setting.create({ data: updateData })
    } else {
      settings = await db.setting.update({
        where: { id: settings.id },
        data: updateData
      })
    }
    
    // Log activity
    try {
      await db.activity.create({
        data: {
          userId: user.id,
          action: 'update',
          entity: 'settings',
          entityId: settings.id,
          details: 'Paramètres modifiés'
        }
      })
    } catch (e) {}
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour des paramètres' }, { status: 500 })
  }
}
