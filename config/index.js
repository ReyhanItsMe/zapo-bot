// ─────────────────────────────────────────────────────────────
// config/index.js — pintu masuk konfigurasi.
// Membaca .env (dotenv), menggabungkan config/bot.js +
// config/features.js, lalu MEMVALIDASI. Konfigurasi yang salah
// menghentikan bot dengan pesan yang jelas (bukan crash aneh).
// ─────────────────────────────────────────────────────────────
import 'dotenv/config'
import { botConfig } from './bot.js'
import { featureConfig } from './features.js'
import { linkConfig } from './links.js'

function fail(message) {
  console.error(`\n[CONFIG ERROR] ${message}\nPeriksa file .env kamu (bandingkan dengan .env.example).\n`)
  process.exit(1)
}

function loadConfig() {
  const env = process.env
  const bot = botConfig(env)
  const features = featureConfig(env)

  // ── Validasi ──────────────────────────────────────────────
  if (!bot.name.trim()) fail('BOT_NAME tidak boleh kosong.')
  if (bot.prefixes.some((p) => p.length > 3)) {
    fail('PREFIX terlalu panjang (maks 3 karakter per prefix). Contoh: PREFIX=.,!,#')
  }
  if (bot.owners.some((n) => n.length < 9)) {
    fail('OWNER_NUMBERS berisi nomor yang terlalu pendek. Pakai format internasional tanpa "+", contoh: 6281234567890')
  }
  if (bot.pairing.usePairingCode && !bot.pairing.number) {
    fail('USE_PAIRING_CODE=true tapi PAIRING_NUMBER kosong. Isi nomor bot (digit saja + kode negara) atau matikan USE_PAIRING_CODE.')
  }
  if (bot.pairing.customCode && !/^[1-9A-HJ-NP-TV-Z]{8}$/.test(bot.pairing.customCode)) {
    fail('PAIRING_CODE harus 8 karakter: angka 1-9 dan huruf A-Z tanpa I, O, U, 0. Kosongkan bila ragu.')
  }
  if (!Number.isFinite(bot.dailyLimit) || bot.dailyLimit < 0) {
    fail('DAILY_LIMIT harus angka >= 0.')
  }
  if (!Intl.DateTimeFormat(undefined, { timeZone: bot.timezone })) {
    fail(`TIMEZONE tidak dikenal: "${bot.timezone}". Contoh valid: Asia/Jakarta`)
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: bot.timezone })
  } catch {
    fail(`TIMEZONE tidak dikenal: "${bot.timezone}". Contoh valid: Asia/Jakarta`)
  }
  if (bot.owners.length === 0) {
    console.warn('[CONFIG] OWNER_NUMBERS kosong — bot tetap jalan, tapi perintah owner (ban, reload, broadcast) tidak bisa dipakai siapa pun. Isi di .env untuk mengaktifkannya.')
  }

  return Object.freeze({
    ...bot,
    features,
    links: linkConfig(env),
    api: {
      aiKey: env.AI_API_KEY || '',
      aiUrl: env.AI_API_URL || '',
      translateUrl: env.TRANSLATE_API_URL || ''
    }
  })
}

export const config = loadConfig()
export default config
