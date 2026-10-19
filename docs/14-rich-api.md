# 14 — API Menu & Pesan Kaya (`ctx.rich`)

Sejak v1.2.0 semua pesan kaya (kartu thumbnail, tombol, list, CTA, gambar, dokumen, lokasi, kontak, polling, dan lainnya) dipanggil lewat **satu fungsi per jenis**. Kamu cukup memanggil fungsinya dan mengisi yang perlu. Bentuk pesan mentah, URL, aset, retry, dan fallback diurus fungsinya.

```js
// plugins/menu/promo.js
export default {
  command: 'promo',
  category: 'menu',
  description: 'Kartu promo',
  access: { owner: false, admin: false, botAdmin: false, group: false, private: false, premium: false, limit: 0 },
  cooldown: 5,
  enabled: true,
  async run(ctx) {
    await ctx.rich.ad({
      text: 'Diskon 50% hari ini!',
      title: 'Promo',
      body: 'Berlaku sampai malam',
      url: 'website'            // nama kunci dari config/links.js
    })
  }
}
```

Contoh lengkap (14 jenis) ada di `plugins/menu/exampleCommands.js`. Semuanya `enabled: false`, ubah ke `true` untuk mencoba.

## Struktur modul

```
lib/rich/
├── index.js     # pintu masuk (re-export)
├── api.js       # fasad ctx.rich (membangun lalu mengirim)
├── builders.js  # build.xxx: pembuat pesan murni
├── native.js    # btn.xxx, interactiveMessage, buttonsMessage, listMessage
├── send.js      # sendBuilt: kirim + alternatif + teks cadangan
├── links.js     # resolveUrl: URL / nama kunci / fungsi
├── assets.js    # akses assets/ dan normalisasi media
└── text.js      # menuText, listSections otomatis dari plugin
config/links.js  # daftar link bernama (website, support, ...)
lib/rich.js      # DEPRECATED, hanya agar plugin lama v1.1.x tetap jalan
```

## Opsi umum semua fungsi kirim

| Opsi | Arti |
| --- | --- |
| `to` | JID tujuan. Bawaan: chat saat ini |
| `quote` | `true` = membalas (quote) pesan pengirim |
| `fallback` | Teks cadangan bila semua bentuk gagal atau file media tidak ada |

Hasilnya `{ ok, via }`, dengan `via` bernilai `'main'`, `'alternative'`, atau `'text'`.

## Mengisi `url` (fungsi URL)

Semua fungsi yang punya `url` (`ad`, tombol `cta`) menerima tiga bentuk:

| Bentuk | Contoh | Hasil |
| --- | --- | --- |
| URL penuh | `'https://toko.com/promo'` | dipakai apa adanya (tanpa `https://` akan ditambah) |
| Nama kunci | `'website'`, `'support'` | diambil dari `config.links` (`config/links.js`) |
| Fungsi | `({ links }) => links.website + '/promo'` | hasil fungsi dipakai (boleh `async`) |
| Kosong | (tidak diisi) | `links.website`, bawaan `https://zapo.to` |

Mengisi link bernama lewat `.env`:

```
LINK_WEBSITE=https://toko-kamu.com
LINK_SUPPORT=https://wa.me/6281234567890
LINK_CHANNEL=https://whatsapp.com/channel/xxxx
```

Kunci kosong otomatis jatuh ke `website`. Menambah kunci sendiri: edit `config/links.js` (mis. `promo: env.LINK_PROMO || '...'`), lalu pakai `url: 'promo'`. Hanya mau tahu hasilnya tanpa kirim: `await ctx.rich.url('support')`.

## Media dan thumbnail

Field `media` dan `thumbnail` menerima: **nama file di `assets/`** (`'menu.jpg'`), **path** (`'data/temp/x.png'`), **Buffer**, atau URL http(s) (`TODO(verify)` untuk media). File yang tidak ada melempar error, atau mengirim `fallback` bila diisi.

## Daftar fungsi

### Teks dan media (tipe bawaan zapo-js, terdokumentasi)

| Fungsi | Opsi | Catatan |
| --- | --- | --- |
| `ctx.rich.text` | `text`, `mentions?`, `linkPreview?` | `mentions` = array JID; tulis `@nomor` di teks |
| `ctx.rich.image` | `media`, `caption?`, `mimetype?`, `viewOnce?` | |
| `ctx.rich.video` | `media`, `caption?`, `gif?`, `viewOnce?` | |
| `ctx.rich.gif` | sama dengan `video` | alias `video({ gif: true })` |
| `ctx.rich.audio` | `media`, `mimetype?`, `voiceNote?` | |
| `ctx.rich.voice` | sama dengan `audio` | alias `audio({ voiceNote: true })` |
| `ctx.rich.document` | `media`, `fileName?`, `mimetype?`, `caption?` | dokumen "palsu" = PDF banner + caption menu |
| `ctx.rich.sticker` | `media` | file `.webp` |

### Raw proto resmi (docs zapo: guides/raw-sends)

| Fungsi | Opsi |
| --- | --- |
| `ctx.rich.location` | `latitude`, `longitude`, `name?`, `address?` |
| `ctx.rich.contact` | `name`, `number`, `organization?` (nomor digit internasional tanpa `+`) |
| `ctx.rich.contacts` | `name?`, `list: [{ name, number }]` |
| `ctx.rich.poll` | `question`, `options: string[]`, `selectableCount?` |
| `ctx.rich.groupInvite` | `groupJid`, `inviteCode`, `groupName?`, `caption?`, `expiresInSec?` |

### Tombol, list, CTA

| Fungsi | Opsi | Catatan |
| --- | --- | --- |
| `ctx.rich.buttons` | `body`, `footer?`, `buttons: [{ text, id }]` (maks 3), `variant?` | `variant`: `'native'` (bawaan) atau `'classic'` (buttonsMessage resmi) |
| `ctx.rich.list` | `body`, `buttonText?`, `footer?`, `sections: [{ title, rows: [{ title, id, description? }] }]`, `variant?` | `ctx.rich.sections()` membuat section otomatis dari plugin aktif |
| `ctx.rich.cta` | `body`, `footer?`, `buttons: [...]` | tombol: `{ type:'url', text, url }`, `{ type:'copy', text, code }`, `{ type:'call', text, phone }`, `{ type:'reply', text, id }` |
| `ctx.rich.interactive` | `body`, `title?`, `subtitle?`, `footer?`, `buttons: [btn.xxx()]` | native flow bebas, campur sendiri |

`id` tombol/baris kembali sebagai **teks pesan** saat ditekan (dibaca `lib/serialize.js`), jadi isi dengan perintah, mis. `'.ping'`, dan perintah itu langsung dijalankan.

### Kartu thumbnail (`ctx.rich.ad`)

| Opsi | Arti |
| --- | --- |
| `text` | Isi pesan (mis. `ctx.rich.menuText()`) |
| `title`, `body` | Judul dan deskripsi kartu |
| `url` | Lihat bagian "Mengisi `url`" |
| `thumbnail` | Bawaan `assets/thumb.jpg` |
| `variant` | `3` (bawaan, link-preview klasik), `1` (`externalAdReply` + `matchedText`), `2` (teks bertipe + `options.contextInfo`) |
| `largeThumbnail`, `attribution` | Atur tampilan kartu |
| `appendUrl` | Tambahkan URL di akhir teks bila belum ada (diperlukan agar kartu muncul) |

Mengganti varian bawaan untuk seluruh bot: ubah `DEFAULTS.adVariant` di `lib/rich/builders.js`.

### Helper

| Fungsi | Hasil |
| --- | --- |
| `ctx.rich.menuText()` | Teks menu otomatis dari plugin aktif |
| `ctx.rich.sections()` | Section list otomatis per kategori |
| `ctx.rich.url(x)` | URL final dari string / nama kunci / fungsi |
| `ctx.rich.links` | Objek link dari config |
| `ctx.rich.build.xxx(opsi)` | Hanya membangun pesan `{ content, options, alternatives, fallbackText }`, tanpa kirim |

## Cara kerja fallback

1. Fungsi membangun pesan. Kalau file media tidak ada: kirim `fallback` (atau lempar error bila tidak diisi).
2. Mengirim bentuk utama. Pesan native flow dicoba dulu dalam bentuk terbungkus, lalu polos.
3. Kalau semuanya ditolak: kirim `fallback` (atau teks yang dibuat otomatis oleh fungsi itu).

Batasan: "terkirim" hanya berarti server menerima. Pesan yang dibuang diam-diam oleh WhatsApp (di HP bot hanya satu centang, penerima tidak melihat apa pun) tidak bisa dideteksi. Itu sebabnya ada beberapa `variant`.

## Menambah fungsi baru

1. Tambah `build.namabaru = async (opsi, env) => ({ content, options?, alternatives?, fallbackText? })` di `lib/rich/builders.js`.
2. Selesai: `ctx.rich.namabaru(opsi)` otomatis tersedia, lengkap dengan `to`, `quote`, `fallback`, dan retry.

## Status verifikasi

| Jenis | Status |
| --- | --- |
| text, image, video, audio, document, sticker, poll | tipe bawaan zapo-js, terdokumentasi |
| location, contact(s), groupInvite, `buttons` classic, `list` classic | bentuk resmi di docs zapo |
| `cta` (url/copy/call) | terbukti tampil di uji lapangan |
| `buttons` native, `list` native, `ad` varian 1/2/3 | `TODO(verify)`: uji di HP penerima |
| `audio` voice note (mimetype), `poll.selectableCount` | `TODO(verify)` |

## Migrasi dari v1.1.x

`lib/rich.js` lama masih ada dan fungsinya tetap jalan, tetapi ditandai deprecated. Plugin lama yang memakai `sendRich`, `btn`, dan sebagainya tidak perlu diubah. Untuk plugin baru, pakai `ctx.rich.*`.
