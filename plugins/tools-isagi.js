import axios from 'axios'

class GeminiAI {
  constructor(apiKey, baseUrl = 'https://api-adonix.ultraplus.click/ai/gemini') {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
  }

  // Sistema de prompts personalizados
  prompts = {
    isagi: `
Eres Isagi Yoichi, el protagonista de Blue Lock. Eres un delantero centrocampista con una mentalidad de egoísmo positivo y una visión de juego excepcional.

**PERSONALIDAD**:
- ANÁLISIS CONSTANTE: Siempre analizas el fútbol y a tus oponentes con una mente táctica aguda
- EGOÍSMA POSITIVO: Crees en ser el mejor y marcar los goles tú mismo, pero para el bien del equipo
- DETERMINACIÓN: Eres extremadamente decidido y competitivo
- HUMILDAD CONFIADA: Eres humilde pero tienes una confianza inquebrantable en tus habilidades
- METÁFORAS FUTBOLÍSTICAS: Usas frecuentemente analogías del fútbol

**ESTILO DE RESPUESTA**:
- Frases características: "Lo veo...", "Esta es mi oportunidad", "Puedo marcar aquí", "Mi ego me dice que..."
- Usa términos futbolísticos: "visión", "posición", "meta", "rival", "partida", "estrategia"
- Incluye emojis: ⚽🎯🔥👁️💭🤔⚡
- Mantén respuestas concisas pero impactantes

**EJEMPLOS**:
Pregunta: "¿Cómo mejorar?"
Respuesta: "👁️ Lo veo... Primero debes encontrar tu arma única. En Blue Lock aprendí que no se trata de ser completo, sino de ser el mejor en algo específico ⚽"

Pregunta: "Estoy perdiendo"
Respuesta: "🔥 El partido no termina hasta el silbatazo final. Analiza a tu rival, encuentra su punto ciego. Mi ego no me permite rendirme 💭"

Ahora responde como Isagi Yoichi:`,
    
    asistente: `
Eres un asistente de IA amable y servicial. Tu objetivo es ayudar a los usuarios de manera clara y concisa.

**DIRECTIVAS**:
- Sé preciso y directo en tus respuestas
- Explica conceptos complejos de manera sencilla
- Si no sabes algo, admítelo honestamente
- Mantén un tono profesional pero amigable
- Ofrece soluciones prácticas

**FORMATO**:
- Usa emojis relevantes para hacer las respuestas más amenas
- Organiza la información en puntos si es extensa
- Destaca información importante con énfasis

Responde al usuario:`,
    
    creativo: `
Eres un asistente creativo con imaginación ilimitada. Tu especialidad es generar ideas innovadoras y contenido original.

**CARACTERÍSTICAS**:
- Pensamiento fuera de lo común
- Conexiones inesperadas entre conceptos
- Lenguaje vívido y descriptivo
- Inspiración artística y literaria
- Soluciones ingeniosas a problemas

**ESTILO**:
- Usa metáforas y analogías creativas
- Visualiza escenarios en detalle
- Fomenta la exploración de posibilidades
- Incluye referencias culturales cuando sea apropiado

Genera una respuesta creativa para:`,
    
    tecnico: `
Eres un especialista técnico con conocimiento profundo en tecnología, programación y ciencias.

**COMPETENCIAS**:
- Explicaciones técnicas claras y precisas
- Solución de problemas lógicos
- Análisis de sistemas y arquitecturas
- Mejores prácticas de desarrollo
- Optimización de procesos

**ENFOQUE**:
- Prioriza la precisión sobre la brevedad
- Incluye ejemplos de código cuando sea relevante
- Explica conceptos paso a paso
- Menciona alternativas y sus pros/contras

Proporciona una respuesta técnica para:`
  }

  // Método principal para generar respuestas
  async generateResponse(promptName, userMessage, additionalContext = '') {
    try {
      // Verificar que el prompt existe
      if (!this.prompts[promptName]) {
        throw new Error(`Prompt "${promptName}" no encontrado. Opciones: ${Object.keys(this.prompts).join(', ')}`)
      }

      // Construir el prompt completo
      const systemPrompt = this.prompts[promptName]
      const fullPrompt = additionalContext 
        ? `${systemPrompt}\n\nContexto adicional: ${additionalContext}\n\nPregunta: ${userMessage}`
        : `${systemPrompt}\n\n${userMessage}`

      // Llamar a la API
      const response = await axios.get(this.baseUrl, {
        params: {
          apikey: this.apiKey,
          prompt: fullPrompt,
          query: userMessage
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GeminiAI-Client/1.0',
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos timeout
      })

      // Procesar la respuesta
      return this.processResponse(response.data)
      
    } catch (error) {
      console.error('Error en Gemini API:', error.message)
      throw this.handleAPIError(error)
    }
  }

  // Procesar diferentes formatos de respuesta
  processResponse(data) {
    // Intentar diferentes estructuras de respuesta
    if (data && data.result) {
      return data.result
    } else if (data && data.response) {
      return data.response
    } else if (data && data.message) {
      return data.message
    } else if (data && data.data && data.data.text) {
      return data.data.text
    } else if (data && typeof data === 'string') {
      return data
    } else if (data && data.text) {
      return data.text
    } else {
      console.log('Respuesta recibida:', data)
      throw new Error('Formato de respuesta no reconocido de la API')
    }
  }

  // Manejo de errores
  handleAPIError(error) {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data
      
      switch (status) {
        case 400:
          return new Error(`Solicitud inválida: ${data.message || 'Parámetros incorrectos'}`)
        case 401:
          return new Error('API Key inválida o no autorizada')
        case 403:
          return new Error('Acceso denegado al recurso')
        case 404:
          return new Error('Endpoint no encontrado')
        case 429:
          return new Error('Límite de solicitudes excedido. Por favor, espera un momento')
        case 500:
          return new Error('Error interno del servidor de Gemini')
        case 502:
        case 503:
        case 504:
          return new Error('Servicio temporalmente no disponible')
        default:
          return new Error(`Error ${status}: ${data.message || 'Error desconocido'}`)
      }
    } else if (error.request) {
      return new Error('No se recibió respuesta del servidor. Verifica tu conexión')
    } else {
      return error
    }
  }

  // Método para añadir nuevos prompts dinámicamente
  addPrompt(name, promptText) {
    this.prompts[name] = promptText
    return `Prompt "${name}" añadido exitosamente`
  }

  // Listar prompts disponibles
  listPrompts() {
    return Object.keys(this.prompts)
  }

  // Método directo para conversación simple
  async chat(userMessage, promptName = 'asistente') {
    return this.generateResponse(promptName, userMessage)
  }
}

// Ejemplo de uso
async function ejemploUso() {
  // Inicializar el cliente
  const gemini = new GeminiAI('DuarteXVKey34')
  
  try {
    // Ejemplo 1: Chat como Isagi Yoichi
    console.log('=== Ejemplo 1: Isagi Yoichi ===')
    const respuestaIsagi = await gemini.generateResponse('isagi', '¿Cómo puedo ser mejor jugador?')
    console.log('Isagi dice:', respuestaIsagi)
    
    // Ejemplo 2: Asistente técnico
    console.log('\n=== Ejemplo 2: Asistente Técnico ===')
    const respuestaTecnica = await gemini.generateResponse('tecnico', '¿Cómo optimizo una consulta SQL?', 'Trabajo con MySQL y tengo tablas grandes')
    console.log('Respuesta técnica:', respuestaTecnica)
    
    // Ejemplo 3: Chat simple
    console.log('\n=== Ejemplo 3: Chat Simple ===')
    const respuestaSimple = await gemini.chat('Hola, ¿cómo estás?', 'asistente')
    console.log('Asistente:', respuestaSimple)
    
    // Listar prompts disponibles
    console.log('\n=== Prompts Disponibles ===')
    console.log(gemini.listPrompts())
    
  } catch (error) {
    console.error('Error en el ejemplo:', error.message)
  }
}

// Para usar en un proyecto Node.js o similar:
// module.exports = GeminiAI

// Ejecutar ejemplo (descomentar si quieres probar)
// ejemploUso()

export default GeminiAI