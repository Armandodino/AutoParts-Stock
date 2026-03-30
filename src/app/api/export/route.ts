import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as XLSX from 'xlsx'

// GET - Export data to Excel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    
    const workbook = XLSX.utils.book_new()
    const settings = await db.setting.findFirst()
    const companyName = settings?.companyName || 'AutoParts Stock'
    
    // Helper function to add sheet
    const addSheet = (name: string, data: any[], headers: string[]) => {
      const sheetData = [headers, ...data.map(item => 
        headers.map(h => item[h] ?? '')
      )]
      const sheet = XLSX.utils.aoa_to_sheet(sheetData)
      
      // Set column widths
      const colWidths = headers.map(h => ({ wch: Math.max(h.length, 15) }))
      sheet['!cols'] = colWidths
      
      XLSX.utils.book_append_sheet(workbook, sheet, name)
    }
    
    if (type === 'all' || type === 'products') {
      const products = await db.product.findMany({
        include: { category: true, unit: true },
        orderBy: { name: 'asc' }
      })
      addSheet('Produits', products.map(p => ({
        'Référence': p.sku,
        'Nom': p.name,
        'Code-barres': p.barcode || '',
        'Catégorie': p.category?.name || '',
        'Unité': p.unit?.name || '',
        'Prix Achat': p.purchasePrice,
        'Prix Vente': p.sellingPrice,
        'Stock': p.stock,
        'Stock Min': p.minStock,
        'Stock Max': p.maxStock || '',
        'Statut': p.isActive ? 'Actif' : 'Inactif',
        'Date Création': new Date(p.createdAt).toLocaleDateString('fr-FR')
      })), ['Référence', 'Nom', 'Code-barres', 'Catégorie', 'Unité', 'Prix Achat', 'Prix Vente', 'Stock', 'Stock Min', 'Stock Max', 'Statut', 'Date Création'])
    }
    
    if (type === 'all' || type === 'sales') {
      const sales = await db.sale.findMany({
        include: { client: true, user: true },
        orderBy: { createdAt: 'desc' }
      })
      addSheet('Ventes', sales.map(s => ({
        'N° Facture': s.invoiceNumber,
        'Date': new Date(s.createdAt).toLocaleDateString('fr-FR'),
        'Client': s.client?.name || 'Anonyme',
        'Vendeur': s.user?.name || s.user?.username,
        'Sous-total': s.subtotal,
        'Remise': s.discount,
        'TVA': s.tax,
        'Total': s.total,
        'Paiement': s.paymentMethod === 'cash' ? 'Espèces' : s.paymentMethod === 'card' ? 'Carte' : s.paymentMethod === 'check' ? 'Chèque' : 'Virement',
        'Statut': s.paymentStatus === 'paid' ? 'Payé' : s.paymentStatus === 'pending' ? 'En attente' : 'Partiel'
      })), ['N° Facture', 'Date', 'Client', 'Vendeur', 'Sous-total', 'Remise', 'TVA', 'Total', 'Paiement', 'Statut'])
    }
    
    if (type === 'all' || type === 'purchases') {
      const purchases = await db.purchase.findMany({
        include: { supplier: true, user: true },
        orderBy: { createdAt: 'desc' }
      })
      addSheet('Achats', purchases.map(p => ({
        'N° Commande': p.purchaseNumber,
        'Date': new Date(p.createdAt).toLocaleDateString('fr-FR'),
        'Fournisseur': p.supplier?.name || 'N/A',
        'Sous-total': p.subtotal,
        'TVA': p.tax,
        'Total': p.total,
        'Statut': p.status === 'received' ? 'Reçu' : p.status === 'pending' ? 'En attente' : 'Annulé',
        'Paiement': p.paymentStatus === 'paid' ? 'Payé' : p.paymentStatus === 'pending' ? 'En attente' : 'Partiel'
      })), ['N° Commande', 'Date', 'Fournisseur', 'Sous-total', 'TVA', 'Total', 'Statut', 'Paiement'])
    }
    
    if (type === 'all' || type === 'clients') {
      const clients = await db.client.findMany({
        orderBy: { name: 'asc' }
      })
      addSheet('Clients', clients.map(c => ({
        'Nom': c.name,
        'Email': c.email || '',
        'Téléphone': c.phone || '',
        'Adresse': c.address || '',
        'Ville': c.city || '',
        'Pays': c.country || '',
        'Notes': c.notes || '',
        'Date Création': new Date(c.createdAt).toLocaleDateString('fr-FR')
      })), ['Nom', 'Email', 'Téléphone', 'Adresse', 'Ville', 'Pays', 'Notes', 'Date Création'])
    }
    
    if (type === 'all' || type === 'suppliers') {
      const suppliers = await db.supplier.findMany({
        orderBy: { name: 'asc' }
      })
      addSheet('Fournisseurs', suppliers.map(s => ({
        'Nom': s.name,
        'Email': s.email || '',
        'Téléphone': s.phone || '',
        'Adresse': s.address || '',
        'Ville': s.city || '',
        'Pays': s.country || '',
        'Notes': s.notes || '',
        'Date Création': new Date(s.createdAt).toLocaleDateString('fr-FR')
      })), ['Nom', 'Email', 'Téléphone', 'Adresse', 'Ville', 'Pays', 'Notes', 'Date Création'])
    }
    
    if (type === 'all' || type === 'stock') {
      const movements = await db.stockMovement.findMany({
        include: { product: true, user: true },
        orderBy: { createdAt: 'desc' },
        take: 500
      })
      addSheet('Mouvements Stock', movements.map(m => ({
        'Date': new Date(m.createdAt).toLocaleDateString('fr-FR'),
        'Produit': m.product?.name || '',
        'Type': m.type === 'entry' ? 'Entrée' : m.type === 'exit' ? 'Sortie' : 'Ajustement',
        'Quantité': m.quantity,
        'Raison': m.reason || '',
        'Utilisateur': m.user?.name || m.user?.username || ''
      })), ['Date', 'Produit', 'Type', 'Quantité', 'Raison', 'Utilisateur'])
    }
    
    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    const date = new Date().toISOString().split('T')[0]
    const filename = `${companyName.replace(/\s+/g, '_')}_Export_${date}.xlsx`
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'export' }, { status: 500 })
  }
}
