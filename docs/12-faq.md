# 12 — FAQ

**Apakah bot ini resmi dari WhatsApp?**
Tidak. zapo-js adalah library tidak resmi yang mengimplementasikan protokol WhatsApp Web. Bot terhubung sebagai perangkat tertaut. Tidak ada afiliasi/dukungan dari WhatsApp LLC atau Meta.

**Apakah nomor saya bisa diblokir?**
Ya, risikonya nyata — terutama untuk spam, broadcast massal ke orang yang tidak menyimpan nomormu, atau pola kirim robotik. Mitigasi bawaan base ini: antrean kirim berjeda acak, cooldown per perintah, dan limit harian. Tetap: **gunakan nomor khusus bot**, batasi broadcast, dan jangan menjanjikan "anti-banned" kepada siapa pun — tidak ada yang bisa menjamin itu.

**Untuk bisnis resmi (notifikasi pelanggan, marketing), pakai ini?**
Untuk kebutuhan formal berskala, gunakan **WhatsApp Business Platform / Cloud API resmi Meta**. Base ini cocok untuk bot komunitas, grup, asisten pribadi, dan eksperimen — dengan kesadaran risiko di atas.

**Satu folder bisa untuk banyak nomor?**
Satu proses = satu sesi (`SESSION_ID`). Untuk banyak nomor, jalankan banyak proses/folder dengan `SESSION_ID` dan folder `data/` berbeda. zapo-js sendiri mendukung multi-session satu proses, tapi base ini sengaja satu proses per nomor agar isolasi & deploy panel sederhana.

**Restart apakah harus scan QR lagi?**
Tidak. Selama folder `data/auth/` utuh dan perangkat tidak dicabut dari HP, sesi dipakai ulang.

**Bagaimana cara menambah perintah?**
Salin satu contoh dari `plugins/*/exampleCommands.js` ke file baru, `enabled: true`, restart atau `.reload`. Panduan: `05-plugin-guide.md`.

**Bisakah menerima/menolak panggilan suara?**
Panggilan masuk dicatat dan diabaikan bila `FEATURE_ANTICALL=true`. Penolakan aktif lewat API belum diaktifkan di base ini (lihat `KNOWN-ISSUES.md` #4).

**Bot tidak membalas di grup tertentu?**
Cek: perintah diawali prefix, bot bukan ter-banned lokal (middleware 03), untuk perintah admin bot harus jadi admin, dan fitur per-grup (welcome/antilink) bisa dioverride lewat `ctx.db` — lihat contoh `antilink`/`welcome` di `plugins/group/exampleCommands.js`.

**Data apa yang dikumpulkan bot?**
Hanya yang bot simpan sendiri di `data/app.sqlite` (JID, nama tampil, status ban/premium, pemakaian limit) dan sesi di `data/auth/`. Tidak ada pengiriman data ke server penjual.

**Bolehkah saya menjual ulang source code ini?**
Ikuti lisensi pembelian di `docs/LICENSE-NOTICE.md`.

**Node.js versi berapa?** >= 22.13 (disarankan 22 LTS). Cek `node --version`.

**Kenapa banyak contoh `enabled:false`?**
Agar bot pertamamu ramping dan aman. Contoh adalah bahan belajar & titik awal — aktifkan hanya yang kamu pahami, terutama contoh owner seperti `eval`.
