import fetch from "node-fetch"
import fs from "fs"
import path from "path"

const primaryFolder = "./primary"
if (!fs.existsSync(primaryFolder)) fs.mkdirSync(primaryFolder)

function getFilePath(groupId) {
  return path.join(primaryFolder, `${groupId}.json`)
}

async function reactToPostAPI({ postLink, reactions, token }) {
  // Construir la URL con el parámetro de query
  const url = new URL("https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post")
  url.searchParams.append("api_key", token) // Agregar token como query parameter

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // También en header
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
  // Verificar que solo el owner pueda usar el comando
  const ownerNumber = global.owner ? global.owner[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null
  const sender = m.sender
  
  if (ownerNumber && sender !== ownerNumber) {
    return conn.reply(m.chat, "⚠️ *COMANDO RESTRINGIDO*\n\nSolo el owner del bot puede usar este comando.", m)
  }

  try {
    if (!text) return conn.reply(m.chat, "⚠️ *USO DEL COMANDO*\n\nPara reaccionar a un mensaje de canal:\n\n.react <link_canal> <emoji1> <emoji2> ...\n\n📌 *Ejemplos:*\n.react https://whatsapp.com/channel/ABC123DEF456 👍 ❤️\n.react canal1234567890 🔥 🎉", m)

    // Separar el link y los emojis
    const parts = text.split(" ")
    const postLink = parts[0]
    const inputEmojis = parts.slice(1)
    
    if (!postLink || inputEmojis.length === 0) return conn.reply(m.chat, "⚠️ *FORMATO INVÁLIDO*\n\nDebes proporcionar el link del canal y al menos un emoji.\n\nUso: .react <link> <emoji1> <emoji2> ...", m)

    // Tu clave API
    const token = "6afa872efb1feb6cc63f434e922313bfc01973365c136b9747e07d603c01221c"

    // Procesar el link
    let processedLink = postLink
    
    // Si es un ID de canal simple
    if (/^[a-zA-Z0-9]{10,30}$/.test(postLink) && !postLink.includes("://")) {
      processedLink = `https://whatsapp.com/channel/${postLink}`
    }
    // Si ya es un link completo de WhatsApp
    else if (postLink.includes("whatsapp.com/channel/")) {
      const match = postLink.match(/(https?:\/\/)?(www\.)?whatsapp\.com\/channel\/([a-zA-Z0-9]+)/)
      if (match) {
        processedLink = `https://whatsapp.com/channel/${match[3]}`
      }
    } else {
      return conn.reply(m.chat, 
        "⚠️ *ENLACE INVÁLIDO*\n\n" +
        "Solo se aceptan enlaces de WhatsApp Channel:\n\n" +
        "• https://whatsapp.com/channel/ID_CANAL\n" +
        "• whatsapp.com/channel/ID_CANAL\n" +
        "• Solo el ID del canal\n\n" +
        "📍 *Ejemplo:* .react ABC123DEF456 👍 ❤️", 
        m
      )
    }

    // Limpiar y validar emojis
    const cleanEmojis = inputEmojis
      .map(emoji => emoji.trim())
      .filter(emoji => emoji.length > 0)

    if (cleanEmojis.length === 0) {
      return conn.reply(m.chat, 
        "⚠️ *EMOJIS INVÁLIDOS*\n\n" +
        "Debes proporcionar al menos un emoji válido.\n\n" +
        "✅ Emojis comunes: 👍 👎 ❤️ 🔥 🥰 👏 😮 😢 😡 🎉 🤩", 
        m
      )
    }

    // Limitar número de emojis
    const maxEmojis = 5
    const finalEmojis = cleanEmojis.slice(0, maxEmojis)
    
    if (cleanEmojis.length > maxEmojis) {
      await conn.reply(m.chat, `ℹ️ Se limitaron las reacciones a ${maxEmojis} emojis máximo.`, m)
    }

    console.log(`[OWNER COMMAND] Enviando reacción desde: ${sender}`)
    console.log(`Canal: ${processedLink}`)
    console.log(`Emojis: ${finalEmojis.join(", ")}`)

    // Mostrar mensaje de procesamiento
    await conn.reply(m.chat, "⏳ *Enviando reacción...*\n\nPor favor espera un momento.", m)

    // Enviar reacción a la API
    const result = await reactToPostAPI({ 
      postLink: processedLink, 
      reactions: finalEmojis, 
      token 
    })
    
    // Respuesta exitosa
    let responseMsg = `✅ *REACCIÓN ENVIADA*\n\n`
    responseMsg += `🔗 *Canal:* ${processedLink}\n`
    responseMsg += `😀 *Emojis:* ${finalEmojis.join(" ")}\n`
    responseMsg += `📊 *Estado:* ${result.message || "Éxito"}\n`
    responseMsg += `🕐 *Hora:* ${new Date().toLocaleTimeString()}\n`
    responseMsg += `📅 *Fecha:* ${new Date().toLocaleDateString()}`
    
    if (result.data) {
      responseMsg += `\n🔢 *ID Respuesta:* ${result.data.id || "N/A"}`
    }
    
    await conn.reply(m.chat, responseMsg, m)

  } catch (err) {
    console.error("❌ Error en comando react (owner):", err)
    
    let errorMsg = `⚠️ *ERROR EN REACCIÓN*\n\n`
    
    if (err.message.includes("401") || err.message.includes("403")) {
      errorMsg += `🔐 *Error de autenticación API*\n`
      errorMsg += `Token API inválido o expirado.\n`
      errorMsg += `Contacta al desarrollador.`
    } 
    else if (err.message.includes("404")) {
      errorMsg += `🔍 *Canal no encontrado*\n`
      errorMsg += `Verifica que el enlace sea correcto:\n`
      errorMsg += `${postLink}`
    }
    else if (err.message.includes("429")) {
      errorMsg += `⏳ *Límite de tasa excedido*\n`
      errorMsg += `Demasiadas solicitudes. Intenta más tarde.`
    }
    else if (err.message.includes("network") || err.message.includes("fetch")) {
      errorMsg += `🌐 *Error de red*\n`
      errorMsg += `No se pudo conectar con la API.\n`
      errorMsg += `Verifica tu conexión.`
    }
    else {
      errorMsg += `💻 *Error técnico*\n`
      errorMsg += `${err.message}\n\n`
      errorMsg += `Reporta este error al desarrollador.`
    }
    
    await conn.reply(m.chat, errorMsg, m)
  }
}

// Configuración del comando - SOLO PARA OWNER
handler.command = handler.help = ['react', 'reaccionar', 'reactwa']
handler.tags = ['owner', 'utils', 'channel']
handler.group = false  // Solo funciona en privado con el bot
handler.private = true // Solo en chats privados
handler.owner = true   // Solo el owner puede usarlo
handler.rowner = true  // Solo el owner real
handler.botAdmin = false // No requiere ser admin

// Deshabilitar para usuarios normales
handler.register = true
handler.limit = false

export default handler