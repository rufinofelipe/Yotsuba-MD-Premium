import fs from 'fs';

const marriagesFile = '.src/casados/database.json';
let marriages = {};
let proposals = {};

// Cargar
if (fs.existsSync(marriagesFile)) {
    try {
        marriages = JSON.parse(fs.readFileSync(marriagesFile, 'utf-8'));
    } catch (e) {
        console.log('Nueva base de matrimonios creada');
    }
}

// Guardar
function saveData() {
    fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
}

let handler = async (m, { conn, command, usedPrefix }) => {
    const sender = m.sender;
    
    // MARRY - Esta versión SÍ funciona
    if (command === 'marry') {
        // Verificar mención
        if (!m.mentionedJid || m.mentionedJid.length === 0) {
            return m.reply(`💍 Menciona a alguien:\n${usedPrefix}marry @amigo`);
        }
        
        const target = m.mentionedJid[0];
        
        // No auto-casamiento
        if (sender === target) return m.reply('❌ No puedes casarte contigo mismo');
        
        // Verificar si ya está casado
        if (marriages[sender]) {
            const spouse = marriages[sender];
            return m.reply(`💍 Ya estás casado con @${spouse.split('@')[0]}\nUsa ${usedPrefix}divorce`);
        }
        
        if (marriages[target]) {
            const spouse = marriages[target];
            return m.reply(`❌ @${target.split('@')[0]} ya está casado con @${spouse.split('@')[0]}`);
        }
        
        // Verificar si hay propuesta pendiente DEL TARGET HACIA EL SENDER
        if (proposals[target] === sender) {
            // ¡ACEPTAR PROPUESTA!
            delete proposals[target];
            
            // Registrar matrimonio
            marriages[sender] = target;
            marriages[target] = sender;
            saveData();
            
            // Mensaje de éxito CON MENCIONES
            return conn.sendMessage(m.chat, {
                text: `🎉 *¡FELICIDADES!*\n\n@${sender.split('@')[0]} 💍 @${target.split('@')[0]}\n\n¡Se han casado! 🥂`,
                mentions: [sender, target]
            }, { quoted: m });
        }
        
        // Crear NUEVA PROPUESTA (sender → target)
        proposals[sender] = target;
        
        // Mensaje de propuesta CON MENCIONES
        return conn.sendMessage(m.chat, {
            text: `💌 *PROPUESTA*\n\n@${sender.split('@')[0]} quiere casarse con @${target.split('@')[0]}!\n\nPara ACEPTAR:\n${usedPrefix}marry @${sender.split('@')[0]}`,
            mentions: [sender, target]
        }, { quoted: m });
    }
    
    // DIVORCE
    if (command === 'divorce') {
        if (!marriages[sender]) {
            return m.reply('💔 No estás casado');
        }
        
        const spouse = marriages[sender];
        
        // Eliminar matrimonio
        delete marriages[sender];
        delete marriages[spouse];
        saveData();
        
        return m.reply(`💔 Te has divorciado de @${spouse.split('@')[0]}`);
    }
    
    // MYSTATUS
    if (command === 'mystatus') {
        if (marriages[sender]) {
            const spouse = marriages[sender];
            return m.reply(`💍 Casado con @${spouse.split('@')[0]}`);
        } else {
            return m.reply('💔 Soltero/a');
        }
    }
};

handler.help = ['marry @usuario', 'divorce', 'mystatus'];
handler.tags = ['social'];
handler.command = ['marry', 'divorce', 'mystatus'];
handler.group = true;
handler.register = true;

export default handler;