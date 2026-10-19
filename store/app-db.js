// ─────────────────────────────────────────────────────────────
// store/app-db.js — database APLIKASI bot (bukan sesi WhatsApp).
// File: data/app.sqlite (terpisah dari data/auth/state.sqlite).
// Tabel: users, groups, settings, meta(schema_version).
// Migrasi bersifat idempotent — aman dijalankan berkali-kali
// (dipakai scripts/migrate-db.js dan saat boot).
// ─────────────────────────────────────────────────────────────
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

export const APP_DB_PATH = resolve(process.env.APP_DB_PATH || 'data/app.sqlite')
export const SCHEMA_VERSION = 1

const MIGRATIONS = [
  // ── Migrasi 1: skema awal ────────────────────────────────
  `
  CREATE TABLE IF NOT EXISTS users (
    jid TEXT PRIMARY KEY,
    name TEXT DEFAULT '',
    banned INTEGER NOT NULL DEFAULT 0,
    premium INTEGER NOT NULL DEFAULT 0,
    limit_used INTEGER NOT NULL DEFAULT 0,
    limit_reset_at TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS groups (
    jid TEXT PRIMARY KEY,
    settings TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );
  `
]


// ── Driver SQLite ────────────────────────────────────────────
// Prioritas: better-sqlite3 (cepat, binary siap pakai). Bila modul native
// itu tidak terpasang / gagal dimuat (mis. Node terlalu baru, panel tanpa
// compiler), otomatis pakai node:sqlite bawaan Node 22.13+ — tanpa
// instalasi apa pun. API yang dipakai bot sengaja dibatasi ke
// prepare/exec/close/transaction/pragma supaya kedua driver sama.
function openDriver(dbPath) {
  try {
    const Database = require('better-sqlite3')
    const db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    return { db, driver: 'better-sqlite3' }
  } catch (nativeErr) {
    let DatabaseSync
    try {
      ;({ DatabaseSync } = require('node:sqlite'))
    } catch {
      throw new Error(
        'Tidak ada driver SQLite. Pasang better-sqlite3 (npm install) atau pakai Node 22.13+ ' +
        `(node:sqlite). Detail better-sqlite3: ${nativeErr?.message || nativeErr}`
      )
    }
    const raw = new DatabaseSync(dbPath)
    raw.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
    const db = {
      prepare: (sql) => raw.prepare(sql),
      exec: (sql) => raw.exec(sql),
      close: () => raw.close(),
      pragma: (sql) => raw.exec(`PRAGMA ${sql}`),
      transaction: (fn) => (...args) => {
        raw.exec('BEGIN')
        try {
          const result = fn(...args)
          raw.exec('COMMIT')
          return result
        } catch (err) {
          try { raw.exec('ROLLBACK') } catch { /* abaikan */ }
          throw err
        }
      }
    }
    return { db, driver: 'node:sqlite' }
  }
}

export function migrate(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '');`)
  const row = db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get()
  let version = row ? Number(row.value) || 0 : 0
  const apply = db.transaction(() => {
    while (version < MIGRATIONS.length) {
      db.exec(MIGRATIONS[version])
      version += 1
      db.prepare("INSERT INTO meta(key, value) VALUES('schema_version', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(String(version))
    }
  })
  apply()
  return version
}

export function openAppDb(dbPath = APP_DB_PATH) {
  mkdirSync(dirname(dbPath), { recursive: true })
  const { db, driver } = openDriver(dbPath)
  migrate(db)

  const api = {
    raw: db,
    driver,
    schemaVersion: () => {
      const r = db.prepare("SELECT value FROM meta WHERE key='schema_version'").get()
      return r ? Number(r.value) || 0 : 0
    },

    // ── Users ──────────────────────────────────────────────
    getUser(jid) {
      if (!jid) return null
      return db.prepare('SELECT * FROM users WHERE jid = ?').get(jid) || null
    },
    ensureUser(jid, name = '') {
      if (!jid) return null
      db.prepare(
        `INSERT INTO users(jid, name) VALUES(?, ?)
         ON CONFLICT(jid) DO UPDATE SET name = CASE WHEN excluded.name != '' THEN excluded.name ELSE users.name END`
      ).run(jid, name || '')
      return api.getUser(jid)
    },
    setBanned(jid, banned) {
      api.ensureUser(jid)
      db.prepare('UPDATE users SET banned = ? WHERE jid = ?').run(banned ? 1 : 0, jid)
      return api.getUser(jid)
    },
    setPremium(jid, premium) {
      api.ensureUser(jid)
      db.prepare('UPDATE users SET premium = ? WHERE jid = ?').run(premium ? 1 : 0, jid)
      return api.getUser(jid)
    },
    /** Tambah pemakaian limit. Mengembalikan baris user terbaru. */
    addLimitUsed(jid, amount = 1, resetAt = '') {
      api.ensureUser(jid)
      db.prepare('UPDATE users SET limit_used = limit_used + ?, limit_reset_at = ? WHERE jid = ?')
        .run(amount, resetAt, jid)
      return api.getUser(jid)
    },
    resetLimit(jid, resetAt = '') {
      api.ensureUser(jid)
      db.prepare('UPDATE users SET limit_used = 0, limit_reset_at = ? WHERE jid = ?').run(resetAt, jid)
      return api.getUser(jid)
    },

    // ── Groups ─────────────────────────────────────────────
    getGroup(jid) {
      if (!jid) return null
      const row = db.prepare('SELECT * FROM groups WHERE jid = ?').get(jid)
      if (!row) return null
      let settings = {}
      try { settings = JSON.parse(row.settings || '{}') } catch { settings = {} }
      return { ...row, settings }
    },
    ensureGroup(jid) {
      if (!jid) return null
      db.prepare('INSERT INTO groups(jid) VALUES(?) ON CONFLICT(jid) DO NOTHING').run(jid)
      return api.getGroup(jid)
    },
    setGroupSetting(jid, key, value) {
      const group = api.ensureGroup(jid)
      const settings = { ...(group?.settings || {}), [key]: value }
      db.prepare('UPDATE groups SET settings = ? WHERE jid = ?').run(JSON.stringify(settings), jid)
      return api.getGroup(jid)
    },
    getGroupSetting(jid, key, fallback = undefined) {
      const group = api.getGroup(jid)
      const value = group?.settings?.[key]
      return value === undefined ? fallback : value
    },

    // ── Settings (key-value global) ─────────────────────────
    getSetting(key, fallback = '') {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
      return row ? row.value : fallback
    },
    setSetting(key, value) {
      db.prepare(
        'INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
      ).run(key, String(value))
    },

    close() {
      try { db.close() } catch { /* sudah tertutup */ }
    }
  }
  return api
}

export default openAppDb
