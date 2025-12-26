const handler = async (m, { conn, usedPrefix, command, args }) => {

  if (command && command.includes('menu')) {
    console.log('🔍 DEBUG MENU:', {
      command: command,
      text: m.text,
      message: Object.keys(m.message || {})
    })
  }

  let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  let user = global.db.data.users[userId]
  let name = conn.getName(userId)
  let _uptime = process.uptime() * 1000
  let uptime = clockString(_uptime)
  let totalreg = Object.keys(global.db.data.users).length
  let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length

  usedPrefix = '.'


  const menuCommand = command || ''


  if (menuCommand && menuCommand.includes('menu')) {
    console.log('🎯 PROCESSING MENU:', menuCommand)
  }

  if (menuCommand === 'menu' || menuCommand === 'menú' || menuCommand === 'help') {
    const buttons = [
      ['📥 Descargas', 'menu_descargas'],
      ['🛠️ Herramientas', 'menu_herramientas'],
      ['🔍 Buscadores', 'menu_buscadores'],
      ['🎮 Juegos & RPG', 'menu_juegos'],
      ['⚽ Fútbol', 'menu_futbol'],
      ['👥 Admin Grupos', 'menu_grupos'],
      ['ℹ️ Info Bot', 'menu_info']
    ]

    const text = `╔══════════════════╗
║ ⚽ *ISAGI YOICHI BOT* ⚽║
╚══════════════════╝

✨¡Hola, *@${userId.split('@')[0]}*! ⚽

╭───────────────╮
│ 🔥 *Estado:* ${(conn.user.jid == global.conn.user.jid ? 'Principal ⚡️' : 'Sub-Bot 🔌')}
│ ⏰ *Activo:* ${uptime}
│ 👥 *Usuarios:* ${totalreg}
│ 📊 *Comandos:* ${totalCommands}
╰───────────────╯

⚽ *¡Explora mis funciones!*
━━━━━━━━━━━━━━━━━━━━━
✨ Usa los botones de abajo
🎯 O escribe el comando directamente
📱 Prueba \`.menucompleto\` para ver todo
━━━━━━━━━━━━━━━━━━━━━

🔥 ¡Hagamos el mejor juego posible! ⚽`

    const footer = '⚽ Powered by DuarteXV'
    const menuImage = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1766764726110.jpg'

    try {
      return await conn.sendNCarousel(m.chat, text, footer, menuImage, buttons, null, null, null, m)
    } catch (error) {


      const buttonMessage = {
        text: text,
        footer: footer,
        templateButtons: buttons.map((btn, index) => ({
          index: index + 1,
          quickReplyButton: {
            displayText: btn[0],
            id: btn[1]
          }
        })),
        image: { url: menuImage }
      }
      return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }
  }

  if (menuCommand === 'menu_descargas') {
    const buttons = [
      ['⬅️ Volver al Menú', 'menu']
    ]

    const text = `┏━━━━━━━━━━━━━┓
┃ 📥 *DESCARGAS* ┃
┗━━━━━━━━━━━━━┛

🎵 ━━ *MÚSICA Y VIDEOS* ━━

🎼 \`.play [nombre]\`
   → YouTube Music/Video

🛒 \`.spotify [nombre]\`
   → Spotify Music

🔗 \`.mp3 [url]\` | \`.mp4 [url]\`
   → Convertir URL a MP3/MP4

━━━━━━━━━━━━━━━━━━━━━

📱 ━━ *REDES SOCIALES* ━━

🎬 \`.tiktok [url]\`
   → Videos TikTok

🎵 \`.tiktokmp3 [url]\`
   → TikTok Audio

📸 \`.tiktokimg [url]\`
   → TikTok Imágenes

🔄 \`.ttrandom\`
   → TikTok Random

📸 \`.instagram [url]\`
   → Posts/Reels IG

💙 \`.facebook [url]\`
   → Videos Facebook

🐦 \`.twitter [url]\`
   → Videos Twitter/X

📌 \`.pinvideo [url]\`
   → Videos Pinterest

━━━━━━━━━━━━━━━━━━━━━

📁 ━━ *ARCHIVOS Y REPOS* ━━

💾 \`.mediafire [url]\`
   → Descargar MediaFire

☁️ \`.mega [url]\`
   → Descargar MEGA

📱 \`.apk [nombre]\`
   → APKs y ModAPKs

🛠️ \`.npmjs [package]\`
   → NPM Packages

🗂️ \`.gitclone [repo]\`
   → Clonar Repositorios

━━━━━━━━━━━━━━━━━━━━━

💙 *Usa los comandos o el botón*
⬅️ *para volver al menú principal*`

    const footer = '📥 Módulo de Descargas - Isagi Yoichi Bot'
    const descargasImage = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1766764726110.jpg'

    try {
      return await conn.sendNCarousel(m.chat, text, footer, descargasImage, buttons, null, null, null, m)
    } catch (error) {
      return await conn.sendMessage(m.chat, { text: text }, { quoted: m })
    }
  }

  if (menuCommand === 'menu_herramientas') {
    const buttons = [
      ['⬅️ Volver al Menú', 'menu']
    ]

    const text = `┏━━━━━━━━━━━━━━━┓
┃ 🛠️ *HERRAMIENTAS* ┃
┗━━━━━━━━━━━━━━━┛

🌐 ━━ *UTILIDADES WEB* ━━

🌤️ \`.clima [ciudad]\`
   → Ver clima actual

🈵 \`.translate [texto]\`
   → Traductor

📷 \`.ss [url]\`
   → Screenshot web

🔍 \`.google [búsqueda]\`
   → Buscar en Google

💮 \`.wikipedia [tema]\`
   → Consultar Wikipedia

🔍 \`.ip [dirección]\`
   → Información de IP

━━━━━━━━━━━━━━━━━━━━━

🎨 ━━ *EDICIÓN Y STICKERS* ━━

✨ \`.hd\`
   → Mejorar calidad imagen

🌟 \`.s\`
   → Crear sticker

🖼️ \`.toimg\`
   → Sticker a imagen

🎭 \`.emojimix\`
   → Mezclar emojis

📝 \`.ttp [texto]\`
   → Texto a sticker

💬 \`.qc [texto]\`
   → Quote creator

⏲ \`.brat [texto]\`
   → Brat video

🏷️ \`.wm [pack|autor]\`
   → Marca de agua

━━━━━━━━━━━━━━━━━━━━━

🔧 ━━ *CONVERSORES* ━━

🎵 \`.tomp3\`
   → Video a MP3

🎬 \`.tovideo\`
   → Audio a video

🎞️ \`.togif\`
   → Video a GIF

🔗 \`.tourl\`
   → Subir archivos

☁️ \`.catbox\`
   → Subir a Catbox

📷 \`.ibb\`
   → Subir a ImgBB

🗣️ \`.tts [texto]\`
   → Texto a voz

━━━━━━━━━━━━━━━━━━━━━

🔍 ━━ *DETECCIÓN Y ANÁLISIS* ━━

🎵 \`.shazam\`
   → Reconocer música

🎶 \`.whatmusic\`
   → Identificar canción

🕵️ \`.detectar\`
   → Detectar persona

📋 \`.todoc\`
   → Convertir a documento

📏 \`.tamaño\`
   → Tamaño de archivo

🔤 \`.letra [canción]\`
   → Letras de música

━━━━━━━━━━━━━━━━━━━━━

⚽ *Usa los comandos o el botón*
⬅️ *para volver al menú principal*`

    const herramientasImage = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1766764726110.jpg'

    try {
      return await conn.sendNCarousel(m.chat, text, '🔧 Módulo de Herramientas - Isagi Yoichi Bot', herramientasImage, buttons, null, null, null, m)
    } catch (error) {
      return await conn.sendMessage(m.chat, { text: text }, { quoted: m })
    }
  }

  if (menuCommand === 'menu_buscadores') {
    const buttons = [
      ['⬅️ Volver al Menú', 'menu']
    ]

    const text = `┏━━━━━━━━━━━━━┓
┃ 🔍 *BUSCADORES* ┃
┗━━━━━━━━━━━━━┛

🌐 ━━ *BUSCADORES GENERALES* ━━

🔍 \`.google [búsqueda]\`
   → Buscar en Google

📊 \`.wikipedia [tema]\`
   → Consultar Wikipedia

🎵 \`.yts [música]\`
   → Buscar en YouTube

📱 \`.npmjs [package]\`
   → Buscar NPM packages

📚 \`.githubsearch [repo]\`
   → Buscar repositorios

━━━━━━━━━━━━━━━━━━━━━

⚽ ━━ *FÚTBOL Y DEPORTES* ━━

🏆 \`.futbol [equipo]\`
   → Info de equipos

📊 \`.resultados\`
   → Resultados en vivo

👤 \`.jugador [nombre]\`
   → Info de jugadores

━━━━━━━━━━━━━━━━━━━━━

📸 ━━ *IMÁGENES* ━━

🖼️ \`.imagen [búsqueda]\`
   → Buscar imágenes

📸 \`.pinterest [término]\`
   → Buscar en Pinterest

━━━━━━━━━━━━━━━━━━━━━

⚽ *Usa los comandos o el botón*
⬅️ *para volver al menú principal*`

    const buscadoresImage = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1766764726110.jpg'

    try {
      return await conn.sendNCarousel(m.chat, text, '🔍 Módulo de Buscadores - Isagi Yoichi Bot', buscadoresImage, buttons, null, null, null, m)
    } catch (error) {
      return await conn.sendMessage(m.chat, { text: text }, { quoted: m })
    }
  }

  if (menuCommand === 'menu_juegos') {
    const buttons = [
      ['⬅️ Volver al Menú', 'menu']
    ]

    const text = `┏━━━━━━━━━┓
┃ 🎮 *JUEGOS & RPG* ┃
┗━━━━━━━━━┛

🕹️ ━━ *JUEGOS CLÁSICOS* ━━

⭕ \`.ttt\`
   → Tres en raya (TicTacToe)

✂️ \`.ppt\`
   → Piedra/Papel/Tijera

🎪 \`.ahorcado\`
   → Juego del ahorcado

🔤 \`.sopa\`
   → Sopa de letras

🗑️ \`.delttt\`
   → Eliminar juego TTT

━━━━━━━━━━━━━━━━━━━━━

🎰 ━━ *CASINO & APUESTAS* ━━

🎲 \`.casino [cantidad]\`
   → Apostar dinero

💰 \`.apostar [cantidad]\`
   → Apostar

━━━━━━━━━━━━━━━━━━━━━

⚔️ ━━ *SISTEMA RPG* ━━

🏰 \`.mazmorra\`
   → Explorar mazmorras épicas

🏪 \`.tiendarpg\`
   → Tienda RPG completa

📊 \`.rpgstats\`
   → Ver estadísticas RPG

🏆 \`.ranking\`
   → Ranking de aventureros

💰 \`.work\` | \`.daily\` | \`.mine\`
   → Ganar monedas

🎰 \`.slot\` | \`.ruleta\` | \`.cf\`
   → Juegos de azar

━━━━━━━━━━━━━━━━━━━━━

⚔️ ━━ *COMPETITIVO* ━━

🥊 \`.pvp [@usuario]\`
   → PvP contra usuario

🧠 \`.math\`
   → Quiz matemático

📊 \`.matematicas\`
   → Desafío matemático

━━━━━━━━━━━━━━━━━━━━━

⚽ *¡Gana monedas como un verdadero delantero!*
🏆 *Sistema de ranking competitivo*
🔥 *Conviértete en el mejor*

⚽ *Usa los comandos o el botón*
⬅️ *para volver al menú principal*`

    const juegosImage = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1766764726110.jpg'

    try {
      return await conn.sendNCarousel(m.chat, text, '🎮 Módulo de Juegos - Isagi Yoichi Bot', juegosImage, buttons, null, null, null, m)
    } catch (error) {
      return await conn.sendMessage(m.chat, { text: text }, { quoted: m })
    }
  }

  if (menuCommand === 'menu_futbol') {
    const buttons = [
      ['⬅️ Volver al Menú', 'menu']
    ]

    const text = `┏━━━━━━━━┓
┃ ⚽ *FÚTBOL* ┃
┗━━━━━━━━┛

🏆 ━━ *INFORMACIÓN* ━━

🔵 \`.blue-lock\`
   → Info Blue Lock

👥 \`.personajes\`
   → Personajes Blue Lock

⚽ \`.isagi\`
   → Info Isagi Yoichi

🥅 \`.egoista\`
   → Filosofía del Egoísta

━━━━━━━━━━━━━━━━━━━━━

🎮 ━━ *JUEGOS FÚTBOL* ━━

⚽ \`.penales\`
   → Juego de penales

🎯 \`.tirolibre\`
   → Tiros libres

👤 \`.1vs1 [@usuario]\`
   → Duelo 1 vs 1

🏃 \`.driblar\`
   → Minijuego de dribling

━━━━━━━━━━━━━━━━━━━━━

🔥 ━━ *FRASES ICÓNICAS* ━━

💭 \`.frase-isagi\`
   → Frases de Isagi

🗣️ \`.egoista\`
   → Frases egoístas

🏆 \`.meta\`
   → La meta del delantero

━━━━━━━━━━━━━━━━━━━━━

📊 ━━ *ESTADÍSTICAS* ━━

📈 \`.misestadisticas\`
   → Ver tus stats

🏅 \`.ranking-futbol\`
   → Ranking de jugadores

⚡ \`.habilidades\`
   → Habilidades desbloqueadas

━━━━━━━━━━━━━━━━━━━━━

⚽ *Usa los comandos o el botón*
⬅️ *para volver al menú principal*`

    const futbolImage = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1766764726110.jpg'

    try {
      return await conn.sendNCarousel(m.chat, text, '⚽ Módulo de Fútbol - Isagi Yoichi Bot', futbolImage, buttons, null, null, null, m)
    } catch (error) {
      return await conn.sendMessage(m.chat, { text: text }, { quoted: m })
    }
  }

  if (menuCommand === 'menu_grupos') {
    const text = `┏━━━━━━━━━┓
┃ 👥 *GRUPOS* ┃
┗━━━━━━━━━┛

⚠️ *Solo para administradores*

👑 ━━ *ADMINISTRACIÓN* ━━

🦵 \`.kick [@usuario]\`
   → Eliminar miembro

➕ \`.add [número]\`
   → Invitar usuario

👑 \`.promote [@usuario]\`
   → Dar admin

👤 \`.demote [@usuario]\`
   → Quitar admin

━━━━━━━━━━━━━━━━━━━━━

📢 ━━ *COMUNICACIÓN* ━━

👻 \`.hidetag [texto]\`
   → Mencionar todos

📣 \`.admins\`
   → Llamar admins

📢 \`.invocar\`
   → Mencionar todos

━━━━━━━━━━━━━━━━━━━━━

⚙️ ━━ *CONFIGURACIÓN* ━━

🔓 \`.group open/close\`
   → Abrir/cerrar grupo

🔗 \`.link\`
   → Ver enlace del grupo

🔄 \`.revoke\`
   → Cambiar enlace

━━━━━━━━━━━━━━━━━━━━━

⚽ *Usa los comandos*
⬅️ *Escribe* \`menu\` *para volver*`

    const gruposImage = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1766764726110.jpg'

    try {
      return await conn.sendMessage(m.chat, {
        image: { url: gruposImage },
        caption: text
      }, { quoted: m })
    } catch (error) {
      console.log('Error enviando imagen, enviando solo texto:', error)
      return await conn.sendMessage(m.chat, { text: text }, { quoted: m })
    }
  }

  if (menuCommand === 'menu_info') {
    const text = `┏━━━━━━━━━━┓
┃ ℹ️ *INFO BOT* ┃
┗━━━━━━━━━━┛

🤖 ━━ *DATOS DEL BOT* ━━

📡 \`.ping\`
   → Velocidad de respuesta

⏱️ \`.uptime\`
   → Tiempo activo

📊 \`.status\`
   → Estado completo

ℹ️ \`.infobot\`
   → Info detallada

━━━━━━━━━━━━━━━━━━━━━

🔗 ━━ *ENLACES & COMUNIDAD* ━━

💻 \`.script\`
   → Código fuente

🔗 \`.links\`
   → Enlaces oficiales

👥 \`.staff\`
   → Desarrolladores

━━━━━━━━━━━━━━━━━━━━━

🤖 ━━ *SUBBOTS* ━━

🤖 \`.serbot\`
   → Crear SubBot

📱 \`.qr\`
   → Código QR

🤖 \`.bots\`
   → Lista SubBots

━━━━━━━━━━━━━━━━━━━━━

⚽ *Usa los comandos*
⬅️ *Escribe* \`menu\` *para volver*`

    const infoImage = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1766764726110.jpg'

    try {
      return await conn.sendMessage(m.chat, {
        image: { url: infoImage },
        caption: text
      }, { quoted: m })
    } catch (error) {
      console.log('Error enviando imagen, enviando solo texto:', error)
      return await conn.sendMessage(m.chat, { text: text }, { quoted: m })
    }
  }
}

function clockString(ms) {
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return `${hours}h ${minutes}m ${seconds}s`
}

handler.before = async function (m, { conn, usedPrefix }) {
  if (!m.message) return false

  let buttonId = null

  if (m.message.templateButtonReplyMessage) {
    buttonId = m.message.templateButtonReplyMessage.selectedId
  }
  if (m.message.buttonsResponseMessage) {
    buttonId = m.message.buttonsResponseMessage.selectedButtonId
  }
  if (m.message.listResponseMessage) {
    buttonId = m.message.listResponseMessage.singleSelectReply?.selectedRowId
  }
  if (m.message.interactiveResponseMessage) {
    try {
      const paramsJson = m.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson
      if (paramsJson) {
        const params = JSON.parse(paramsJson)
        buttonId = params.id
      }
    } catch (e) {}
  }

  if (buttonId && buttonId.startsWith('menu')) {
    console.log('🎯 BUTTON DETECTED:', buttonId)

    try {
      await handler(m, { conn, usedPrefix: '.', command: buttonId, args: [] })
      return true 
    } catch (error) {
      console.log('❌ Error processing button:', error)
      return false
    }
  }

  return false
}

handler.help = ['menu', 'menú', 'help']
handler.tags = ['main', 'menu']
handler.command = /^(menu|menú|help|menu_descargas|menu_herramientas|menu_buscadores|menu_juegos|menu_futbol|menu_grupos|menu_info)$/i

export default handler