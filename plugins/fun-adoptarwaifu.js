const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

// Configuración
const PREFIX = '!';
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const waifusFile = path.join(dataDir, 'waifus.json');

// Asegurar que exista el directorio de datos
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Datos iniciales de waifus disponibles
const defaultWaifus = [
    { 
        id: 1, 
        name: "Sakura", 
        type: "Mágica", 
        baseHunger: 50, 
        baseHappiness: 70,
        rarity: "Común"
    },
    { 
        id: 2, 
        name: "Hikari", 
        type: "Guerra", 
        baseHunger: 30, 
        baseHappiness: 80,
        rarity: "Rara"
    },
    { 
        id: 3, 
        name: "Yuki", 
        type: "Hielo", 
        baseHunger: 60, 
        baseHappiness: 60,
        rarity: "Común"
    },
    { 
        id: 4, 
        name: "Akane", 
        type: "Fuego", 
        baseHunger: 40, 
        baseHappiness: 90,
        rarity: "Épica"
    },
    { 
        id: 5, 
        name: "Mizu", 
        type: "Agua", 
        baseHunger: 55, 
        baseHappiness: 75,
        rarity: "Rara"
    }
];

// Cargar o inicializar datos
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
            food: 5,
            coins: 100,
            level: 1,
            xp: 0
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
        lastCared: moment().toISOString()
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
    
    // Reducir hambre con el tiempo (1 punto cada 10 minutos)
    const minutesSinceFed = now.diff(lastFed, 'minutes');
    const hungerReduction = Math.floor(minutesSinceFed / 10);
    waifu.hunger = Math.max(0, waifu.hunger - hungerReduction);
    
    // Reducir felicidad si tiene hambre
    if (waifu.hunger < 30) {
        const minutesSinceCared = now.diff(lastCared, 'minutes');
        const happinessReduction = Math.floor(minutesSinceCared / 15);
        waifu.happiness = Math.max(0, waifu.happiness - happinessReduction);
    }
    
    waifu.lastFed = lastFed.add(hungerReduction * 10, 'minutes').toISOString();
    saveData();
}

function feedWaifu(userId) {
    const user = getUser(userId);
    if (!user.waifu) return { success: false, message: "No tienes una waifu para alimentar" };
    
    if (user.food <= 0) {
        return { success: false, message: "No tienes comida. Compra más con !comprar" };
    }
    
    const waifu = user.waifu;
    const now = moment();
    const lastFed = moment(waifu.lastFed);
    
    // Solo puede alimentar cada 30 minutos
    if (now.diff(lastFed, 'minutes') < 30) {
        const minutesLeft = 30 - now.diff(lastFed, 'minutes');
        return { 
            success: false, 
            message: `Debes esperar ${minutesLeft} minutos para alimentar de nuevo` 
        };
    }
    
    user.food -= 1;
    waifu.hunger = Math.min(100, waifu.hunger + 30);
    waifu.lastFed = now.toISOString();
    
    // Ganar XP por alimentar
    waifu.xp += 10;
    if (waifu.xp >= waifu.level * 50) {
        waifu.level += 1;
        waifu.xp = 0;
    }
    
    saveData();
    return { 
        success: true, 
        message: `🍖 Alimentaste a ${waifu.name}! Hambre: ${waifu.hunger}/100\nNivel: ${waifu.level} | XP: ${waifu.xp}/${waifu.level * 50}` 
    };
}

function careWaifu(userId) {
    const user = getUser(userId);
    if (!user.waifu) return { success: false, message: "No tienes una waifu para cuidar" };
    
    const waifu = user.waifu;
    const now = moment();
    const lastCared = moment(waifu.lastCared);
    
    // Solo puede cuidar cada 20 minutos
    if (now.diff(lastCared, 'minutes') < 20) {
        const minutesLeft = 20 - now.diff(lastCared, 'minutes');
        return { 
            success: false, 
            message: `Debes esperar ${minutesLeft} minutos para cuidar de nuevo` 
        };
    }
    
    waifu.happiness = Math.min(100, waifu.happiness + 25);
    waifu.lastCared = now.toISOString();
    
    // Ganar XP por cuidar
    waifu.xp += 5;
    if (waifu.xp >= waifu.level * 50) {
        waifu.level += 1;
        waifu.xp = 0;
    }
    
    saveData();
    return { 
        success: true, 
        message: `💖 Cuidaste a ${waifu.name}! Felicidad: ${waifu.happiness}/100\nNivel: ${waifu.level} | XP: ${waifu.xp}/${waifu.level * 50}` 
    };
}

function buyFood(userId, amount = 1) {
    const user = getUser(userId);
    const cost = amount * 20;
    
    if (user.coins < cost) {
        return { success: false, message: `No tienes suficientes monedas. Necesitas ${cost}, tienes ${user.coins}` };
    }
    
    user.coins -= cost;
    user.food += amount;
    saveData();
    
    return { 
        success: true, 
        message: `🛒 Compraste ${amount} comida(s) por ${cost} monedas\nComida: ${user.food} | Monedas: ${user.coins}` 
    };
}

function getWaifuStatus(userId) {
    const user = getUser(userId);
    if (!user.waifu) return "No tienes una waifu. Usa !adoptar para adoptar una.";
    
    const waifu = user.waifu;
    updateWaifuStatus(userId);
    
    const hungerBar = '🍖'.repeat(Math.floor(waifu.hunger / 20)) + '◻️'.repeat(5 - Math.floor(waifu.hunger / 20));
    const happinessBar = '💖'.repeat(Math.floor(waifu.happiness / 20)) + '◻️'.repeat(5 - Math.floor(waifu.happiness / 20));
    
    const now = moment();
    const adoptedAgo = moment(waifu.adoptedAt).from(now);
    
    let statusMessage = `🌸 *${waifu.name}* (${waifu.type})\n`;
    statusMessage += `✨ Rareza: ${waifu.rarity} | Nivel: ${waifu.level}\n`;
    statusMessage += `📊 XP: ${waifu.xp}/${waifu.level * 50}\n\n`;
    statusMessage += `🍖 Hambre: ${hungerBar} ${waifu.hunger}/100\n`;
    statusMessage += `💖 Felicidad: ${happinessBar} ${waifu.happiness}/100\n\n`;
    statusMessage += `🕐 Adoptada: ${adoptedAgo}\n`;
    statusMessage += `📦 Comida: ${user.food} | 🪙 Monedas: ${user.coins}`;
    
    // Advertencias
    if (waifu.hunger < 30) {
        statusMessage += `\n\n⚠️ *${waifu.name} tiene hambre!* Usa !alimentar`;
    }
    if (waifu.happiness < 30) {
        statusMessage += `\n⚠️ *${waifu.name} está triste!* Usa !cuidar`;
    }
    
    return statusMessage;
}

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
            console.log('Bot conectado correctamente');
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
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
        
        const command = text.toLowerCase().slice(PREFIX.length).split(' ')[0];
        const args = text.slice(PREFIX.length + command.length).trim();
        
        console.log(`Comando recibido: ${command} de ${userId}`);
        
        try {
            let response = '';
            
            switch(command) {
                case 'adoptar':
                    if (!canAdopt(userId)) {
                        const user = getUser(userId);
                        const nextAdoption = moment(user.lastAdoption).add(1, 'hour');
                        response = `Debes esperar hasta ${nextAdoption.format('HH:mm')} para adoptar otra waifu`;
                    } else if (users[userId]?.waifu) {
                        response = "Ya tienes una waifu. Usa !liberar antes de adoptar otra";
                    } else {
                        const randomWaifu = getRandomWaifu();
                        const adoptedWaifu = adoptWaifu(userId, randomWaifu);
                        response = `🎉 ¡Felicidades! Adoptaste a *${adoptedWaifu.name}* (${adoptedWaifu.type})!\n`;
                        response += `✨ Rareza: ${adoptedWaifu.rarity}\n`;
                        response += `💝 Cuídala bien! Aliméntala con !alimentar y cuídala con !cuidar\n`;
                        response += `📊 Revisa su estado con !mivaifu`;
                    }
                    break;
                    
                case 'mivaifu':
                case 'status':
                    response = getWaifuStatus(userId);
                    break;
                    
                case 'alimentar':
                case 'feed':
                    const feedResult = feedWaifu(userId);
                    response = feedResult.message;
                    break;
                    
                case 'cuidar':
                case 'care':
                    const careResult = careWaifu(userId);
                    response = careResult.message;
                    break;
                    
                case 'comprar':
                    const amount = parseInt(args) || 1;
                    if (amount < 1 || amount > 10) {
                        response = "Puedes comprar entre 1 y 10 comidas a la vez";
                    } else {
                        const buyResult = buyFood(userId, amount);
                        response = buyResult.message;
                    }
                    break;
                    
                case 'liberar':
                    const user = getUser(userId);
                    if (user.waifu) {
                        const waifuName = user.waifu.name;
                        user.waifu = null;
                        user.lastAdoption = moment().toISOString();
                        user.coins += 50; // Bonificación por liberar
                        saveData();
                        response = `😢 Liberaste a ${waifuName}. Recibiste 50 monedas por tu bondad.\nPuedes adoptar otra en 1 hora con !adoptar`;
                    } else {
                        response = "No tienes una waifu para liberar";
                    }
                    break;
                    
                case 'inventario':
                case 'inv':
                    const userData = getUser(userId);
                    response = `📦 *Tu Inventario*\n`;
                    response += `🍖 Comida: ${userData.food}\n`;
                    response += `🪙 Monedas: ${userData.coins}\n`;
                    if (userData.waifu) {
                        response += `🌸 Waifu: ${userData.waifu.name} (Nivel ${userData.waifu.level})`;
                    }
                    break;
                    
                case 'ayuda':
                case 'help':
                    response = `🌸 *Comandos del Waifu Bot* 🌸\n\n`;
                    response += `*!adoptar* - Adopta una waifu aleatoria (1h de espera)\n`;
                    response += `*!mivaifu* - Ver estado de tu waifu\n`;
                    response += `*!alimentar* - Alimenta a tu waifu (30min espera)\n`;
                    response += `*!cuidar* - Cuida a tu waifu (20min espera)\n`;
                    response += `*!comprar [cantidad]* - Compra comida (20 monedas c/u)\n`;
                    response += `*!liberar* - Libera a tu waifu (+50 monedas)\n`;
                    response += `*!inventario* - Ver tu inventario\n`;
                    response += `*!ayuda* - Muestra esta ayuda`;
                    break;
                    
                default:
                    response = `Comando no reconocido. Usa !ayuda para ver los comandos disponibles`;
            }
            
            await sock.sendMessage(sender, { text: response });
            
        } catch (error) {
            console.error('Error procesando comando:', error);
            await sock.sendMessage(sender, { 
                text: '❌ Ocurrió un error procesando tu comando' 
            });
        }
    });
    
    // Actualizar estado de waifus cada 5 minutos
    setInterval(() => {
        console.log('Actualizando estado de waifus...');
        for (const userId in users) {
            if (users[userId].waifu) {
                updateWaifuStatus(userId);
            }
        }
        saveData();
    }, 5 * 60 * 1000);
}

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Promise rechazada no manejada:', error);
});

// Iniciar el bot
console.log('🌸 Iniciando Waifu Bot...');
startBot().catch(console.error);