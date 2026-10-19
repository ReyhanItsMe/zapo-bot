// ─────────────────────────────────────────────────────────────
// scripts/migrate-db.js — jalankan migrasi DB aplikasi.
// Idempotent: aman dijalankan berkali-kali (npm run migrate).
// Juga otomatis dijalankan saat bot boot (store/app-db.js).
// ─────────────────────────────────────────────────────────────
import { openAppDb } from '../store/app-db.js'

function main() {
  const db = openAppDb()
  console.log(`migrate-db: OK, schema_version = ${db.schemaVersion()}`)
  db.close()
}

try {
  main()
} catch (err) {
  console.error('migrate-db gagal:', err.message)
  process.exit(1)
}
