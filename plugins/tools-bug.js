import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  const isagiVision = 'https://files.catbox.moe/l8qiik.jpeg'      // Mi visión: ver más allá
  const chemicalReaction = 'https://files.catbox.moe/56ok7q.jpg'   // Reacción química con otros jugadores

  // Mi visión directa
  const media = await prepareWAMessageMedia({ image: { url: isagiVision } }, { upload: conn.waUploadToServer })
  // Metavisión activada
  const { data: thumb } = await conn.getFile(chemicalReaction)

  const directShoot = "⚽".repeat(5000) // Goles en serie

  // 1) Panel de estrategia Isagi
  const content = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          header: { hasMediaAttachment: true, imageMessage: media.imageMessage },
          body: { text: directShoot },
          footer: { text: "ISAGI YOICHI • Metavisión activada 🔵" },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Canal de estrategia 💠",
                  url: "https://whatsapp.com/channel/0029Vb73g1r1NCrTbefbQ2T",
                }),
              },
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "📋 Copiar patrón de goles",
                  id: "isagi-copy",
                  copy_code: directShoot
                }),
              },
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "🎯 Filosofía del egoísmo",
                  sections: [{
                    title: "Filosofías disponibles",
                    rows: [
                      { title: "🔵 La visión directa", description: "Ver el camino más eficiente", id: "filosofia1" },
                      { title: "⚡ Reacción química", description: "Conectar con otros talentos", id: "filosofia2" },
                      { title: "👁️ Metavisión", description: "Anticipar todas las posibilidades", id: "filosofia3" },
                      { title: "👑 Superar a Kaiser", description: "Mi próximo objetivo", id: "filosofia4" }
                    ]
                  }]
                })
              }
            ],
          },
        },
      },
    },
  }

  const msg = generateWAMessageFromContent(m.chat, content, { userJid: m.sender })
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  // 2) Documento de estrategia - Chemical Reaction
  await conn.sendMessage(m.chat, {
    document: { url: chemicalReaction },
    fileName: 'Chemical-Reaction-Isagi.jpg',
    mimetype: 'image/jpeg',
    caption: "La conexión perfecta con otros talentos.\nMI VISIÓN: SER EL NÚMERO UNO DEL MUNDO",
    jpegThumbnail: thumb
  }, { quoted: m })
}

handler.help = ['isagivision']
handler.tags = ['fun', 'bluelock']
handler.command = ['isagivision', 'metavision', 'blue-lock']
handler.register = true

export default handler