import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { writeFile } from 'fs/promises';

const execAsync = promisify(exec);

// GET /api/export - Exporter les données en Excel
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'parts'; // parts, movements, all

    // Récupérer les données selon le type
    let data: Record<string, unknown>[] = [];
    let headers: string[] = [];
    let filename = '';

    if (type === 'parts' || type === 'all') {
      const parts = await db.part.findMany({
        where: { isActive: true },
        include: { category: true },
        orderBy: { name: 'asc' }
      });

      if (type === 'parts') {
        headers = [
          'Référence', 'Nom', 'Catégorie', 'Description', 
          'Prix d\'achat', 'Prix de vente', 'Quantité', 'Stock min',
          'Emplacement', 'Code-barres', 'Valeur stock'
        ];
        data = parts.map(p => ({
          reference: p.reference,
          name: p.name,
          category: p.category?.name || '',
          description: p.description || '',
          purchasePrice: p.purchasePrice,
          sellingPrice: p.sellingPrice,
          quantity: p.quantity,
          minStock: p.minStock,
          location: p.location || '',
          barcode: p.barcode || '',
          stockValue: p.quantity * p.purchasePrice
        }));
        filename = `pieces_auto_${new Date().toISOString().split('T')[0]}.xlsx`;
      }
    }

    if (type === 'movements' || type === 'all') {
      const movements = await db.movement.findMany({
        include: {
          part: { include: { category: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: type === 'movements' ? 1000 : 500
      });

      if (type === 'movements') {
        headers = [
          'Date', 'Pièce', 'Référence', 'Catégorie', 'Type',
          'Quantité', 'Prix unitaire', 'Prix total',
          'Fournisseur', 'Client', 'Réf. Facture', 'Notes'
        ];
        data = movements.map(m => ({
          date: m.createdAt.toLocaleString('fr-FR'),
          partName: m.part?.name || '',
          reference: m.part?.reference || '',
          category: m.part?.category?.name || '',
          type: m.type === 'ENTRY' ? 'Entrée' : 
                m.type === 'EXIT' ? 'Sortie' : 
                m.type === 'ADJUST' ? 'Ajustement' : 'Retour',
          quantity: m.quantity,
          unitPrice: m.unitPrice,
          totalPrice: m.totalPrice,
          supplier: m.supplier || '',
          customer: m.customer || '',
          invoiceRef: m.invoiceRef || '',
          notes: m.notes || ''
        }));
        filename = `mouvements_${new Date().toISOString().split('T')[0]}.xlsx`;
      }
    }

    // Générer le fichier Excel avec Python
    const pythonScript = `
import json
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Read data from stdin
input_data = json.loads('''${JSON.stringify({ headers, data, filename })}''')

wb = Workbook()
ws = wb.active
ws.title = "Données"

# Title style (no background, left-aligned, bold)
title_font = Font(name='Times New Roman', size=18, bold=True, color='000000')
title_alignment = Alignment(horizontal='left', vertical='center')
ws['B2'] = input_data['filename'].replace('.xlsx', '').replace('_', ' ').title()
ws['B2'].font = title_font
ws['B2'].alignment = title_alignment
ws.row_dimensions[2].height = 30

# Header style (dark background, white text)
header_fill = PatternFill(start_color='333333', end_color='333333', fill_type='solid')
header_font = Font(name='Times New Roman', color='FFFFFF', bold=True)
header_alignment = Alignment(horizontal='center', vertical='center')

# Data style
data_font = Font(name='Times New Roman', size=11)
data_alignment = Alignment(horizontal='left', vertical='center')
number_alignment = Alignment(horizontal='right', vertical='center')

# Border style
thin_border = Border(
    left=Side(style='thin', color='E3DEDE'),
    right=Side(style='thin', color='E3DEDE'),
    top=Side(style='thin', color='E3DEDE'),
    bottom=Side(style='thin', color='E3DEDE')
)

# Alternating row fill
alt_fill = PatternFill(start_color='E9E9E9', end_color='E9E9E9', fill_type='solid')

# Write headers (row 4)
headers = input_data['headers']
for col_idx, header in enumerate(headers, start=2):
    cell = ws.cell(row=4, column=col_idx, value=header)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = header_alignment
    cell.border = thin_border

# Write data
data = input_data['data']
for row_idx, row in enumerate(data, start=5):
    values = list(row.values())
    for col_idx, value in enumerate(values, start=2):
        cell = ws.cell(row=row_idx, column=col_idx, value=value)
        cell.font = data_font
        cell.border = thin_border
        
        # Number formatting
        if isinstance(value, (int, float)):
            cell.alignment = number_alignment
            if isinstance(value, float):
                cell.number_format = '#,##0.00'
        else:
            cell.alignment = data_alignment
        
        # Alternating rows
        if row_idx % 2 == 0:
            cell.fill = alt_fill

# Auto-adjust column widths
for col_idx, header in enumerate(headers, start=2):
    column_letter = get_column_letter(col_idx)
    max_length = len(str(header))
    for row in data:
        value = list(row.values())[col_idx - 2]
        if value:
            max_length = max(max_length, len(str(value)))
    ws.column_dimensions[column_letter].width = min(max_length + 2, 50)

# Save
output_path = '/tmp/' + input_data['filename']
wb.save(output_path)
print(output_path)
`;

    // Écrire le script Python
    const scriptPath = `/tmp/export_${Date.now()}.py`;
    await writeFile(scriptPath, pythonScript);

    // Exécuter le script
    const { stdout } = await execAsync(`python3 ${scriptPath}`);
    const excelPath = stdout.trim();

    // Lire le fichier et le retourner
    const { readFile } = await import('fs/promises');
    const fileBuffer = await readFile(excelPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}
