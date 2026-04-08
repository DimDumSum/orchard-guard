// ---------------------------------------------------------------------------
// Database Backup — reusable backup logic for cron and CLI usage
// ---------------------------------------------------------------------------

import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

const PROJECT_ROOT = process.cwd()
const MAX_BACKUPS = 30

function getDbPath(): string {
  return process.env.DATABASE_PATH || path.join(PROJECT_ROOT, "data", "orchard.db")
}

function getBackupsDir(): string {
  return path.join(PROJECT_ROOT, "backups")
}

function formatTimestamp(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const MM = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const HH = String(now.getHours()).padStart(2, "0")
  const mm = String(now.getMinutes()).padStart(2, "0")
  const ss = String(now.getSeconds()).padStart(2, "0")
  return `${yyyy}-${MM}-${dd}-${HH}${mm}${ss}`
}

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

/**
 * Create a backup of the database using VACUUM INTO (safe for WAL mode).
 * Returns the backup file path on success, or null if the DB doesn't exist.
 */
export function createBackup(): string | null {
  const dbPath = getDbPath()
  const backupsDir = getBackupsDir()

  if (!fs.existsSync(dbPath)) {
    console.warn(`[backup] Database not found at ${dbPath}`)
    return null
  }

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true })
  }

  const timestamp = formatTimestamp()
  const backupFilename = `orchard-${timestamp}.db`
  const backupPath = path.join(backupsDir, backupFilename)

  const db = new Database(dbPath, { readonly: true })
  db.pragma("journal_mode = WAL")
  db.exec(`VACUUM INTO '${backupPath.replace(/\\/g, "/")}'`)
  db.close()

  const stats = fs.statSync(backupPath)
  console.log(
    `[backup] Created: backups/${backupFilename} (${formatFileSize(stats.size)})`,
  )

  return backupPath
}

/**
 * Remove old backups beyond the MAX_BACKUPS limit.
 */
export function cleanupOldBackups(): number {
  const backupsDir = getBackupsDir()
  if (!fs.existsSync(backupsDir)) return 0

  const files = fs
    .readdirSync(backupsDir)
    .filter((f) => /^orchard-\d{4}-\d{2}-\d{2}-\d{6}\.db$/.test(f))
    .sort()
    .reverse()

  if (files.length <= MAX_BACKUPS) return 0

  const toDelete = files.slice(MAX_BACKUPS)
  for (const file of toDelete) {
    fs.unlinkSync(path.join(backupsDir, file))
  }

  console.log(`[backup] Cleaned up ${toDelete.length} old backup(s)`)
  return toDelete.length
}

/**
 * Run a full backup cycle: create backup + cleanup old ones.
 */
export function runBackup(): boolean {
  try {
    const result = createBackup()
    if (result) cleanupOldBackups()
    return result !== null
  } catch (err) {
    console.error("[backup] Failed:", err instanceof Error ? err.message : err)
    return false
  }
}
