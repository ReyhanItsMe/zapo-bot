// ─────────────────────────────────────────────────────────────
// main.js — titik masuk zapo-bot.
// Urutan boot:
//   1. config (validasi .env)        4. loader (middleware/event/plugin)
//   2. DB aplikasi (migrasi)         5. pasang event handler ke client
//   3. WaClient + antrean kirim      6. connect (QR/pairing) → siap
// Shutdown (SIGINT/SIGTERM): scheduler.stop → antrean.stop →
// client.disconnect → db.close. Baca docs/04-architecture.md
// ─────────────────────────────────────────────────────────────
import { config } from './config/index.js'
import { createLogger } from './lib/logger.js'
import { createSendQueue } from './lib/queue.js'
import { openAppDb } from './store/app-db.js'
import { createClient } from './core/client.js'
import { createConnectionManager } from './core/connection.js'
import { createLoader } from './core/loader.js'
import { createDispatcher } from './core/dispatcher.js'
import { createUserService } from './services/user.js'
import { createGroupService } from './services/group.js'
import { createMediaService } from './services/media.js'
import { createApiService } from './services/api.js'
import { createScheduler } from './services/scheduler.js'
import { mkdirSync } from 'node:fs'

for (const dir of ['data/auth', 'data/temp', 'data/logs']) mkdirSync(dir, { recursive: true })

const log = createLogger({ level: config.logLevel, timeZone: config.timezone })

async function boot() {
  log.info(`Memulai ${config.name} (sesi: ${config.sessionId}, prefix: ${config.prefixes.join(' ')})`)

  const db = openAppDb()
  log.info('Database aplikasi siap (data/app.sqlite).')

  const services = {
    user: createUserService({ db, config }),
    group: createGroupService({ log }),
    media: createMediaService({ log }),
    api: createApiService({ log }),
    scheduler: createScheduler({ log, timezone: config.timezone })
  }

  const { client } = await createClient({ config, log })

  // Antrean kirim: SEMUA pesan keluar bot melewati lib/queue.js.
  const queue = createSendQueue({
    sender: (jid, content, options) => client.message.send(jid, content, options),
    minDelayMs: config.sendMinDelayMs,
    log
  })

  const loader = createLoader({ log })
  const registry = await loader.loadAll()

  // Menu & reload membaca registry lewat services (keputusan desain:
  // kontrak ctx tidak memuat registry, jadi jembatan ini eksplisit).
  services.menu = {
    list: () => loader.registry.pluginList,
    reload: () => loader.reload()
  }

  const connection = createConnectionManager({ client, config, log })
  connection.bindAuthEvents()

  const dispatcher = createDispatcher({ client, config, db, services, queue, log, registry: loader.registry })

  const app = { config, db, services, dispatcher, log, connection, queue, loader }
  for (const handler of loader.registry.events) {
    const wrapped = async (event) => {
      try { await handler.run({ client, app }, event) } catch (err) {
        log.error(`Error event "${handler.name}":`, err)
      }
    }
    if (handler.once) client.once(handler.name, wrapped)
    else client.on(handler.name, wrapped)
  }
  log.info(`${loader.registry.events.length} event handler terpasang.`)

  // Tugas berkala contoh: bersihkan antrean cooldown tidak perlu —
  // bot ini cukup mencontohkan heartbeat log tiap 6 jam (debug).
  services.scheduler.every(6 * 60 * 60 * 1000, () => {
    log.debug(`Heartbeat: antrean kirim = ${queue.size} pesan menunggu/aktif.`)
  }, 'heartbeat')

  // ── Shutdown rapi ─────────────────────────────────────────
  let shuttingDown = false
  const shutdown = async (signal) => {
    if (shuttingDown) return
    shuttingDown = true
    log.info(`Menerima ${signal} — mematikan bot dengan rapi...`)
    try { services.scheduler.stop() } catch { /* lanjut */ }
    try { queue.stop() } catch { /* lanjut */ }
    try { await connection.disconnect() } catch { /* lanjut */ }
    try { db.close() } catch { /* lanjut */ }
    log.info('Bot berhenti. Sesi tersimpan — hidupkan lagi tanpa pairing ulang.')
    process.exit(0)
  }
  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))

  await connection.connect()
}

boot().catch((err) => {
  log.error('Boot gagal total:', err)
  console.error('\nBot gagal start. Cek pesan di atas, lalu lihat docs/11-troubleshooting.md\n')
  process.exit(1)
})
