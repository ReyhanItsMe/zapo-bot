// ─────────────────────────────────────────────────────────────
// events/message.js — event pesan masuk zapo-js.
// Tugas file ini HANYA: (opsional) tandai dibaca, lalu serahkan
// ke dispatcher. Seluruh logika perintah ada di dispatcher +
// middleware + plugin. Lihat docs/ZAPO-NOTES.md §4.
// ─────────────────────────────────────────────────────────────
export default {
  name: 'message',
  once: false,
  async run({ client, app }, event) {
    if (app.config.features.autoRead) {
      // TODO(verify): API mark-read/receipt zapo-js belum terkonfirmasi dari docs yang dibaca.
      // Dicoba defensif lewat message coordinator; kegagalan diabaikan (bukan fitur kritis).
      try {
        const read = client.message?.markRead || client.message?.sendReceipt || client.message?.readMessages
        if (typeof read === 'function') await read.call(client.message, event)
      } catch { /* abaikan */ }
    }
    await app.dispatcher.dispatch(event)
  }
}
