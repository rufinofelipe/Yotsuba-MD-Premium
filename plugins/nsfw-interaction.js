import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    // Lista de las 14 opciones
    const opcionesValidas = [
        'blowjob', 'yuri', 'boobjob', 'cum', 'fap',
        'anal', 'grabboobs', 'footjob', 'grope',
        'undress', 'sixnine', 'lickpussy', 'spank',
        'fuck', 'suckboobs'
    ];
    
    // Verificar si se proporcionó una opción
    if (args.length === 0) {
        return m.reply(`❌ *Falta la opción*\n\n📌 *Uso correcto:* ${usedPrefix + command} <opción>\n\n📋 *Opciones disponibles:*\n${opcionesValidas.map((op, i) => `  ${i + 1}. ${op}`).join('\n')}\n\n💡 *Ejemplo:* ${usedPrefix + command} blowjob`);
    }
    
    const opcion = args[0].toLowerCase();
    
    // Validar que la opción sea válida
    if (!opcionesValidas.includes(opcion)) {
        return m.reply(`❌ *Opción no válida*\n\n📋 *Opciones válidas:* ${opcionesValidas.join(', ')}\n\n💡 *Ejemplo:* ${usedPrefix + command} blowjob`);
    }
    
    try {
        // Mostrar mensaje de espera
        const waiting = await m.reply('⏳ *Obteniendo contenido...*');
        
        // Configurar la solicitud a la API
        const apiUrl = 'https://rest.alyabotpe.xyz/nsfw/interaction';
        const apiKey = 'stellar-t1opU0P4';
        
        // Parámetros (puede variar según la API real)
        const params = new URLSearchParams({
            type: opcion,
            key: apiKey
        });
        
        // Hacer la solicitud GET
        const response = await fetch(`${apiUrl}?${params}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'MikuBot/1.0'
            },
            timeout: 30000 // 30 segundos timeout
        });
        
        // Verificar respuesta
        if (!response.ok) {
            await conn.sendMessage(m.chat, { 
                delete: waiting.key 
            });
            
            if (response.status === 404) {
                return m.reply('❌ *Error 404*\nLa API no está disponible en este momento. Contacta al administrador.');
            }
            
            return m.reply(`❌ *Error ${response.status}*\nNo se pudo obtener el contenido. Intenta más tarde.`);
        }
        
        // Parsear respuesta JSON
        const data = await response.json();
        
        // Borrar mensaje de espera
        await conn.sendMessage(m.chat, { 
            delete: waiting.key 
        });
        
        // Verificar si la API devolvió un error
        if (data.status === false) {
            return m.reply(`❌ *Error en la API:* ${data.message || 'Error desconocido'}`);
        }
        
        // Dependiendo del tipo de respuesta de la API
        // Aquí debes adaptar según lo que realmente devuelva la API
        
        if (data.url || data.image || data.media) {
            // Si la API devuelve una URL de imagen/video
            const mediaUrl = data.url || data.image || data.media;
            
            // Determinar tipo de medio
            const isVideo = mediaUrl.match(/\.(mp4|mov|avi|webm)$/i);
            const isGif = mediaUrl.match(/\.gif$/i);
            
            if (isVideo || isGif) {
                // Enviar video o GIF
                await conn.sendMessage(m.chat, {
                    video: { url: mediaUrl },
                    caption: `🎬 *Contenido NSFW*\n🔞 *Tipo:* ${opcion}\n👤 *Solicitado por:* @${m.sender.split('@')[0]}`,
                    mentions: [m.sender]
                }, { quoted: m });
            } else {
                // Enviar imagen por defecto
                await conn.sendMessage(m.chat, {
                    image: { url: mediaUrl },
                    caption: `🖼️ *Contenido NSFW*\n🔞 *Tipo:* ${opcion}\n👤 *Solicitado por:* @${m.sender.split('@')[0]}`,
                    mentions: [m.sender]
                }, { quoted: m });
            }
        } else if (data.text || data.message) {
            // Si la API devuelve texto
            m.reply(`📝 *Respuesta de la API:*\n\n${data.text || data.message}\n\n🔞 *Tipo:* ${opcion}`);
        } else {
            // Respuesta inesperada
            console.log('Respuesta API:', data);
            m.reply(`✅ *Contenido obtenido*\n🔞 *Tipo:* ${opcion}\n\n⚠️ *Formato de respuesta no manejado, revisa la consola.*`);
        }
        
    } catch (error) {
        console.error('Error en el handler:', error);
        m.reply(`❌ *Error interno*\n${error.message}\n\n🔧 *Posibles causas:*\n• La API está caída\n• Problema de conexión\n• Formato de respuesta cambiado`);
    }
};

// Configuración del handler
handler.help = ['nsfw <opción>'];
handler.tags = ['nsfw', 'adult'];
handler.command = /^(nsfw|adult|interaction)$/i;
handler.group = true;
handler.premium = false;
handler.admin = false;
handler.botAdmin = false;
handler.register = true;
handler.limit = 3; // Límite de uso por usuario
handler.exp = 50; // Experiencia ganada por uso

// Información adicional
handler.info = `
*Comando NSFW*

Obtiene contenido adulto de una API externa.

*Uso:* !nsfw <opción>

*Opciones disponibles:*
${[
    'blowjob', 'yuri', 'boobjob', 'cum', 'fap',
    'anal', 'grabboobs', 'footjob', 'grope',
    'undress', 'sixnine', 'lickpussy', 'spank',
    'fuck', 'suckboobs'
].map((op, i) => `  ${i + 1}. ${op}`).join('\n')}

*Notas:*
• Solo funciona en grupos
• Límite de 3 usos por usuario
• Requiere registro
• Contenido solo para adultos (+18)
`;

export default handler;