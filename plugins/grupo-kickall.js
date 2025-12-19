let handler = async (m, { conn, usedPrefix, command }) => {
    // No necesitamos verificar si es grupo o admin, los flags al final ya lo hacen.
    const groupMetadata = await conn.groupMetadata(m.chat);
    const botId = conn.user.jid.split(':')[0] + '@s.whatsapp.net';
    const ownerBot = (global.owner?.[0]?.[0] || '') + '@s.whatsapp.net';
    const ownerGroup = groupMetadata.owner || '';

    // Filtramos para NO tocar al Bot, al dueño del Bot o al Creador del grupo
    const whitelist = [botId, ownerBot, ownerGroup];

    // 1. Lista de admins para quitarles el rango (excepto whitelist)
    const adminsToDemote = groupMetadata.participants
        .filter(p => p.admin && !whitelist.includes(p.id))
        .map(p => p.id);

    // 2. Lista completa de usuarios a eliminar
    const usersToKick = groupMetadata.participants
        .filter(p => !whitelist.includes(p.id))
        .map(p => p.id);

    if (usersToKick.length === 0) return conn.reply(m.chat, `ℹ️ No hay usuarios para eliminar.`, m);

    // Mensaje de advertencia
    let texto = `⚠️ *ADVERTENCIA DE LIMPIEZA*\n\n`;
    texto += `Se realizará lo siguiente:\n`;
    texto += `• Quitar admin a: *${adminsToDemote.length}* usuarios.\n`;
    texto += `• Expulsar a: *${usersToKick.length}* usuarios.\n\n`;
    texto += `¿Estás seguro? Responde con *"si"* para proceder.`;

    await conn.reply(m.chat, texto, m);

    // Guardamos los datos en una variable global temporal
    const confirmationKey = `kickall-${m.chat}-${m.sender}`;
    global.confirmationData = global.confirmationData || {};
    global.confirmationData[confirmationKey] = {
        adminsToDemote,
        usersToKick,
        timeout: setTimeout(() => {
            if (global.confirmationData[confirmationKey]) {
                delete global.confirmationData[confirmationKey];
                conn.reply(m.chat, '⏱️ Tiempo de confirmación agotado.', m);
            }
        }, 30000) // 30 segundos
    };
};

handler.before = async (m, { conn }) => {
    const confirmationKey = `kickall-${m.chat}-${m.sender}`;
    if (!global.confirmationData || !global.confirmationData[confirmationKey] || !m.text) return;
    
    const data = global.confirmationData[confirmationKey];
    const response = m.text.toLowerCase().trim();

    if (response === 'si' || response === 'sí') {
        clearTimeout(data.timeout);
        delete global.confirmationData[confirmationKey];

        await conn.reply(m.chat, `⏳ Iniciando proceso... esto puede tardar un poco.`, m);

        // PASO 1: Quitar Admins (en bloques de 5 para no saturar)
        if (data.adminsToDemote.length > 0) {
            for (let i = 0; i < data.adminsToDemote.length; i += 5) {
                const batch = data.adminsToDemote.slice(i, i + 5);
                await conn.groupParticipantsUpdate(m.chat, batch, 'demote');
                await new Promise(r => setTimeout(r, 1500)); 
            }
        }

        // PASO 2: Expulsar uno por uno
        let successCount = 0;
        for (const user of data.usersToKick) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
                successCount++;
                // Delay de 1 segundo entre cada expulsión para evitar ban del bot
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                console.error(`Fallo al eliminar a ${user}`);
            }
        }

        await conn.reply(m.chat, `✅ *Limpieza terminada*\n\nSe eliminaron exitosamente a *${successCount}* usuarios.`, m);

    } else if (response === 'no') {
        clearTimeout(data.timeout);
        delete global.confirmationData[confirmationKey];
        await conn.reply(m.chat, '❌ Acción cancelada.', m);
    }
};

handler.help = ['kickall'];
handler.tags = ['group'];
handler.command = /^(kickall|expulsartodos)$/i;

// Estos flags reemplazan los ifs manuales dentro del código
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
