import fs from 'fs';

// Archivo simple
const FILE = '.src/casados/database.json;
let data = { marriages: {}, proposals: {} };

// Cargar
if (fs.existsSync(FILE)) {
    try {
        data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    } catch { }
}

// Guardar
function save() {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// Obtener nombre SIN números problemáticos
function getName(conn, jid) {
    try {
        let name = conn.getName(jid);
        // Si el nombre es solo números, poner un nombre genérico
        if (name && /^\d+$/.test(name.replace(/\D/g, ''))) {
            name = `Usuario${jid.split('@')[0].slice(-4)}`;
        }
        return name || `Usuario${jid.split('@')[0].slice(-4)}`;
    } catch {
        return `Usuario${jid.split('@')[0].slice(-4)}`;
    }
}

let handler = async (m, { conn, command, usedPrefix }) => {
    const sender = m.sender;
    
    // MARRY - Versión sin números en el mensaje
    if (command === 'marry') {
        if (!m.mentionedJid?.[0]) {
            return m.reply(`💍 *PROPUESTA DE MATRIMONIO*\n\nDebes mencionar a alguien:\n\nEjemplo: ${usedPrefix}marry @amigo`);
        }
        
        const target = m.mentionedJid[0];
        
        // Validaciones básicas
        if (sender === target) return m.reply('❌ No puedes casarte contigo mismo/a.');
        if (data.marriages[sender]) {
            const spouse = data.marriages[sender];
            const spouseName = getName(conn, spouse);
            return m.reply(`💍 Ya estás casado/a con *${spouseName}*.\n\nUsa *${usedPrefix}divorce* para divorciarte.`);
        }
        if (data.marriages[target]) {
            const spouseName = getName(conn, data.marriages[target]);
            return m.reply(`❌ Esta persona ya está casada con *${spouseName}*.`);
        }
        
        // Verificar si hay propuesta pendiente
        if (data.proposals[target] === sender) {
            // 🎉 ACEPTAR LA PROPUESTA
            delete data.proposals[target];
            data.marriages[sender] = target;
            data.marriages[target] = sender;
            save();
            
            // Obtener nombres (sin números problemáticos)
            const senderName = getName(conn, sender);
            const targetName = getName(conn, target);
            
            // Mensaje sin menciones para evitar lids
            return m.reply(`🎉 *¡FELICIDADES!*\n\n💒 *BODA OFICIAL*\n\n👰 *${senderName}*\n💍 SE HA CASADO CON 💍\n🤵 *${targetName}*\n\n¡Que vivan los novios! 🥂\n\n_Usa *${usedPrefix}mystatus* para ver tu estado_`);
        }
        
        // Crear nueva propuesta
        data.proposals[sender] = target;
        save();
        
        // Obtener nombres
        const senderName = getName(conn, sender);
        const targetName = getName(conn, target);
        
        // Mensaje sin menciones @ para evitar lids
        return m.reply(`💌 *PROPUESTA DE MATRIMONIO*\n\n*${senderName}* quiere casarse contigo *${targetName}*!\n\nPara aceptar, escribe:\n*${usedPrefix}marry ${senderName}*\n\n⏰ La propuesta expira en 5 minutos.`);
    }
    
    // DIVORCE
    if (command === 'divorce') {
        if (!data.marriages[sender]) {
            return m.reply('💔 No estás casado/a actualmente.');
        }
        
        const spouse = data.marriages[sender];
        const spouseName = getName(conn, spouse);
        
        delete data.marriages[sender];
        delete data.marriages[spouse];
        save();
        
        const userName = getName(conn, sender);
        
        return m.reply(`💔 *DIVORCIO*\n\n*${userName}* y *${spouseName}* se han divorciado.\n\nEsperamos que encuentren la felicidad por separado.`);
    }
    
    // MYSTATUS
    if (command === 'mystatus') {
        const userName = getName(conn, sender);
        
        if (data.marriages[sender]) {
            const spouse = data.marriages[sender];
            const spouseName = getName(conn, spouse);
            
            return m.reply(`💍 *ESTADO MATRIMONIAL*\n\n✅ *CASADO/A*\n\n👤 Tú: *${userName}*\n💕 Pareja: *${spouseName}*\n\nUsa *${usedPrefix}divorce* para divorciarte.`);
        } else {
            return m.reply(`💔 *ESTADO MATRIMONIAL*\n\n❌ *SOLTERO/A*\n\n*${userName}*, no estás casado/a actualmente.\n\nPara casarte:\n${usedPrefix}marry @amigo`);
        }
    }
    
    // LISTA DE MATRIMONIOS
    if (command === 'casados' || command === 'parejas') {
        const couples = [];
        const processed = new Set();
        
        for (const [person1, person2] of Object.entries(data.marriages)) {
            if (!processed.has(person1)) {
                couples.push([person1, person2]);
                processed.add(person1);
                processed.add(person2);
            }
        }
        
        if (couples.length === 0) {
            return m.reply('💔 No hay matrimonios registrados.');
        }
        
        let text = `💒 *MATRIMONIOS REGISTRADOS*\n\n`;
        couples.forEach(([p1, p2], i) => {
            const name1 = getName(conn, p1);
            const name2 = getName(conn, p2);
            text += `${i + 1}. *${name1}* 💕 *${name2}*\n`;
        });
        text += `\nTotal: ${couples.length} pareja(s)`;
        
        return m.reply(text);
    }
    
    // LIMPIAR PROPuestas (solo admin)
    if (command === 'clearmarry' && sender.includes('573135180873')) {
        data.proposals = {};
        save();
        return m.reply('✅ Propuestas limpiadas.');
    }
};

handler.help = [
    'marry @usuario - Proponer matrimonio',
    'divorce - Divorciarse',
    'mystatus - Ver tu estado',
    'casados - Ver matrimonios'
];

handler.tags = ['social', 'fun'];
handler.command = ['marry', 'divorce', 'mystatus', 'casados', 'parejas', 'clearmarry'];
handler.group = true;
handler.register = true;

export default handler;