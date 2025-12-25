import fetch from "node-fetch"
import fs from "fs"
import path from "path"

const primaryFolder = "./primary"
if (!fs.existsSync(primaryFolder)) fs.mkdirSync(primaryFolder)

function getFilePath(groupId) {
  return path.join(primaryFolder, `${groupId}.json`)
}

async function reactToPostAPI({ postLink, reactions, token }) {
  // Construir la URL con el parámetro de query (opción 1)
  const url = new URL("https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post")
  url.searchParams.append("api_key", token) // Agregar token como query parameter

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // También en header (opción 2)
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
    throw new Error(`API falló: ${res.status} ${text}`)
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
    if (!text) return conn.reply(m.chat, "⚠︎ Ingresa el link del mensaje seguido de los emojis.\n\nEjemplo:\n.react https://whatsapp.com/channel/1234567890ABC123DEF456 👍 ❤️ 🔥\n.react canal1234567890 🎉 👏", m)

    // Separar el link y los emojis
    const parts = text.split(" ")
    const postLink = parts[0]
    const inputEmojis = parts.slice(1)
    
    if (!postLink || inputEmojis.length === 0) return conn.reply(m.chat, "⚠︎ Formato inválido. Debes poner el link y al menos un emoji.\n\nUso: .react <link> <emoji1> <emoji2> ...", m)

    // Tu clave API
    const token = "6afa872efb1feb6cc63f434e922313bfc01973365c136b9747e07d603c01221c"

    // Procesar el link (acepta varios formatos)
    let processedLink = postLink
    
    // Si es un ID de canal simple (sin URL completa)
    if (/^[a-zA-Z0-9]{10,30}$/.test(postLink) && !postLink.includes("://")) {
      processedLink = `https://whatsapp.com/channel/${postLink}`
    }
    // Si ya es un link completo
    else if (postLink.includes("whatsapp.com/channel/")) {
      // Asegurar formato correcto
      const match = postLink.match(/(https?:\/\/)?(www\.)?whatsapp\.com\/channel\/([a-zA-Z0-9]+)/)
      if (match) {
        processedLink = `https://whatsapp.com/channel/${match[3]}`
      }
    } else {
      return conn.reply(m.chat, 
        "⚠︎ Formato de enlace inválido.\n\n" +
        "📌 Formatos aceptados:\n" +
        "• https://whatsapp.com/channel/ID_CANAL\n" +
        "• whatsapp.com/channel/ID_CANAL\n" +
        "• ID_CANAL (solo el ID)\n\n" +
        "📍 Ejemplo: .react ABC123DEF456 👍 ❤️", 
        m
      )
    }

    // Limpiar y validar emojis
    const cleanEmojis = inputEmojis
      .map(emoji => emoji.trim())
      .filter(emoji => emoji.length > 0 && /\p{Emoji}/u.test(emoji)) // Solo emojis reales

    if (cleanEmojis.length === 0) {
      return conn.reply(m.chat, 
        "⚠︎ No se detectaron emojis válidos.\n\n" +
        "✅ Emojis válidos: 👍 👎 ❤️ 🔥 🥰 👏 😮 😢 😡 🎉 🤩 🤯 😱 🤔 👀\n" +
        "📍 Ejemplo: .react canal123 👍 ❤️ 🎉", 
        m
      )
    }

    // Limitar número de emojis (por si acaso)
    const maxEmojis = 5
    const finalEmojis = cleanEmojis.slice(0, maxEmojis)
    
    if (cleanEmojis.length > maxEmojis) {
      await conn.reply(m.chat, `ℹ️ Se limitaron las reacciones a ${maxEmojis} emojis.`, m)
    }

    console.log(`Enviando reacción a: ${processedLink}`)
    console.log(`Emojis: ${finalEmojis.join(", ")}`)
    console.log(`Token: ${token.substring(0, 10)}...`)

    // Enviar reacción a la API
    const result = await reactToPostAPI({ 
      postLink: processedLink, 
      reactions: finalEmojis, 
      token 
    })
    
    // Respuesta exitosa
    let responseMsg = `✅ *Reacción enviada exitosamente!*\n\n`
    responseMsg += `📱 *Canal:* ${processedLink}\n`
    responseMsg += `😀 *Emojis:* ${finalEmojis.join(" ")}\n`
    responseMsg += `📊 *Estado:* ${result.message || "Éxito"}\n`
    
    if (result.data) {
      responseMsg += `🔗 *ID:* ${result.data.id || "N/A"}\n`
      responseMsg += `🕐 *Fecha:* ${new Date().toLocaleString()}`
    }
    
    conn.reply(m.chat, responseMsg, m)

  } catch (err) {
    console.error("❌ Error en react handler:", err)
    
    let errorMsg = `⚠️ *Error al enviar reacción*\n\n`
    
    if (err.message.includes("401") || err.message.includes("403")) {
      errorMsg += `🔐 *Error de autenticación*\n`
      errorMsg += `La clave API podría ser inválida o haber expirado.\n`
      errorMsg += `Verifica tu token: ${token.substring(0, 10)}...`
    } 
    else if (err.message.includes("404")) {
      errorMsg += `🔍 *No encontrado*\n`
      errorMsg += `El canal o mensaje no existe.\n`
      errorMsg += `Verifica el link: ${postLink}`
    }
    else if (err.message.includes("429")) {
      errorMsg += `⏳ *Límite excedido*\n`
      errorMsg += `Demasiadas solicitudes. Espera un momento.`
    }
    else {
      errorMsg += `💥 *Error técnico*\n`
      errorMsg += `${err.message}\n`
      errorMsg += `Verifica que la API esté funcionando.`
    }
    
    conn.reply(m.chat, errorMsg, m)
  }
}

// Configuración del comando
handler.command = handler.help = ['react', 'reaccionar', 'reactwa', 'reaccion']
handler.tags = ['utils', 'whatsapp', 'channel']
handler.group = true
handler.botAdmin = false
handler.admin = false  // Cambiado a false para que cualquiera pueda usarlo (si lo prefieres)
handler.owner = false  // Cambiado a false (ajusta según necesites)
handler.rowner = false // Cambiado a false (ajusta según necesites)

export default handler