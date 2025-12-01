import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import yts from 'yt-search'

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const primaryFolder = "./primary"
if (!fs.existsSync(primaryFolder)) {
  fs.mkdirSync(primaryFolder)
}

function getFilePath(groupId) {
  return path.join(primaryFolder, `${groupId}.json`)
}

const handler = async (m, { conn, text, command }) => {
  const filePath = getFilePath(m.chat)
  if (fs.existsSync(filePath)) {
    let db = JSON.parse(fs.readFileSync(filePath))
    if (db.primary && conn.user.jid !== db.primary) {
      return
    }
  }

  try {
    if (!text.trim()) return conn.reply(m.chat, `⚽ Por favor, ingresa el nombre de la música a descargar.`, m)

    let videoIdToFind = text.match(youtubeRegexID)
    let ytplay2 = await yts(videoIdToFind ? 'https://youtu.be/' + videoIdToFind[1] : text)

    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId)
    }

    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2
    if (!ytplay2 || ytplay2.length == 0) return m.reply('✧ No se encontraron resultados para tu búsqueda.')

    let { title, thumbnail, timestamp, views, ago, url, author } = ytplay2
    const vistas = formatViews(views)
    const canalLink = author.url || 'Desconocido'

    const infoMessage = `
⚽ 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱 | 𝗕𝗹𝘂𝗲 𝗟𝗼𝗰𝗸

━━━━━━━━━━━━━━━━━━━━━━━

⚡ 𝗧𝗶𝘁𝘂𝗹𝗼: *${title || 'Desconocido'}*
👁️ 𝗩𝗶𝘀𝘁𝗮𝘀: *${vistas}*
⏱️ 𝗗𝘂𝗿𝗮𝗰𝗶𝗼𝗻: *${timestamp}*
📅 𝗣𝘂𝗯𝗹𝗶𝗰𝗮𝗱𝗼: *${ago}*
🔗 𝗘𝗻𝗹𝗮𝗰𝗲: ${url}
📺 𝗖𝗮𝗻𝗮𝗹: ${canalLink}

━━━━━━━━━━━━━━━━━━━━━━━
⚽ 𝗣𝗿𝗲𝗽𝗮𝗿𝗮𝗻𝗱𝗼 𝘁𝘂 𝗮𝗿𝗰𝗵𝗶𝘃𝗼...
`

    const thumb = (await conn.getFile(thumbnail))?.data
    const JT = {
      contextInfo: {
        externalAdReply: {
          title: botname,
          body: dev,
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    }

    await conn.reply(m.chat, infoMessage, m, JT)

    // 🌀 Audio (MP3)
    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      try {
        const api = await (await fetch(
          `https://rest.alyabotpe.xyz/dl/ytmp3?url=${encodeURIComponent(url)}&key=stellar-j3sPK5q1`
        )).json()

        if (!api.status) throw new Error('La API no devolvió status=true')

        const result = api.data?.dl
        const titulo = api.data?.title || 'audio'

        if (!result) throw new Error('No se generó el enlace.')

        await conn.sendMessage(m.chat, {
          audio: { url: result },
          fileName: `${titulo}.mp3`,
          mimetype: 'audio/mpeg',
          ptt: false
        }, { quoted: m })

      } catch (e) {
        return conn.reply(m.chat, `
⚽ ¡𝗚𝗼𝗹 𝗳𝗮𝗹𝗹𝗮𝗱𝗼! 𝗡𝗼 𝗽𝘂𝗱𝗶𝗺𝗼𝘀 𝗲𝗻𝘃𝗶𝗮𝗿 𝗲𝗹 𝗮𝗿𝗰𝗵𝗶𝘃𝗼.

⚡ 𝗣𝗼𝘀𝗶𝗯𝗹𝗲𝘀 𝗰𝗮𝘂𝘀𝗮𝘀:
  ↯ 𝗘𝗹 𝗮𝗿𝗰𝗵𝗶𝘃𝗼 𝗲𝘀 𝗱𝗲𝗺𝗮𝘀𝗶𝗮𝗱𝗼 𝗴𝗿𝗮𝗻𝗱𝗲.
  ↯ 𝗢𝗰𝘂𝗿𝗿𝗶𝗼́ 𝘂𝗻 𝗲𝗿𝗿𝗼𝗿 𝗶𝗻𝗲𝘀𝗽𝗲𝗿𝗮𝗱𝗼.
`, m)
      }
    }

    // 🎥 Video (MP4)
    else if (['play2', 'ytv', 'ytmp4'].includes(command)) {
      try {
        const api = await (await fetch(
          `https://rest.alyabotpe.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&quality=144&key=stellar-j3sPK5q1`
        )).json()

        if (!api.status) throw new Error('La API no devolvió status=true')

        const result = api.data?.dl
        const titulo = api.data?.title || 'video'

        if (!result) throw new Error('No se generó el enlace.')

        await conn.sendMessage(m.chat, {
          document: { url: result },
          fileName: `${titulo}.mp4`,
          mimetype: 'video/mp4'
        }, { quoted: m })

      } catch (e) {
        return conn.reply(m.chat, `
⚽ ¡𝗚𝗼𝗹 𝗳𝗮𝗹𝗹𝗮𝗱𝗼! 𝗡𝗼 𝗽𝘂𝗱𝗶𝗺𝗼𝘀 𝗲𝗻𝘃𝗶𝗮𝗿 𝗲𝗹 𝗮𝗿𝗰𝗵𝗶𝘃𝗼.

⚡ 𝗣𝗼𝘀𝗶𝗯𝗹𝗲𝘀 𝗰𝗮𝘂𝘀𝗮𝘀:
  ↯ 𝗘𝗹 𝗮𝗿𝗰𝗵𝗶𝘃𝗼 𝗲𝘀 𝗱𝗲𝗺𝗮𝘀𝗶𝗮𝗱𝗼 𝗴𝗿𝗮𝗻𝗱𝗲.
  ↯ 𝗢𝗰𝘂𝗿𝗿𝗶𝗼́ 𝘂𝗻 𝗲𝗿𝗿𝗼𝗿 𝗶𝗻𝗲𝘀𝗽𝗲𝗿𝗮𝗱𝗼.
`, m)
      }
    } else {
      return conn.reply(m.chat, '✧︎ Comando no reconocido.', m)
    }

  } catch (error) {
    return m.reply(`⚠︎ Ocurrió un error: ${error.message}`)
  }
}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio']
handler.tags = ['descargas']
handler.group = true

export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}