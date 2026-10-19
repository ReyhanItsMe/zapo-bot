# 10 — Memperbarui Bot (Updating)

Update produk akan datang sebagai paket baru. **Jangan menimpa seluruh folder** — karya kamu ada di dalamnya.

## Folder milik kamu (JANGAN ditimpa)

```
.env                 ← konfigurasi & rahasia kamu
plugins/             ← perintah buatanmu (file contoh boleh diperbarui manual)
config/              ← hanya bila kamu mengubahnya (bandingkan dulu)
assets/              ← gambar/dokumen punyamu
data/                ← sesi & database — TIDAK PERNAH ditimpa/dikirim ke siapa pun
```

## Folder inti (boleh ditimpa dari paket update)

```
core/  lib/  middlewares/  events/  store/  services/
main.js  package.json  scripts/  docs/
```

## Prosedur update yang aman

1. **Stop bot.** Backup seluruh folder (terutama `data/` dan `.env`).
2. Timpa folder inti dari paket baru (daftar di atas).
3. Untuk `plugins/` dan `config/`: bandingkan file bawaan yang berubah (mis. `exampleCommands.js`) dan salin hanya bagian yang kamu mau — file plugin buatanmu sendiri biarkan.
4. `npm install` (dependency bisa berubah versi).
5. `npm run migrate` (migrasi DB idempotent).
6. Start bot, uji `.ping` dan `.menu`.

## Update zapo-js saja

Bila WhatsApp mengubah protokol (gejala umum: gagal connect / error 405), sering cukup:

```bash
npm update zapo-js
npm start
```

Jangan mengubah file di dalam `node_modules/` — perubahanmu hilang saat `npm install` dan tidak ikut terbawa saat deploy ulang.
