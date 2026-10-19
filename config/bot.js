// ─────────────────────────────────────────────────────────────
// config/bot.js — identitas dasar bot.
// File ini AMAN diedit pembeli. Nilai dibaca dari .env lewat
// config/index.js, file ini hanya memetakan & memberi default.
// ─────────────────────────────────────────────────────────────

export function botConfig(env) {
  const prefixes = String(env.PREFIX || '.')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

  return {
    name: env.BOT_NAME || 'ZapoBot',
    // Daftar prefix yang dikenali, contoh: ['.', '!', '#']
    prefixes: prefixes.length ? prefixes : ['.'],
    // Prefix utama (dipakai di menu & contoh usage)
    prefix: (prefixes.length ? prefixes : ['.'])[0],
    sessionId: env.SESSION_ID || 'default',
    timezone: env.TIMEZONE || 'Asia/Jakarta',
    // Nomor owner dalam format digit internasional tanpa "+" (contoh 62812xxxx)
    owners: String(env.OWNER_NUMBERS || '')
      .split(',')
      .map((n) => n.replace(/\D/g, ''))
      .filter(Boolean),
    pairing: {
      usePairingCode: env.USE_PAIRING_CODE === 'true',
      number: String(env.PAIRING_NUMBER || '').replace(/\D/g, ''),
      customCode: env.PAIRING_CODE || undefined
    },
    dailyLimit: Number(env.DAILY_LIMIT || 25),
    maxReconnect: Number(env.MAX_RECONNECT || 10),
    sendMinDelayMs: Number(env.SEND_MIN_DELAY_MS || 350),
    allowEval: env.ALLOW_EVAL === 'true',
    logLevel: env.LOG_LEVEL || 'info'
  }
}
