// Lista de waifus directamente en el código
const waifusList = [
    {
        id: 1,
        name: 'Hinata',
        image: 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1766616841694.jpg',
        anime: 'Naruto',
        rarity: 'Común'
    },
    {
        id: 2,
        name: 'Futaba',
        image: 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1766616887654.jpg',
        anime: 'May kadowaki',
        rarity: 'Rara'
    },
    {
        id: 3,
        name: 'Sada Naohiro',
        image: 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1766617095809.jpg',
        anime: 'Over Flow',
        rarity: 'Épica'
    },
    {
        id: 4,
        name: 'Aqua',
        image: 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1766617152528.jpg',
        anime: 'Konosuba',
        rarity: 'Legendaria'
    },
    {
        id: 5,
        name: 'Ai Hoshino',
        image: 'https://files.catbox.moe/ko1z0y.jpeg',
        anime: 'Oshi no Ko',
        rarity: 'Mítica'
    },
    {
        id: 6,
        name: 'Waguri',
        image: 'https://files.catbox.moe/ra9n34.jpeg',
        anime: 'La nobleza de las flores',
        rarity: 'Rara'
    },
    {
        id: 7,
        name: 'Rem',
        image: 'https://files.catbox.moe/bcrdm3.jpeg',
        anime: 'Re:Zero',
        rarity: 'Épica'
    }
];

// Almacenamiento de waifus adoptadas
let adoptedWaifus = {};

const handler = async (m, { conn, usedPrefix, command }) => {
    try {
        const sender = m.sender;
        const groupId = m.chat;

        // Inicializar grupo si no existe
        if (!adoptedWaifus[groupId]) {
            adoptedWaifus[groupId] = {};
        }

        const cmd = command.toLowerCase();

        // COMANDO: ADOPTAR
        if (cmd === 'adoptar') {
            return adoptarWaifu(m, conn, groupId, sender, usedPrefix);
        }

        // COMANDO: MIWAIFU
        if (cmd === 'miwaifu') {
            return verMiWaifu(m, conn, groupId, sender);
        }

        // COMANDO: LISTAWAIFUS
        if (cmd === 'listawaifus') {
            return listarWaifusGrupo(m, groupId);
        }

        // COMANDO: WAIFUSDISPONIBLES
        if (cmd === 'waifusdisponibles') {
            return verWaifusDisponibles(m, groupId, usedPrefix);
        }

        // COMANDO: ALIMENTAR
        if (cmd === 'alimentar') {
            return alimentarWaifu(m, groupId, sender, usedPrefix);
        }

        // COMANDO: RELACIONES
        if (cmd === 'relaciones') {
            return tenerRelaciones(m, conn, groupId, sender, usedPrefix);
        }

        // COMANDO: WAIFUS (ayuda)
        if (cmd === 'waifus') {
            return mostrarAyuda(m, usedPrefix);
        }

    } catch (error) {
        console.error(error);
        m.reply('❌ Ocurrió un error');
    }
};

// Función para adoptar waifu
async function adoptarWaifu(m, conn, groupId, sender, usedPrefix) {
    // Verificar si ya tiene waifu
    if (adoptedWaifus[groupId][sender]) {
        const waifu = adoptedWaifus[groupId][sender];
        return m.reply(`❌ Ya tienes una waifu: *${waifu.name}*\nUsa *${usedPrefix}miwaifu* para verla`);
    }

    // Obtener waifus disponibles
    const waifusAdoptadas = Object.values(adoptedWaifus[groupId]);
    const disponibles = waifusList.filter(w => 
        !waifusAdoptadas.some(aw => aw.id === w.id)
    );

    if (disponibles.length === 0) {
        return m.reply('❌ Todas las waifus han sido adoptadas en este grupo');
    }

    // Seleccionar waifu aleatoria
    const waifu = disponibles[Math.floor(Math.random() * disponibles.length)];

    // Guardar waifu adoptada
    adoptedWaifus[groupId][sender] = {
        ...waifu,
        fecha: new Date().toLocaleDateString(),
        hambre: 50,
        felicidad: 50,
        nivel: 1,
        relaciones: 0 // Contador de relaciones
    };

    // Enviar imagen
    await conn.sendFile(m.chat, waifu.image, 'waifu.jpg', 
        `✨ *¡Waifu Adoptada!* ✨\n\n` +
        `💕 *Nombre:* ${waifu.name}\n` +
        `🎌 *Anime:* ${waifu.anime}\n` +
        `⭐ *Rareza:* ${waifu.rarity}\n` +
        `📅 *Fecha:* ${new Date().toLocaleDateString()}\n\n` +
        `Usa *${usedPrefix}miwaifu* para ver tu waifu`,
    m);
}

// Función para ver mi waifu
async function verMiWaifu(m, conn, groupId, sender) {
    if (!adoptedWaifus[groupId][sender]) {
        return m.reply('❌ No tienes una waifu\nUsa .adoptar para adoptar una');
    }

    const waifu = adoptedWaifus[groupId][sender];

    await conn.sendFile(m.chat, waifu.image, 'waifu.jpg', 
        `🌸 *Tu Waifu* 🌸\n\n` +
        `💕 *Nombre:* ${waifu.name}\n` +
        `🎌 *Anime:* ${waifu.anime}\n` +
        `⭐ *Rareza:* ${waifu.rarity}\n\n` +
        `📊 *Estadísticas:*\n` +
        `• Nivel: ${waifu.nivel}\n` +
        `• Hambre: ${waifu.hambre}/100\n` +
        `• Felicidad: ${waifu.felicidad}/100\n` +
        `• Relaciones: ${waifu.relaciones} veces\n` +
        `📅 *Adoptada:* ${waifu.fecha}\n\n` +
        `💑 *Requisito relaciones:* Nivel ${waifu.nivel >= 20 ? '✅ Cumplido' : '❌ Necesitas nivel 20'}`,
    m);
}

// Función para listar waifus del grupo
function listarWaifusGrupo(m, groupId) {
    if (!adoptedWaifus[groupId] || Object.keys(adoptedWaifus[groupId]).length === 0) {
        return m.reply('📭 No hay waifus adoptadas en este grupo');
    }

    let lista = '🌸 *Waifus del Grupo* 🌸\n\n';
    let i = 1;

    for (const [userId, waifu] of Object.entries(adoptedWaifus[groupId])) {
        const user = userId.split('@')[0];
        lista += `${i}. *${waifu.name}*\n`;
        lista += `   👤 ${user}\n`;
        lista += `   🎌 ${waifu.anime}\n`;
        lista += `   ⭐ ${waifu.rarity}\n`;
        lista += `   📈 Nivel: ${waifu.nivel}\n`;
        lista += `━━━━━━━━━━━━\n`;
        i++;
    }

    lista += `\nTotal: ${i-1} waifus`;
    m.reply(lista);
}

// Función para ver waifus disponibles
function verWaifusDisponibles(m, groupId, usedPrefix) {
    const waifusAdoptadas = Object.values(adoptedWaifus[groupId] || {});
    const disponibles = waifusList.filter(w => 
        !waifusAdoptadas.some(aw => aw.id === w.id)
    );

    if (disponibles.length === 0) {
        return m.reply('❌ No hay waifus disponibles');
    }

    let lista = '🎌 *Waifus Disponibles* 🎌\n\n';

    disponibles.forEach((waifu, index) => {
        lista += `${index+1}. *${waifu.name}*\n`;
        lista += `   🎌 ${waifu.anime}\n`;
        lista += `   ⭐ ${waifu.rarity}\n`;
        lista += `━━━━━━━━━━━━\n`;
    });

    lista += `\nUsa *${usedPrefix}adoptar* para adoptar una`;
    m.reply(lista);
}

// Función para alimentar waifu
function alimentarWaifu(m, groupId, sender, usedPrefix) {
    if (!adoptedWaifus[groupId][sender]) {
        return m.reply(`❌ No tienes una waifu\nUsa *${usedPrefix}adoptar* primero`);
    }

    const waifu = adoptedWaifus[groupId][sender];

    // Aumentar hambre y felicidad
    waifu.hambre = Math.min(100, waifu.hambre + 20);
    waifu.felicidad = Math.min(100, waifu.felicidad + 15);

    // Subir nivel cada 3 alimentaciones
    if (waifu.hambre % 30 === 0) {
        waifu.nivel++;
        m.reply(`🎉 *¡${waifu.name} ha subido al nivel ${waifu.nivel}!*`);
    }

    m.reply(`🍽️ *${waifu.name}* ha sido alimentada\n\n` +
           `📊 *Nuevas estadísticas:*\n` +
           `• Hambre: ${waifu.hambre}/100 (+20)\n` +
           `• Felicidad: ${waifu.felicidad}/100 (+15)\n` +
           `• Nivel: ${waifu.nivel}\n\n` +
           `💖 ¡${waifu.name} está muy feliz!`);
}

// Función para tener relaciones con la waifu (nivel 20+)
async function tenerRelaciones(m, conn, groupId, sender, usedPrefix) {
    if (!adoptedWaifus[groupId][sender]) {
        return m.reply(`❌ No tienes una waifu\nUsa *${usedPrefix}adoptar* primero`);
    }

    const waifu = adoptedWaifus[groupId][sender];
    
    // Verificar nivel mínimo
    if (waifu.nivel < 20) {
        return m.reply(`❌ *${waifu.name}* necesita alcanzar el nivel 20 para tener relaciones\n` +
                      `📈 Nivel actual: ${waifu.nivel}/20\n` +
                      `💡 Alimenta a tu waifu más veces para subir de nivel`);
    }

    // Verificar que la waifu no esté muy hambrienta o infeliz
    if (waifu.hambre < 30) {
        return m.reply(`❌ *${waifu.name}* tiene demasiada hambre para tener relaciones\n` +
                      `🍽️ Hambre actual: ${waifu.hambre}/100\n` +
                      `💡 Usa *${usedPrefix}alimentar* primero`);
    }

    if (waifu.felicidad < 40) {
        return m.reply(`❌ *${waifu.name}* está muy triste para tener relaciones\n` +
                      `💖 Felicidad actual: ${waifu.felicidad}/100\n` +
                      `💡 Alimenta a tu waifu para aumentar su felicidad`);
    }

    // Aumentar contador de relaciones
    waifu.relaciones++;
    
    // Reducir hambre y aumentar felicidad después de las relaciones
    waifu.hambre = Math.max(0, waifu.hambre - 15);
    waifu.felicidad = Math.min(100, waifu.felicidad + 10);
    
    // Mensajes aleatorios para mayor variedad
    const mensajesRelaciones = [
        `💕 *¡Has tenido relaciones con ${waifu.name}!*\n\n` +
        `🏩 *${waifu.name}* está muy feliz contigo\n` +
        `✨ Relaciones totales: ${waifu.relaciones}\n\n` +
        `📊 *Cambios en estadísticas:*\n` +
        `• Hambre: ${waifu.hambre}/100 (-15)\n` +
        `• Felicidad: ${waifu.felicidad}/100 (+10)\n` +
        `💘 ¡La conexión con tu waifu se ha fortalecido!`,
        
        `💑 *Momento íntimo con ${waifu.name}*\n\n` +
        `🌸 *${waifu.name}* te mira con cariño\n` +
        `❤️ Veces que han estado juntos: ${waifu.relaciones}\n\n` +
        `📈 *Efectos:*\n` +
        `• Energía: ${waifu.hambre}/100\n` +
        `• Amor: ${waifu.felicidad}/100\n` +
        `🔥 ¡La pasión arde entre ustedes!`,
        
        `🛏️ *Noche de pasión con ${waifu.name}*\n\n` +
        `💖 *${waifu.name}* está más unida a ti ahora\n` +
        `💕 Momentos íntimos: ${waifu.relaciones}\n\n` +
        `📊 *Estado actual:*\n` +
        `• Cansancio: ${waifu.hambre}/100\n` +
        `• Satisfacción: ${waifu.felicidad}/100\n` +
        `🌙 ¡Una noche inolvidable!`
    ];
    
    // Seleccionar mensaje aleatorio
    const mensaje = mensajesRelaciones[Math.floor(Math.random() * mensajesRelaciones.length)];
    
    // Enviar imagen de la waifu junto con el mensaje
    await conn.sendFile(m.chat, waifu.image, 'waifu.jpg', mensaje, m);
}

// Función para mostrar ayuda
function mostrarAyuda(m, usedPrefix) {
    const ayuda = `🌸 *Sistema de Waifus* 🌸\n\n` +
                 `📋 *Comandos:*\n` +
                 `• ${usedPrefix}adoptar - Adoptar una waifu\n` +
                 `• ${usedPrefix}miwaifu - Ver tu waifu\n` +
                 `• ${usedPrefix}listawaifus - Ver waifus del grupo\n` +
                 `• ${usedPrefix}waifusdisponibles - Ver waifus disponibles\n` +
                 `• ${usedPrefix}alimentar - Alimentar tu waifu\n` +
                 `• ${usedPrefix}relaciones - Tener relaciones (nivel 20+)\n\n` +
                 `✨ *Reglas:*\n` +
                 `• Solo 1 waifu por usuario\n` +
                 `• Alimenta a tu waifu regularmente\n` +
                 `• Las waifus son por grupo\n` +
                 `• Relaciones disponibles desde nivel 20`;

    m.reply(ayuda);
}

// Configuración del handler
handler.help = ['adoptar', 'miwaifu', 'listawaifus', 'waifusdisponibles', 'alimentar', 'relaciones', 'waifus'];
handler.tags = ['waifu', 'juegos'];
handler.command = ['adoptar', 'miwaifu', 'listawaifus', 'waifusdisponibles', 'alimentar', 'relaciones', 'waifus'];
handler.group = true;

export default handler;