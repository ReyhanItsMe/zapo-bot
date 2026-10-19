# License Notice — zapo-bot

> **PLACEHOLDER — penjual wajib mengganti teks di bawah dengan lisensi penjualan resmi sebelum produk didistribusikan.**

## Lisensi penggunaan (contoh kerangka)

1. Pembelian memberikan hak pakai **1 (satu) deployment bot** untuk pembeli yang namanya tercatat saat transaksi.
2. Pembeli **boleh** mengubah `plugins/`, `config/`, `assets/`, dan `.env` untuk kebutuhannya.
3. Pembeli **dilarang** mendistribusikan ulang, menjual kembali, atau membagikan source code ini (utuh maupun sebagian inti: `core/`, `lib/`) kepada pihak yang tidak membeli.
4. Dukungan produk mencakup panduan di folder `docs/`; kustomisasi di luar panduan adalah tanggung jawab pembeli.
5. Perangkat lunak disediakan "sebagaimana adanya" tanpa jaminan; risiko penggunaan terhadap akun WhatsApp (termasuk pembatasan/pemblokiran nomor oleh WhatsApp) ditanggung pengguna.

## Perangkat lunak pihak ketiga

Bot ini dibangun di atas perangkat lunak open-source, masing-masing dengan lisensinya sendiri (umumnya MIT):

- `zapo-js` & paket `@zapo-js/*` — library tidak resmi, tidak berafiliasi dengan WhatsApp/Meta
- `better-sqlite3`, `dotenv`, `qrcode-terminal`, `sharp`

Teks lisensi masing-masing tersedia di `node_modules/<nama-paket>/LICENSE` setelah `npm install`.
