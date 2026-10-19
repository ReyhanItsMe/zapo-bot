// lib/rich/assets.js — akses file di folder assets/ dan normalisasi input media.
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { isAbsolute, resolve } from 'node:path'

const ASSETS_DIR = fileURLToPath(new URL('../../assets/', import.meta.url))

export const assetPath = (name) => resolve(ASSETS_DIR, name)
export const hasAsset = (name) => existsSync(assetPath(name))
export const readAsset = (name) => readFileSync(assetPath(name))

/**
 * Input media yang diterima semua fungsi ctx.rich.*:
 *   • Buffer / Uint8Array → dipakai apa adanya
 *   • 'menu.jpg'          → file di folder assets/
 *   • '/abs/path.jpg' atau 'data/temp/x.jpg' → file di disk
 *   • 'https://…'         → dikembalikan apa adanya (TODO(verify): apakah media zapo menerima URL)
 * Mengembalikan nilai untuk field `media` zapo-js, atau melempar error bila file tidak ada.
 */
export function resolveMedia(input) {
  if (input == null || input === '') throw new Error('media wajib diisi')
  if (typeof input !== 'string') return input
  if (/^https?:\/\//i.test(input)) return input
  const candidates = [isAbsolute(input) ? input : resolve(process.cwd(), input), assetPath(input)]
  const found = candidates.find((c) => existsSync(c))
  if (!found) throw new Error(`Media tidak ditemukan: ${input}`)
  return found
}

/** Seperti resolveMedia tetapi mengembalikan Buffer (untuk thumbnail). Tidak melempar: undefined bila tidak ada. */
export function toBuffer(input) {
  if (input == null || input === '') return undefined
  if (typeof input !== 'string') return Buffer.from(input)
  try {
    const found = resolveMedia(input)
    return typeof found === 'string' && !/^https?:\/\//i.test(found) ? readFileSync(found) : undefined
  } catch {
    return undefined
  }
}
