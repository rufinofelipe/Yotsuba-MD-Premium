import fs from 'fs';
import path from 'path';

// Archivo donde se guardarán los matrimonios
const marriagesFile = './src/database/casados.json';

// Cargar matrimonios existentes
function loadMarriages() {
    try {
        if (fs.existsSync(marriagesFile)) {
            const data = fs.readFileSync(marriagesFile, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error al cargar matrimonios:', error);
    }
    return {};
}

// Guardar matrimonios
function saveMarriages(data) {
    try {
        fs.writeFileSync(marriagesFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error al guardar matrimonios:', error);
    }
}

// Cargar matrimonios al inicio
let marriages = loadMarriages();
// Almacenar propuestas temporales
let proposals = {};

let handler = async (m, { conn, command, usedPrefix, args }) => {
    const sender = m.sender;
    const isGroup = m.isGroup;
    
    // Comandos de matrimonio
    if (command === 'marry' || command === 'casarse' || command === 'boda') {
        try {
            // Verificar si ya está casado
            if (marriages[sender]) {
                const partner = marriages[sender];
                return conn.reply(
                    m.chat,
                    `💍 *YA ESTÁS CASADO/A*\n\nYa estás casado/a con:\n@${partner.split('@')[0]}\n\nPara divorciarte usa: *${usedPrefix}divorce*`,
                    m,
                    { mentions: [partner] }
                );
            }
            
            // Verificar mención
            if (!m.mentionedJid || m.mentionedJid.length === 0) {
                return conn.reply(
                    m.chat,
                    `💍 *PROPUESTA DE MATRIMONIO*\n\nDebes mencionar a la persona con quien quieres casarte.\n\nEjemplo:\n*${usedPrefix}marry @usuario*`,
                    m
                );
            }
            
            const target = m.mentionedJid[0];
            
            // No se puede casar consigo mismo
            if (sender === target) {
                return m.reply('❌ No puedes casarte contigo mismo/a.');
            }
            
            // Verificar si el objetivo ya está casado
            if (marriages[target]) {
                const targetPartner = marriages[target];
                return conn.reply(
                    m.chat,
                    `❌ *YA CASADO/A*\n\n@${target.split('@')[0]} ya está casado/a con:\n@${targetPartner.split('@')[0]}`,
                    m,
                    { mentions: [target, targetPartner] }
                );
            }
            
            // Verificar si el objetivo es el bot
            if (target === conn.user.jid) {
                return m.reply('🤖 Lo siento, soy un bot y no puedo casarme. ¡Pero te deseo suerte en encontrar a tu alma gemela!');
            }
            
            // Verificar si hay una propuesta pendiente del objetivo hacia el remitente
            if (proposals[target] === sender) {
                // ¡Aceptar la propuesta!
                delete proposals[target];
                
                // Crear el matrimonio
                marriages[sender] = target;
                marriages[target] = sender;
                saveMarriages(marriages);
                
                // Obtener nombres
                const senderName = conn.getName(sender) || sender.split('@')[0];
                const targetName = conn.getName(target) || target.split('@')[0];
                
                // Mensaje de felicitación
                return conn.reply(
                    m.chat,
                    `🎉 *¡FELICIDADES!* 🎉\n\n💍 @${sender.split('@')[0]} y @${target.split('@')[0]} ahora están casados.\n\n` +
                    `👰 ${senderName}\n🤵 ${targetName}\n\n` +
                    `¡Que vivan los novios! 🥂`,
                    m,
                    { mentions: [sender, target] }
                );
            }
            
            // Crear nueva propuesta
            proposals[sender] = target;
            
            // Obtener nombres para el mensaje
            const senderName = conn.getName(sender) || sender.split('@')[0];
            const targetName = conn.getName(target) || target.split('@')[0];
            
            return conn.reply(
                m.chat,
                `💌 *PROPUESTA ENVIADA*\n\n@${sender.split('@')[0]} ha propuesto matrimonio a @${target.split('@')[0]}\n\n` +
                `Para aceptar, ${targetName} debe usar:\n` +
                `*${usedPrefix}marry @${sender.split('@')[0]}*`,
                m,
                { mentions: [sender, target] }
            );
            
        } catch (error) {
            console.error('Error en comando marry:', error);
            return m.reply('❌ Ocurrió un error al procesar la solicitud.');
        }
    }
    
    // Comando de divorcio
    if (command === 'divorce' || command === 'divorciarse') {
        try {
            // Verificar si está casado
            if (!marriages[sender]) {
                return m.reply('❌ No estás casado/a con nadie.');
            }
            
            const partner = marriages[sender];
            
            // Eliminar el matrimonio
            delete marriages[sender];
            delete marriages[partner];
            saveMarriages(marriages);
            
            // Mensaje de divorcio
            return conn.reply(
                m.chat,
                `💔 *DIVORCIO*\n\n@${sender.split('@')[0]} y @${partner.split('@')[0]} se han divorciado.\n\n` +
                `Esperamos que encuentren la felicidad por separado.`,
                m,
                { mentions: [sender, partner] }
            );
            
        } catch (error) {
            console.error('Error en comando divorce:', error);
            return m.reply('❌ Ocurrió un error al procesar el divorcio.');
        }
    }
    
    // Comando para ver estado de matrimonio
    if (command === 'mystatus' || command === 'micasamiento') {
        try {
            if (marriages[sender]) {
                const partner = marriages[sender];
                const partnerName = conn.getName(partner) || partner.split('@')[0];
                const since = marriages._timestamp ? new Date(marriages._timestamp[sender]).toLocaleDateString() : 'Fecha desconocida';
                
                return conn.reply(
                    m.chat,
                    `💍 *TU MATRIMONIO*\n\nEstás casado/a con:\n@${partner.split('@')[0]}\n\n` +
                    `💕 ${conn.getName(sender) || sender.split('@')[0]} ❤️ ${partnerName}\n` +
                    `📅 Desde: ${since}`,
                    m,
                    { mentions: [partner] }
                );
            } else {
                return m.reply('💔 No estás casado/a actualmente.\n\nUsa *' + usedPrefix + 'marry @usuario* para proponer matrimonio.');
            }
        } catch (error) {
            console.error('Error en comando mystatus:', error);
            return m.reply('❌ Error al consultar tu estado.');
        }
    }
    
    // Comando para ver lista de matrimonios
    if (command === 'listmarriages' || command === 'casados') {
        try {
            const marriedCouples = Object.entries(marriages)
                .filter(([key, value]) => key < value) // Evitar duplicados
                .map(([person1, person2]) => {
                    const name1 = conn.getName(person1) || person1.split('@')[0];
                    const name2 = conn.getName(person2) || person2.split('@')[0];
                    return `• @${person1.split('@')[0]} 💕 @${person2.split('@')[0]}\n  ${name1} ❤️ ${name2}`;
                });
            
            if (marriedCouples.length === 0) {
                return m.reply('💔 No hay matrimonios registrados en este momento.');
            }
            
            return conn.reply(
                m.chat,
                `💍 *MATRIMONIOS REGISTRADOS*\n\n${marriedCouples.join('\n\n')}\n\nTotal: ${marriedCouples.length} pareja(s)`,
                m
            );
            
        } catch (error) {
            console.error('Error en comando listmarriages:', error);
            return m.reply('❌ Error al obtener la lista de matrimonios.');
        }
    }
};

// Información del handler
handler.help = [
    'marry @usuario - Proponer matrimonio a alguien',
    'divorce - Divorciarse de tu pareja actual',
    'mystatus - Ver tu estado de matrimonio',
    'listmarriages - Ver todos los matrimonios'
];

handler.tags = ['social', 'fun'];
handler.command = ['marry', 'casarse', 'boda', 'divorce', 'divorciarse', 'mystatus', 'micasamiento', 'listmarriages', 'casados'];
handler.group = true;
handler.register = true;

export default handler;