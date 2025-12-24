import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Cargar waifus desde JSON
const waifusPath = path.join(process.cwd(), 'src', 'waifus.json');
const waifusList = JSON.parse(fs.readFileSync(waifusPath, 'utf-8')).waifus;

// Almacenamiento de waifus adoptadas
let adoptedWaifus = {};

const handler = async (m, { conn, args, usedPrefix, command, participants }) => {
    try {
        // Obtener información del usuario
        const sender = m.sender;
        const groupId = m.chat;
        
        // Inicializar datos del grupo si no existen
        if (!adoptedWaifus[groupId]) {
            adoptedWaifus[groupId] = {};
        }
        
        // Verificar el comando utilizado
        const cmd = command.toLowerCase();
        
        if (cmd === 'grabboobs' || cmd === 'agarrartetas') {
            // COMANDO PARA ADOPTAR WAIFU
            await handleAdoptWaifu(m, conn, sender, groupId, usedPrefix, cmd);
        } else if (cmd === 'mivaifu' || cmd === 'verwaifu') {
            // COMANDO PARA VER TU WAIFU
            await handleViewWaifu(m, conn, sender, groupId);
        } else if (cmd === 'listawaifus' || cmd === 'listarwaifus') {
            // COMANDO PARA LISTAR WAIFUS ADOPTADAS EN EL GRUPO
            await handleListGroupWaifus(m, conn, groupId, participants);
        } else if (cmd === 'waifusdisponibles' || cmd === 'disponibles') {
            // COMANDO PARA VER WAIFUS DISPONIBLES
            await handleAvailableWaifus(m, conn, groupId);
        } else if (cmd === 'todaswaifus' || cmd === 'catalogo') {
            // COMANDO PARA VER CATÁLOGO COMPLETO DE WAIFUS
            await handleAllWaifus(m, conn);
        }
        
    } catch (error) {
        console.error(error);
        m.reply('❌ Ocurrió un error al procesar el comando.');
    }
};

// Función para adoptar waifu
async function handleAdoptWaifu(m, conn, sender, groupId, usedPrefix, cmd) {
    // Verificar si el usuario ya tiene una waifu
    if (adoptedWaifus[groupId][sender]) {
        const userWaifu = adoptedWaifus[groupId][sender];
        return m.reply(`❌ Ya tienes una waifu adoptada: *${userWaifu.name}*\nNo puedes adoptar más de una waifu.\n\nUsa *${usedPrefix}mivaifu* para ver tu waifu actual.`);
    }
    
    // Obtener waifus disponibles (no adoptadas en este grupo)
    const availableWaifus = waifusList.filter(waifu => {
        // Verificar si la waifu ya fue adoptada por alguien en este grupo
        const adoptedWaifusInGroup = Object.values(adoptedWaifus[groupId] || {});
        return !adoptedWaifusInGroup.some(adopted => adopted.id === waifu.id);
    });
    
    if (availableWaifus.length === 0) {
        return m.reply('❌ Todas las waifus han sido adoptadas en este grupo. 😢\nEspera a que alguien libere una waifu o únete a otro grupo.');
    }
    
    // Seleccionar waifu aleatoria de las disponibles
    const randomIndex = Math.floor(Math.random() * availableWaifus.length);
    const selectedWaifu = availableWaifus[randomIndex];
    
    // Adoptar la waifu
    adoptedWaifus[groupId][sender] = {
        ...selectedWaifu,
        adoptedBy: sender,
        adoptionDate: new Date().toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        groupId: groupId
    };
    
    // Obtener nombre del usuario
    const user = m.pushName || m.sender.split('@')[0];
    
    // Enviar imagen de la waifu adoptada
    await conn.sendFile(m.chat, selectedWaifu.image, 'waifu.jpg', 
        `✨ *¡FELICIDADES!* ✨\n\n` +
        `👤 *Usuario:* ${user}\n` +
        `💕 *Waifu adoptada:* ${selectedWaifu.name}\n` +
        `🎌 *Anime/Origen:* ${selectedWaifu.anime}\n` +
        `⭐ *Rareza:* ${selectedWaifu.rarity}\n` +
        `📝 *Descripción:* ${selectedWaifu.description}\n` +
        `📅 *Fecha de adopción:* ${new Date().toLocaleDateString('es-ES')}\n\n` +
        `💖 *¡Cuida bien de tu waifu!*\n` +
        `Usa *${usedPrefix}mivaifu* para verla cuando quieras.`,
        m
    );
}

// Función para ver tu waifu adoptada
async function handleViewWaifu(m, conn, sender, groupId) {
    if (!adoptedWaifus[groupId] || !adoptedWaifus[groupId][sender]) {
        return m.reply('❌ No tienes ninguna waifu adoptada.\n\nUsa el comando *grabboobs* o *agarrartetas* para adoptar una waifu disponible.');
    }
    
    const userWaifu = adoptedWaifus[groupId][sender];
    const user = m.pushName || m.sender.split('@')[0];
    
    await conn.sendFile(m.chat, userWaifu.image, 'waifu.jpg', 
        `💕 *TU WAIFU* 💕\n\n` +
        `✨ *Nombre:* ${userWaifu.name}\n` +
        `🎌 *Anime/Origen:* ${userWaifu.anime}\n` +
        `⭐ *Rareza:* ${userWaifu.rarity}\n` +
        `📝 *Descripción:* ${userWaifu.description}\n` +
        `👤 *Dueño:* ${user}\n` +
        `📅 *Adoptada el:* ${userWaifu.adoptionDate}\n\n` +
        `💖 *¡Tu waifu te aprecia mucho!*`,
        m
    );
}

// Función para listar waifus adoptadas en el grupo
async function handleListGroupWaifus(m, conn, groupId, participants) {
    if (!adoptedWaifus[groupId] || Object.keys(adoptedWaifus[groupId]).length === 0) {
        return m.reply('📭 Ningún usuario ha adoptado waifus en este grupo todavía.\n\nUsa *grabboobs* o *agarrartetas* para ser el primero.');
    }
    
    let list = '🎌 *WAIFUS ADOPTADAS EN ESTE GRUPO* 🎌\n\n';
    let counter = 1;
    
    for (const [userId, waifu] of Object.entries(adoptedWaifus[groupId])) {
        const user = participants.find(p => p.id === userId);
        const userName = user?.notify || user?.vname || user?.name || 'Usuario desconocido';
        
        list += `${counter}. 👤 *${userName}*\n`;
        list += `   💕 *Waifu:* ${waifu.name}\n`;
        list += `   ⭐ *Rareza:* ${waifu.rarity}\n`;
        list += `   📅 *Desde:* ${waifu.adoptionDate.split(',')[0]}\n`;
        list += '━━━━━━━━━━━━━━━━━━━━\n';
        counter++;
    }
    
    list += `\n📊 *Total:* ${Object.keys(adoptedWaifus[groupId]).length}/${waifusList.length} waifus adoptadas`;
    list += `\n\nUsa *${usedPrefix}mivaifu* para ver tu waifu`;
    
    m.reply(list);
}

// Función para ver waifus disponibles
async function handleAvailableWaifus(m, conn, groupId) {
    // Obtener waifus no adoptadas en este grupo
    const availableWaifus = waifusList.filter(waifu => {
        if (!adoptedWaifus[groupId]) return true;
        const adoptedWaifusInGroup = Object.values(adoptedWaifus[groupId] || {});
        return !adoptedWaifusInGroup.some(adopted => adopted.id === waifu.id);
    });
    
    if (availableWaifus.length === 0) {
        return m.reply('❌ No hay waifus disponibles en este grupo.\nTodas han sido adoptadas. 😢');
    }
    
    let list = '🎌 *WAIFUS DISPONIBLES PARA ADOPTAR* 🎌\n\n';
    
    availableWaifus.forEach((waifu, index) => {
        list += `${index + 1}. *${waifu.name}*\n`;
        list += `   🎌 ${waifu.anime}\n`;
        list += `   ⭐ ${waifu.rarity}\n`;
        list += `   📝 ${waifu.description}\n`;
        list += '━━━━━━━━━━━━━━━━━━━━\n';
    });
    
    list += `\n📊 *Disponibles:* ${availableWaifus.length}/${waifusList.length}`;
    list += `\n💖 Usa *${usedPrefix}grabboobs* para adoptar una waifu aleatoria`;
    
    m.reply(list);
}

// Función para ver todas las waifus (catálogo completo)
async function handleAllWaifus(m, conn) {
    let list = '📚 *CATÁLOGO COMPLETO DE WAIFUS* 📚\n\n';
    
    waifusList.forEach((waifu, index) => {
        // Verificar si está adoptada (necesitaríamos pasar groupId, pero este comando es global)
        list += `${index + 1}. *${waifu.name}*\n`;
        list += `   🎌 ${waifu.anime}\n`;
        list += `   ⭐ ${waifu.rarity}\n`;
        list += `   📝 ${waifu.description}\n`;
        list += '━━━━━━━━━━━━━━━━━━━━\n';
    });
    
    list += `\n📊 *Total de waifus:* ${waifusList.length}`;
    list += `\n💖 Usa *${usedPrefix}grabboobs* para adoptar una`;
    
    m.reply(list);
}

// Configuración del handler
handler.help = [
    'grabboobs - Adoptar una waifu aleatoria',
    'agarrartetas - Adoptar una waifu aleatoria',
    'mivaifu - Ver tu waifu adoptada',
    'verwaifu - Ver tu waifu adoptada',
    'listawaifus - Ver waifus adoptadas en el grupo',
    'waifusdisponibles - Ver waifus disponibles para adoptar',
    'todaswaifus - Ver catálogo completo de waifus'
];

handler.tags = ['fun', 'waifu', 'juegos'];
handler.command = [
    'grabboobs',
    'agarrartetas',
    'mivaifu',
    'verwaifu',
    'listawaifus',
    'listarwaifus',
    'waifusdisponibles',
    'disponibles',
    'todaswaifus',
    'catalogo'
];
handler.group = true;
handler.register = true;

export default handler;