// CLI entrypoint for manual backups — delegates to shared backup module
import { runBackup } from "../lib/backup"

const success = runBackup()
process.exit(success ? 0 : 1)
