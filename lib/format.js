// ─────────────────────────────────────────────────────────────
// lib/format.js — helper teks/angka murni untuk pesan bot.
// Semua pesan pengguna berbahasa Indonesia dan mudah diubah.
// ─────────────────────────────────────────────────────────────

/** 1234567 → "1.234.567" (format id-ID) */
export function formatNumber(n) {
  return new Intl.NumberFormat('id-ID').format(Number(n) || 0)
}

/** Byte → "1.5 MB" */
export function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = Number(bytes) || 0
  let i = 0
  while (value >= 1024 && i < units.length - 1) { value /= 1024; i += 1 }
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
}

/** Milidetik → "1j 2m 3d" (jam/menit/detik) */
export function formatDuration(ms) {
  const totalSec = Math.max(0, Math.floor((Number(ms) || 0) / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const parts = []
  if (h) parts.push(`${h}j`)
  if (m) parts.push(`${m}m`)
  parts.push(`${s}d`)
  return parts.join(' ')
}

/** Waktu sekarang dalam timezone tertentu → "Senin, 18/10/2026 14.30" */
export function formatDateTime(date = new Date(), timeZone = 'Asia/Jakarta') {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone, weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).format(date)
}

/** Potong teks panjang dengan elipsis. */
export function truncate(text, max = 500) {
  const str = String(text ?? '')
  return str.length <= max ? str : `${str.slice(0, Math.max(0, max - 1))}…`
}

/** Escape agar aman disisipkan ke teks biasa (hindari format WA liar). */
export function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Sapaan sesuai jam lokal. */
export function greeting(timeZone = 'Asia/Jakarta') {
  const hour = Number(new Intl.DateTimeFormat('id-ID', { timeZone, hour: '2-digit', hour12: false }).format(new Date()))
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 19) return 'Selamat sore'
  return 'Selamat malam'
}
