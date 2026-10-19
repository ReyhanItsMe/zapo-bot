// ─────────────────────────────────────────────────────────────
// events/call.js — panggilan masuk ke nomor bot.
// Default perilaku (FEATURE_ANTICALL=true): catat + abaikan.
// Menolak panggilan secara aktif butuh API coordinator yang
// bentuknya tidak terkonfirmasi dari docs yang dibaca
// (docs/ZAPO-NOTES.md §10) — jadi base ini TIDAK memanggil
// method tebak-tebakan yang bisa crash / salah sasaran.
// Aktifkan penolakan aktif di sini setelah verifikasi docs.
// ─────────────────────────────────────────────────────────────
export default {
  name: 'call',
  once: false,
  async run({ app }, event) {
    const { log, config } = app
    // TODO(verify): field event call zapo-js (callId, from, status) — dibaca defensif.
    const from = event?.from || event?.peerJid || event?.key?.remoteJid || 'tidak-dikenal'
    const callId = event?.id || event?.callId || '-'
    if (config.features.antiCall) {
      log?.info?.(`Panggilan masuk diabaikan (antiCall aktif). dari=${from} id=${callId}`)
      // TODO(verify): method reject call zapo-js tidak ditemukan di docs yang dibaca.
      // Jangan panggil method spekulatif; pencatatan ini adalah perilaku aman default.
      return
    }
    log?.info?.(`Panggilan masuk diterima sistem (antiCall nonaktif). dari=${from} id=${callId}`)
  }
}
