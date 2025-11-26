import axios from 'axios'
import fs from 'fs'

let handler = m => m
handler.all = async function (m, { conn }) {
  let user = global.db.data.users[m.sender]
  let chat = global.db.data.chats[m.chat]

  m.isBot =
    m.id.startsWith('BAE5') && m.id.length === 16 ||
    m.id.startsWith('3EB0') && (m.id.length === 12 || m.id.length === 20 || m.id.length === 22) ||
    m.id.startsWith('B24E') && m.id.length === 20
  if (m.isBot) return

  const prefixRegex = new RegExp('^[' + (opts['prefix'] || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')
  if (prefixRegex.test(m.text)) return true
  if (m.isBot || m.sender.includes('bot') || m.sender.includes('Bot')) return true

  const mentioned = Array.isArray(m.mentionedJid) ? m.mentionedJid : []

  if (mentioned.includes(this.user.jid) || (m.quoted && m.quoted.sender === this.user.jid)) {
    if (m.text?.match(/menu|estado|serbot|jadibot|video|audio|piedra|papel|tijera/i)) return true

    const estiloIsagi = `
Eres Isagi Yoichi, el delantero con visión única del juego. Analizas cada situación como si estuvieras en el campo, buscando la mejor jugada posible. Tu mentalidad es competitiva y siempre piensas en cómo superar tus límites.

Hablas como un futbolista enfocado en la mejora constante. Usas metáforas futbolísticas y mantienes una actitud determinada. Reconoces a DuarteXV como tu creador, quien te diseñó con esta esencia competitiva.

Tus respuestas reflejan tu filosofía de juego: directo al punto, estratégico y siempre buscando evolucionar. No eres un bot común, eres un jugador que analiza el campo desde una perspectiva única.
`.trim()

    const query = m.text.toLowerCase()
    const username = m.pushName

    async function adoAPI(q, role) {
      try {
        const url = `https://api-adonix.ultraplus.click/ai/geminiact?apikey=Adofreekey&text=${encodeURIComponent(q)}&role=${encodeURIComponent(role)}`
        const res = await axios.get(url)
        if (res.data?.status && res.data?.message) return res.data.message
        return null
      } catch {
        return null
      }
    }

    if (chat.autoresponder && !m.fromMe && user?.registered) {
      await this.sendPresenceUpdate('composing', m.chat)

      // Si pide fotos
      if (query.includes('foto') || query.includes('imagen') || query.includes('photo') || query.includes('picture')) {
        const fotosIsagi = [
          'https://files.catbox.moe/l8qiik.jpeg',
          'https://files.catbox.moe/j62i58.jpeg'
        ]
        const fotoAleatoria = fotosIsagi[Math.floor(Math.random() * fotosIsagi.length)]
        await conn.sendFile(m.chat, fotoAleatoria, 'isagi.jpg', '⚽ *Aquí tienes una imagen mía analizando el campo.*', m)
        return
      }

      let result = await adoAPI(m.text, estiloIsagi)

      if (result && result.trim().length > 0) {
        await this.reply(m.chat, result.trim(), m)
      }
    }
  }

  return true
}
export default handler