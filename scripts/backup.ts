import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

const PROJECT_ROOT = process.cwd()
const DB_PATH = path.join(PROJECT_ROOT, "data", "orchard.db")
const BACKUPS_DIR = path.join(PROJECT_ROOT, "backups")
const MAX_BACKUPS = 30

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

function createBackup(): void {
  // Verify the source database exists
  if (!fs.existsSync(DB_PATH)) {
    console.error(`Error: Database not found at ${DB_PATH}`)
    process.exit(1)
  }

  // Create backups directory if it doesn't exist
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true })
    console.log(`Created backups directory: ${BACKUPS_DIR}`)
  }

  const timestamp = formatTimestamp()
  const backupFilename = `orchard-${timestamp}.db`
  const backupPath = path.join(BACKUPS_DIR, backupFilename)

  // Use VACUUM INTO for a clean single-file backup (proper WAL-mode backup)
  try {
    const db = new Database(DB_PATH, { readonly: true })
    db.pragma("journal_mode = WAL") // ensure WAL mode is active
    db.exec(`VACUUM INTO '${backupPath.replace(/\\/g, "/")}'`)
    db.close()
  } catch (err) {
    console.error(`Error creating backup: ${err}`)
    process.exit(1)
  }

  // Report backup size
  const stats = fs.statSync(backupPath)
  console.log(
    `Backup created: backups/${backupFilename} (${formatFileSize(stats.size)})`
  )
}

function cleanupOldBackups(): void {
  // List all backup files matching the naming pattern
  const files = fs
    .readdirSync(BACKUPS_DIR)
    .filter((f) => /^orchard-\d{4}-\d{2}-\d{2}-\d{6}\.db$/.test(f))
    .sort()
    .reverse() // newest first

  if (files.length <= MAX_BACKUPS) {
    console.log(`No old backups to clean up (${files.length} backups kept)`)
    return
  }

  const toDelete = files.slice(MAX_BACKUPS)
  for (const file of toDelete) {
    fs.unlinkSync(path.join(BACKUPS_DIR, file))
  }

  console.log(`Cleaned up ${toDelete.length} old backup${toDelete.length === 1 ? "" : "s"}`)
}

try {
  createBackup()
  cleanupOldBackups()
  process.exit(0)
} catch (err) {
  console.error(`Unexpected error: ${err}`)
  process.exit(1)
}
