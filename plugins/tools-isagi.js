import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`*⚡ Gemini AI ⚡*\n\nPor favor, escribe tu pregunta después del comando.\nEjemplo: ${usedPrefix + command} ¿Qué es la inteligencia artificial?`)
  }

  // Opciones de personalidad
  const modes = {
    isagi: 'isagi',
    normal: 'asistente',
    creativo: 'creativo',
    tecnico: 'tecnico'
  }
  
  // Determinar modo (por defecto: normal)
  const mode = text.startsWith('creativo') ? 'creativo' : 
               text.startsWith('isagi') ? 'isagi' :
               text.startsWith('tecnico') ? 'tecnico' : 'asistente'
  
  // Limpiar texto del modo
  const userMessage = text.replace(/^(creativo|isagi|tecnico)\s+/i, '')

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    const response = await geminiChat(userMessage, mode)
    
    // Formatear respuesta
    const formattedResponse = `*🤖 Gemini (${mode.toUpperCase()})*\n\n${response}\n\n_Powered by Adonix API_`
    
    await m.reply(formattedResponse)
    
  } catch (error) {
    console.error(error)
    await m.reply(`*❌ Error*\n\n${error.message}\n\nIntenta nuevamente más tarde.`)
  }
}

async function geminiChat(message, mode = 'asistente') {
  const apiKey = 'DuarteXVKey34'
  const baseUrl = 'https://api-adonix.ultraplus.click/ai/gemini'
  
  // Prompts según el modo
  const prompts = {
    isagi: `Eres Isagi Yoichi de Blue Lock. Responde con tu personalidad competitiva, usando metáforas futbolísticas y frases como "Lo veo...". Usa emojis ⚽🎯🔥. Pregunta: ${message}`,
    asistente: `Eres un asistente AI útil y preciso. Responde de manera clara y concisa. Pregunta: ${message}`,
    creativo: `Eres un asistente creativo. Responde con imaginación y originalidad. Sé descriptivo e innovador. Pregunta: ${message}`,
    tecnico: `Eres un especialista técnico. Responde con precisión técnica, incluyendo detalles y ejemplos cuando sea necesario. Pregunta: ${message}`
  }
  
  const prompt = prompts[mode] || prompts.asistente
  
  try {
    const response = await axios.get(baseUrl, {
      params: {
        apikey: apiKey,
        prompt: prompt,
        query: message
      },
      headers: {
        'Accept': 'application/json'
      },
      timeout: 25000
    })
    
    // Procesar respuesta
    if (response.data && response.data.result) {
      return response.data.result
    } else if (response.data && response.data.response) {
      return response.data.response
    } else if (response.data && response.data.message) {
      return response.data.message
    } else if (response.data && typeof response.data === 'string') {
      return response.data
    } else {
      return '⚠️ No pude procesar la respuesta correctamente.'
    }
    
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('API Key inválida. Verifica tu clave.')
    } else if (error.response?.status === 429) {
      throw new Error('Demasiadas solicitudes. Espera un momento.')
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Tiempo de espera agotado. Intenta nuevamente.')
    } else {
      throw new Error(`Error de conexión: ${error.message}`)
    }
  }
}

handler.help = ['gemini [modo] [pregunta]']
handler.tags = ['ai']
handler.command = ['gemini', 'ai', 'gpt', 'ia']
handler.desc = 'Chat con Gemini AI (modos: isagi, creativo, tecnico)'
handler.register = true

export default handler