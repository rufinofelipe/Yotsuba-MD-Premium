import fs from 'fs';

const FILE = './matrimonios.json';
let data = { marriages: {}, proposals: {} };

// Cargar
if (fs.existsSync(FILE)) {
    try { data = JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch { }
}

// Guardar
function save() { fs.writeFileSync(FILE, JSON.stringify(data, null, 2)); }

let handler = async (m, { conn, command, usedPrefix }) => {
    const sender = m.sender;
    
    // COMANDO MARRY - VERSIÓN CORREGIDA
    if (command === 'marry') {
        if (!m.mentionedJid?.[0]) {
            return m.reply(`💍 Debes mencionar a alguien:\n${usedPrefix}marry @amigo`);
        }
        
        const target = m.mentionedJid[0];
        
        // Validaciones
        if (sender === target) return m.reply('❌ No puedes casarte contigo mismo');
        if (data.marriages[sender]) return m.reply(`💍 Ya estás casado con @${data.marriages[sender].split('@')[0]}`);
        if (data.marriages[target]) return m.reply(`❌ @${target.split('@')[0]} ya está casado`);
        
        // 🔥 **LÓGICA CORREGIDA AQUÍ** 🔥
        // 1. Si YA HAY una propuesta del TARGET hacia el SENDER (target → sender)
        if (data.proposals[target] === sender) {
            // ¡ACEPTAR PROPUESTA! (sender acepta la propuesta de target)
            console.log(`✅ ${sender.split('@')[0]} ACEPTA propuesta de ${target.split('@')[0]}`);
            
            delete data.proposals[target]; // Limpiar propuesta
            
            // Registrar matrimonio
            data.marriages[sender] = target;
            data.marriages[target] = sender;
            save();
            
            // Mensaje de éxito
            return conn.sendMessage(m.chat, {
                text: `🎉 *¡FELICIDADES!*\n\n@${sender.split('@')[0]} 💍 @${target.split('@')[0]}\n\n¡Se han casado! 🥂\n\nUsa *${usedPrefix}mystatus* para ver tu estado.`,
                mentions: [sender, target]
            }, { quoted: m });
        }
        
        // 2. Si NO hay propuesta, crear NUEVA (sender → target)
        console.log(`📩 ${sender.split('@')[0]} ENVÍA propuesta a ${target.split('@')[0]}`);
        
        data.proposals[sender] = target; // sender propone a target
        save();
        
        // Mensaje de propuesta
        return conn.sendMessage(m.chat, {
            text: `💌 *PROPUESTA DE MATRIMONIO*\n\n@${sender.split('@')[0]} quiere casarse contigo @${target.split('@')[0]}!\n\nPara *ACEPTAR*, responde con:\n*${usedPrefix}marry @${sender.split('@')[0]}*\n\n⏰ Tienes 5 minutos para responder.`,
            mentions: [sender, target]
        }, { quoted: m });
    }
    
    // COMANDO DIVORCE
    if (command === 'divorce') {
        if (!data.marriages[sender]) {
            return m.reply('💔 No estás casado');
        }
        
        const spouse = data.marriages[sender];
        delete data.marriages[sender];
        delete data.marriages[spouse];
        
        // Limpiar propuestas relacionadas
        Object.keys(data.proposals).forEach(key => {
            if (data.proposals[key] === sender || data.proposals[key] === spouse) {
                delete data.proposals[key];
            }
        });
        
        save();
        
        return m.reply(`💔 Te has divorciado de @${spouse.split('@')[0]}`);
    }
    
    // COMANDO MYSTATUS
    if (command === 'mystatus') {
        const userName = conn.getName(sender) || sender.split('@')[0];
        
        if (data.marriages[sender]) {
            const spouse = data.marriages[sender];
            const spouseName = conn.getName(spouse) || spouse.split('@')[0];
            
            return m.reply(`💍 *ESTADO*\n\n✅ *CASADO/A*\n\n👤 Tú: ${userName}\n💕 Pareja: ${spouseName}\n\nUsa *${usedPrefix}divorce* para divorciarte.`);
        } else {
            // Ver si tiene propuestas pendientes
            let propuestasRecibidas = [];
            for (const [de, para] of Object.entries(data.proposals)) {
                if (para === sender) {
                    propuestasRecibidas.push(de);
                }
            }
            
            let mensaje = `💔 *ESTADO*\n\n❌ *SOLTERO/A*\n\n${userName}, no estás casado/a.\n`;
            
            if (propuestasRecibidas.length > 0) {
                mensaje += `\n📩 *Propuestas pendientes de:*\n`;
                propuestasRecibidas.forEach(jid => {
                    const nombre = conn.getName(jid) || jid.split('@')[0];
                    mensaje += `• ${nombre}\n`;
                });
                mensaje += `\nPara aceptar: *${usedPrefix}marry @nombre*`;
            } else {
                mensaje += `\nPara proponer matrimonio:\n${usedPrefix}marry @amigo`;
            }
            
            return m.reply(mensaje);
        }
    }
    
    // VER PROPuestas PENDIENTES (debug)
    if (command === 'verpropuestas') {
        let texto = '📋 *PROPUESTAS PENDIENTES*\n\n';
        
        for (const [de, para] of Object.entries(data.proposals)) {
            const nombreDe = conn.getName(de) || de.split('@')[0];
            const nombrePara = conn.getName(para) || para.split('@')[0];
            texto += `${nombreDe} → ${nombrePara}\n`;
        }
        
        if (Object.keys(data.proposals).length === 0) {
            texto += 'No hay propuestas pendientes.';
        }
        
        return m.reply(texto);
    }
    
    // VER TODOS LOS CASADOS
    if (command === 'casados') {
        const parejas = [];
        const procesados = new Set();
        
        for (const [p1, p2] of Object.entries(data.marriages)) {
            if (!procesados.has(p1)) {
                parejas.push([p1, p2]);
                procesados.add(p1);
                procesados.add(p2);
            }
        }
        
        if (parejas.length === 0) {
            return m.reply('💔 No hay matrimonios.');
        }
        
        let texto = '💒 *PAREJAS CASADAS*\n\n';
        parejas.forEach(([p1, p2], i) => {
            const n1 = conn.getName(p1) || p1.split('@')[0];
            const n2 = conn.getName(p2) || p2.split('@')[0];
            texto += `${i+1}. ${n1} ❤️ ${n2}\n`;
        });
        
        return m.reply(texto);
    }
};

// Información del comando
handler.help = [
    'marry @usuario - Proponer/aceptar matrimonio',
    'divorce - Divorciarse',
    'mystatus - Ver tu estado',
    'casados - Ver parejas casadas',
    'verpropuestas - Ver propuestas pendientes'
];

handler.tags = ['social', 'fun'];
handler.command = ['marry', 'divorce', 'mystatus', 'casados', 'verpropuestas'];
handler.group = true;
handler.register = true;

export default handler;