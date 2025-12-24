import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Cargar waifus desde JSON
const waifusPath = path.join(process.cwd(), 'src', 'waifus.json');
const waifusList = JSON.parse(fs.readFileSync(waifusPath, 'utf-8')).waifus;

// Almacenamiento de waifus adoptadas con estadísticas
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
        
        if (cmd === 'adoptar' || cmd === 'adopt') {
            // COMANDO PARA ADOPTAR WAIFU
            await handleAdoptWaifu(m, conn, sender, groupId, usedPrefix);
        } else if (cmd === 'mivaifu' || cmd === 'verwaifu') {
            // COMANDO PARA VER TU WAIFU
            await handleViewWaifu(m, conn, sender, groupId, usedPrefix);
        } else if (cmd === 'listawaifus' || cmd === 'listarwaifus') {
            // COMANDO PARA LISTAR WAIFUS ADOPTADAS EN EL GRUPO
            await handleListGroupWaifus(m, conn, groupId, participants, usedPrefix);
        } else if (cmd === 'waifusdisponibles' || cmd === 'disponibles') {
            // COMANDO PARA VER WAIFUS DISPONIBLES
            await handleAvailableWaifus(m, conn, groupId, usedPrefix);
        } else if (cmd === 'catalogo' || cmd === 'waifucatalog') {
            // COMANDO PARA VER CATÁLOGO COMPLETO DE WAIFUS
            await handleAllWaifus(m, conn, usedPrefix);
        } else if (cmd === 'alimentar' || cmd === 'darcomida') {
            // COMANDO PARA DAR COMIDA A TU WAIFU
            await handleFeedWaifu(m, conn, sender, groupId, usedPrefix);
        } else if (cmd === 'waifus' || cmd === 'waifulist') {
            // COMANDO PARA VER LISTA RÁPIDA DE WAIFUS
            await handleWaifusList(m, conn, groupId, usedPrefix);
        } else if (cmd === 'libera' || cmd === 'liberar') {
            // COMANDO PARA LIBERAR WAIFU
            await handleReleaseWaifu(m, conn, sender, groupId, usedPrefix);
        }
        
    } catch (error) {
        console.error(error);
        m.reply('❌ Ocurrió un error al procesar el comando.');
    }
};

// Función para mostrar lista rápida de comandos
async function handleWaifusList(m, conn, groupId, usedPrefix) {
    let list = `🌸 *SISTEMA DE WAIFUS* 🌸\n\n`;
    
    // Mostrar estadísticas rápidas
    const adoptedCount = adoptedWaifus[groupId] ? Object.keys(adoptedWaifus[groupId]).length : 0;
    const availableCount = waifusList.length - adoptedCount;
    
    list += `📊 *ESTADO DEL GRUPO:*\n`;
    list += `   • Adoptadas: ${adoptedCount}\n`;
    list += `   • Disponibles: ${availableCount}\n`;
    list += `   • Total: ${waifusList.length}\n\n`;
    
    list += `💖 *COMANDOS DISPONIBLES:*\n`;
    list += `   • ${usedPrefix}adoptar - Adoptar una waifu\n`;
    list += `   • ${usedPrefix}mivaifu - Ver tu waifu\n`;
    list += `   • ${usedPrefix}listawaifus - Ver waifus del grupo\n`;
    list += `   • ${usedPrefix}waifusdisponibles - Ver waifus libres\n`;
    list += `   • ${usedPrefix}catalogo - Ver todas las waifus\n`;
    list += `   • ${usedPrefix}alimentar - Dar comida\n`;
    list += `   • ${usedPrefix}libera - Liberar tu waifu\n\n`;
    
    list += `✨ *¡Adopta y cuida de tu waifu!*`;
    
    m.reply(list);
}

// Función para adoptar waifu
async function handleAdoptWaifu(m, conn, sender, groupId, usedPrefix) {
    // Verificar si el usuario ya tiene una waifu
    if (adoptedWaifus[groupId][sender]) {
        const userWaifu = adoptedWaifus[groupId][sender];
        return m.reply(`❌ *${userWaifu.name}* ya es tu waifu.\nUsa *${usedPrefix}mivaifu* para verla o *${usedPrefix}libera* para liberarla.`);
    }
    
    // Obtener waifus disponibles (no adoptadas en este grupo)
    const availableWaifus = waifusList.filter(waifu => {
        const adoptedWaifusInGroup = Object.values(adoptedWaifus[groupId] || {});
        return !adoptedWaifusInGroup.some(adopted => adopted.id === waifu.id);
    });
    
    if (availableWaifus.length === 0) {
        return m.reply('❌ No hay waifus disponibles en este grupo.\nTodas han sido adoptadas. 😢');
    }
    
    // Seleccionar waifu aleatoria
    const randomIndex = Math.floor(Math.random() * availableWaifus.length);
    const selectedWaifu = availableWaifus[randomIndex];
    
    // Adoptar la waifu con estadísticas
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
        groupId: groupId,
        stats: {
            nivel: 1,
            experiencia: 0,
            hambre: 50,
            felicidad: 50,
            alimentaciones: 0,
            ultimaAlimentacion: null
        }
    };
    
    // Obtener nombre del usuario
    const user = m.pushName || m.sender.split('@')[0];
    
    // Enviar mensaje de éxito
    await conn.sendFile(m.chat, selectedWaifu.image, 'waifu.jpg', 
        `✨ *¡FELICIDADES!* ✨\n\n` +
        `👤 *Usuario:* ${user}\n` +
        `💕 *Waifu adoptada:* ${selectedWaifu.name}\n` +
        `🎌 *Origen:* ${selectedWaifu.anime}\n` +
        `⭐ *Rareza:* ${selectedWaifu.rarity}\n` +
        `📅 *Adoptada:* ${new Date().toLocaleDateString('es-ES')}\n\n` +
        `📊 *Estadísticas:*\n` +
        `   • Nivel: 1\n` +
        `   • Hambre: 50/100\n` +
        `   • Felicidad: 50/100\n\n` +
        `💖 *Comandos útiles:*\n` +
        `   • ${usedPrefix}mivaifu - Ver tu waifu\n` +
        `   • ${usedPrefix}alimentar - Dar comida\n` +
        `   • ${usedPrefix}listawaifus - Ver waifus del grupo`,
        m
    );
}

// Función para ver tu waifu
async function handleViewWaifu(m, conn, sender, groupId, usedPrefix) {
    if (!adoptedWaifus[groupId] || !adoptedWaifus[groupId][sender]) {
        return m.reply(`❌ No tienes una waifu.\nUsa *${usedPrefix}adoptar* para adoptar una.`);
    }
    
    const userWaifu = adoptedWaifus[groupId][sender];
    const user = m.pushName || m.sender.split('@')[0];
    
    // Crear barras de progreso
    const hungerBar = createBar(userWaifu.stats.hambre);
    const happinessBar = createBar(userWaifu.stats.felicidad);
    const expPercent = (userWaifu.stats.experiencia % 100);
    const expBar = createBar(expPercent);
    
    await conn.sendFile(m.chat, userWaifu.image, 'waifu.jpg', 
        `🌸 *TU WAIFU* 🌸\n\n` +
        `✨ *Nombre:* ${userWaifu.name}\n` +
        `🎌 *Origen:* ${userWaifu.anime}\n` +
        `⭐ *Rareza:* ${userWaifu.rarity}\n\n` +
        `📊 *ESTADÍSTICAS:*\n` +
        `   • Nivel ${userWaifu.stats.nivel}\n` +
        `   • Exp: ${expBar} ${expPercent}%\n` +
        `   • Hambre: ${hungerBar} ${userWaifu.stats.hambre}%\n` +
        `   • Felicidad: ${happinessBar} ${userWaifu.stats.felicidad}%\n` +
        `   • Alimentaciones: ${userWaifu.stats.alimentaciones}\n\n` +
        `👤 *Dueño:* ${user}\n` +
        `📅 *Adoptada:* ${userWaifu.adoptionDate}\n\n` +
        `💝 *Usa ${usedPrefix}alimentar para cuidarla*`,
        m
    );
}

// Función para listar waifus del grupo
async function handleListGroupWaifus(m, conn, groupId, participants, usedPrefix) {
    if (!adoptedWaifus[groupId] || Object.keys(adoptedWaifus[groupId]).length === 0) {
        return m.reply(`📭 No hay waifus en este grupo.\nSé el primero usando *${usedPrefix}adoptar*`);
    }
    
    let list = `🌸 *WAIFUS DEL GRUPO* 🌸\n\n`;
    let counter = 1;
    
    for (const [userId, waifu] of Object.entries(adoptedWaifus[groupId])) {
        const user = participants.find(p => p.id === userId);
        const userName = user?.notify || user?.vname || user?.name || 'Usuario';
        
        list += `${counter}. *${waifu.name}*\n`;
        list += `   👤 Dueño: ${userName}\n`;
        list += `   ⭐ ${waifu.rarity}\n`;
        list += `   🎌 ${waifu.anime}\n`;
        list += `   📅 ${waifu.adoptionDate.split(',')[0]}\n`;
        list += `━━━━━━━━━━━━━━━━━━\n`;
        counter++;
    }
    
    list += `\n📊 Total: ${counter-1} waifus`;
    m.reply(list);
}

// Función para ver waifus disponibles
async function handleAvailableWaifus(m, conn, groupId, usedPrefix) {
    const availableWaifus = waifusList.filter(waifu => {
        if (!adoptedWaifus[groupId]) return true;
        const adoptedWaifusInGroup = Object.values(adoptedWaifus[groupId] || {});
        return !adoptedWaifusInGroup.some(adopted => adopted.id === waifu.id);
    });
    
    if (availableWaifus.length === 0) {
        return m.reply('❌ No hay waifus disponibles.\nTodas han sido adoptadas.');
    }
    
    let list = `🌸 *WAIFUS DISPONIBLES* 🌸\n\n`;
    
    availableWaifus.forEach((waifu, index) => {
        list += `${index + 1}. *${waifu.name}*\n`;
        list += `   🎌 ${waifu.anime}\n`;
        list += `   ⭐ ${waifu.rarity}\n`;
        list += `━━━━━━━━━━━━━━━━━━\n`;
    });
    
    list += `\n💖 Usa *${usedPrefix}adoptar* para adoptar una waifu aleatoria`;
    m.reply(list);
}

// Función para ver todas las waifus
async function handleAllWaifus(m, conn, usedPrefix) {
    let list = `📚 *CATÁLOGO DE WAIFUS* 📚\n\n`;
    
    waifusList.forEach((waifu, index) => {
        list += `${index + 1}. *${waifu.name}*\n`;
        list += `   🎌 ${waifu.anime}\n`;
        list += `   ⭐ ${waifu.rarity}\n`;
        list += `   📝 ${waifu.description}\n`;
        list += `━━━━━━━━━━━━━━━━━━\n`;
    });
    
    list += `\n📊 Total: ${waifusList.length} waifus\n`;
    list += `💖 Usa *${usedPrefix}adoptar* para adoptar una`;
    
    m.reply(list);
}

// Función para alimentar waifu
async function handleFeedWaifu(m, conn, sender, groupId, usedPrefix) {
    if (!adoptedWaifus[groupId] || !adoptedWaifus[groupId][sender]) {
        return m.reply(`❌ No tienes una waifu.\nUsa *${usedPrefix}adoptar* primero.`);
    }
    
    const userWaifu = adoptedWaifus[groupId][sender];
    
    // Verificar cooldown (30 minutos)
    const now = Date.now();
    const lastFeed = userWaifu.stats.ultimaAlimentacion;
    const cooldown = 30 * 60 * 1000; // 30 minutos
    
    if (lastFeed && (now - lastFeed) < cooldown) {
        const remainingTime = Math.ceil((cooldown - (now - lastFeed)) / (60 * 1000));
        return m.reply(`⏰ *${userWaifu.name}* no tiene hambre.\nEspera *${remainingTime} minutos* más.`);
    }
    
    // Comidas disponibles
    const comidas = [
        { nombre: '🍙 Onigiri', hambre: 20, felicidad: 10, mensaje: '¡Un onigiri delicioso!' },
        { nombre: '🍜 Ramen', hambre: 30, felicidad: 15, mensaje: '¡El ramen está calientito!' },
        { nombre: '🍡 Dango', hambre: 15, felicidad: 20, mensaje: '¡Los dango son su favorito!' },
        { nombre: '🍰 Pastel', hambre: 10, felicidad: 25, mensaje: '¡Un pastel muy dulce!' },
        { nombre: '🍎 Manzana', hambre: 15, felicidad: 10, mensaje: '¡Una manzana fresca!' },
        { nombre: '🍵 Té', hambre: 5, felicidad: 15, mensaje: '¡Un té relajante!' }
    ];
    
    const comida = comidas[Math.floor(Math.random() * comidas.length)];
    
    // Actualizar estadísticas
    userWaifu.stats.hambre = Math.min(100, userWaifu.stats.hambre + comida.hambre);
    userWaifu.stats.felicidad = Math.min(100, userWaifu.stats.felicidad + comida.felicidad);
    userWaifu.stats.alimentaciones++;
    userWaifu.stats.ultimaAlimentacion = now;
    
    // Añadir experiencia
    userWaifu.stats.experiencia += 15;
    
    // Subir de nivel
    if (userWaifu.stats.experiencia >= userWaifu.stats.nivel * 100) {
        userWaifu.stats.nivel++;
        userWaifu.stats.experiencia = 0;
    }
    
    // Mensaje de resultado
    let message = `🍽️ *${userWaifu.name}* ha sido alimentada\n\n`;
    message += `🍖 *Comida:* ${comida.nombre}\n`;
    message += comida.mensaje + '\n\n';
    message += `📊 *Resultados:*\n`;
    message += `   • Hambre: +${comida.hambre}\n`;
    message += `   • Felicidad: +${comida.felicidad}\n`;
    message += `   • Alimentaciones: ${userWaifu.stats.alimentaciones}\n\n`;
    message += `💖 ${userWaifu.name} te agradece mucho!`;
    
    m.reply(message);
}

// Función para liberar waifu
async function handleReleaseWaifu(m, conn, sender, groupId, usedPrefix) {
    if (!adoptedWaifus[groupId] || !adoptedWaifus[groupId][sender]) {
        return m.reply(`❌ No tienes una waifu para liberar.\nUsa *${usedPrefix}adoptar* primero.`);
    }
    
    const userWaifu = adoptedWaifus[groupId][sender];
    
    // Confirmar liberación
    delete adoptedWaifus[groupId][sender];
    
    m.reply(`🌸 *${userWaifu.name}* ha sido liberada\n\n` +
           `📅 Te acompañó desde: ${userWaifu.adoptionDate}\n` +
           `💔 Ahora está disponible para otros usuarios\n\n` +
           `Usa *${usedPrefix}adoptar* cuando quieras adoptar otra waifu`);
}

// Función auxiliar para crear barras de progreso
function createBar(percentage) {
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

// Configuración del handler
handler.help = [
    'adoptar - Adoptar una waifu aleatoria',
    'mivaifu - Ver tu waifu adoptada',
    'listawaifus - Ver waifus del grupo',
    'waifusdisponibles - Ver waifus disponibles',
    'catalogo - Ver todas las waifus',
    'alimentar - Dar comida a tu waifu',
    'waifus - Ver lista de comandos',
    'libera - Liberar tu waifu'
];

handler.tags = ['waifu', 'juegos', 'rpg'];
handler.command = [
    'adoptar',
    'adopt',
    'mivaifu',
    'verwaifu',
    'listawaifus',
    'listarwaifus',
    'waifusdisponibles',
    'disponibles',
    'catalogo',
    'waifucatalog',
    'alimentar',
    'darcomida',
    'waifus',
    'waifulist',
    'libera',
    'liberar'
];
handler.group = true;
handler.register = true;

export default handler;