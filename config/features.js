// ─────────────────────────────────────────────────────────────
// config/features.js — toggle fitur global bot.
// AMAN diedit pembeli. Setiap toggle bisa dioverride dari .env
// (FEATURE_ANTILINK=true dsb). Sebagian fitur juga bisa diatur
// per-grup lewat tabel `groups.settings` di database aplikasi.
// ─────────────────────────────────────────────────────────────

const bool = (env, key, fallback) =>
  env[key] === undefined ? fallback : env[key] === 'true'

export function featureConfig(env) {
  return {
    // Hapus pesan berisi tautan di grup (butuh bot jadi admin)
    antilink: bool(env, 'FEATURE_ANTILINK', false),
    // Sambut anggota baru / ucapkan selamat tinggal di grup
    welcome: bool(env, 'FEATURE_WELCOME', false),
    // Tolak/abaikan panggilan masuk ke nomor bot
    antiCall: bool(env, 'FEATURE_ANTICALL', true),
    // Tandai pesan masuk sebagai dibaca (centang biru)
    autoRead: bool(env, 'FEATURE_AUTOREAD', false),
    // Sistem kuota harian untuk command ber-limit
    limit: bool(env, 'FEATURE_LIMIT', true),
    // Sistem premium (user premium bebas limit harian)
    premium: bool(env, 'FEATURE_PREMIUM', true)
  }
}
