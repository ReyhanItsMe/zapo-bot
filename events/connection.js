// ─────────────────────────────────────────────────────────────
// events/connection.js — pendengar tipis event koneksi.
// SELURUH logika (reconnect/backoff/status) ada di
// core/connection.js; file ini hanya meneruskan event ke sana,
// sesuai pembagian tanggung jawab di kontrak.
// Catatan: event auth_* (QR/pairing) di-bind langsung oleh
// connection manager di core/connection.js karena harus aktif
// sebelum event handler dari loader terpasang penuh.
// ─────────────────────────────────────────────────────────────
export default {
  name: 'connection',
  once: false,
  async run({ app }, event) {
    app.connection?.handleConnectionEvent?.(event)
  }
}
