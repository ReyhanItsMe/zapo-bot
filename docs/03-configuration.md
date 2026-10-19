# 03 — Konfigurasi (.env)

Semua pengaturan ada di file `.env` (salin dari `.env.example`). Bot **berhenti dengan pesan jelas** bila konfigurasi salah (mis. nomor owner terlalu pendek, pairing code tidak valid, timezone tidak dikenal).

| Variabel | Default | Fungsi |
|---|---|---|
| `BOT_NAME` | `ZapoBot` | Nama bot di menu & sapaan |
| `PREFIX` | `.` | Prefix perintah, boleh banyak: `.,!,#` |
| `SESSION_ID` | `default` | Kunci sesi di store. Ganti untuk nomor bot lain di folder sama |
| `TIMEZONE` | `Asia/Jakarta` | Zona waktu reset limit & scheduler |
| `OWNER_NUMBERS` | *(kosong)* | Nomor owner, format `62812xxxx`, pisah koma. Kosong = perintah owner tidak bisa dipakai siapa pun |
| `USE_PAIRING_CODE` | `false` | `true` = pairing kode 8 karakter, `false` = QR |
| `PAIRING_NUMBER` | *(kosong)* | Nomor bot (digit + kode negara), wajib bila pairing code aktif |
| `PAIRING_CODE` | *(kosong)* | Kode custom 8 karakter (1–9, A–Z tanpa I/O/U/0). Kosong = acak |
| `DAILY_LIMIT` | `25` | Kuota harian command ber-limit per user |
| `FEATURE_PREMIUM` | `true` | Sistem premium (bebas limit) aktif |
| `FEATURE_ANTILINK` | `false` | Default global anti-link (bisa dioverride per grup) |
| `FEATURE_WELCOME` | `false` | Default global sambutan grup (bisa dioverride per grup) |
| `FEATURE_ANTICALL` | `true` | Abaikan panggilan masuk ke nomor bot |
| `FEATURE_AUTOREAD` | `false` | Tandai pesan dibaca *(catatan: lihat KNOWN-ISSUES #6)* |
| `AI_API_KEY` / `AI_API_URL` | *(kosong)* | Endpoint & key API AI resmi milikmu (untuk contoh kategori `ai`) |
| `TRANSLATE_API_URL` | *(kosong)* | Endpoint translate resmi milikmu (contoh kategori `tools`) |
| `LOG_LEVEL` | `info` | `debug` \| `info` \| `warn` \| `error` |
| `MAX_RECONNECT` | `10` | Batas percobaan reconnect otomatis (`0` = tanpa batas) |
| `SEND_MIN_DELAY_MS` | `350` | Jeda minimum antar pesan keluar (anti pembatasan) |
| `ALLOW_EVAL` | `false` | Izinkan contoh perintah eval owner. **Biarkan false** kecuali paham risiko |

## File config (untuk yang ingin lebih dalam)

- `config/index.js` — membaca `.env`, menggabungkan, memvalidasi.
- `config/bot.js` — pemetaan identitas bot (nama, prefix, owner, pairing, limit).
- `config/features.js` — toggle fitur.

Pembeli cukup mengedit `.env`; file `config/*.js` jarang perlu diubah kecuali menambah variabel baru (tambahkan juga validasinya di `config/index.js`).

## Link untuk menu (v1.2.0)

Dipakai fungsi `ctx.rich.*` lewat nama kunci (lihat `docs/14-rich-api.md`).

| Variabel | Default | Fungsi |
| --- | --- | --- |
| `LINK_WEBSITE` | `https://zapo.to` | Link `website`, juga tujuan bila `url` tidak diisi |
| `LINK_SUPPORT` | (kosong) | Link `support`; kosong = jatuh ke `website` |
| `LINK_CHANNEL` | (kosong) | Link `channel` |
| `LINK_GROUP` | (kosong) | Link `group` |
| `LINK_GITHUB` | (kosong) | Link `github` |

