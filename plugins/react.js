import fetch from "node-fetch"
import fs from "fs"
import path from "path"

const primaryFolder = "./primary"
if (!fs.existsSync(primaryFolder)) fs.mkdirSync(primaryFolder)

function getFilePath(groupId) {
  return path.join(primaryFolder, `${groupId}.json`)
}

async function reactToPostAPI({ postLink, reactions, token }) {
  const res = await fetch("https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0",
      Referer: "https://asitha.top/channel-manager"
    },
    body: JSON.stringify({
      post_link: postLink,
      reacts: reactions.join(",")
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API falló: ${text}`)
  }

  return res.json()
}

const handler = async (m, { conn, text, command }) => {
  const filePath = getFilePath(m.chat)
  if (fs.existsSync(filePath)) {
    const db = JSON.parse(fs.readFileSync(filePath))
    if (db.primary && conn.user.jid !== db.primary) return
  }

  try {
    if (!text) return conn.reply(m.chat, "⚠︎ Ingresa el link del mensaje del canal seguido de los emojis.\nEjemplo: https://whatsapp.com/channel/1234567890ABC123DEF456 👍 ❤️ 🔥", m)

    const [postLink, ...inputEmojis] = text.split(" ")
    if (!postLink || inputEmojis.length === 0) return conn.reply(m.chat, "⚠︎ Formato inválido. Debes poner el link y al menos un emoji.", m)

    // Token de autorización
    const token = "6afa872efb1feb6cc63f434e922313bfc01973365c136b9747e07d603c01221c"

    // Opción 1: Si el link es de WhatsApp Channel
    let whatsappLink = postLink
    
    // Convertir varios formatos de WhatsApp a formato estándar
    if (postLink.includes("whatsapp.com/channel/")) {
      // Extraer el ID del canal del link
      const channelMatch = postLink.match(/channel\/([a-zA-Z0-9]+)/)
      if (channelMatch) {
        whatsappLink = `https://whatsapp.com/channel/${channelMatch[1]}`
      }
    } 
    // Opción 2: Si es un mensaje específico (puede contener parámetros de mensaje)
    else if (postLink.includes("whatsapp.com")) {
      // Ya es un link de WhatsApp
    }
    // Opción 3: Si es solo un ID de canal
    else if (/^[A-Z0-9]{22}$/i.test(postLink)) {
      whatsappLink = `https://whatsapp.com/channel/${postLink}`
    }
    else {
      return conn.reply(m.chat, 
        "⚠︎ El enlace debe ser un link de WhatsApp Channel.\n" +
        "Formatos aceptados:\n" +
        "• https://whatsapp.com/channel/ID_CANAL\n" +
        "• ID del canal (22 caracteres)\n" +
        "• Link completo de un mensaje específico", 
        m
      )
    }

    // Limpiar emojis y filtrar
    const cleanEmojis = inputEmojis.map(emoji => emoji.trim()).filter(emoji => emoji.length > 0)
    
    // Reacciones soportadas por WhatsApp (emojis comunes)
    const whatsappEmojis = ["👍", "👎", "❤️", "🔥", "🥰", "👏", "😮", "😢", "😡", "🎉", "🤩", "🤯", "😱", "🤔", "👀"]
    
    // Validar que los emojis sean compatibles
    const invalidEmojis = cleanEmojis.filter(emoji => !whatsappEmojis.includes(emoji))
    if (invalidEmojis.length > 0) {
      return conn.reply(m.chat, 
        `⚠︎ Algunos emojis no son compatibles con WhatsApp: ${invalidEmojis.join(", ")}\n` +
        `✅ Emojis soportados: ${whatsappEmojis.join(" ")}`, 
        m
      )
    }

    const result = await reactToPostAPI({ 
      postLink: whatsappLink, 
      reactions: cleanEmojis, 
      token 
    })
    
    conn.reply(m.chat, 
      `✅ Reacción enviada correctamente a WhatsApp Channel!\n\n` +
      `📱 Plataforma: WhatsApp Channel\n` +
      `🔗 Enlace: ${whatsappLink}\n` +
      `😀 Emojis: ${cleanEmojis.join(" ")}\n` +
      `📊 Respuesta API: ${JSON.stringify(result)}`, 
      m
    )

  } catch (err) {
    console.error("Error en react:", err)
    
    // Mensajes de error más específicos
    let errorMsg = `⚠︎ Ocurrió un error: ${err.message}`
    
    if (err.message.includes("404")) {
      errorMsg = "⚠︎ No se encontró el canal o mensaje. Verifica que el link sea correcto y que tengas acceso al canal."
    } else if (err.message.includes("401")) {
      errorMsg = "⚠︎ Error de autenticación. El token podría ser inválido o haber expirado."
    } else if (err.message.includes("403")) {
      errorMsg = "⚠︎ No tienes permiso para reaccionar en este canal."
    }
    
    conn.reply(m.chat, errorMsg, m)
  }
}

handler.command = handler.help = ['react', 'reaccionar', 'reactwa']
handler.tags = ['utils', 'whatsapp']
handler.group = true
handler.botAdmin = false
handler.admin = true
handler.owner = true
handler.rowner = true

export default handler