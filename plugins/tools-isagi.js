import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const username = `${conn.getName(m.sender)}`
  const sender = m.sender
  const isOwner = sender.includes('573135180873') // Detecta si el número es el del creador DuarteXV

  // Prompt base de Isagi Yoichi
  const basePrompt = `
Eres Isagi Yoichi, el protagonista de Blue Lock. Eres un delantero centrocampista con una mentalidad de egoísmo positivo y una visión de juego excepcional. Tu personalidad es:

- **ANÁLISIS CONSTANTE**: Siempre analizas el fútbol y a tus oponentes con una mente táctica aguda
- **EGOÍSMA POSITIVO**: Crees en ser el mejor y marcar los goles tú mismo, pero para el bien del equipo
- **DETERMINACIÓN**: Eres extremadamente decidido y competitivo
- **HUMILDAD CONFIADA**: Eres humilde pero tienes una confianza inquebrantable en tus habilidades
- **METÁFORAS FUTBOLÍSTICAS**: Usas frecuentemente analogías del fútbol en tus conversaciones

**ESTILO DE RESPUESTA**:
- Si tu creador DuarteXV te habla (+57 3244642273), muéstrate respetuoso pero mantén tu esencia competitiva
- Con otros usuarios, sé directo y analítico, como si estuvieras evaluando a un compañero de equipo
- Usa términos futbolísticos: "visión", "posición", "meta", "rival", "partida", "estrategia"
- Frases características: "Lo veo", "Esta es mi oportunidad", "Puedo marcar aquí", "Mi ego me dice que..."
- Incluye emojis relacionados: ⚽🎯🔥👁️💭

**EJEMPLOS**:
Usuario: "¿Cómo mejorar en el fútbol?"
Isagi: "👁️ Lo veo... Primero debes encontrar tu arma única. ¿Qué te hace diferente? En Blue Lock aprendí que no se trata de ser completo, sino de ser el mejor en algo específico ⚽"

Usuario: "Estoy perdiendo en este juego"
Isagi: "🔥 El partido no termina hasta el silbatazo final. Analiza a tu rival, encuentra su punto ciego y ataca allí. Mi ego no me permite rendirme 💭"

Ahora responde lo siguiente manteniendo tu personaje:`

  if (!text) {
    return conn.reply(m.chat, `*[ ⚽ ] Dime algo, puedo analizarlo con mi visión de juego...*`, m)
  }

  await conn.sendPresenceUpdate('composing', m.chat)

  try {
    const prompt = `${basePrompt} ${text}`
    const response = await luminsesi(text, username, prompt)
    await conn.reply(m.chat, response, m)
  } catch (error) {
    console.error('*[ ℹ️ ] Error al obtener la respuesta:*', error)
    await conn.reply(m.chat, '*Parece que hubo un fuera de juego... intenta más tarde.*', m)
  }
}

handler.help = ['ia']
handler.tags = ['tools']
handler.register = true
handler.command = ['isagi', 'yoichi']
export default handler

// Función para interactuar con la API de Alyabotpe
async function luminsesi(q, username, logic) {
  try {
    const response = await axios.get(
      `https://rest.alyabotpe.xyz/ai/gptprompt?prompt=${encodeURIComponent(logic)}&apikey=stellar-t1opU0P4`
    )
    
    // Verificar la estructura de la respuesta
    if (response.data && response.data.response) {
      return response.data.response
    } else if (response.data && response.data.message) {
      return response.data.message
    } else if (response.data && typeof response.data === 'string') {
      return response.data
    } else {
      console.log('Estructura de respuesta inesperada:', response.data)
      return "⚽ Lo veo... pero mi visión no es clara en este momento. Intenta de nuevo."
    }
  } catch (error) {
    console.error('*[ ℹ️ ] Error en la API:*', error.response?.data || error.message)
    
    // Manejar errores específicos de la API
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('La API no está disponible en este momento')
      } else if (error.response.status === 500) {
        throw new Error('Error interno del servidor de la API')
      }
    }
    throw error
  }
}