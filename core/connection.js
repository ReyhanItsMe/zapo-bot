// ─────────────────────────────────────────────────────────────
// core/connection.js — SELURUH logika koneksi WhatsApp:
// tampil QR / pairing code, reconnect exponential backoff,
// klasifikasi error fatal, logout/disconnect.
// events/connection.js hanya mendengarkan event lalu memanggil
// fungsi di file ini. Lihat docs/ZAPO-NOTES.md §4 & §7.
// ─────────────────────────────────────────────────────────────

// Kode/alasan yang TIDAK boleh di-retry: reconnect hanya akan
// memperparah (akun terkunci/banned/perangkat dicabut).
const FATAL_REASONS = new Set([
  'stream_error_replaced', 'stream_error_device_removed', 'stream_error_force_logout',
  'failure_not_authorized', 'failure_banned', 'failure_locked',
  'failure_bad_user_agent', 'primary_identity_key_change'
])
const FATAL_CODES = new Set([401, 403, 406, 409, 516])

export function isFatalDisconnect(event) {
  if (!event) return false
  if (event.isLogout) return true
  if (FATAL_REASONS.has(event.reason)) return true
  if (FATAL_CODES.has(event.code)) return true
  if (event.code === 405) return false // client too old → ditangani dengan saran update, tetap stop loop otomatis
  return false
}

export function createConnectionManager({ client, config, log }) {
  let state = 'idle' // idle | connecting | open | close | logged-out
  let attempts = 0
  let reconnectTimer = null
  let pairingRequested = false
  let stopped = false

  async function showQr(qr) {
    try {
      const qrcode = (await import('qrcode-terminal')).default
      console.log('\nScan QR ini dari WhatsApp → Perangkat tertaut → Tautkan perangkat:\n')
      qrcode.generate(qr, { small: true })
    } catch {
      // Fallback: cetak string QR mentah (bisa ditempel ke generator QR lain)
      console.log('\n[QR] (qrcode-terminal tidak tersedia, string QR mentah):\n', qr, '\n')
    }
  }

  function handleConnectionEvent(event) {
    if (!event) return
    if (event.status === 'open') {
      state = 'open'
      attempts = 0
      log?.info?.(`Terhubung ke WhatsApp${event.isNewLogin ? ' (login baru)' : ''}. Bot siap menerima pesan.`)
      return
    }
    if (event.status === 'close') {
      state = event.isLogout ? 'logged-out' : 'close'
      log?.warn?.(`Koneksi tertutup. reason=${event.reason || '-'} code=${event.code ?? '-'} isLogout=${Boolean(event.isLogout)}`)
      if (stopped) return
      if (event.isLogout || isFatalDisconnect(event)) {
        log?.error?.('Sesi berakhir permanen (logout/banned/perangkat dicabut). Hapus folder data/auth lalu pairing ulang. Bot TIDAK reconnect otomatis untuk kondisi ini.')
        return
      }
      if (event.code === 405) {
        log?.error?.('Versi WhatsApp Web ditolak server (405 client too old). Update zapo-js (npm update zapo-js) lalu jalankan ulang. Bot tidak reconnect otomatis.')
        return
      }
      scheduleReconnect()
    }
  }

  function scheduleReconnect() {
    const max = config.maxReconnect
    if (max > 0 && attempts >= max) {
      log?.error?.(`Menyerah reconnect setelah ${attempts} percobaan (MAX_RECONNECT=${max}). Periksa jaringan/server lalu jalankan ulang bot.`)
      return
    }
    attempts += 1
    const delayMs = Math.min(30_000, 1000 * 2 ** Math.min(attempts, 5))
    log?.info?.(`Reconnect percobaan #${attempts} dalam ${Math.round(delayMs / 1000)} detik...`)
    clearTimeout(reconnectTimer)
    reconnectTimer = setTimeout(() => { void connect() }, delayMs)
  }

  async function connect() {
    if (state === 'open' || stopped) return
    state = 'connecting'
    try {
      await client.connect()
    } catch (err) {
      log?.error?.('Gagal connect:', err?.message || err)
      if (!stopped) scheduleReconnect()
    }
  }

  let pairingFailed = false
  let lastQr = null

  function printPairingCode(code) {
    const pretty = String(code).match(/.{1,4}/g)?.join('-') || code
    console.log(`\n===============================\n KODE PAIRING: ${pretty}\n===============================\nWhatsApp → Perangkat tertaut → Tautkan perangkat → Tautkan dengan nomor telepon, lalu masukkan kode di atas.\n`)
  }

  async function requestPairing() {
    if (!config.pairing.usePairingCode || pairingRequested) return
    pairingRequested = true
    try {
      // docs/ZAPO-NOTES.md §7: requestPairingCode(nomor, tampilkanNotifikasi, kodeCustom)
      const code = await client.auth.requestPairingCode(config.pairing.number, true, config.pairing.customCode)
      if (code) printPairingCode(code)
    } catch (err) {
      pairingFailed = true
      pairingRequested = false
      log?.error?.('Gagal meminta pairing code:', err?.message || err)
      console.log('\nPairing code gagal diminta, beralih ke QR. Kalau terus gagal, kosongkan PAIRING_CODE di .env.\n')
      if (lastQr) void showQr(lastQr)
    }
  }

  function bindAuthEvents() {
    // Mode pairing code: saat server siap menautkan (event auth_qr atau
    // auth_pairing_required), minta kode ke WhatsApp. Mode QR: tampilkan QR.
    // Bila permintaan kode gagal, otomatis jatuh ke QR agar tidak buntu.
    client.on('auth_qr', ({ qr }) => {
      lastQr = qr
      if (config.pairing.usePairingCode && !pairingFailed) { void requestPairing(); return }
      void showQr(qr)
    })
    client.on('auth_pairing_code', ({ code }) => printPairingCode(code))
    client.on('auth_pairing_required', () => { void requestPairing() })
    client.on('auth_passkey_required', ({ hasSigner }) => {
      log?.warn?.(`Server meminta passkey untuk menautkan perangkat (hasSigner=${Boolean(hasSigner)}). Tanpa passkey pemilik akun, penautan tidak bisa dilanjutkan dari bot ini.`)
    })
    client.on('auth_paired', ({ credentials }) => {
      log?.info?.(`Berhasil tertaut sebagai ${credentials?.meJid || 'nomor bot'}. Sesi tersimpan — restart tidak perlu pairing ulang.`)
    })
    client.on('stream_failure', (e) => log?.warn?.('stream_failure:', e?.failureReason || '', e?.failureCode ?? ''))
    client.on('stanza_error', (e) => log?.warn?.('stanza_error:', e?.code ?? '', e?.text || ''))
    client.on('connection', handleConnectionEvent)
  }

  async function disconnect() {
    stopped = true
    clearTimeout(reconnectTimer)
    try { await client.disconnect() } catch { /* abaikan saat shutdown */ }
    state = 'close'
  }

  async function logout() {
    stopped = true
    clearTimeout(reconnectTimer)
    await client.logout()
    state = 'logged-out'
  }

  return {
    connect,
    disconnect,
    logout,
    bindAuthEvents,
    handleConnectionEvent, // diekspos untuk events/connection.js & pengujian
    get state() { return state },
    get attempts() { return attempts }
  }
}

export default createConnectionManager
