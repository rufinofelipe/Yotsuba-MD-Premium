const { generateWAMessageFromContent, proto } = (await import('@whiskeysockets/baileys')).default

// Objeto global para almacenar acertijos activos por chat/usuario
global.acertijosActivos = global.acertijosActivos || {};

var handler = async (m, { conn, text }) => {
    const chatId = m.chat;
    const userId = m.sender;
    const args = text ? text.trim().split(' ') : [];
    const comando = args[0]?.toLowerCase() || '';

    // Comandos principales
    if (comando === 'acertijo' || comando === 'riddle') {
        // Iniciar nuevo acertijo
        if (global.acertijosActivos[chatId]) {
            return conn.sendMessage(m.chat, { 
                text: `❌ Ya hay un acertijo activo en este chat. Resuelve el anterior primero.\nUsa: *rendirse* para ver la respuesta.` 
            }, { quoted: m });
        }

        const categoria = args[1]?.toLowerCase();
        let acertijo;
        
        if (categoria) {
            // Filtrar por categoría si se especifica
            const acertijosCategoria = global.acertijos.filter(a => a.categoria === categoria);
            if (acertijosCategoria.length > 0) {
                acertijo = acertijosCategoria[Math.floor(Math.random() * acertijosCategoria.length)];
            } else {
                acertijo = pickRandom(global.acertijos);
                conn.sendMessage(m.chat, { 
                    text: `⚠️ Categoría no encontrada. Te doy un acertijo aleatorio en su lugar.` 
                }, { quoted: m });
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
                               `📝 *Pregunta:*\n${acertijo.pregunta}\n\n` +
                               `📂 *Categoría:* ${acertijo.categoria}\n` +
                               `⏰ Tienes 5 minutos para responder\n\n` +
                               `✨ *Comandos disponibles:*\n` +
                               `• *adivina [respuesta]* - Para responder\n` +
                               `• *pista* - Obtener una pista\n` +
                               `• *rendirse* - Ver la respuesta\n` +
                               `• *categorias* - Ver categorías`;

        await conn.sendMessage(m.chat, { text: mensajeAcertijo }, { quoted: m });

        // Eliminar acertijo después de 5 minutos
        setTimeout(() => {
            if (global.acertijosActivos[chatId]) {
                delete global.acertijosActivos[chatId];
            }
        }, 5 * 60 * 1000);

    } else if (comando === 'adivina' || comando === 'guess') {
        // Verificar respuesta
        const acertijoActivo = global.acertijosActivos[chatId];
        if (!acertijoActivo) {
            return conn.sendMessage(m.chat, { 
                text: `❌ No hay ningún acertijo activo. Usa *acertijo* para comenzar uno.` 
            }, { quoted: m });
        }

        const respuestaUsuario = args.slice(1).join(' ').toLowerCase().trim();
        if (!respuestaUsuario) {
            return conn.sendMessage(m.chat, { 
                text: `⚠️ Por favor, escribe tu respuesta después de *adivina*.\nEjemplo: *adivina manzana*` 
            }, { quoted: m });
        }

        acertijoActivo.intentos++;

        if (respuestaUsuario === acertijoActivo.respuesta.toLowerCase()) {
            // Respuesta correcta
            const mensajeCorrecto = `✅ *¡CORRECTO!* 🎉\n\n` +
                                   `La respuesta era: *${acertijoActivo.respuesta}*\n` +
                                   `Intentos: ${acertijoActivo.intentos}\n` +
                                   `Categoría: ${acertijoActivo.categoria}\n\n` +
                                   `¡Felicidades ${m.pushName || 'participante'}! 👏`;

            delete global.acertijosActivos[chatId];
            
            // Enviar sticker de celebración si está disponible
            try {
                await conn.sendMessage(m.chat, { 
                    sticker: fs.readFileSync('./src/sticker/felicidades.webp') 
                }, { quoted: m });
            } catch (e) {
                // Si no hay sticker, enviar emojis
                await conn.sendMessage(m.chat, { 
                    text: "🎊✨🎉" 
                }, { quoted: m });
            }
            
            return conn.sendMessage(m.chat, { text: mensajeCorrecto }, { quoted: m });
        } else {
            // Respuesta incorrecta
            return conn.sendMessage(m.chat, { 
                text: `❌ *Respuesta incorrecta*\n\n` +
                     `Intentos: ${acertijoActivo.intentos}\n` +
                     `Sigue intentando o usa *pista* para ayuda.` 
            }, { quoted: m });
        }

    } else if (comando === 'pista' || comando === 'hint') {
        // Obtener pista
        const acertijoActivo = global.acertijosActivos[chatId];
        if (!acertijoActivo) {
            return conn.sendMessage(m.chat, { 
                text: `❌ No hay ningún acertijo activo. Usa *acertijo* para comenzar uno.` 
            }, { quoted: m });
        }

        // Obtener pistas no usadas
        const pistasDisponibles = acertijoActivo.pistas.filter(
            p => !acertijoActivo.pistasUsadas.includes(p)
        );

        if (pistasDisponibles.length === 0) {
            return conn.sendMessage(m.chat, { 
                text: `ℹ️ Ya has usado todas las pistas para este acertijo.` 
            }, { quoted: m });
        }

        const pista = pistasDisponibles[0];
        acertijoActivo.pistasUsadas.push(pista);

        return conn.sendMessage(m.chat, { 
            text: `💡 *PISTA #${acertijoActivo.pistasUsadas.length}:*\n${pista}\n\n` +
                 `Pistas usadas: ${acertijoActivo.pistasUsadas.length}/${acertijoActivo.pistas.length}` 
        }, { quoted: m });

    } else if (comando === 'rendirse' || comando === 'giveup') {
        // Rendirse y mostrar respuesta
        const acertijoActivo = global.acertijosActivos[chatId];
        if (!acertijoActivo) {
            return conn.sendMessage(m.chat, { 
                text: `❌ No hay ningún acertijo activo.` 
            }, { quoted: m });
        }

        const mensajeRendicion = `😔 *Te has rendido*\n\n` +
                                `La respuesta era: *${acertijoActivo.respuesta}*\n` +
                                `Categoría: ${acertijoActivo.categoria}\n` +
                                `Intentos realizados: ${acertijoActivo.intentos}\n\n` +
                                `Usa *acertijo* para intentar con otro.`;

        delete global.acertijosActivos[chatId];
        return conn.sendMessage(m.chat, { text: mensajeRendicion }, { quoted: m });

    } else if (comando === 'categorias' || comando === 'categories') {
        // Mostrar categorías disponibles
        const categorias = [...new Set(global.acertijos.map(a => a.categoria))];
        let mensajeCategorias = `📂 *CATEGORÍAS DISPONIBLES:*\n\n`;

        categorias.forEach(cat => {
            const cantidad = global.acertijos.filter(a => a.categoria === cat).length;
            mensajeCategorias += `• *${cat.charAt(0).toUpperCase() + cat.slice(1)}* (${cantidad} acertijos)\n`;
        });

        mensajeCategorias += `\n✨ *Uso:* acertijo [categoría]\n` +
                            `Ejemplo: *acertijo frutas*`;

        return conn.sendMessage(m.chat, { text: mensajeCategorias }, { quoted: m });

    } else if (comando === 'ayudaacertijo' || comando === 'helpacertijo') {
        // Mostrar ayuda
        const mensajeAyuda = `🎯 *AYUDA DE ACERTIJOS*\n\n` +
                           `*Comandos disponibles:*\n\n` +
                           `• *acertijo* - Nuevo acertijo aleatorio\n` +
                           `• *acertijo [categoría]* - Acertijo de categoría específica\n` +
                           `• *adivina [respuesta]* - Responder al acertijo\n` +
                           `• *pista* - Obtener una pista\n` +
                           `• *rendirse* - Rendirse y ver la respuesta\n` +
                           `• *categorias* - Ver categorías disponibles\n\n` +
                           `📝 *Ejemplos:*\n` +
                           `- acertijo animales\n` +
                           `- adivina perro\n` +
                           `- pista`;

        return conn.sendMessage(m.chat, { text: mensajeAyuda }, { quoted: m });
    } else {
        // Si no es un comando válido, mostrar ayuda
        return conn.sendMessage(m.chat, { 
            text: `⚠️ *Comando no reconocido*\n\n` +
                 `Usa *ayudaacertijo* para ver todos los comandos disponibles.` 
        }, { quoted: m });
    }
}

handler.help = ['acertijo', 'adivina [respuesta]', 'pista', 'rendirse', 'categorias', 'ayudaacertijo']
handler.tags = ['games', 'fun']
handler.command = ['acertijo', 'riddle', 'adivina', 'guess', 'pista', 'hint', 'rendirse', 'giveup', 'categorias', 'categories', 'ayudaacertijo', 'helpacertijo']
handler.fail = null
handler.exp = 0
handler.group = true
handler.register = true

export default handler

function pickRandom(list) {
    return list[Math.floor(list.length * Math.random())]
}

// Base de datos de acertijos
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
    }
];