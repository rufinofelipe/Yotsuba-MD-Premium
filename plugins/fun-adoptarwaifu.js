const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

// Configuración
const PREFIX = '.';
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const waifusFile = path.join(dataDir, 'waifus.json');

// Asegurar que exista el directorio de datos
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Datos iniciales de waifus
const defaultWaifus = [
    { 
        id: 1, 
        name: "Sakura", 
        type: "Mágica", 
        baseHunger: 50, 
        baseHappiness: 70,
        rarity: "Común",
        emoji: "🌸"
    },
    { 
        id: 2, 
        name: "Hikari", 
        type: "Guerra", 
        baseHunger: 30, 
        baseHappiness: 80,
        rarity: "Rara",
        emoji: "⚔️"
    },
    { 
        id: 3, 
        name: "Yuki", 
        type: "Hielo", 
        baseHunger: 60, 
        baseHappiness: 60,
        rarity: "Común",
        emoji: "❄️"
    },
    { 
        id: 4, 
        name: "Akane", 
        type: "Fuego", 
        baseHunger: 40, 
        baseHappiness: 90,
        rarity: "Épica",
        emoji: "🔥"
    },
    { 
        id: 5, 
        name: "Mizu", 
        type: "Agua", 
        baseHunger: 55, 
        baseHappiness: 75,
        rarity: "Rara",
        emoji: "💧"
    },
    { 
        id: 6, 
        name: "Luna", 
        type: "Oscuridad", 
        baseHunger: 45, 
        baseHappiness: 65,
        rarity: "Legendaria",
        emoji: "🌙"
    }
];

// Sistema de comandos
const handlers = new Map();

// Sistema de datos
let users = {};
let waifus = {};

function loadData() {
    try {
        if (fs.existsSync(usersFile)) {
            users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        }
        
        if (fs.existsSync(waifusFile)) {
            waifus = JSON.parse(fs.readFileSync(waifusFile, 'utf8'));
        } else {
            waifus = defaultWaifus.reduce((acc, waifu) => {
                acc[waifu.id] = waifu;
                return acc;
            }, {});
            saveWaifus();
        }
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

function saveData() {
    try {
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error guardando datos:', error);
    }
}

function saveWaifus() {
    try {
        fs.writeFileSync(waifusFile, JSON.stringify(waifus, null, 2));
    } catch (error) {
        console.error('Error guardando waifus:', error);
    }
}

function getUser(userId) {
    if (!users[userId]) {
        users[userId] = {
            waifu: null,
            lastAdoption: null,
            lastFed: null,
            lastInteraction: null,
            food: 10,
            coins: 200,
            level: 1,
            xp: 0,
            dailyClaimed: null
        };
    }
    return users[userId];
}

function canAdopt(userId) {
    const user = getUser(userId);
    if (!user.lastAdoption) return true;
    
    const lastAdoption = moment(user.lastAdoption);
    const now = moment();
    const hoursDiff = now.diff(lastAdoption, 'hours');
    
    return hoursDiff >= 1;
}

function getRandomWaifu() {
    const waifuList = Object.values(waifus);
    const randomIndex = Math.floor(Math.random() * waifuList.length);
    return { ...waifuList[randomIndex] };
}

function adoptWaifu(userId, waifuData) {
    const user = getUser(userId);
    
    const adoptedWaifu = {
        ...waifuData,
        hunger: 100,
        happiness: 100,
        level: 1,
        xp: 0,
        adoptedAt: moment().toISOString(),
        lastFed: moment().toISOString(),
        lastCared: moment().toISOString(),
        bond: 0
    };
    
    user.waifu = adoptedWaifu;
    user.lastAdoption = moment().toISOString();
    saveData();
    
    return adoptedWaifu;
}

function updateWaifuStatus(userId) {
    const user = getUser(userId);
    if (!user.waifu) return;
    
    const waifu = user.waifu;
    const now = moment();
    const lastFed = moment(waifu.lastFed);
    const lastCared = moment(waifu.lastCared);
    
    // Reducir hambre con el tiempo
    const hoursSinceFed = now.diff(lastFed, 'hours');
    const hungerReduction = Math.min(30, hoursSinceFed * 5);
    waifu.hunger = Math.max(0, waifu.hunger - hungerReduction);
    
    // Reducir felicidad si tiene hambre
    if (waifu.hunger < 50) {
        const hoursSinceCared = now.diff(lastCared, 'hours');
        const happinessReduction = Math.min(20, hoursSinceCared * 3);
        waifu.happiness = Math.max(0, waifu.happiness - happinessReduction);
    }
    
    saveData();
}

// =================== COMANDOS ===================

// Comando: adoptar
const adoptarCommand = {
    command: 'adoptar',
    help: 'Adopta una waifu aleatoria (espera de 1 hora entre adopciones)',
    category: 'Waifu',
    handler: async (userId, args) => {
        if (!canAdopt(userId)) {
            const user = getUser(userId);
            const nextAdoption = moment(user.lastAdoption).add(1, 'hour');
            return `⏰ Debes esperar hasta ${nextAdoption.format('HH:mm')} para adoptar otra waifu`;
        }
        
        if (users[userId]?.waifu) {
            return "❌ Ya tienes una waifu. Usa .liberar antes de adoptar otra";
        }
        
        const randomWaifu = getRandomWaifu();
        const adoptedWaifu = adoptWaifu(userId, randomWaifu);
        
        return `🎉 ¡Felicidades! Adoptaste a *${adoptedWaifu.emoji} ${adoptedWaifu.name}* (${adoptedWaifu.type})!\n` +
               `✨ Rareza: ${adoptedWaifu.rarity}\n` +
               `💝 Cuídala bien! Aliméntala con .alimentar y cuídala con .cuidar\n` +
               `📊 Revisa su estado con .mivaifu`;
    }
};

// Comando: mivaifu
const mivaifuCommand = {
    command: 'mivaifu',
    help: 'Muestra el estado actual de tu waifu',
    category: 'Waifu',
    handler: async (userId, args) => {
        const user = getUser(userId);
        if (!user.waifu) return "❌ No tienes una waifu. Usa .adoptar para adoptar una.";
        
        updateWaifuStatus(userId);
        const waifu = user.waifu;
        
        const hungerBar = '🍖'.repeat(Math.floor(waifu.hunger / 20)) + '◻️'.repeat(5 - Math.floor(waifu.hunger / 20));
        const happinessBar = '💖'.repeat(Math.floor(waifu.happiness / 20)) + '◻️'.repeat(5 - Math.floor(waifu.happiness / 20));
        const bondBar = '💝'.repeat(Math.floor(waifu.bond / 20)) + '◻️'.repeat(5 - Math.floor(waifu.bond / 20));
        
        const now = moment();
        const adoptedAgo = moment(waifu.adoptedAt).from(now);
        
        let status = `${waifu.emoji} *${waifu.name}* (${waifu.type})\n`;
        status += `✨ Rareza: ${waifu.rarity} | Nivel: ${waifu.level}\n`;
        status += `📊 XP: ${waifu.xp}/${waifu.level * 100}\n\n`;
        status += `🍖 Hambre: ${hungerBar} ${waifu.hunger}/100\n`;
        status += `💖 Felicidad: ${happinessBar} ${waifu.happiness}/100\n`;
        status += `💝 Vínculo: ${bondBar} ${waifu.bond}/100\n\n`;
        status += `🕐 Adoptada: ${adoptedAgo}\n`;
        status += `📦 Comida: ${user.food} | 🪙 Monedas: ${user.coins}`;
        
        if (waifu.hunger < 30) status += `\n\n⚠️ *${waifu.name} tiene hambre!* Usa .alimentar`;
        if (waifu.happiness < 30) status += `\n⚠️ *${waifu.name} está triste!* Usa .cuidar`;
        
        return status;
    }
};

// Comando: alimentar
const alimentarCommand = {
    command: 'alimentar',
    help: 'Alimenta a tu waifu (30min de espera)',
    category: 'Waifu',
    handler: async (userId, args) => {
        const user = getUser(userId);
        if (!user.waifu) return "❌ No tienes una waifu para alimentar";
        
        if (user.food <= 0) {
            return "❌ No tienes comida. Compra más con .comprar";
        }
        
        const waifu = user.waifu;
        const now = moment();
        const lastFed = moment(waifu.lastFed);
        
        if (now.diff(lastFed, 'minutes') < 30) {
            const minutesLeft = 30 - now.diff(lastFed, 'minutes');
            return `⏰ Debes esperar ${minutesLeft} minutos para alimentar de nuevo`;
        }
        
        user.food -= 1;
        waifu.hunger = Math.min(100, waifu.hunger + 40);
        waifu.happiness = Math.min(100, waifu.happiness + 10);
        waifu.bond = Math.min(100, waifu.bond + 5);
        waifu.lastFed = now.toISOString();
        waifu.xp += 15;
        
        if (waifu.xp >= waifu.level * 100) {
            waifu.level += 1;
            waifu.xp = 0;
            user.coins += 50;
        }
        
        saveData();
        
        return `🍖 Alimentaste a ${waifu.emoji} *${waifu.name}*!\n` +
               `🍗 Hambre: ${waifu.hunger}/100 | 💖 +10 Felicidad\n` +
               `📊 Nivel: ${waifu.level} | XP: ${waifu.xp}/${waifu.level * 100}\n` +
               `💝 Vínculo: +5 | 📦 Comida restante: ${user.food}`;
    }
};

// Comando: cuidar
const cuidarCommand = {
    command: 'cuidar',
    help: 'Cuida a tu waifu (20min de espera)',
    category: 'Waifu',
    handler: async (userId, args) => {
        const user = getUser(userId);
        if (!user.waifu) return "❌ No tienes una waifu para cuidar";
        
        const waifu = user.waifu;
        const now = moment();
        const lastCared = moment(waifu.lastCared);
        
        if (now.diff(lastCared, 'minutes') < 20) {
            const minutesLeft = 20 - now.diff(lastCared, 'minutes');
            return `⏰ Debes esperar ${minutesLeft} minutos para cuidar de nuevo`;
        }
        
        waifu.happiness = Math.min(100, waifu.happiness + 30);
        waifu.bond = Math.min(100, waifu.bond + 10);
        waifu.lastCared = now.toISOString();
        waifu.xp += 10;
        
        if (waifu.xp >= waifu.level * 100) {
            waifu.level += 1;
            waifu.xp = 0;
            user.coins += 30;
        }
        
        saveData();
        
        return `💖 Cuidaste a ${waifu.emoji} *${waifu.name}*!\n` +
               `😊 Felicidad: ${waifu.happiness}/100\n` +
               `📊 Nivel: ${waifu.level} | XP: ${waifu.xp}/${waifu.level * 100}\n` +
               `💝 Vínculo: +10 | 🪙 Monedas: ${user.coins}`;
    }
};

// Comando: comprar
const comprarCommand = {
    command: 'comprar',
    help: 'Compra comida para tu waifu (ej: .comprar 5)',
    category: 'Economía',
    handler: async (userId, args) => {
        const amount = parseInt(args) || 1;
        if (amount < 1 || amount > 20) {
            return "❌ Puedes comprar entre 1 y 20 comidas a la vez";
        }
        
        const user = getUser(userId);
        const cost = amount * 25;
        
        if (user.coins < cost) {
            return `❌ No tienes suficientes monedas. Necesitas ${cost}, tienes ${user.coins}`;
        }
        
        user.coins -= cost;
        user.food += amount;
        saveData();
        
        return `🛒 Compraste ${amount} comida(s) por ${cost} monedas\n` +
               `📦 Comida: ${user.food} | 🪙 Monedas: ${user.coins}`;
    }
};

// Comando: liberar
const liberarCommand = {
    command: 'liberar',
    help: 'Libera a tu waifu actual para adoptar otra',
    category: 'Waifu',
    handler: async (userId, args) => {
        const user = getUser(userId);
        if (!user.waifu) return "❌ No tienes una waifu para liberar";
        
        const waifuName = user.waifu.name;
        const bonus = user.waifu.level * 20;
        
        user.waifu = null;
        user.lastAdoption = moment().toISOString();
        user.coins += bonus;
        saveData();
        
        return `😢 Liberaste a *${waifuName}*. Recibiste ${bonus} monedas por tu bondad.\n` +
               `⏰ Puedes adoptar otra en 1 hora con .adoptar`;
    }
};

// Comando: inventario
const inventarioCommand = {
    command: 'inventario',
    help: 'Muestra tu inventario y recursos',
    category: 'General',
    handler: async (userId, args) => {
        const user = getUser(userId);
        
        let response = `📦 *INVENTARIO DE ${userId}*\n\n`;
        response += `🍖 Comida: ${user.food}\n`;
        response += `🪙 Monedas: ${user.coins}\n`;
        response += `🎯 Nivel Usuario: ${user.level}\n`;
        response += `⭐ XP Usuario: ${user.xp}/${user.level * 200}\n\n`;
        
        if (user.waifu) {
            response += `🌸 *WAIFU ACTUAL*\n`;
            response += `${user.waifu.emoji} ${user.waifu.name} (${user.waifu.type})\n`;
            response += `✨ Rareza: ${user.waifu.rarity} | Nivel: ${user.waifu.level}\n`;
            response += `💝 Vínculo: ${user.waifu.bond}/100`;
        } else {
            response += `❌ No tienes waifu actualmente\n`;
            response += `Usa .adoptar para conseguir una`;
        }
        
        return response;
    }
};

// Comando: diario
const diarioCommand = {
    command: 'diario',
    help: 'Reclama tu recompensa diaria',
    category: 'Economía',
    handler: async (userId, args) => {
        const user = getUser(userId);
        const today = moment().format('YYYY-MM-DD');
        
        if (user.dailyClaimed === today) {
            return "⏰ Ya reclamaste tu recompensa diaria hoy. Vuelve mañana!";
        }
        
        const reward = 100 + (user.level * 20);
        user.coins += reward;
        user.food += 5;
        user.dailyClaimed = today;
        saveData();
        
        return `🎁 *RECOMPENSA DIARIA*\n\n` +
               `🪙 +${reward} monedas\n` +
               `🍖 +5 comida\n\n` +
               `📦 Inventario actual:\n` +
               `Monedas: ${user.coins} | Comida: ${user.food}`;
    }
};

// Comando: ayuda
const ayudaCommand = {
    command: 'ayuda',
    help: 'Muestra todos los comandos disponibles',
    category: 'General',
    handler: async (userId, args) => {
        const categories = {};
        
        // Agrupar comandos por categoría
        for (const [_, cmd] of handlers) {
            if (!categories[cmd.category]) {
                categories[cmd.category] = [];
            }
            categories[cmd.category].push(cmd);
        }
        
        let response = `🌸 *WAIFU BOT - COMANDOS* 🌸\n\n`;
        response += `Prefijo: *${PREFIX}*\n\n`;
        
        for (const [category, commands] of Object.entries(categories)) {
            response += `*${category.toUpperCase()}*\n`;
            commands.forEach(cmd => {
                response += `• *${PREFIX}${cmd.command}* - ${cmd.help}\n`;
            });
            response += `\n`;
        }
        
        response += `📝 *Ejemplos:*\n`;
        response += `${PREFIX}adoptar - Adopta una waifu\n`;
        response += `${PREFIX}alimentar - Alimenta a tu waifu\n`;
        response += `${PREFIX}comprar 5 - Compra 5 comidas\n`;
        
        return response;
    }
};

// Registrar comandos
function registerCommands() {
    const commandList = [
        adoptarCommand,
        mivaifuCommand,
        alimentarCommand,
        cuidarCommand,
        comprarCommand,
        liberarCommand,
        inventarioCommand,
        diarioCommand,
        ayudaCommand
    ];
    
    commandList.forEach(cmd => {
        handlers.set(cmd.command, cmd);
    });
}

// =================== BOT PRINCIPAL ===================

async function startBot() {
    // Cargar datos y registrar comandos
    loadData();
    registerCommands();
    
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
        version: [2, 2413, 1]
    });
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
                console.log('Reconectando...');
                startBot();
            }
        } else if (connection === 'open') {
            console.log('🌸 Waifu Bot conectado correctamente');
            console.log(`📋 Comandos cargados: ${handlers.size}`);
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    // Handler de mensajes
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        
        if (!message.message || message.key.fromMe) return;
        
        const text = message.message.conversation || 
                    message.message.extendedTextMessage?.text ||
                    message.message.imageMessage?.caption ||
                    '';
        
        const sender = message.key.remoteJid;
        const userId = sender.split('@')[0];
        
        if (!text.startsWith(PREFIX)) return;
        
        const args = text.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();
        const argString = args.join(' ');
        
        console.log(`[CMD] ${userId}: ${PREFIX}${command} ${argString}`);
        
        try {
            if (!handlers.has(command)) {
                await sock.sendMessage(sender, { 
                    text: `❌ Comando no encontrado. Usa ${PREFIX}ayuda para ver los comandos disponibles` 
                });
                return;
            }
            
            const cmd = handlers.get(command);
            const response = await cmd.handler(userId, argString);
            
            await sock.sendMessage(sender, { text: response });
            
        } catch (error) {
            console.error('Error procesando comando:', error);
            await sock.sendMessage(sender, { 
                text: '❌ Ocurrió un error procesando tu comando' 
            });
        }
    });
    
    // Actualizar estado de waifus cada 10 minutos
    setInterval(() => {
        console.log('[SISTEMA] Actualizando estado de waifus...');
        for (const userId in users) {
            if (users[userId].waifu) {
                updateWaifuStatus(userId);
            }
        }
        saveData();
    }, 10 * 60 * 1000);
}

// Manejo de errores
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Promise rechazada no manejada:', error);
});

// Iniciar el bot
console.log('🌸 Iniciando Waifu Bot...');
startBot().catch(console.error);