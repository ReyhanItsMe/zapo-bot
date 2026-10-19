# 02 — Instalasi (Lokal, Pterodactyl, VPS)

## A. Instalasi lokal / umum

```bash
cp .env.example .env   # edit: OWNER_NUMBERS dsb
npm install
npm start
```

Syarat: Node.js >= 22.13, Linux/macOS/Windows. Untuk fitur media, pasang juga `ffmpeg` (bagian D).

## B. Pterodactyl (langkah demi langkah)

1. **Buat server** dengan egg **Node.js** (image Node 22 disarankan; Node 20 tidak didukung lagi oleh better-sqlite3 versi ini).
2. **Upload** isi `zapo-bot.zip` ke file manager panel (ekstrak di root server, pastikan `main.js` & `package.json` berada di root, bukan di dalam subfolder ganda).
3. Buat file **`.env`** dari contoh `.env.example`, isi minimal:
   - `OWNER_NUMBERS=628xxxxxxxxxx` (nomormu)
   - biarkan `USE_PAIRING_CODE=false` bila bisa melihat console panel untuk scan QR.
4. Atur **Startup Command** egg ke file utama `main.js` (egg Node.js umumnya menjalankan `npm start` atau file index/main — sesuaikan dengan egg yang dipakai; bot ini menjalankan `node main.js`).
5. Tekan **Start**. Buka tab **Console**: saat QR muncul, scan dari HP nomor bot. QR berotasi — scan QR terbaru.
6. Bila console sulit dipakai untuk scan, pakai pairing code: set `USE_PAIRING_CODE=true` + `PAIRING_NUMBER=62...`, restart, lalu masukkan kode 8 karakter dari console ke HP.
7. Setelah tertaut, sesi tersimpan di `data/auth/state.sqlite`. Restart berikutnya **tidak perlu scan lagi**.
8. Pastikan alokasi disk cukup: folder `data/` tumbuh (database + temp media).

> Panel menekan tombol Stop mengirim sinyal berhenti — bot menangani SIGINT/SIGTERM dan menutup sesi dengan rapi (bukan logout, sesi tetap tersimpan).

## C. VPS Linux x64 (Ubuntu/Debian contoh)

```bash
# Node.js 22 LTS (NodeSource) — sesuaikan dengan distro kamu
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs ffmpeg

unzip zapo-bot.zip && cd zapo-bot
cp .env.example .env && nano .env
npm install
npm start   # scan QR / pairing sekali

# Jalan 24 jam dengan PM2:
sudo npm install -g pm2
pm2 start main.js --name zapo-bot
pm2 save && pm2 startup
pm2 logs zapo-bot
```

Catatan VPS: gunakan user non-root untuk menjalankan bot, backup folder `data/` secara berkala (itu sesi + database kamu), dan jangan expose port apa pun — bot ini tidak membuka server HTTP.

## D. ffmpeg (untuk fitur media)

```bash
# Ubuntu/Debian
sudo apt-get install -y ffmpeg
ffmpeg -version && ffprobe -version
```

Di Pterodactyl, ffmpeg bergantung image egg — bila tidak tersedia, fitur stiker dasar (sharp) tetap jalan; yang membutuhkan ffprobe (info media, sebagian proses video) akan membalas pesan bahwa ffmpeg belum terpasang. Detail: `09-media-and-ffmpeg.md`.

## Update dependency

Versi dependency di `package.json` ter-pin. Update zapo-js saja bila ada rilis perbaikan protokol (mis. error 405): `npm update zapo-js` lalu restart dan uji `.ping`. Lihat juga `10-updating.md`.
