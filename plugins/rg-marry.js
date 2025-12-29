import fs from 'fs';

// Archivo simple
const FILE = './casamientos_simple.json';

// Inicializar datos
let db = {
    marriages: {},
    proposals: {}
};

// Cargar
if (fs.existsSync(FILE)) {
    try {
        db = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    } catch {
        // Si hay error, empezar fresh
    }
}

// Guardar
function saveDB() {
    fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

let handler = async (m, { conn, command, usedPrefix }) => {
    const yo = m.sender;
    
    // SOLO COMANDO MARRY - SUPER SIMPLE
    if (command === 'marry') {
        // Verificar mención
        if (!m.mentionedJid || m.mentionedJid.length === 0) {
            return m.reply(`💍 Menciona a alguien: ${usedPrefix}marry @amigo`);
        }
        
        const otraPersona = m.mentionedJid[0];
        
        // No auto-casamiento
        if (yo === otraPersona) return m.reply('❌ No auto-casamiento');
        
        // Verificar si ya están casados
        if (db.marriages[yo]) {
            const pareja = db.marriages[yo];
            return m.reply(`💍 Ya casado con @${pareja.split('@')[0]}`);
        }
        
        if (db.marriages[otraPersona]) {
            return m.reply(`❌ @${otraPersona.split('@')[0]} ya está casado`);
        }
        
        // **VERIFICAR SI YO YA ENVIÉ PROPUESTA**
        const yoYaPropuse = db.proposals[yo] === otraPersona;
        
        // **VERIFICAR SI ELLA ME ENVIÓ PROPUESTA A MÍ**
        const ellaMePropuso = db.proposals[otraPersona] === yo;
        
        console.log(`DEBUG: Yo: ${yo.split('@')[0]}, Ella: ${otraPersona.split('@')[0]}`);
        console.log(`DEBUG: Yo ya propuse: ${yoYaPropuse}`);
        console.log(`DEBUG: Ella me propuso: ${ellaMePropuso}`);
        console.log(`DEBUG: Proposals actuales:`, db.proposals);
        
        // CASO 1: Ella ya me propuso a mí → ACEPTAR
        if (ellaMePropuso) {
            console.log('✅ CASO ACEPTACIÓN');
            
            // Limpiar su propuesta
            delete db.proposals[otraPersona];
            
            // Casarnos
            db.marriages[yo] = otraPersona;
            db.marriages[otraPersona] = yo;
            saveDB();
            
            // Mensaje de éxito
            return conn.sendMessage(m.chat, {
                text: `🎉 *¡SE CASARON!*\n\n@${yo.split('@')[0]} 💍 @${otraPersona.split('@')[0]}\n\n¡Felicidades! 🥳`,
                mentions: [yo, otraPersona]
            }, { quoted: m });
        }
        
        // CASO 2: Yo ya le propuse → Mensaje de espera
        if (yoYaPropuse) {
            return m.reply(`⏳ Ya le enviaste propuesta a @${otraPersona.split('@')[0]}. Espera su respuesta.`);
        }
        
        // CASO 3: Enviar NUEVA propuesta
        console.log('📩 CASO NUEVA PROPUESTA');
        
        db.proposals[yo] = otraPersona;
        saveDB();
        
        // Mostrar mensaje claro
        return conn.sendMessage(m.chat, {
            text: `💌 *NUEVA PROPUESTA*\n\n@${yo.split('@')[0]} quiere casarse contigo!\n\nPara ACEPTAR:\n1. Copia este mensaje\n2. Responde con: ${usedPrefix}marry @${yo.split('@')[0]}`,
            mentions: [yo, otraPersona]
        }, { quoted: m });
    }
    
    // DIVORCE
    if (command === 'divorce') {
        if (!db.marriages[yo]) {
            return m.reply('💔 No estás casado');
        }
        
        const pareja = db.marriages[yo];
        delete db.marriages[yo];
        delete db.marriages[pareja];
        saveDB();
        
        return m.reply(`💔 Divorcio con @${pareja.split('@')[0]}`);
    }
    
    // MYSTATUS
    if (command === 'mystatus') {
        if (db.marriages[yo]) {
            const pareja = db.marriages[yo];
            return m.reply(`💍 Casado con @${pareja.split('@')[0]}`);
        }
        
        // Ver propuestas recibidas
        let recibidas = [];
        for (const [de, para] of Object.entries(db.proposals)) {
            if (para === yo) {
                recibidas.push(de);
            }
        }
        
        if (recibidas.length > 0) {
            let msg = `📩 Tienes ${recibidas.length} propuesta(s):\n`;
            recibidas.forEach(jid => {
                msg += `• @${jid.split('@')[0]}\n`;
            });
            msg += `\nPara aceptar: ${usedPrefix}marry @ellos`;
            return m.reply(msg);
        }
        
        return m.reply('💔 Soltero/a');
    }
    
    // VER PROPuestas (debug)
    if (command === 'propuestas') {
        let msg = '📋 PROPuestas:\n';
        for (const [de, para] of Object.entries(db.proposals)) {
            msg += `@${de.split('@')[0]} → @${para.split('@')[0]}\n`;
        }
        return m.reply(msg || 'No hay propuestas');
    }
};

// Config
handler.help = ['marry @usuario', 'divorce', 'mystatus', 'propuestas'];
handler.tags = ['social'];
handler.command = ['marry', 'divorce', 'mystatus', 'propuestas'];
handler.group = true;
handler.register = true;

export default handler;