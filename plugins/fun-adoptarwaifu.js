import fetch from 'node-fetch';

let waifusData = {};

const handler = async (m, { conn, args, usedPrefix, command, participants }) => {
    try {
        // Lista de waifus disponibles
        const waifus = [
            {
                name: 'China Fujiwara',
                url: 'https://files.catbox.moe/b1hf5t.jpg',
                author: 'Desconocido'
            },
            {
                name: 'Futaba',
                url: 'https://files.catbox.moe/ldwptn.jpeg',
                author: 'Desconocido'
            },
            {
                name: 'Ellen Joe',
                url: 'https://files.catbox.moe/3usriy.webp',
                author: 'Desconocido'
            },
            {
                name: 'Yidhari Fujumi',
                url: 'https://files.catbox.moe/czaoiv.webp',
                author: 'Desconocido'
            },
            {
                name: 'Ai Hoshino',
                url: 'https://files.catbox.moe/ko1z0y.jpeg',
                author: 'Desconocido'
            },
            {
                name: 'Waguri',
                url: 'https://files.catbox.moe/ra9n34.jpeg',
                author: 'Desconocido'
            },
            {
                name: 'Rem',
                url: 'https://files.catbox.moe/bcrdm3.jpeg',
                author: 'Desconocido'
            }
        ];

        // Inicializar datos del grupo si no existen
        const groupId = m.chat;
        if (!waifusData[groupId]) {
            waifusData[groupId] = {};
        }

        // Verificar si el usuario ya tiene una waifu
        const sender = m.sender;
        if (waifusData[groupId][sender]) {
            const userWaifu = waifusData[groupId][sender];
            return m.reply(`❌ Ya tienes una waifu adoptada: *${userWaifu.name}*\nNo puedes adoptar más de una waifu.`);
        }

        // Verificar si hay menciones
        const mentionedJid = m.mentionedJid && m.mentionedJid[0];
        
        if (mentionedJid) {
            // Verificar si la persona mencionada ya tiene waifu
            if (waifusData[groupId][mentionedJid]) {
                const targetWaifu = waifusData[groupId][mentionedJid];
                return m.reply(`❌ @${mentionedJid.split('@')[0]} ya tiene una waifu adoptada: *${targetWaifu.name}*`, null, { mentions: [mentionedJid] });
            }

            // Asignar waifu aleatoria
            const randomWaifu = waifus[Math.floor(Math.random() * waifus.length)];
            waifusData[groupId][mentionedJid] = {
                ...randomWaifu,
                adoptedBy: mentionedJid,
                adoptionDate: new Date().toLocaleDateString()
            };

            // Obtener info del usuario mencionado
            const user = participants.find(p => p.id === mentionedJid);
            const userName = user?.notify || user?.vname || user?.name || 'Usuario';

            // Enviar imagen de la waifu
            await conn.sendFile(m.chat, randomWaifu.url, 'waifu.jpg', 
                `✨ *¡Waifu Adoptada!* ✨\n\n` +
                `👤 *Usuario:* ${userName}\n` +
                `💕 *Waifu:* ${randomWaifu.name}\n` +
                `📅 *Fecha de adopción:* ${new Date().toLocaleDateString()}\n\n` +
                `¡Felicidades! Ahora tienes una waifu para proteger.`,
                m
            );
        } else {
            // Si no hay mención, mostrar las waifus disponibles
            let availableWaifus = waifus.filter(waifu => {
                return !Object.values(waifusData[groupId]).some(w => w.name === waifu.name);
            });

            if (availableWaifus.length === 0) {
                return m.reply('❌ Todas las waifus han sido adoptadas en este grupo.');
            }

            let waifuList = '🎌 *Waifus Disponibles para Adoptar:* 🎌\n\n';
            waifus.forEach((waifu, index) => {
                const isAdopted = Object.values(waifusData[groupId]).some(w => w.name === waifu.name);
                waifuList += `${index + 1}. ${waifu.name} ${isAdopted ? '❌ (Adoptada)' : '✅ (Disponible)'}\n`;
            });

            waifuList += `\n📌 *Uso:* ${usedPrefix}${command} @usuario\n`;
            waifuList += `📌 *Ejemplo:* ${usedPrefix}${command} @${sender.split('@')[0]}`;

            m.reply(waifuList);
        }

    } catch (error) {
        console.error(error);
        m.reply('❌ Ocurrió un error al procesar el comando.');
    }
};

// Comando para ver tu waifu
const verWaifuHandler = async (m, { conn }) => {
    const groupId = m.chat;
    const sender = m.sender;

    if (!waifusData[groupId] || !waifusData[groupId][sender]) {
        return m.reply('❌ No tienes ninguna waifu adoptada.\nUsa el comando *grabboobs* o *agarrartetas* para adoptar una.');
    }

    const userWaifu = waifusData[groupId][sender];
    
    await conn.sendFile(m.chat, userWaifu.url, 'waifu.jpg', 
        `💕 *Tu Waifu Adoptada* 💕\n\n` +
        `✨ *Nombre:* ${userWaifu.name}\n` +
        `📅 *Fecha de adopción:* ${userWaifu.adoptionDate}\n` +
        `👤 *Adoptada por ti*`,
        m
    );
};

// Comando para ver todas las waifus adoptadas en el grupo
const listarWaifusHandler = async (m, { conn, participants }) => {
    const groupId = m.chat;
    
    if (!waifusData[groupId] || Object.keys(waifusData[groupId]).length === 0) {
        return m.reply('📭 Ningún usuario ha adoptado waifus en este grupo todavía.');
    }

    let list = '🎌 *Waifus Adoptadas en este Grupo:* 🎌\n\n';
    
    for (const [userId, waifu] of Object.entries(waifusData[groupId])) {
        const user = participants.find(p => p.id === userId);
        const userName = user?.notify || user?.vname || user?.name || 'Usuario desconocido';
        list += `👤 *Usuario:* ${userName}\n`;
        list += `💕 *Waifu:* ${waifu.name}\n`;
        list += `📅 *Fecha:* ${waifu.adoptionDate}\n`;
        list += '━━━━━━━━━━━━━━━━\n';
    }

    list += `\nTotal: ${Object.keys(waifusData[groupId]).length} waifus adoptadas`;
    m.reply(list);
};

// Agregar comando para ver waifu propia
handler.help = ['waifus'];
handler.tags = ['fun'];
handler.command = ['adoptarwaifu'];
handler.group = true;

// Comandos adicionales
handler.verWaifu = verWaifuHandler;
handler.listarWaifus = listarWaifusHandler;

export default handler;