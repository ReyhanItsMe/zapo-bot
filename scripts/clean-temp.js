// ─────────────────────────────────────────────────────────────
// scripts/clean-temp.js — bersihkan data/temp (file unduhan &
// hasil proses media). Dijalankan manual: npm run clean
// Sengaja TIDAK menghapus data/auth & data/app.sqlite.
// ─────────────────────────────────────────────────────────────
import { mkdir, readdir, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const TEMP_DIR = resolve('data/temp')

async function main() {
  await mkdir(TEMP_DIR, { recursive: true })
  const entries = await readdir(TEMP_DIR)
  let count = 0
  for (const name of entries) {
    if (name === '.gitkeep') continue
    await rm(join(TEMP_DIR, name), { recursive: true, force: true })
    count += 1
  }
  console.log(`clean-temp: ${count} item dihapus dari data/temp.`)
}

main().catch((err) => {
  console.error('clean-temp gagal:', err.message)
  process.exit(1)
})
