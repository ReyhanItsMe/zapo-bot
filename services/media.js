// ─────────────────────────────────────────────────────────────
// services/media.js — pemrosesan media (sharp + ffmpeg) untuk
// plugin media: stiker, ubah format, info media.
// SEMUA fitur bersifat opsional & terdegradasi dengan pesan
// jelas bila dependency/binary tidak tersedia — bot tetap boot.
// ─────────────────────────────────────────────────────────────
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

async function which(binary) {
  try { await execFileAsync('which', [binary]); return true } catch { return false }
}

export function createMediaService({ log } = {}) {
  let sharpPromise = null
  const loadSharp = () => {
    if (!sharpPromise) {
      sharpPromise = import('sharp').then((m) => m.default || m).catch(() => null)
    }
    return sharpPromise
  }

  return {
    async capabilities() {
      const sharp = await loadSharp()
      return {
        sharp: Boolean(sharp),
        ffmpeg: await which('ffmpeg'),
        ffprobe: await which('ffprobe')
      }
    },

    /** Buffer gambar → stiker WebP 512x512. Butuh sharp. */
    async imageToSticker(inputBuffer) {
      const sharp = await loadSharp()
      if (!sharp) {
        throw new Error('Fitur stiker butuh paket "sharp" (optionalDependency). Install dengan: npm install sharp — atau nonaktifkan plugin stiker.')
      }
      if (!Buffer.isBuffer(inputBuffer) || inputBuffer.length === 0) {
        throw new Error('Gambar kosong/tidak valid. Kirim atau reply gambar lalu coba lagi.')
      }
      return sharp(inputBuffer)
        .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .webp({ quality: 80 })
        .toBuffer()
    },

    /** Buffer stiker WebP → PNG. Butuh sharp. */
    async stickerToImage(inputBuffer) {
      const sharp = await loadSharp()
      if (!sharp) throw new Error('Fitur ini butuh paket "sharp". Install dengan: npm install sharp')
      return sharp(inputBuffer).png().toBuffer()
    },

    /** Info dasar media lewat ffprobe (durasi, ukuran, codec). */
    async probe(inputBuffer, ext = 'bin') {
      if (!(await which('ffprobe'))) {
        throw new Error('Fitur info media butuh "ffprobe" (paket ffmpeg) di server. Lihat docs/09-media-and-ffmpeg.md')
      }
      const dir = await mkdtemp(join(tmpdir(), 'zapo-media-'))
      const file = join(dir, `input.${ext}`)
      try {
        await writeFile(file, inputBuffer)
        const { stdout } = await execFileAsync('ffprobe', [
          '-v', 'error', '-show_entries', 'format=duration,size,format_name',
          '-show_entries', 'stream=codec_name,width,height', '-of', 'json', file
        ], { timeout: 20_000 })
        return JSON.parse(stdout)
      } finally {
        await rm(dir, { recursive: true, force: true }).catch(() => {})
      }
    },

    /**
     * Ambil buffer media dari pesan yang di-quote / pesan itu sendiri.
     * TODO(verify): API download media zapo-js (`downloadMediaMessage`?)
     * dan bentuk message media (url/mediaKey/directPath) belum
     * terkonfirmasi penuh — fungsi ini mencoba beberapa bentuk umum
     * lalu gagal dengan pesan jelas, bukan crash.
     */
    async download(client, message) {
      if (!message || typeof message !== 'object') {
        throw new Error('Tidak ada media pada pesan itu. Kirim/reply media yang ingin diproses.')
      }
      const mediaObj = message.imageMessage || message.videoMessage || message.stickerMessage ||
        message.audioMessage || message.documentMessage || message
      // Bila pemanggil sudah menyediakan buffer (mis. dari handler unduhan sendiri):
      if (Buffer.isBuffer(mediaObj?.buffer)) return mediaObj.buffer
      if (Buffer.isBuffer(mediaObj?.data)) return mediaObj.data

      const candidates = [
        client?.message?.downloadMediaMessage,
        client?.message?.downloadMedia,
        client?.message?.download
      ].filter((fn) => typeof fn === 'function')
      if (!candidates.length) {
        // TODO(verify): sesuaikan dengan API download resmi zapo-js setelah verifikasi docs.
        throw new Error('Unduh media belum terhubung ke API zapo-js di base ini (lihat KNOWN-ISSUES). Media dari pesan belum bisa diproses otomatis.')
      }
      const fn = candidates[0]
      const result = await fn.call(client.message, message)
      if (Buffer.isBuffer(result)) return result
      if (result instanceof Uint8Array) return Buffer.from(result)
      if (result && typeof result.arrayBuffer === 'function') return Buffer.from(await result.arrayBuffer())
      throw new Error('Hasil unduhan media tidak dikenal bentuknya. Lihat KNOWN-ISSUES untuk catatan verifikasi API download zapo-js.')
    },

    async readTempFile(path) { return readFile(path) },
    log
  }
}

export default createMediaService
