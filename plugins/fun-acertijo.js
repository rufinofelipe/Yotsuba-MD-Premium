import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

// Objeto global para almacenar acertijos activos por chat/usuario
global.acertijosActivos = global.acertijosActivos || {};

var handler = async (m, { conn, text, usedPrefix, command }) => {
    const chatId = m.chat;
    const userId = m.sender;
    
    // Obtener el comando usado (sin el prefijo)
    const cmd = command || m.text.split(' ')[0].replace(usedPrefix, '').toLowerCase();
    
    // Si no hay texto y el comando es "acertijo", mostrar uno aleatorio
    if (cmd === 'acertijo' || cmd === 'riddle') {
        // Verificar si ya hay un acertijo activo
        if (global.acertijosActivos[chatId]) {
            return await conn.reply(m.chat, 
                `❌ *Ya hay un acertijo activo en este chat*\n\n` +
                `Pregunta: *${global.acertijosActivos[chatId].pregunta}*\n\n` +
                `Usa:\n• *${usedPrefix}adivina [respuesta]* para responder\n• *${usedPrefix}pista* para una pista\n• *${usedPrefix}rendirse* para rendirte`, 
                m
            );
        }

        // Obtener categoría si se especificó
        const categoria = text ? text.toLowerCase().trim() : null;
        let acertijo;
        
        if (categoria && categoria !== '') {
            const acertijosCategoria = global.acertijos.filter(a => a.categoria === categoria);
            if (acertijosCategoria.length > 0) {
                acertijo = pickRandom(acertijosCategoria);
            } else {
                acertijo = pickRandom(global.acertijos);
                await conn.reply(m.chat, 
                    `⚠️ *Categoría "${categoria}" no encontrada*\nTe doy un acertijo aleatorio en su lugar.`, 
                    m
                );
            }
        } else {
            acertijo = pickRandom(global.acertijos);
        }

        // Guardar acertijo activo
        global.acertijosActivos[chatId] = {
            ...acertijo,
            intentos: 0,
            timestamp: Date.now(),
            userId: userId,
            pistasUsadas: []
        };

        // Enviar acertijo
        const mensajeAcertijo = `🎯 *ACERTIJO #${acertijo.id}*\n\n` +
                               `📝 *Pregunta:*\n"${acertijo.pregunta}"\n\n` +
                               `📂 *Categoría:* ${acertijo.categoria}\n` +
                               `⏰ *Tiempo:* 5 minutos\n` +
                               `🎮 *Intentos:* 0/5\n\n` +
                               `✨ *Comandos:*\n` +
                               `• ${usedPrefix}adivina [respuesta] - Para responder\n` +
                               `• ${usedPrefix}pista - Obtener una pista\n` +
                               `• ${usedPrefix}rendirse - Ver la respuesta\n` +
                               `• ${usedPrefix}categorias - Ver categorías`;

        await conn.reply(m.chat, mensajeAcertijo, m);

        // Eliminar acertijo después de 5 minutos
        setTimeout(() => {
            if (global.acertijosActivos[chatId]) {
                conn.sendMessage(chatId, { 
                    text: `⏰ *Tiempo agotado*\n\nEl acertijo ha expirado. La respuesta era: *${global.acertijosActivos[chatId].respuesta}*\n\nUsa ${usedPrefix}acertijo para un nuevo acertijo.`
                });
                delete global.acertijosActivos[chatId];
            }
        }, 5 * 60 * 1000);

        return;
    }

    // Comando: adivina
    if (cmd === 'adivina' || cmd === 'guess') {
        const acertijoActivo = global.acertijosActivos[chatId];
        if (!acertijoActivo) {
            return await conn.reply(m.chat, 
                `❌ *No hay ningún acertijo activo*\n\nUsa ${usedPrefix}acertijo para comenzar uno.`, 
                m
            );
        }

        const respuestaUsuario = text ? text.toLowerCase().trim() : '';
        if (!respuestaUsuario) {
            return await conn.reply(m.chat, 
                `⚠️ *Por favor, escribe tu respuesta*\n\nEjemplo: ${usedPrefix}adivina pera`, 
                m
            );
        }

        acertijoActivo.intentos++;

        // Verificar si se excedieron los intentos
        if (acertijoActivo.intentos > 5) {
            delete global.acertijosActivos[chatId];
            return await conn.reply(m.chat, 
                `❌ *Has excedido el límite de intentos*\n\nLa respuesta era: *${acertijoActivo.respuesta}*\n\nUsa ${usedPrefix}acertijo para un nuevo acertijo.`, 
                m
            );
        }

        if (respuestaUsuario === acertijoActivo.respuesta.toLowerCase()) {
            // Respuesta correcta
            const mensajeCorrecto = `✅ *¡CORRECTO!* 🎉\n\n` +
                                   `🎯 *Respuesta:* ${acertijoActivo.respuesta}\n` +
                                   `📊 *Intentos:* ${acertijoActivo.intentos}\n` +
                                   `📂 *Categoría:* ${acertijoActivo.categoria}\n\n` +
                                   `¡Felicidades *${m.pushName || 'participante'}*! 👏`;

            delete global.acertijosActivos[chatId];
            
            // Enviar sticker de celebración si existe
            try {
                const stickers = [
                    'https://raw.githubusercontent.com/adiwajshing/baileys/master/src/Default/Stickers/Happy.webp',
                    'https://raw.githubusercontent.com/adiwajshing/baileys/master/src/Default/Stickers/Celebration.webp'
                ];
                await conn.sendMessage(chatId, { 
                    sticker: { url: pickRandom(stickers) }
                }, { quoted: m });
            } catch (e) {
                // Si falla el sticker, enviar emojis
                await conn.sendMessage(chatId, { 
                    text: "🎊✨🎉" 
                }, { quoted: m });
            }
            
            return await conn.reply(m.chat, mensajeCorrecto, m);
        } else {
            // Respuesta incorrecta
            return await conn.reply(m.chat, 
                `❌ *Respuesta incorrecta*\n\n` +
                `📊 Intentos: ${acertijoActivo.intentos}/5\n` +
                `💡 Usa *${usedPrefix}pista* para una ayuda\n` +
                `😔 Usa *${usedPrefix}rendirse* para rendirte`, 
                m
            );
        }
    }

    // Comando: pista
    if (cmd === 'pista' || cmd === 'hint') {
        const acertijoActivo = global.acertijosActivos[chatId];
        if (!acertijoActivo) {
            return await conn.reply(m.chat, 
                `❌ *No hay ningún acertijo activo*\n\nUsa ${usedPrefix}acertijo para comenzar uno.`, 
                m
            );
        }

        // Obtener pistas no usadas
        const pistasDisponibles = acertijoActivo.pistas.filter(
            p => !acertijoActivo.pistasUsadas.includes(p)
        );

        if (pistasDisponibles.length === 0) {
            return await conn.reply(m.chat, 
                `ℹ️ *Ya has usado todas las pistas*\n\n` +
                `La respuesta comienza con: *${acertijoActivo.respuesta.charAt(0).toUpperCase()}*`, 
                m
            );
        }

        const pista = pistasDisponibles[0];
        acertijoActivo.pistasUsadas.push(pista);

        return await conn.reply(m.chat, 
            `💡 *PISTA #${acertijoActivo.pistasUsadas.length}:*\n${pista}\n\n` +
            `📊 Pistas usadas: ${acertijoActivo.pistasUsadas.length}/${acertijoActivo.pistas.length}`, 
            m
        );
    }

    // Comando: rendirse
    if (cmd === 'rendirse' || cmd === 'giveup') {
        const acertijoActivo = global.acertijosActivos[chatId];
        if (!acertijoActivo) {
            return await conn.reply(m.chat, 
                `❌ *No hay ningún acertijo activo*`, 
                m
            );
        }

        const mensajeRendicion = `😔 *Te has rendido*\n\n` +
                                `🎯 *Respuesta:* ${acertijoActivo.respuesta}\n` +
                                `📂 *Categoría:* ${acertijoActivo.categoria}\n` +
                                `📊 *Intentos realizados:* ${acertijoActivo.intentos}\n\n` +
                                `Usa *${usedPrefix}acertijo* para intentar con otro.`;

        delete global.acertijosActivos[chatId];
        return await conn.reply(m.chat, mensajeRendicion, m);
    }

    // Comando: categorias
    if (cmd === 'categorias' || cmd === 'categories') {
        const categorias = [...new Set(global.acertijos.map(a => a.categoria))];
        let mensajeCategorias = `📂 *CATEGORÍAS DISPONIBLES:*\n\n`;

        categorias.forEach(cat => {
            const cantidad = global.acertijos.filter(a => a.categoria === cat).length;
            mensajeCategorias += `• *${cat.charAt(0).toUpperCase() + cat.slice(1)}* (${cantidad} acertijos)\n`;
        });

        mensajeCategorias += `\n✨ *Uso:* ${usedPrefix}acertijo [categoría]\n` +
                            `Ejemplo: *${usedPrefix}acertijo frutas*`;

        return await conn.reply(m.chat, mensajeCategorias, m);
    }

    // Comando: ayudaacertijo
    if (cmd === 'ayudaacertijo' || cmd === 'helpacertijo') {
        const mensajeAyuda = `🎯 *AYUDA DE ACERTIJOS*\n\n` +
                           `*Comandos disponibles:*\n\n` +
                           `• *${usedPrefix}acertijo* - Nuevo acertijo aleatorio\n` +
                           `• *${usedPrefix}acertijo [categoría]* - Acertijo específico\n` +
                           `• *${usedPrefix}adivina [respuesta]* - Responder\n` +
                           `• *${usedPrefix}pista* - Obtener una pista\n` +
                           `• *${usedPrefix}rendirse* - Rendirse\n` +
                           `• *${usedPrefix}categorias* - Ver categorías\n\n` +
                           `📝 *Ejemplos:*\n` +
                           `- ${usedPrefix}acertijo animales\n` +
                           `- ${usedPrefix}adivina perro\n` +
                           `- ${usedPrefix}pista`;

        return await conn.reply(m.chat, mensajeAyuda, m);
    }
}

handler.help = ['acertijo', 'adivina [respuesta]', 'pista', 'rendirse', 'categorias', 'ayudaacertijo']
handler.tags = ['games', 'fun']
handler.command = /^(acertijo|riddle|adivina|guess|pista|hint|rendirse|giveup|categorias|categories|ayudaacertijo|helpacertijo)$/i
handler.fail = null
handler.exp = 0
handler.group = true
handler.register = true
handler.limit = true

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

// Base de datos de acertijos (debe estar ANTES del export)
if (!global.acertijos) {
    global.acertijos = [
        {
            id: 1,
            pregunta: "Blanco por dentro, verde por fuera. Si quieres que te lo diga, espera.",
            respuesta: "pera",
            pistas: ["Es una fruta", "Tiene forma de campana", "Comienza con P"],
            categoria: "frutas"
        },
        {
            id: 2,
            pregunta: "Tiene dientes y no come, tiene cabeza y no es hombre.",
            respuesta: "ajo",
            pistas: ["Se usa en la cocina", "Tiene un olor fuerte", "Es un condimento"],
            categoria: "alimentos"
        },
        {
            id: 3,
            pregunta: "Oro parece, plata no es. El que no lo adivine, bien tonto es.",
            respuesta: "plátano",
            pistas: ["Es una fruta", "Tiene forma curva", "Es amarillo"],
            categoria: "frutas"
        },
        {
            id: 4,
            pregunta: "Largo como un brazo, duro como piedra, lo abres y no lo comes.",
            respuesta: "hueso",
            pistas: ["Los perros lo muerden", "Está dentro del cuerpo", "Da estructura"],
            categoria: "cuerpo"
        },
        {
            id: 5,
            pregunta: "Sin alas vuela, sin ojos llora, sin boca canta.",
            respuesta: "viento",
            pistas: ["No se puede ver", "Mueve las hojas", "Hace frío"],
            categoria: "naturaleza"
        },
        {
            id: 6,
            pregunta: "Tengo llaves pero no abro puertas, tengo espacio pero no tengo habitaciones, puedes entrar pero no salir.",
            respuesta: "teclado",
            pistas: ["Lo usas con la computadora", "Tiene letras y números", "Es un periférico"],
            categoria: "tecnologia"
        },
        {
            id: 7,
            pregunta: "Redondo como la luna, blanco como la cal, todos me preguntan y yo siempre callo.",
            respuesta: "huevo",
            pistas: ["Es un alimento", "Lo ponen las gallinas", "Tiene yema"],
            categoria: "alimentos"
        },
        {
            id: 8,
            pregunta: "Un león en el zoológico, el rey de la jungla sin corona, pero no es animal ni hombre.",
            respuesta: "león",
            pistas: ["Es un felino", "Tiene melena", "Ruge fuerte"],
            categoria: "animales"
        },
        {
            id: 9,
            pregunta: "Camina con cuatro patas al amanecer, con dos al mediodía y con tres al atardecer.",
            respuesta: "humano",
            pistas: ["Se refiere a etapas de la vida", "Usa bastón en la vejez", "Ser racional"],
            categoria: "enigmas"
        },
        {
            id: 10,
            pregunta: "Lo tienes tú, lo tengo yo, los animales no lo tienen, el árbol sí lo tiene.",
            respuesta: "sombra",
            pistas: ["Aparece con la luz", "Te sigue", "Cambia de tamaño"],
            categoria: "enigmas"
        },
        {
            id: 11,
            pregunta: "Es tuyo, pero otros lo usan más que tú.",
            respuesta: "nombre",
            pistas: ["Te identifica", "Lo escriben en documentos", "Tienes uno o varios"],
            categoria: "logica"
        },
        {
            id: 12,
            pregunta: "Tiene agujas pero no cose, tiene números pero no cuenta.",
            respuesta: "reloj",
            pistas: ["Mide el tiempo", "Lo llevas en la muñeca", "Tiene manecillas"],
            categoria: "objetos"
        }
    ];
}