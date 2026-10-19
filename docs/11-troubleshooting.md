# 11 — Troubleshooting

| Gejala | Penyebab umum & cara cek |
|---|---|
| Bot berhenti dengan `[CONFIG ERROR]` | `.env` salah. Baca pesannya — validasi menyebut variabel persisnya (nomor owner, pairing, timezone, prefix). Bandingkan dengan `.env.example`. |
| QR tidak muncul / console kosong | Pastikan start benar-benar menjalankan `node main.js`. Di panel, cek egg memakai file utama yang benar. Coba `LOG_LEVEL=debug`. Alternatif: pairing code. |
| QR muncul tapi scan gagal terus | QR berotasi ±20 detik — scan yang terbaru. Pastikan HP nomor bot online. Hapus `data/auth/` lalu ulangi bila sesi korup (wajib pairing ulang). |
| Pairing code ditolak WhatsApp | Nomor di `PAIRING_NUMBER` harus sama dengan akun di HP dan berformat digit + kode negara. Kode custom harus 8 karakter valid (tanpa I/O/U/0). |
| Bot terkoneksi tapi tidak membalas perintah | (1) Awali dengan prefix yang benar (`.ping`). (2) `OWNER_NUMBERS` tidak memengaruhi balasan publik — cek log: apakah middleware menolak? Set `LOG_LEVEL=debug`. (3) Pastikan mengirim dari nomor lain, bukan dari bot sendiri (pesan sendiri sengaja diabaikan). |
| Perintah owner ditolak ("khusus owner") | Nomormu belum tepat di `OWNER_NUMBERS`, atau kamu menulis dari LID tanpa pemetaan nomor. Tulis nomor format `628xxxx` lalu restart. |
| Bot bilang "jadikan bot admin" | Untuk perintah `botAdmin`, jadikan nomor bot admin grup sungguhan di WhatsApp. |
| Sering disconnect | Jaringan/server tidak stabil — bot reconnect otomatis dengan backoff (maks `MAX_RECONNECT`). Bila log memuat kode 401/403/406/516: sesi berakhir (logout/banned/dicabut) → berhenti, cek nomor di HP, pairing ulang bila perlu. |
| Error 405 (client too old) | Versi protokol tertolak: `npm update zapo-js`, restart. |
| Stiker/mediainfo membalas "butuh sharp/ffmpeg" | Install sesuai `09-media-and-ffmpeg.md`. Bot sengaja tidak crash untuk fitur opsional. |
| Fitur sticker/toimg menjawab unduhan belum terhubung | Batasan terverifikasi di `KNOWN-ISSUES.md` #5 — API download media zapo-js menunggu penyesuaian. |
| Welcome grup tidak berjalan | Fitur ini membaca payload event grup secara defensif (KNOWN-ISSUES #3). Aktifkan `FEATURE_WELCOME`/setting grup, set `LOG_LEVEL=debug`, dan lihat bentuk event asli di log untuk penyesuaian. |
| Limit tidak berkurang / langsung habis | Command bawaan gratis (`limit:0`). Hanya command ber-`access.limit > 0` yang memotong kuota. Premium & owner selalu bebas. Cek `DAILY_LIMIT` di `.env`. |
| `npm install` gagal di sharp/better-sqlite3 | Butuh build tools di sebagian platform: di Debian/Ubuntu `sudo apt-get install -y build-essential python3`. Di Pterodactyl, pilih image Node yang menyertakan toolchain, atau nonaktifkan fitur yang membutuhkannya (bot tetap boot untuk better-sqlite3 pengganti? tidak — better-sqlite3 adalah dependency inti DB; selesaikan install-nya). |
| Bot dobel membalas | Dua proses bot jalan memakai sesi yang sama (mis. lokal + panel). Matikan salah satu — satu sesi hanya boleh dimiliki satu proses. |

Masih buntu? Kumpulkan: versi Node (`node -v`), log 30 baris terakhir (hapus nomor/kredensial!), dan langkah reproduksi — lalu hubungi penjual/produk support.


## `npm warn EBADENGINE` / `better-sqlite3` gagal terpasang (Node terlalu baru atau lama)

Gejala: peringatan `Unsupported engine`, `prebuild-install deprecated`, CPU penuh saat `npm install`, atau error `node-gyp` / `gyp ERR`.

Penyebab: tidak ada binary `better-sqlite3` untuk versi Node kamu sehingga dikompilasi dari source (lama dan sering gagal di panel).

Solusi, dari yang paling mudah:
1. Pakai **Node 22 LTS** (tab Startup di panel > Docker Image). Hapus folder `node_modules` dan `package-lock.json`, lalu start lagi.
2. Biarkan saja. `better-sqlite3` bersifat opsional: kalau gagal terpasang, DB aplikasi otomatis memakai `node:sqlite` bawaan Node 22.13+ (log menampilkan peringatan ExperimentalWarning, aman diabaikan).
3. Store sesi WhatsApp (`@zapo-js/store-sqlite`) memakai driver `auto` dan juga bisa jatuh ke `node:sqlite` bila `better-sqlite3` tidak ada.
