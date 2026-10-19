// ─────────────────────────────────────────────────────────────
// config/links.js — daftar link bernama yang dipakai fungsi menu.
// Dipakai lewat nama kunci: ctx.rich.ad({ url: 'website' }) atau
// ctx.rich.cta({ buttons: [{ type: 'url', text: 'Bantuan', url: 'support' }] }).
// Ubah lewat .env (LINK_*) atau langsung di file ini. AMAN diedit pembeli.
// Kunci kosong otomatis jatuh ke `website`; bila `website` kosong, ke https://zapo.to.
// ─────────────────────────────────────────────────────────────

export function linkConfig(env) {
  return {
    website: env.LINK_WEBSITE || 'https://zapo.to',
    support: env.LINK_SUPPORT || '',
    channel: env.LINK_CHANNEL || '',
    group: env.LINK_GROUP || '',
    github: env.LINK_GITHUB || ''
    // Tambah kunci sendiri, mis.: promo: env.LINK_PROMO || 'https://toko-kamu.com/promo'
  }
}
