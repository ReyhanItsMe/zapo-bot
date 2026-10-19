// lib/rich/native.js — bentuk pesan interaktif mentah (raw proto).
//  • native flow (interactiveMessage): terbukti tampil untuk tombol CTA di uji lapangan
//  • buttonsMessage / listMessage: bentuk resmi di docs zapo (guides/raw-sends)
// Rendering akhir bergantung klien WhatsApp & jenis akun (TODO(verify) per HP).

/** Pembuat tombol native flow. */
export const btn = {
  quickReply: (text, id) => ({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: text, id }) }),
  url: (text, url) => ({ name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: text, url, merchant_url: url }) }),
  copy: (text, code) => ({ name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: text, copy_code: code }) }),
  call: (text, phone) => ({ name: 'cta_call', buttonParamsJson: JSON.stringify({ display_text: text, phone_number: phone }) }),
  list: (title, sections) => ({
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title,
      sections: sections.map((s) => ({
        title: s.title,
        rows: s.rows.map((r) => ({ header: r.header || '', title: r.title, description: r.description || '', id: r.id }))
      }))
    })
  })
}

/** interactiveMessage native flow; wrap=true → dibungkus viewOnceMessage (bentuk yang terbukti tampil). */
export function buildInteractive({ title = '', subtitle = '', body = '', footer = '', buttons = [], wrap = true } = {}) {
  const interactiveMessage = {
    header: { title, subtitle, hasMediaAttachment: false },
    body: { text: body },
    footer: { text: footer },
    nativeFlowMessage: { buttons, messageParamsJson: '', messageVersion: 1 }
  }
  if (!wrap) return { interactiveMessage }
  return {
    viewOnceMessage: {
      message: {
        messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
        interactiveMessage
      }
    }
  }
}

// Nilai enum dari namespace `proto` zapo-js bila ada; jika tidak, angka standar proto WhatsApp.
async function protoEnums() {
  try {
    const { proto } = await import('zapo-js')
    return {
      headerText: proto?.Message?.ButtonsMessage?.HeaderType?.TEXT ?? 2,
      buttonResponse: proto?.Message?.ButtonsMessage?.Button?.Type?.RESPONSE ?? 1,
      listSingle: proto?.Message?.ListMessage?.ListType?.SINGLE_SELECT ?? 1
    }
  } catch {
    return { headerText: 2, buttonResponse: 1, listSingle: 1 }
  }
}

/** buttons: [{ id, text }] (maks 3). */
export async function buildButtonsMessage({ title = '', body = '', footer = '', buttons = [] } = {}) {
  const e = await protoEnums()
  return {
    buttonsMessage: {
      contentText: body,
      footerText: footer,
      headerType: e.headerText,
      text: title,
      buttons: buttons.slice(0, 3).map((b) => ({
        buttonId: b.id,
        buttonText: { displayText: b.text },
        type: e.buttonResponse
      }))
    }
  }
}

/** sections: [{ title, rows: [{ title, id, description }] }] */
export async function buildListMessage({ title = '', body = '', buttonText = 'Lihat', footer = '', sections = [] } = {}) {
  const e = await protoEnums()
  return {
    listMessage: {
      title,
      description: body,
      buttonText,
      footerText: footer,
      listType: e.listSingle,
      sections: sections.map((sec) => ({
        title: sec.title,
        rows: sec.rows.map((r) => ({ rowId: r.id, title: r.title, description: r.description || '' }))
      }))
    }
  }
}
