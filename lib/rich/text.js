// lib/rich/text.js — teks menu dan baris list dari registry plugin.
export const section = (title, rows) => ({ title, rows })
export const row = (title, id, description = '', header = '') => ({ header, title, description, id })

export function groupByCategory(list = []) {
  const map = new Map()
  for (const p of list) {
    const cat = p.category || 'misc'
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat).push(p)
  }
  return new Map([...map.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

/** Teks menu lengkap (caption gambar/dokumen/kartu). */
export function menuText({ name = 'Bot', prefix = '.', list = [] } = {}) {
  const lines = [`*${name}*`, 'Daftar perintah:', '']
  for (const [cat, plugins] of groupByCategory(list)) {
    lines.push(`*${cat.toUpperCase()}*`)
    for (const p of plugins) lines.push(`• ${prefix}${p.command[0]} — ${p.description || '-'}`)
    lines.push('')
  }
  return lines.join('\n').trim()
}

/** Section list per kategori; `id` tiap baris = perintah lengkap dengan prefix. */
export function listSections({ prefix = '.', list = [], maxRowsPerSection = 10 } = {}) {
  const sections = []
  for (const [cat, plugins] of groupByCategory(list)) {
    sections.push(section(
      cat.toUpperCase(),
      plugins.slice(0, maxRowsPerSection).map((p) => row(`${prefix}${p.command[0]}`, `${prefix}${p.command[0]}`, (p.description || '').slice(0, 72)))
    ))
  }
  return sections
}
