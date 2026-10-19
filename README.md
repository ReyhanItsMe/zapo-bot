# zapo-bot — Base Bot WhatsApp (zapo-js)

Base bot WhatsApp **siap pakai & siap dikembangkan** berbasis [zapo-js](https://zapo.to): modular, berbasis plugin, penyimpanan SQLite, dan pesan pengguna berbahasa Indonesia.

> ⚠️ **Disclaimer penting:** zapo-js adalah library **tidak resmi** — tidak berafiliasi dan tidak didukung WhatsApp/Meta. Bot terhubung sebagai perangkat tertaut (seperti WhatsApp Web). **Ada risiko nomor dibatasi atau diblokir permanen** bila dipakai melanggar ketentuan WhatsApp (spam, broadcast massal, dsb). **Selalu gunakan nomor khusus bot**, jangan nomor pribadi/utama. Baca `docs/12-faq.md`.

## Mulai dalam 5 menit

```bash
cp .env.example .env   # lalu isi OWNER_NUMBERS dengan nomormu
npm install
npm start              # scan QR yang muncul (atau pakai pairing code)
```

Kirim `ping` ke nomor bot → bot membalas `Pong!`. Kirim `.menu` untuk daftar perintah.

Panduan lengkap ada di folder `docs/` — mulai dari **`docs/01-getting-started.md`**.

## Folder aman diedit vs inti

| Folder | Status |
|---|---|
| `plugins/`, `config/`, `assets/`, `.env` | ✅ **Aman diedit** — di sinilah kamu mengembangkan bot |
| `docs/`, `scripts/` | ✅ Aman dibaca/diubah seperlunya |
| `core/`, `lib/`, `middlewares/`, `events/`, `store/`, `services/` | ⚠️ **Inti bot** — ubah hanya bila paham; update produk bisa menimpa folder ini (lihat `docs/10-updating.md`) |
| `data/` | 🚫 Runtime (sesi & database) — jangan diedit manual, jangan dibagikan |

## Perintah aktif bawaan

`.ping` · `.menu` · `.info` · `.reload` (owner) · `.ban` / `.unban` (owner) · `.tagall` (grup)

Contoh perintah lain (36 contoh: sticker, kick, broadcast, AI, kalkulator, dll) ada di `plugins/*/exampleCommands.js` — semua nonaktif, salin & aktifkan sesuai `docs/05-plugin-guide.md`.

## Skrip

```bash
npm start          # jalankan bot
npm run migrate    # migrasi database aplikasi (idempotent)
npm run clean      # bersihkan data/temp
```

Butuh Node.js >= 22.13 (22 LTS, 24, atau 26), dan `ffmpeg` untuk fitur media (lihat `docs/09-media-and-ffmpeg.md`). Deploy di Pterodactyl/VPS: `docs/02-installation.md`.
