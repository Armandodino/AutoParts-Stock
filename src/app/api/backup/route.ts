import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { copyFile, mkdir, stat, readdir, unlink } from 'fs/promises';
import path from 'path';

// GET /api/backup - Lister les sauvegardes
export async function GET() {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    
    try {
      await mkdir(backupDir, { recursive: true });
    } catch {
      // Directory already exists
    }

    const files = await readdir(backupDir);
    const backups = [];

    for (const file of files) {
      if (file.endsWith('.db')) {
        const filePath = path.join(backupDir, file);
        const stats = await stat(filePath);
        
        backups.push({
          id: file.replace('.db', ''),
          filename: file,
          filepath: filePath,
          size: stats.size,
          createdAt: stats.mtime
        });
      }
    }

    // Sort by date descending
    backups.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('Get backups error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des sauvegardes' },
      { status: 500 }
    );
  }
}

// POST /api/backup - Créer une sauvegarde
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body.type || 'manual';

    const backupDir = path.join(process.cwd(), 'backups');
    await mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `autoparts_${timestamp}.db`;
    const backupPath = path.join(backupDir, fileName);

    // Chemin de la base de données actuelle
    const dbPath = path.join(process.cwd(), 'db', 'custom.db');

    // Copier le fichier
    await copyFile(dbPath, backupPath);

    // Enregistrer dans la base
    const stats = await stat(backupPath);
    await db.backup.create({
      data: {
        filename: fileName,
        filepath: backupPath,
        size: stats.size,
        type: type === 'automatic' ? 'automatic' : 'manual',
        status: 'completed'
      }
    });

    // Nettoyer les vieilles sauvegardes automatiques (garder les 10 dernières)
    if (type === 'automatic') {
      const autoBackups = await db.backup.findMany({
        where: { type: 'automatic' },
        orderBy: { createdAt: 'desc' }
      });

      if (autoBackups.length > 10) {
        const toDelete = autoBackups.slice(10);
        for (const backup of toDelete) {
          try {
            await unlink(backup.filepath);
            await db.backup.delete({ where: { id: backup.id } });
          } catch {
            // Ignore errors
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        filename: fileName,
        size: stats.size
      },
      message: 'Sauvegarde créée avec succès'
    });
  } catch (error) {
    console.error('Create backup error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la sauvegarde' },
      { status: 500 }
    );
  }
}

// PUT /api/backup - Restaurer une sauvegarde
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Nom de fichier requis' },
        { status: 400 }
      );
    }

    const backupPath = path.join(process.cwd(), 'backups', filename);
    const dbPath = path.join(process.cwd(), 'db', 'custom.db');

    // Créer une sauvegarde de la base actuelle avant restauration
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preRestoreBackup = path.join(
      process.cwd(), 
      'backups', 
      `pre_restore_${timestamp}.db`
    );
    
    await copyFile(dbPath, preRestoreBackup);

    // Restaurer
    await copyFile(backupPath, dbPath);

    return NextResponse.json({
      success: true,
      message: 'Sauvegarde restaurée avec succès. Veuillez redémarrer l\'application.'
    });
  } catch (error) {
    console.error('Restore backup error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la restauration de la sauvegarde' },
      { status: 500 }
    );
  }
}
