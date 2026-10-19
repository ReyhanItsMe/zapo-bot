// ─────────────────────────────────────────────────────────────
// lib/queue.js — antrean kirim pesan keluar.
// Semua pengiriman bot WAJIB lewat sini (ctx.send / ctx.reply):
//  - jeda acak kecil antar pesan (menyerupai manusia, mengurangi
//    risiko pembatasan akun),
//  - batas konkurensi agar tidak membanjiri server,
//  - urutan FIFO per antrean global.
// Fungsi murni dari sisi dependensi: sender di-inject dari core.
// ─────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function createSendQueue({ sender, minDelayMs = 350, maxDelayMs = 900, concurrency = 2, log } = {}) {
  if (typeof sender !== 'function') {
    throw new Error('createSendQueue: "sender" wajib berupa fungsi async (jid, content, options) => result')
  }
  const pending = []
  let active = 0
  let stopped = false
  let lastSentAt = 0

  async function drain() {
    if (active >= concurrency) return
    const item = pending.shift()
    if (!item) return
    active += 1
    try {
      const sinceLast = Date.now() - lastSentAt
      const jitter = minDelayMs + Math.random() * Math.max(0, maxDelayMs - minDelayMs)
      if (lastSentAt && sinceLast < jitter) await sleep(jitter - sinceLast)
      if (stopped) throw new Error('Antrean kirim sudah dihentikan (bot shutdown).')
      const result = await sender(item.jid, item.content, item.options)
      lastSentAt = Date.now()
      item.resolve(result)
    } catch (err) {
      log?.warn?.('Gagal mengirim pesan lewat antrean:', err?.message || err)
      item.reject(err)
    } finally {
      active -= 1
      void drain()
    }
  }

  return {
    /** Masukkan pesan ke antrean. Mengembalikan Promise hasil kirim. */
    send(jid, content, options) {
      if (stopped) return Promise.reject(new Error('Antrean kirim sudah dihentikan (bot shutdown).'))
      return new Promise((resolve, reject) => {
        pending.push({ jid, content, options, resolve, reject })
        void drain()
      })
    },
    /** Hentikan antrean (dipakai saat shutdown). Item menunggu ditolak dengan jelas. */
    stop() {
      stopped = true
      while (pending.length) {
        pending.shift().reject(new Error('Bot dimatikan sebelum pesan terkirim.'))
      }
    },
    get size() { return pending.length + active }
  }
}

export default createSendQueue
