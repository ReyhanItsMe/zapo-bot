# 08 — Database

Bot memakai **dua file SQLite terpisah** — jangan tertukar:

| File | Milik | Isi | Boleh dihapus? |
|---|---|---|---|
| `data/auth/state.sqlite` | zapo-js (`store/auth.js`) | Kredensial sesi WhatsApp + sesi Signal | Hanya bila ingin pairing ulang dari nol |
| `data/app.sqlite` | Bot (`store/app-db.js`) | User, grup, setting aplikasi | Bot akan membuat ulang (data user/grup hilang) |

## Skema aplikasi (data/app.sqlite)

```sql
users   (jid PK, name, banned, premium, limit_used, limit_reset_at, created_at)
groups  (jid PK, settings JSON, created_at)
settings(key PK, value)
meta    (key PK, value)  -- berisi schema_version
```

## Migrasi

Migrasi berjalan **otomatis saat boot** dan idempotent (aman berulang). Jalankan manual dengan:

```bash
npm run migrate
```

API yang tersedia untuk plugin lewat `ctx.db`: `getUser/ensureUser/setBanned/setPremium/addLimitUsed/resetLimit`, `getGroup/ensureGroup/getGroupSetting/setGroupSetting`, `getSetting/setSetting`, dan `raw` (koneksi better-sqlite3 untuk query khusus, contoh di plugin `stats`).

## Aturan main plugin

- **Jangan** menulis data terstruktur ke tabel `settings` — itu untuk key-value global sederhana. Data per-user masuk `users`, per-grup masuk `groups.settings` (JSON) atau tabel baru lewat migrasi.
- Menambah tabel: tambahkan migrasi baru di `store/app-db.js` (`MIGRATIONS`), naikkan versi otomatis lewat panjang array, lalu `npm run migrate`. Jangan mengubah migrasi lama yang sudah terlanjur jalan di user lain.
- Limit harian disimpan sebagai `limit_used` + `limit_reset_at` (tanggal lokal terakhir); reset terjadi malas (lazy) saat user memakai command ber-limit di hari baru.

## Backup

Backup = salin folder `data/` saat bot berhenti. File sesi (`data/auth/`) setara kata sandi nomor bot — simpan terenkripsi, jangan dibagikan.
