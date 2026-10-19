// ─────────────────────────────────────────────────────────────
// store/auth.js — store sesi WhatsApp milik zapo-js.
// File SQLite TERPISAH dari DB aplikasi: data/auth/state.sqlite
// Berisi kredensial Noise + sesi Signal. JANGAN dibagikan,
// JANGAN di-commit. Lihat docs/ZAPO-NOTES.md §2.
// ─────────────────────────────────────────────────────────────
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createStore } from 'zapo-js'
import { createSqliteStore } from '@zapo-js/store-sqlite'

export const AUTH_DB_PATH = resolve('data/auth/state.sqlite')

export function createAuthStore(log) {
  mkdirSync(dirname(AUTH_DB_PATH), { recursive: true })
  const store = createStore({
    backends: {
      sqlite: createSqliteStore({ path: AUTH_DB_PATH, driver: 'auto' })
    },
    providers: {
      auth: 'sqlite',
      signal: 'sqlite',
      preKey: 'sqlite',
      session: 'sqlite',
      identity: 'sqlite',
      senderKey: 'sqlite',
      appState: 'sqlite',
      privacyToken: 'sqlite',
      // Arsip pesan/kontak dimatikan ('none'): base bot tidak membutuhkannya
      // dan ini menghemat disk & memori. Ubah ke 'sqlite' bila perlu riwayat.
      messages: 'none',
      threads: 'none',
      contacts: 'none'
    }
  })
  log?.debug?.(`Store auth zapo-js: ${AUTH_DB_PATH}`)
  return store
}

export default createAuthStore
