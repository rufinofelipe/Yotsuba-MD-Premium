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

// Asegurar directorios
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Datos de waifus
const defaultWaifus = [
    { id: 1, name: "Sakura", type: "Mágica", emoji: "🌸", rarity: "Común" },
    { id: 2, name: "Hikari", type: "Guerra", emoji: "⚔️", rarity: "Rara" },
    { id: 3, name: "Yuki", type: "Hielo", emoji: "❄️", rarity: "Común" },
    { id: 4, name: "Akane", type: "Fuego", emoji: "🔥", rarity: "Épica" },
    { id: 5, name: "Mizu", type: "Agua", emoji: "💧", rarity: "Rara" },
    { id: 6, name: "Luna", type: "Oscuridad", emoji: "🌙", rarity: "Legendaria" }
];

// Sistema de datos
let users = {};
let waifus = {};

function loadData() {
    try {
        if (fs.existsSync(usersFile)) users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        if (fs.existsSync(waifusFile)) {
            waifus = JSON.parse(fs.readFileSync(waifusFile, 'utf8'));
        } else {
            waifus = defaultWaifus.reduce((acc, w) => ({...acc, [w.id]: w}), {});
            fs.writeFileSync(waifusFile, JSON.stringify(waifus, null, 2));
        }
    } catch (e) {
        console.error('Error cargando datos:', e);
    }
}

function saveData() {
    try {
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('Error guardando datos:', e);
    }
}

function getUser(userId) {
    if (!users[userId]) {
        users[userId] = {
            waifu: null,
            lastAdoption: null,
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
    return moment().diff(moment(user.lastAdoption), 'hours') >= 1;
}

function getRandomWaifu() {
    const list = Object.values(waifus);
    return { ...list[Math.floor(Math.random() * list.length)] };
}

// ============== HANDLER DE COMANDOS ==============

async function adoptarHandler(m, { userId }) {
    if (!canAdopt(userId)) {
        const user = getUser(userId);
        const nextTime = moment(user.lastAdoption).add(1, 'hour').format('HH:mm');
        return `⏰ Debes esperar hasta las ${nextTime} para adoptar otra waifu`;
    }
    
    if (users[userId]?.waifu) {
        return "❌ Ya tienes una waifu. Usa .liberar antes";
    }
    
    const waifu = getRandomWaifu();
    users[userId].waifu = {
        ...waifu,
        hunger: 100,
        happiness: 100,
        level: 1,
        xp: 0,
        adoptedAt: moment().toISOString(),
        lastFed: moment().toISOString()
    };
    users[userId].lastAdoption = moment().toISOString();
    saveData();
    
    return `🎉 ¡Felicidades! Adoptaste a *${waifu.emoji} ${waifu.name}* (${waifu.type})!\n✨ Rareza: ${waifu.rarity}\n💝 Cuídala con .alimentar y .cuidar`;
}

adoptarHandler.help = ['adoptar - Adopta una waifu aleatoria (1h espera)'];
adoptarHandler.tags = ['waifu', 'juego'];
adoptarHandler.command = ['adoptar', 'adopt'];
adoptarHandler.group = true;

// ==============

async function mivaifuHandler(m, { userId }) {
    const user = getUser(userId);
    if (!user.waifu) return "❌ No tienes waifu. Usa .adoptar";
    
    const w = user.waifu;
    const hungerBar = '🍖'.repeat(Math.floor(w.hunger / 20)) + '◻️'.repeat(5 - Math.floor(w.hunger / 20));
    const happyBar = '💖'.repeat(Math.floor(w.happiness / 20)) + '◻️'.repeat(5 - Math.floor(w.happiness / 20));
    
    return `${w.emoji} *${w.name}* (${w.type})\n✨ ${w.rarity} | Nivel ${w.level}\n🍖 Hambre: ${hungerBar} ${w.hunger}/100\n💖 Felicidad: ${happyBar} ${w.happiness}/100\n📦 Comida: ${user.food} | 🪙 ${user.coins}`;
}

mivaifuHandler.help = ['mivaifu - Muestra el estado de tu waifu'];
mivaifuHandler.tags = ['waifu', 'juego'];
mivaifuHandler.command = ['mivaifu', 'mishi', 'miwaifu'];
mivaifuHandler.group = true;

// ==============

async function alimentarHandler(m, { userId }) {
    const user = getUser(userId);
    if (!user.waifu) return "❌ No tienes waifu";
    if (user.food < 1) return "❌ Sin comida. Compra con .comprar";
    
    const w = user.waifu;
    const lastFed = moment(w.lastFed);
    if (moment().diff(lastFed, 'minutes') < 30) {
        return `⏰ Espera ${30 - moment().diff(lastFed, 'minutes')} minutos`;
    }
    
    user.food--;
    w.hunger = Math.min(100, w.hunger + 40);
    w.happiness = Math.min(100, w.happiness + 10);
    w.lastFed = moment().toISOString();
    w.xp += 15;
    
    if (w.xp >= w.level * 100) {
        w.level++;
        w.xp = 0;
        user.coins += 50;
    }
    
    saveData();
    return `🍖 Alimentaste a ${w.emoji} *${w.name}*!\n🍗 Hambre: ${w.hunger}/100 | 💖 +10\n📦 Comida: ${user.food} | 🪙 ${user.coins}`;
}

alimentarHandler.help = ['alimentar - Alimenta a tu waifu (30min espera)'];
alimentarHandler.tags = ['waifu', 'juego'];
alimentarHandler.command = ['alimentar', 'feed', 'comer'];
alimentarHandler.group = true;

// ==============

async function cuidarHandler(m, { userId }) {
    const user = getUser(userId);
    if (!user.waifu) return "❌ No tienes waifu";
    
    const w = user.waifu;
    w.happiness = Math.min(100, w.happiness + 30);
    w.xp += 10;
    
    if (w.xp >= w.level * 100) {
        w.level++;
        w.xp = 0;
        user.coins += 30;
    }
    
    saveData();
    return `💖 Cuidaste a ${w.emoji} *${w.name}*!\n😊 Felicidad: ${w.happiness}/100\n📊 Nivel: ${w.level} | 🪙 ${user.coins}`;
}

cuidarHandler.help = ['cuidar - Cuida a tu waifu (20min espera)'];
cuidarHandler.tags = ['waifu', 'juego'];
cuidarHandler.command = ['cuidar', 'care', 'amor'];
cuidarHandler.group = true;

// ==============

async function comprarHandler(m, { userId, args }) {
    const amount = parseInt(args[0]) || 1;
    if (amount < 1 || amount > 20) return "❌ Entre 1 y 20";
    
    const user = getUser(userId);
    const cost = amount * 25;
    
    if (user.coins < cost) {
        return `❌ Necesitas ${cost}, tienes ${user.coins}`;
    }
    
    user.coins -= cost;
    user.food += amount;
    saveData();
    
    return `🛒 Compraste ${amount} comida(s) por ${cost} monedas\n📦 Comida: ${user.food} | 🪙 ${user.coins}`;
}

comprarHandler.help = ['comprar <cantidad> - Compra comida (25 monedas c/u)'];
comprarHandler.tags = ['economía', 'juego'];
comprarHandler.command = ['comprar', 'buy'];
comprarHandler.group = true;

// ==============

async function liberarHandler(m, { userId }) {
    const user = getUser(userId);
    if (!user.waifu) return "❌ No tienes waifu";
    
    const name = user.waifu.name;
    const bonus = user.waifu.level * 20;
    
    user.waifu = null;
    user.lastAdoption = moment().toISOString();
    user.coins += bonus;
    saveData();
    
    return `😢 Liberaste a *${name}*. +${bonus} monedas\n⏰ Adopta otra en 1 hora`;
}

liberarHandler.help = ['liberar - Libera tu waifu actual'];
liberarHandler.tags = ['waifu', 'juego'];
liberarHandler.command = ['liberar', 'release', 'soltar'];
liberarHandler.group = true;

// ==============

async function inventarioHandler(m, { userId }) {
    const user = getUser(userId);
    
    let msg = `📦 *INVENTARIO*\n🍖 Comida: ${user.food}\n🪙 Monedas: ${user.coins}\n`;
    
    if (user.waifu) {
        msg += `\n🌸 WAIFU\n${user.waifu.emoji} ${user.waifu.name}\n✨ ${user.waifu.rarity} | Nivel ${user.waifu.level}`;
    } else {
        msg += `\n❌ Sin waifu\nUsa .adoptar`;
    }
    
    return msg;
}

inventarioHandler.help = ['inventario - Muestra tu inventario'];
inventarioHandler.tags = ['general', 'juego'];
inventarioHandler.command = ['inventario', 'inv', 'inventory'];
inventarioHandler.group = true;

// ==============

async function ayudaHandler(m, { userId }) {
    const handlers = [
        adoptarHandler, mivaifuHandler, alimentarHandler, 
        cuidarHandler, comprarHandler, liberarHandler, 
        inventarioHandler, ayudaHandler
    ];
    
    let help = `🌸 *WAIFU BOT - COMANDOS* 🌸\nPrefijo: *${PREFIX}*\n\n`;
    
    handlers.forEach(h => {
        if (h.help && h.command) {
            help += `• *${PREFIX}${h.command[0]}* - ${h.help[0]}\n`;
        }
    });
    
    return help;
}

ayudaHandler.help = ['ayuda - Muestra todos los comandos'];
ayudaHandler.tags = ['general'];
ayudaHandler.command = ['ayuda', 'help', 'comandos'];
ayudaHandler.group = true;

// ============== BOT PRINCIPAL ==============

async function startBot() {
    loadData();
    
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
            console.log('🌸 Waifu Bot conectado');
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    // Mapa de comandos
    const commandMap = new Map();
    const handlers = [
        adoptarHandler, mivaifuHandler, alimentarHandler, 
        cuidarHandler, comprarHandler, liberarHandler, 
        inventarioHandler, ayudaHandler
    ];
    
    // Registrar todos los comandos
    handlers.forEach(handler => {
        if (handler.command) {
            handler.command.forEach(cmd => {
                commandMap.set(cmd, handler);
            });
        }
    });
    
    // Handler de mensajes
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const text = msg.message.conversation || 
                    msg.message.extendedTextMessage?.text ||
                    msg.message.imageMessage?.caption ||
                    '';
        
        const sender = msg.key.remoteJid;
        const userId = sender.split('@')[0];
        
        if (!text.startsWith(PREFIX)) return;
        
        const args = text.slice(PREFIX.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        
        if (!commandMap.has(cmdName)) return;
        
        const handler = commandMap.get(cmdName);
        console.log(`[CMD] ${userId}: ${cmdName}`);
        
        try {
            const context = {
                userId,
                args,
                text: args.join(' ')
            };
            
            const response = await handler(msg, context);
            await sock.sendMessage(sender, { text: response });
            
        } catch (error) {
            console.error('Error:', error);
            await sock.sendMessage(sender, { 
                text: '❌ Error procesando comando' 
            });
        }
    });
    
    // Actualizar cada 10 min
    setInterval(() => {
        saveData();
    }, 10 * 60 * 1000);
}

// Handler principal
const handler = async (m, { command, args, text, userId }) => {
    // Esta función es para compatibilidad con otros sistemas
    // pero nuestro bot principal ya maneja los comandos arriba
    return "Usa el bot directamente con los comandos .adoptar, .alimentar, etc.";
};

handler.help = ['waifu - Sistema de adopción de waifus'];
handler.tags = ['waifu', 'juego', 'fun'];
handler.command = ['waifu'];
handler.group = true;

// Exportar handlers individuales
module.exports = {
    adoptarHandler,
    mivaifuHandler,
    alimentarHandler,
    cuidarHandler,
    comprarHandler,
    liberarHandler,
    inventarioHandler,
    ayudaHandler,
    handler,
    startBot
};

// Iniciar si es el archivo principal
if (require.main === module) {
    console.log('🌸 Iniciando Waifu Bot...');
    startBot().catch(console.error);
}