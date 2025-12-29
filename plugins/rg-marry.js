import fs from 'fs';

// Archivo simple
const FILE = '.src/casados/database.json';
let data = { marriages: {}, proposals: {} };

// Cargar datos
if (fs.existsSync(FILE)) {
    try {
        data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
    } catch (e) {
        console.log('Creando nuevo archivo de matrimonios...');
    }
}

// Guardar datos
function save() {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// Obtener nombre bonito
function getName(conn, jid) {
    try {
        let name = conn.getName(jid);
        // Si el nombre es muy corto o parece número, lo mejoramos
        if (!name || name.length < 2 || /^\d+$/.test(name)) {
            name = `Usuario${jid.split('@')[0].slice(-4)}`;
        }
        return name;
    } catch {
        return `Usuario${jid.split('@')[0].slice(-4)}`;
    }
}

let handler = async (m, { conn, command, usedPrefix }) => {
    const sender = m.sender;
    
    // COMANDO MARRY - VERSIÓN CORREGIDA
    if (command === 'marry' || command === 'casarse' || command === 'boda') {
        try {
            // Verificar si mencionó a alguien
            if (!m.mentionedJid || m.mentionedJid.length === 0) {
                return m.reply(`💍 *¿Con quién te quieres casar?*\n\nMenciona a la persona:\n*${usedPrefix}marry @nombre*`);
            }
            
            const target = m.mentionedJid[0];
            const senderName = getName(conn, sender);
            const targetName = getName(conn, target);
            
            // Validaciones básicas
            if (sender === target) {
                return m.reply('❌ No puedes casarte contigo mismo, eso sería raro 😅');
            }
            
            // Verificar si ya está casado
            if (data.marriages[sender]) {
                const spouseJid = data.marriages[sender];
                const spouseName = getName(conn, spouseJid);
                return m.reply(`💍 *Ya tienes pareja*\n\nEstás casado/a con *${spouseName}*\n\nUsa *${usedPrefix}divorce* si quieres divorciarte.`);
            }
            
            if (data.marriages[target]) {
                const spouseJid = data.marriages[target];
                const spouseName = getName(conn, spouseJid);
                return m.reply(`❌ *Ya está comprometido/a*\n\n*${targetName}* ya está casado/a con *${spouseName}*`);
            }
            
            // 🔄 VERIFICAR SI HAY PROPUESTA PENDIENTE
            // (El target ya había enviado propuesta al sender)
            if (data.proposals[target] === sender) {
                console.log('¡Propuesta aceptada!');
                
                // Limpiar propuesta
                delete data.proposals[target];
                
                // Registrar matrimonio
                data.marriages[sender] = target;
                data.marriages[target] = sender;
                save();
                
                // Mensaje de FELICITACIONES con menciones
                await conn.sendMessage(m.chat, {
                    text: `🎉 *¡FELICIDADES!*\n\n💒 *BODA OFICIAL* 💒\n\n👰 *${senderName}*\n💍 SE HA CASADO CON 💍\n🤵 *${targetName}*\n\n¡Que vivan los novios! 🥂🎊\n\n_Usa *${usedPrefix}mystatus* para ver tu estado_`,
                    mentions: [sender, target] // MENCIONES IMPORTANTES
                }, { quoted: m });
                
                return;
            }
            
            // 📩 CREAR NUEVA PROPUESTA
            // (El sender envía propuesta al target)
            data.proposals[sender] = target;
            save();
            
            console.log(`Propuesta creada: ${senderName} -> ${targetName}`);
            
            // Mensaje de PROPUESTA con menciones
            await conn.sendMessage(m.chat, {
                text: `💌 *PROPUESTA DE MATRIMONIO*\n\n*${senderName}* 💝 quiere casarse contigo *${targetName}*!\n\nPara *ACEPTAR*, escribe:\n*${usedPrefix}marry @${senderName.replace(/\s+/g, '')}*\n\n⏳ *La propuesta expira en 5 minutos*`,
                mentions: [sender, target] // MENCIONES IMPORTANTES
            }, { quoted: m });
            
        } catch (error) {
            console.error('Error en marry:', error);
            await m.reply('❌ Ocurrió un error. Intenta de nuevo.');
        }
        return;
    }
    
    // COMANDO DIVORCE
    if (command === 'divorce' || command === 'divorciarse') {
        try {
            if (!data.marriages[sender]) {
                return m.reply('💔 *No estás casado/a*\n\nNo tienes ningún matrimonio registrado.');
            }
            
            const spouseJid = data.marriages[sender];
            const spouseName = getName(conn, spouseJid);
            const userName = getName(conn, sender);
            
            // Eliminar matrimonio
            delete data.marriages[sender];
            delete data.marriages[spouseJid];
            save();
            
            // Eliminar cualquier propuesta pendiente
            for (const key in data.proposals) {
                if (data.proposals[key] === sender || data.proposals[key] === spouseJid) {
                    delete data.proposals[key];
                }
            }
            save();
            
            return m.reply(`💔 *DIVORCIO*\n\n*${userName}* y *${spouseName}* se han divorciado.\n\nCada uno seguirá su camino...`);
            
        } catch (error) {
            console.error('Error en divorce:', error);
            return m.reply('❌ Error al procesar el divorcio.');
        }
    }
    
    // COMANDO MYSTATUS
    if (command === 'mystatus' || command === 'estado') {
        try {
            const userName = getName(conn, sender);
            
            if (data.marriages[sender]) {
                const spouseJid = data.marriages[sender];
                const spouseName = getName(conn, spouseJid);
                
                return m.reply(`💍 *ESTADO MATRIMONIAL*\n\n✅ *CASADO/A*\n\n👤 *Tú:* ${userName}\n💕 *Pareja:* ${spouseName}\n\nUsa *${usedPrefix}divorce* para divorciarte.`);
            } else {
                // Verificar si tiene propuestas pendientes
                const pendingProposals = [];
                for (const [fromJid, toJid] of Object.entries(data.proposals)) {
                    if (toJid === sender) {
                        pendingProposals.push(getName(conn, fromJid));
                    }
                }
                
                let message = `💔 *ESTADO MATRIMONIAL*\n\n❌ *SOLTERO/A*\n\n*${userName}*, no estás casado/a.\n\n`;
                
                if (pendingProposals.length > 0) {
                    message += `📩 *Tienes propuestas pendientes de:*\n`;
                    pendingProposals.forEach(name => {
                        message += `• ${name}\n`;
                    });
                    message += `\nPara aceptar: *${usedPrefix}marry @nombre*`;
                } else {
                    message += `Para casarte:\n*${usedPrefix}marry @persona*`;
                }
                
                return m.reply(message);
            }
            
        } catch (error) {
            console.error('Error en mystatus:', error);
            return m.reply('❌ Error al ver tu estado.');
        }
    }
    
    // COMANDO PARA VER TODAS LAS PAREJAS
    if (command === 'casados' || command === 'parejas') {
        try {
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
                return m.reply('💔 *No hay matrimonios*\n\nNadie se ha casado todavía.');
            }
            
            let text = `💒 *MATRIMONIOS REGISTRADOS*\n\n`;
            couples.forEach(([p1, p2], i) => {
                const name1 = getName(conn, p1);
                const name2 = getName(conn, p2);
                text += `${i + 1}. *${name1}* ❤️ *${name2}*\n`;
            });
            text += `\n📊 Total: ${couples.length} pareja(s)`;
            
            return m.reply(text);
            
        } catch (error) {
            console.error('Error en casados:', error);
            return m.reply('❌ Error al ver la lista.');
        }
    }
    
    // COMANDO SECRETO: LIMPIAR PROPuestas (solo admin)
    if (command === 'limpiarcasamientos' && sender.includes('573135180873')) {
        data.proposals = {};
        save();
        return m.reply('✅ Propuestas de matrimonio limpiadas.');
    }
};

// Información del comando
handler.help = [
    'marry @usuario - Proponer matrimonio',
    'divorce - Divorciarse',
    'mystatus - Ver tu estado',
    'casados - Ver todos los matrimonios'
];

handler.tags = ['social', 'fun'];
handler.command = ['marry', 'casarse', 'boda', 'divorce', 'divorciarse', 'mystatus', 'estado', 'casados', 'parejas'];
handler.group = true;
handler.register = true;

export default handler;