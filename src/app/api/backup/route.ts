import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import fs from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const BACKUP_DIR = path.join(process.cwd(), 'backups')
const DB_PATH = path.join(process.cwd(), 'db', 'custom.db')

// Ensure backup directory exists
async function ensureBackupDir() {
  if (!existsSync(BACKUP_DIR)) {
    await fs.mkdir(BACKUP_DIR, { recursive: true })
  }
}

// GET - List all backups or download a specific backup
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const download = searchParams.get('download')
    
    await ensureBackupDir()
    
    // Download specific backup
    if (download) {
      const backupPath = path.join(BACKUP_DIR, download)
      if (!existsSync(backupPath)) {
        return NextResponse.json({ error: 'Sauvegarde non trouvée' }, { status: 404 })
      }
      
      const buffer = await fs.readFile(backupPath)
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${download}"`,
          'Content-Length': buffer.length.toString()
        }
      })
    }
    
    // List all backups from database
    const backups = await db.backup.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // Also check filesystem for any backup files not in database
    const files = await fs.readdir(BACKUP_DIR)
    const dbFiles = backups.map(b => b.filename)
    
    for (const file of files) {
      if (file.endsWith('.db') && !dbFiles.includes(file)) {
        const stats = await fs.stat(path.join(BACKUP_DIR, file))
        backups.push({
          id: 'fs-' + file,
          filename: file,
          size: stats.size,
          createdAt: stats.mtime
        })
      }
    }
    
    return NextResponse.json(backups.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ))
  } catch (error) {
    console.error('Error listing backups:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des sauvegardes' }, { status: 500 })
  }
}

// POST - Create a new backup
export async function POST(request: NextRequest) {
  try {
    await ensureBackupDir()
    
    if (!existsSync(DB_PATH)) {
      return NextResponse.json({ error: 'Base de données non trouvée' }, { status: 404 })
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `backup-${timestamp}.db`
    const backupPath = path.join(BACKUP_DIR, filename)
    
    // Copy database file
    await fs.copyFile(DB_PATH, backupPath)
    
    // Get file stats
    const stats = await fs.stat(backupPath)
    
    // Save backup record
    const backup = await db.backup.create({
      data: {
        filename,
        size: stats.size
      }
    })
    
    // Log activity
    await db.activity.create({
      data: {
        action: 'create',
        entity: 'backup',
        entityId: backup.id,
        details: `Sauvegarde créée: ${filename}`
      }
    })
    
    return NextResponse.json({
      message: 'Sauvegarde créée avec succès',
      backup: {
        id: backup.id,
        filename: backup.filename,
        size: backup.size,
        createdAt: backup.createdAt
      }
    })
  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json({ error: 'Erreur lors de la création de la sauvegarde' }, { status: 500 })
  }
}

// PUT - Restore a backup
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { filename } = data
    
    if (!filename) {
      return NextResponse.json({ error: 'Nom de fichier requis' }, { status: 400 })
    }
    
    const backupPath = path.join(BACKUP_DIR, filename)
    
    if (!existsSync(backupPath)) {
      return NextResponse.json({ error: 'Fichier de sauvegarde non trouvé' }, { status: 404 })
    }
    
    // Create a backup of current database before restore
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const preRestoreBackup = `pre-restore-${timestamp}.db`
    await fs.copyFile(DB_PATH, path.join(BACKUP_DIR, preRestoreBackup))
    
    // Restore the backup
    await fs.copyFile(backupPath, DB_PATH)
    
    // Log activity
    await db.activity.create({
      data: {
        action: 'restore',
        entity: 'backup',
        details: `Base de données restaurée depuis: ${filename}`
      }
    })
    
    return NextResponse.json({ 
      message: 'Base de données restaurée avec succès',
      preRestoreBackup
    })
  } catch (error) {
    console.error('Error restoring backup:', error)
    return NextResponse.json({ error: 'Erreur lors de la restauration' }, { status: 500 })
  }
}

// DELETE - Delete a backup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    
    if (!filename) {
      return NextResponse.json({ error: 'Nom de fichier requis' }, { status: 400 })
    }
    
    const backupPath = path.join(BACKUP_DIR, filename)
    
    if (existsSync(backupPath)) {
      await fs.unlink(backupPath)
    }
    
    // Delete from database
    await db.backup.deleteMany({
      where: { filename }
    })
    
    return NextResponse.json({ message: 'Sauvegarde supprimée' })
  } catch (error) {
    console.error('Error deleting backup:', error)
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }
}
