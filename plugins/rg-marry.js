import fs from 'fs';

// Archivo de datos
const FILE = './casamientos.json';
let casados = {};
let propuestas = {};

// Cargar
if (fs.existsSync(FILE)) {
    try {
        const contenido = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
        casados = contenido.casados || {};
        propuestas = contenido.propuestas || {};
    } catch { }
}

// Guardar
function guardar() {
    fs.writeFileSync(FILE, JSON.stringify({ casados, propuestas }, null, 2));
}

let handler = async (m, { conn, command, usedPrefix }) => {
    const yo = m.sender;
    
    // COMANDO MARRY - CORREGIDO
    if (command === 'marry') {
        // Verificar mención
        if (!m.mentionedJid || m.mentionedJid.length === 0) {
            return m.reply(`💍 *¿Con quién?*\n\n${usedPrefix}marry @persona`);
        }
        
        const otraPersona = m.mentionedJid[0];
        
        // Validaciones
        if (yo === otraPersona) return m.reply('😅 No puedes casarte contigo mismo');
        if (casados[yo]) return m.reply(`💍 Ya tienes pareja: @${casados[yo].split('@')[0]}`);
        if (casados[otraPersona]) return m.reply(`❌ @${otraPersona.split('@')[0]} ya está casado/a`);
        
        // 🔄 **LÓGICA PRINCIPAL CORREGIDA**
        // Caso 1: La otra persona YA ME ENVIÓ propuesta a mí
        if (propuestas[otraPersona] === yo) {
            console.log(`💕 ${yo.split('@')[0]} ACEPTA a ${otraPersona.split('@')[0]}`);
            
            // Limpiar propuesta
            delete propuestas[otraPersona];
            
            // Casarnos
            casados[yo] = otraPersona;
            casados[otraPersona] = yo;
            guardar();
            
            // Mensaje de felicitación
            await conn.sendMessage(m.chat, {
                text: `🎉 *¡BODA!*\n\n@${yo.split('@')[0]} 💍 @${otraPersona.split('@')[0]}\n\n¡Felicidades a los recién casados! 🥂`,
                mentions: [yo, otraPersona]
            }, { quoted: m });
            
            return;
        }
        
        // Caso 2: Envío NUEVA propuesta
        console.log(`💌 ${yo.split('@')[0]} PROPONE a ${otraPersona.split('@')[0]}`);
        
        propuestas[yo] = otraPersona;
        guardar();
        
        // Mensaje de propuesta
        await conn.sendMessage(m.chat, {
            text: `💌 *TE QUIERO CASAR*\n\n@${yo.split('@')[0]} te ha propuesto matrimonio @${otraPersona.split('@')[0]}!\n\nSi quieres aceptar, responde con:\n*${usedPrefix}marry @${yo.split('@')[0]}*`,
            mentions: [yo, otraPersona]
        }, { quoted: m });
        
        return;
    }
    
    // COMANDO DIVORCE
    if (command === 'divorce') {
        if (!casados[yo]) {
            return m.reply('💔 No estás casado/a');
        }
        
        const pareja = casados[yo];
        delete casados[yo];
        delete casados[pareja];
        guardar();
        
        return m.reply(`💔 Divorcio completado con @${pareja.split('@')[0]}`);
    }
    
    // COMANDO STATUS
    if (command === 'mystatus') {
        if (casados[yo]) {
            const pareja = casados[yo];
            return m.reply(`💍 Casado/a con @${pareja.split('@')[0]}`);
        } else {
            // Ver propuestas recibidas
            let recibidas = [];
            for (const [de, para] of Object.entries(propuestas)) {
                if (para === yo) {
                    recibidas.push(de);
                }
            }
            
            if (recibidas.length > 0) {
                let msg = '📩 *Tienes propuestas de:*\n';
                recibidas.forEach(jid => {
                    msg += `• @${jid.split('@')[0]}\n`;
                });
                msg += `\nPara aceptar: ${usedPrefix}marry @ellos`;
                return m.reply(msg);
            } else {
                return m.reply('💔 Soltero/a\n\nPara casarte: ' + usedPrefix + 'marry @alguien');
            }
        }
    }
};

// Configuración
handler.help = ['marry @usuario', 'divorce', 'mystatus'];
handler.tags = ['social'];
handler.command = ['marry', 'divorce', 'mystatus'];
handler.group = true;
handler.register = true;

export default handler;