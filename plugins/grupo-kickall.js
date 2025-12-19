let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // 1. Validaciones iniciales
        if (!m.isGroup) return conn.reply(m.chat, `⚠️ Este comando solo se puede usar en grupos.`, m);

        const groupMetadata = await conn.groupMetadata(m.chat);
        const botId = conn.user.jid.split(':')[0] + '@s.whatsapp.net';
        const ownerBot = (global.owner?.[0]?.[0] || '') + '@s.whatsapp.net';
        const ownerGroup = groupMetadata.owner || '';

        // Verificar que el bot sea admin
        const botParticipant = groupMetadata.participants.find(p => p.id === botId);
        if (!botParticipant?.admin) return conn.reply(m.chat, `❌ ¡Error! El bot necesita ser **Administrador** para ejecutar esta acción.`, m);

        // 2. Identificar a quiénes NO debemos tocar (Bot, Dueño Bot, Dueño Grupo)
        const whitelist = [botId, ownerBot, ownerGroup];

        // 3. Obtener lista de todos los que son admins actualmente (para quitarles el rango)
        const adminsToDemote = groupMetadata.participants
            .filter(p => p.admin && !whitelist.includes(p.id))
            .map(p => p.id);

        // 4. Obtener lista total de usuarios a eliminar (todos menos la whitelist)
        const usersToKick = groupMetadata.participants
            .filter(p => !whitelist.includes(p.id))
            .map(p => p.id);

        if (usersToKick.length === 0) return conn.reply(m.chat, `ℹ️ No hay usuarios para eliminar (solo están el staff principal).`, m);

        // 5. Mensaje de advertencia y preparación
        await conn.reply(m.chat, `⚠️ *INICIANDO LIMPIEZA TOTAL*\n\n` +
            `• Usuarios a degradar: ${adminsToDemote.length}\n` +
            `• Usuarios a expulsar: ${usersToKick.length}\n\n` +
            `*Responde con "si" para confirmar.*`, m);

        // Guardar datos para la confirmación
        const confirmationKey = `kickall-${m.chat}-${m.sender}`;
        global.confirmationData = global.confirmationData || {};
        global.confirmationData[confirmationKey] = {
            adminsToDemote,
            usersToKick,
            status: 'waiting'
        };

        // Tiempo límite de 30 segundos
        setTimeout(() => {
            if (global.confirmationData[confirmationKey]) {
                delete global.confirmationData[confirmationKey];
            }
        }, 30000);

    } catch (e) {
        console.error(e);
        conn.reply(m.chat, `❌ Ocurrió un error inesperado.`, m);
    }
};

handler.before = async (m, { conn }) => {
    const confirmationKey = `kickall-${m.chat}-${m.sender}`;
    const data = global.confirmationData?.[confirmationKey];
    
    if (!data || m.text.toLowerCase() !== 'si') return;

    try {
        delete global.confirmationData[confirmationKey];
        await conn.reply(m.chat, `⏳ Procesando... Por favor no envíes más comandos hasta terminar.`, m);

        // PASO 1: Quitar admins
        if (data.adminsToDemote.length > 0) {
            await conn.reply(m.chat, `Step 1: Quitando rangos administrativos...`, m);
            // WhatsApp permite quitar admins en grupos de hasta 5-10 a la vez
            for (let i = 0; i < data.adminsToDemote.length; i += 5) {
                const batch = data.adminsToDemote.slice(i, i + 5);
                await conn.groupParticipantsUpdate(m.chat, batch, 'demote');
                await new Promise(r => setTimeout(r, 1500)); // Delay seguridad
            }
        }

        // PASO 2: Expulsar uno por uno y confirmar
        await conn.reply(m.chat, `Step 2: Expulsando usuarios (${data.usersToKick.length})...`, m);
        
        let success = 0;
        let failed = 0;

        for (const user of data.usersToKick) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
                success++;
                // Pausa dinámica: si son muchos, pausa más larga para evitar ban
                await new Promise(r => setTimeout(r, 1000)); 
            } catch (err) {
                failed++;
                console.error(`Fallo al expulsar a ${user}`);
            }
        }

        // PASO 3: Reporte Final
        const report = `✅ *LIMPIEZA COMPLETADA*\n\n` +
            `• Expulsados con éxito: ${success}\n` +
            `• Fallidos: ${failed}\n\n` +
            `*Nota:* Si hubo fallos, puede ser por conexión o límites de WhatsApp.`;
        
        await conn.reply(m.chat, report, m);

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, `❌ Error crítico durante la ejecución.`, m);
    }
};

handler.help = ['kickall'];
handler.tags = ['group'];
handler.command = /^(kickall|expulsartodos)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
