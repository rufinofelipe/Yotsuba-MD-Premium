import fs from 'fs';

// Archivo simple
const FILE = '.src/casados/database.json';
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

let handler = async (m, { conn, command, usedPrefix }) => {
    const sender = m.sender;
    
    // MARRY
    if (command === 'marry') {
        if (!m.mentionedJid?.[0]) {
            return m.reply(`💍 Menciona a alguien:\n${usedPrefix}marry @usuario`);
        }
        
        const target = m.mentionedJid[0];
        
        // Validar
        if (sender === target) return m.reply('❌ No puedes casarte contigo mismo');
        if (data.marriages[sender]) return m.reply(`❌ Ya estás casado con @${data.marriages[sender].split('@')[0]}`);
        if (data.marriages[target]) return m.reply(`❌ Esta persona ya está casada`);
        
        // Verificar propuesta
        if (data.proposals[target] === sender) {
            // ACEPTAR
            delete data.proposals[target];
            data.marriages[sender] = target;
            data.marriages[target] = sender;
            save();
            
            const senderName = conn.getName(sender) || 'Usuario';
            const targetName = conn.getName(target) || 'Usuario';
            
            return conn.sendMessage(m.chat, {
                text: `🎉 *¡BODA!*\n\n${senderName} 💍 ${targetName}\n\n¡Felicitaciones! 🥂`,
                mentions: [sender, target]
            }, { quoted: m });
        }
        
        // NUEVA PROPUESTA
        data.proposals[sender] = target;
        save();
        
        const senderName = conn.getName(sender) || 'Usuario';
        const targetName = conn.getName(target) || 'Usuario';
        
        return conn.sendMessage(m.chat, {
            text: `💌 *PROPUESTA*\n\n${senderName} quiere casarse con ${targetName}!\n\nPara aceptar:\n${usedPrefix}marry @${sender.split('@')[0]}`,
            mentions: [sender, target]
        }, { quoted: m });
    }
    
    // DIVORCE
    if (command === 'divorce') {
        if (!data.marriages[sender]) return m.reply('💔 No estás casado');
        
        const spouse = data.marriages[sender];
        delete data.marriages[sender];
        delete data.marriages[spouse];
        save();
        
        return m.reply(`💔 Divorcio completado con @${spouse.split('@')[0]}`);
    }
    
    // STATUS
    if (command === 'mystatus') {
        if (data.marriages[sender]) {
            const spouse = data.marriages[sender];
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