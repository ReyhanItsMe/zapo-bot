// ─────────────────────────────────────────────────────────────
// services/api.js — HTTP client untuk API EKSTERNAL resmi.
// fetch bawaan Node + timeout (AbortController) + retry eksponensial
// ringan. API key dibaca dari config (.env) oleh pemanggil.
// TANPA scraping situs yang melanggar ToS platform mana pun —
// hanya endpoint API resmi yang kamu konfigurasi sendiri.
// ─────────────────────────────────────────────────────────────
export function createApiService({ log } = {}) {
  async function request(url, { method = 'GET', headers = {}, body, timeoutMs = 10_000, retries = 2 } = {}) {
    let lastError
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
      try {
        const res = await fetch(url, {
          method,
          headers: { 'user-agent': 'zapo-bot/1.0', ...headers },
          body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)),
          signal: controller.signal
        })
        clearTimeout(timer)
        if (!res.ok) throw new Error(`HTTP ${res.status} dari ${new URL(url).host}`)
        const contentType = res.headers.get('content-type') || ''
        return contentType.includes('application/json') ? res.json() : res.text()
      } catch (err) {
        clearTimeout(timer)
        lastError = err.name === 'AbortError' ? new Error(`Timeout ${timeoutMs}ms memanggil API.`) : err
        if (attempt < retries) await new Promise((r) => setTimeout(r, 500 * 2 ** attempt))
      }
    }
    log?.warn?.('Panggilan API gagal:', lastError?.message || lastError)
    throw lastError
  }

  return {
    request,
    get: (url, opts) => request(url, { ...opts, method: 'GET' }),
    post: (url, body, opts) => request(url, { ...opts, method: 'POST', body })
  }
}

export default createApiService
