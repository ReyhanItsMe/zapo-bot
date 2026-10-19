// ─────────────────────────────────────────────────────────────
// services/scheduler.js — tugas terjadwal sederhana tanpa cron
// dependency: daftarkan job interval / harian (per timezone).
// Semua job dibungkus try/catch — job yang error tidak membunuh
// scheduler maupun bot. stop() wajib dipanggil saat shutdown.
// ─────────────────────────────────────────────────────────────
export function createScheduler({ log, timezone = 'Asia/Jakarta' } = {}) {
  const timers = new Set()
  let stopped = false

  function nowParts() {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false
    })
    const [hour, minute] = fmt.format(new Date()).split(':').map(Number)
    return { hour, minute }
  }

  function add(timer) { timers.add(timer); return timer }

  return {
    /** Jalankan fn tiap N milidetik. Mengembalikan timer. */
    every(ms, fn, name = 'job') {
      const timer = setInterval(() => {
        if (stopped) return
        Promise.resolve().then(fn).catch((err) => log?.error?.(`Scheduler "${name}" error:`, err))
      }, ms)
      timer.unref?.()
      return add(timer)
    },
    /** Jalankan fn sekali sehari pada jam:menit (timezone config). Cek tiap 30 dtk. */
    dailyAt(hour, minute, fn, name = 'daily') {
      let lastRunKey = ''
      const timer = setInterval(() => {
        if (stopped) return
        const now = nowParts()
        const key = `${now.hour}:${now.minute}`
        if (now.hour === hour && now.minute === minute && lastRunKey !== key) {
          lastRunKey = key
          Promise.resolve().then(fn).catch((err) => log?.error?.(`Scheduler "${name}" error:`, err))
        }
      }, 30_000)
      timer.unref?.()
      return add(timer)
    },
    stop() {
      stopped = true
      for (const timer of timers) clearInterval(timer)
      timers.clear()
    },
    get size() { return timers.size }
  }
}

export default createScheduler
