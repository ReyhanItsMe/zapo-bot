// ─────────────────────────────────────────────────────────────
// core/client.js — membuat WaClient zapo-js + store auth.
// Dipisahkan agar main.js & pengujian bisa memakai ulang.
// Lihat docs/ZAPO-NOTES.md §1, §2, §8, §9.
// ─────────────────────────────────────────────────────────────
import { WaClient, ConsoleLogger } from 'zapo-js'
import { createAuthStore } from '../store/auth.js'

async function loadMediaProcessor(log) {
  // @zapo-js/media-utils bersifat OPSIONAL. Bot tetap boot tanpanya;
  // konsekuensinya media terkirim tanpa thumbnail/waveform.
  try {
    const mod = await import('@zapo-js/media-utils')
    if (typeof mod.createMediaProcessor !== 'function') throw new Error('createMediaProcessor tidak ditemukan')
    log?.info?.('Media processor aktif (@zapo-js/media-utils). Pastikan ffmpeg & ffprobe terpasang.')
    return mod.createMediaProcessor()
  } catch (err) {
    log?.warn?.(`@zapo-js/media-utils tidak aktif (${err.message}). Media tetap terkirim tanpa thumbnail/waveform. Lihat docs/09-media-and-ffmpeg.md`)
    return undefined
  }
}

export async function createClient({ config, log }) {
  const store = createAuthStore(log)
  const processor = await loadMediaProcessor(log)

  const options = {
    store,
    sessionId: config.sessionId,
    connectTimeoutMs: 15_000,
    nodeQueryTimeoutMs: 30_000,
    history: { enabled: false, requireFullSync: false },
    markOnlineOnConnect: false
  }
  // TODO(verify): bentuk opsi media processor di WaClientOptions (diduga `media: { processor }`).
  if (processor) options.media = { processor }

  // WaClient memakai logger bawaan zapo-js (ConsoleLogger). Logger buatan sendiri
  // (lib/logger.js) tetap dipakai untuk log bot; log internal library mengikuti LOG_LEVEL.
  let zapoLogger
  try { zapoLogger = new ConsoleLogger(config.logLevel || 'info') } catch {
    try { zapoLogger = new ConsoleLogger('info') } catch { zapoLogger = log } // log sudah punya trace/fatal
  }
  const client = new WaClient(options, zapoLogger)
  return { client, store }
}

export default createClient
