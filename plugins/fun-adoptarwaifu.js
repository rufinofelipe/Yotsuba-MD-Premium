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

// Sistema de comandos
class Command {
    constructor(info, handler) {
        this.command = info.command || [];
        this.tags = info.tags || [];
        this.category = info.category || 'general';
        this.use = info.use || '';
        this.desc = info.desc || '';
        this.help = info.help || [];
        this.group = info.group || false;
        this.owner = info.owner || false;
        this.handler = handler;
    }
}

// Colección de comandos
const commands = new Map();

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
        users[UserId] = {
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

// ============== COMANDOS ==============

// Comando: adoptar
const adoptarInfo = {
    command: ['adoptar', 'adopt'],
    tags: ['waifu', 'juego'],
    category: 'waifu',
    use: '.adoptar',
    desc: 'Adopta una waifu aleatoria',
    help: ['adoptar - Adopta una waifu aleatoria (1h de espera)'],
    group: true,
    owner: false
};

const adoptarHandler = async (m, { userId }) => {
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
};

// Comando: mivaifu
const mivaifuInfo = {
    command: ['mivaifu', 'mishi', 'mivaifu'],
    tags: ['waifu', 'juego'],
    category: 'waifu',
    use: '.mivaifu',
    desc: 'Muestra el estado de tu waifu',
    help: ['mivaifu - Muestra el estado de tu waifu'],
    group: true,
    owner: false
};

const mivaifuHandler = async (m, { userId }) => {
    const user = getUser(userId);
    if (!user.waifu) return "❌ No tienes waifu. Usa .adoptar";
    
    const w = user.waifu;
    const hungerBar = '🍖'.repeat(Math.floor(w.hunger / 20)) + '◻️'.repeat(5 - Math.floor(w.hunger / 20));
    const happyBar = '💖'.repeat(Math.floor(w.happiness / 20)) + '◻️'.repeat(5 - Math.floor(w.happiness / 20));
    
    return `${w.emoji} *${w.name}* (${w.type})\n✨ ${w.rarity} | Nivel ${w.level}\n🍖 Hambre: ${hungerBar} ${w.hunger}/100\n💖 Felicidad: ${happyBar} ${w.happiness}/100\n📦 Comida: ${user.food} | 🪙 ${user.coins}`;
};

// Comando: alimentar
const alimentarInfo = {
    command: ['alimentar', 'feed', 'comer'],
    tags: ['waifu', 'juego'],
    category: 'waifu',
    use: '.alimentar',
    desc: 'Alimenta a tu waifu',
    help: ['alimentar - Alimenta a tu waifu (30min espera)'],
    group: true,
    owner: false
};

const alimentarHandler = async (m, { userId }) => {
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
};

// Comando: cuidar
const cuidarInfo = {
    command: ['cuidar', 'care', 'amor'],
    tags: ['waifu', 'juego'],
    category: 'waifu',
    use: '.cuidar',
    desc: 'Cuida a tu waifu',
    help: ['cuidar - Cuida a tu waifu (20min espera)'],
    group: true,
    owner: false
};

const cuidarHandler = async (m, { userId }) => {
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
};

// Comando: comprar
const comprarInfo = {
    command: ['comprar', 'buy'],
    tags: ['economía', 'juego'],
    category: 'economía',
    use: '.comprar <cantidad>',
    desc: 'Compra comida para tu waifu',
    help: ['comprar 5 - Compra 5 comidas (25 monedas c/u)'],
    group: true,
    owner: false
};

const comprarHandler = async (m, { userId, args }) => {
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
};

// Comando: liberar
const liberarInfo = {
    command: ['liberar', 'release', 'soltar'],
    tags: ['waifu', 'juego'],
    category: 'waifu',
    use: '.liberar',
    desc: 'Libera a tu waifu',
    help: ['liberar - Libera tu waifu actual'],
    group: true,
    owner: false
};

const liberarHandler = async (m, { userId }) => {
    const user = getUser(userId);
    if (!user.waifu) return "❌ No tienes waifu";
    
    const name = user.waifu.name;
    const bonus = user.waifu.level * 20;
    
    user.waifu = null;
    user.lastAdoption = moment().toISOString();
    user.coins += bonus;
    saveData();
    
    return `😢 Liberaste a *${name}*. +${bonus} monedas\n⏰ Adopta otra en 1 hora`;
};

// Comando: inventario
const inventarioInfo = {
    command: ['inventario', 'inv', 'inventory'],
    tags: ['general', 'juego'],
    category: 'general',
    use: '.inventario',
    desc: 'Muestra tu inventario',
    help: ['inventario - Muestra tu inventario'],
    group: true,
    owner: false
};

const inventarioHandler = async (m, { userId }) => {
    const user = getUser(userId);
    
    let msg = `📦 *INVENTARIO*\n🍖 Comida: ${user.food}\n🪙 Monedas: ${user.coins}\n`;
    
    if (user.waifu) {
        msg += `\n🌸 WAIFU\n${user.waifu.emoji} ${user.waifu.name}\n✨ ${user.waifu.rarity} | Nivel ${user.waifu.level}`;
    } else {
        msg += `\n❌ Sin waifu\nUsa .adoptar`;
    }
    
    return msg;
};

// Comando: ayuda
const ayudaInfo = {
    command: ['ayuda', 'help', 'comandos'],
    tags: ['general'],
    category: 'general',
    use: '.ayuda',
    desc: 'Muestra todos los comandos',
    help: ['ayuda - Muestra esta ayuda'],
    group: true,
    owner: false
};

const ayudaHandler = async (m, { userId }) => {
    const categories = {};
    
    commands.forEach(cmd => {
        if (!categories[cmd.category]) categories[cmd.category] = [];
        categories[cmd.category].push(cmd);
    });
    
    let help = `🌸 *WAIFU BOT - COMANDOS* 🌸\nPrefijo: *${PREFIX}*\n\n`;
    
    for (const [cat, cmds] of Object.entries(categories)) {
        help += `*${cat.toUpperCase()}*\n`;
        cmds.forEach(cmd => {
            help += `• *${PREFIX}${cmd.command[0]}* - ${cmd.desc}\n`;
        });
        help += `\n`;
    }
    
    return help;
};

// Registrar comandos
function registerCommands() {
    const cmdList = [
        [adoptarInfo, adoptarHandler],
        [mivaifuInfo, mivaifuHandler],
        [alimentarInfo, alimentarHandler],
        [cuidarInfo, cuidarHandler],
        [comprarInfo, comprarHandler],
        [liberarInfo, liberarHandler],
        [inventarioInfo, inventarioHandler],
        [ayudaInfo, ayudaHandler]
    ];
    
    cmdList.forEach(([info, handler]) => {
        const cmd = new Command(info, handler);
        info.command.forEach(cmdName => {
            commands.set(cmdName, cmd);
        });
    });
}

// ============== BOT PRINCIPAL ==============

async function startBot() {
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
            console.log('🌸 Waifu Bot conectado');
            console.log(`📋 ${commands.size} comandos cargados`);
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
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
        
        if (!commands.has(cmdName)) return;
        
        const cmd = commands.get(cmdName);
        console.log(`[CMD] ${userId}: ${cmdName}`);
        
        try {
            const context = {
                userId,
                args,
                text: args.join(' ')
            };
            
            const response = await cmd.handler(msg, context);
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
        console.log('[SISTEMA] Actualizando...');
        saveData();
    }, 10 * 60 * 1000);
}

// Exportar para uso como módulo
const handler = {
    commands: commands,
    startBot,
    loadData,
    saveData,
    getUser
};

// Para uso con CommonJS
module.exports = handler;

// Para uso como script principal
if (require.main === module) {
    console.log('🌸 Iniciando Waifu Bot...');
    startBot().catch(console.error);
}