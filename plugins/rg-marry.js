import fs from 'fs';
import path from 'path';

// Archivo de matrimonios
const marriagesFile = '.src/casados/database.json';
let marriages = {};
let proposals = {};

// Cargar datos
if (fs.existsSync(marriagesFile)) {
    try {
        const data = fs.readFileSync(marriagesFile, 'utf-8');
        marriages = JSON.parse(data);
        console.log('Matrimonios cargados:', Object.keys(marriages).length);
    } catch (e) {
        console.error('Error cargando matrimonios:', e);
        marriages = {};
    }
} else {
    // Crear archivo si no existe
    fs.writeFileSync(marriagesFile, '{}');
}

// Guardar datos
function saveMarriages() {
    try {
        fs.writeFileSync(marriagesFile, JSON.stringify(marriages, null, 2));
        console.log('Matrimonios guardados');
    } catch (e) {
        console.error('Error guardando matrimonios:', e);
    }
}

// Obtener nombre bonito del usuario
function getUserName(conn, jid) {
    try {
        const name = conn.getName(jid);
        return name || jid.split('@')[0];
    } catch {
        return jid.split('@')[0];
    }
}

// Función para obtener mención correcta
function getMention(jid) {
    return `@${jid.split('@')[0]}`;
}

let handler = async (m, { conn, command, usedPrefix }) => {
    const sender = m.sender;
    
    // COMANDO MARRY
    if (/^(marry|casarse|boda)$/i.test(command)) {
        try {
            // Verificar mención
            if (!m.mentionedJid || m.mentionedJid.length === 0) {
                return m.reply(`💍 *PROPUESTA DE MATRIMONIO*\n\nDebes mencionar a alguien.\n\nEjemplo: ${usedPrefix}${command} @usuario`);
            }
            
            const target = m.mentionedJid[0];
            const targetNumber = target.split('@')[0];
            
            // Validaciones
            if (sender === target) {
                return m.reply('❌ No puedes casarte contigo mismo/a.');
            }
            
            // Verificar si ya está casado
            if (marriages[sender]) {
                const spouse = marriages[sender];
                const spouseName = getUserName(conn, spouse);
                return conn.sendMessage(m.chat, {
                    text: `💍 *YA ESTÁS CASADO/A*\n\nYa estás casado/a con:\n${getMention(spouse)} (${spouseName})\n\nUsa *${usedPrefix}divorce* para divorciarte.`,
                    mentions: [spouse]
                }, { quoted: m });
            }
            
            if (marriages[target]) {
                const spouse = marriages[target];
                const spouseName = getUserName(conn, spouse);
                return conn.sendMessage(m.chat, {
                    text: `❌ *YA CASADO/A*\n\n${getMention(target)} ya está casado/a con:\n${getMention(spouse)} (${spouseName})`,
                    mentions: [target, spouse]
                }, { quoted: m });
            }
            
            // Verificar si hay propuesta pendiente
            if (proposals[target] && proposals[target] === sender) {
                // ¡ACEPTAR LA PROPUESTA!
                delete proposals[target];
                
                // Registrar matrimonio
                marriages[sender] = target;
                marriages[target] = sender;
                saveMarriages();
                
                // Obtener nombres
                const senderName = getUserName(conn, sender);
                const targetName = getUserName(conn, target);
                
                // Mensaje de felicitación
                const message = `🎉 *¡FELICIDADES!* 🎉\n\n💒 *BODA OFICIAL*\n\n👰 *${senderName}*\n💍 CASADO/A CON 💍\n🤵 *${targetName}*\n\n¡Que vivan los novios! 🥂\n\n_Usa *${usedPrefix}mystatus* para ver tu estado matrimonial_`;
                
                return conn.sendMessage(m.chat, {
                    text: message,
                    mentions: [sender, target]
                }, { quoted: m });
            }
            
            // Crear nueva propuesta
            proposals[sender] = target;
            
            // Obtener nombres
            const senderName = getUserName(conn, sender);
            const targetName = getUserName(conn, target);
            
            // Mensaje de propuesta
            const message = `💌 *PROPUESTA DE MATRIMONIO*\n\n${senderName} (@${sender.split('@')[0]}) quiere casarse contigo ${targetName}!\n\nPara aceptar, responde con:\n*${usedPrefix}${command} @${sender.split('@')[0]}*\n\n⏰ La propuesta expira en 5 minutos.`;
            
            return conn.sendMessage(m.chat, {
                text: message,
                mentions: [sender, target]
            }, { quoted: m });
            
        } catch (error) {
            console.error('Error en comando marry:', error);
            return m.reply('❌ Ocurrió un error. Intenta nuevamente.');
        }
    }
    
    // COMANDO DIVORCE
    if (/^(divorce|divorciarse)$/i.test(command)) {
        try {
            if (!marriages[sender]) {
                return m.reply('💔 No estás casado/a actualmente.');
            }
            
            const spouse = marriages[sender];
            const spouseName = getUserName(conn, spouse);
            
            // Eliminar matrimonio
            delete marriages[sender];
            delete marriages[spouse];
            saveMarriages();
            
            return conn.sendMessage(m.chat, {
                text: `💔 *DIVORCIO*\n\n${getUserMention(sender, conn)} y ${getUserMention(spouse, conn)} se han divorciado.\n\nEsperamos que encuentren la felicidad por separado.`,
                mentions: [sender, spouse]
            }, { quoted: m });
            
        } catch (error) {
            console.error('Error en comando divorce:', error);
            return m.reply('❌ Error al procesar el divorcio.');
        }
    }
    
    // COMANDO MYSTATUS
    if (/^(mystatus|micasamiento|micasada|micasado)$/i.test(command)) {
        try {
            if (marriages[sender]) {
                const spouse = marriages[sender];
                const spouseName = getUserName(conn, spouse);
                const userName = getUserName(conn, sender);
                
                return conn.sendMessage(m.chat, {
                    text: `💍 *ESTADO MATRIMONIAL*\n\n✅ *CASADO/A*\n\n👤 Tú: ${userName}\n💕 Pareja: ${spouseName} (@${spouse.split('@')[0]})\n\nUsa *${usedPrefix}divorce* para divorciarte.`,
                    mentions: [spouse]
                }, { quoted: m });
            } else {
                const userName = getUserName(conn, sender);
                return m.reply(`💔 *ESTADO MATRIMONIAL*\n\n❌ *SOLTERO/A*\n\n${userName}, no estás casado/a actualmente.\n\nPara casarte usa:\n${usedPrefix}marry @usuario`);
            }
        } catch (error) {
            console.error('Error en comando mystatus:', error);
            return m.reply('❌ Error al consultar tu estado.');
        }
    }
    
    // COMANDO LISTMARRIAGES
    if (/^(listmarriages|casados|parejas|matrimonios)$/i.test(command)) {
        try {
            const couples = [];
            const processed = new Set();
            
            for (const [person1, person2] of Object.entries(marriages)) {
                if (!processed.has(person1)) {
                    couples.push([person1, person2]);
                    processed.add(person1);
                    processed.add(person2);
                }
            }
            
            if (couples.length === 0) {
                return m.reply('💔 No hay matrimonios registrados en este momento.');
            }
            
            let text = `💒 *MATRIMONIOS REGISTRADOS*\n\n`;
            couples.forEach(([p1, p2], i) => {
                const name1 = getUserName(conn, p1);
                const name2 = getUserName(conn, p2);
                text += `${i + 1}. ${name1} 💕 ${name2}\n   @${p1.split('@')[0]} 👉 @${p2.split('@')[0]}\n\n`;
            });
            text += `\nTotal: ${couples.length} pareja(s)`;
            
            return m.reply(text);
            
        } catch (error) {
            console.error('Error en comando listmarriages:', error);
            return m.reply('❌ Error al obtener la lista.');
        }
    }
    
    // COMANDO PARA LIMPIAR PROPuestas viejas (admin)
    if (command === 'clearmarriages' && m.sender.endsWith('573135180873@s.whatsapp.net')) {
        proposals = {};
        return m.reply('✅ Propuestas de matrimonio limpiadas.');
    }
};

// Función auxiliar para obtener mención con nombre
function getUserMention(jid, conn) {
    const name = getUserName(conn, jid);
    return `${name} (@${jid.split('@')[0]})`;
}

handler.help = [
    'marry @usuario - Proponer matrimonio',
    'divorce - Divorciarse',
    'mystatus - Ver tu estado',
    'listmarriages - Ver matrimonios'
];

handler.tags = ['social', 'fun'];
handler.command = ['marry', 'casarse', 'boda', 'divorce', 'divorciarse', 'mystatus', 'micasamiento', 'micasada', 'micasado', 'listmarriages', 'casados', 'parejas', 'matrimonios'];
handler.group = true;
handler.register = true;

export default handler;