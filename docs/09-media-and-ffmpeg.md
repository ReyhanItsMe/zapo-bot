# 09 — Media & ffmpeg

## Tiga lapis fitur media

| Lapis | Butuh | Tanpa itu |
|---|---|---|
| Kirim media dasar (gambar/video/dokumen/audio) | `zapo-js` saja | — tetap bisa kirim |
| Thumbnail, dimensi, waveform voice-note | `@zapo-js/media-utils` (+ `sharp`, `file-type`) | Media terkirim polos tanpa pratinjau — bot tetap jalan |
| Olah media di bot (stiker via `sharp`, info via `ffprobe`) | `sharp` (npm) & binary `ffmpeg/ffprobe` | Plugin terkait membalas pesan jelas, bot tidak crash |

`@zapo-js/native` (akselerator crypto Rust/WASM) juga opsional: terpasang = otomatis dipakai zapo-js, tidak ada kode yang perlu diubah.

## Install

```bash
npm install            # optionalDependencies ikut terpasang bila platform mendukung
sudo apt-get install -y ffmpeg   # Ubuntu/Debian; di Pterodactyl tergantung image
ffmpeg -version && ffprobe -version
```

`sharp` dan `@zapo-js/media-utils` berada di `optionalDependencies` — bila install-nya gagal di platform tertentu, `npm install` utama tetap berhasil dan bot tetap boot.

## Cara bot memakai media (untuk developer)

- Kirim: `ctx.send(jid, { type:'image', media, mimetype:'image/jpeg', caption })`. `media` paling hemat memori berupa **path file** (di-stream), bukan Buffer hasil baca manual.
- Voice note: `{ type:'audio', media, mimetype:'audio/ogg; codecs=opus', ptt:true }`.
- Stiker: `{ type:'sticker', media:<webp>, mimetype:'image/webp' }` — pembuatan WebP lewat `services.media.imageToSticker(buffer)`.
- Video sebaiknya **faststart** (`ffmpeg -i in.mp4 -c copy -movflags +faststart out.mp4`) agar bisa langsung diputar penerima.

## Batasan yang diketahui

Unduh media dari pesan yang di-quote (`services.media.download`) masih menunggu verifikasi API download resmi zapo-js — lihat `KNOWN-ISSUES.md` #5. Contoh plugin `sticker/toimg/mediainfo` sudah menangani kegagalannya dengan pesan ramah.

Bersihkan file sisa proses media berkala: `npm run clean` (mengosongkan `data/temp/`).
