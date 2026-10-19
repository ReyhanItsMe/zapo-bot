// ─────────────────────────────────────────────────────────────
// lib/logger.js — logger konsol sederhana dengan level & waktu.
// Sengaja tanpa dependency: dipakai sejak detik pertama boot,
// sebelum WaClient/logger zapo-js dibuat.
// Bentuk objek { debug, info, warn, error, child } ini juga yang
// diteruskan ke WaClient sebagai logger.
// TODO(verify): WaClient mungkin mengharapkan logger bawaan
// zapo-js (ConsoleLogger/createPinoLogger). Bila bot gagal boot
// karena logger, ganti di core/client.js — lihat KNOWN-ISSUES.
// ─────────────────────────────────────────────────────────────

const LEVELS = { trace: 5, debug: 10, info: 20, warn: 30, error: 40, fatal: 50 }

function timestamp(timeZone) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(new Date())
}

export function createLogger({ level = 'info', timeZone = 'Asia/Jakarta', scope = '' } = {}) {
  const threshold = LEVELS[level] ?? LEVELS.info
  const write = (name, args) => {
    if (LEVELS[name] < threshold) return
    const tag = scope ? `${name.toUpperCase()} ${scope}` : name.toUpperCase()
    const line = `[${timestamp(timeZone)}] [${tag}]`
    if (name === 'error' || name === 'fatal') console.error(line, ...args)
    else if (name === 'warn') console.warn(line, ...args)
    else console.log(line, ...args)
  }
  const logger = {
    trace: (...args) => write('trace', args),
    fatal: (...args) => write('fatal', args),
    debug: (...args) => write('debug', args),
    info: (...args) => write('info', args),
    warn: (...args) => write('warn', args),
    error: (...args) => write('error', args),
    child: (childScope) => createLogger({ level, timeZone, scope: childScope ? `${scope}:${childScope}`.replace(/^:/, '') : scope })
  }
  return logger
}

export default createLogger
