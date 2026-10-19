// lib/rich/links.js — resolusi URL untuk tombol/kartu menu.
export const DEFAULT_URL = 'https://zapo.to'

/**
 * Ubah input `url` menjadi URL final. Urutan:
 *   1. fungsi      → dipanggil ({ links }) dan hasilnya dipakai (boleh async)
 *   2. nama kunci  → 'website' | 'support' | … dari config/links.js
 *   3. string URL  → dipakai (tanpa http(s):// akan ditambah https://)
 *   4. kosong      → links.website, lalu DEFAULT_URL
 */
export async function resolveUrl(input, links = {}) {
  let value = typeof input === 'function' ? await input({ links }) : input
  if (typeof value === 'string' && Object.hasOwn(links, value)) value = links[value]
  if (value == null || value === '') value = links.website || DEFAULT_URL
  if (typeof value !== 'string') throw new TypeError('url harus berupa string, nama kunci links, atau fungsi')
  value = value.trim()
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}
