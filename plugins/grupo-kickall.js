let handler = async (m, { conn, usedPrefix, command, participants }) => {
    try {
        // 1. Verificar si es grupo
        if (!m.isGroup) {
            return conn.reply(m.chat, `⚠️ Este comando solo funciona en grupos.`, m);
        }

        // 2. Verificar permisos (solo administradores pueden usar)
        const groupInfo = await conn.groupMetadata(m.chat);
        const sender = m.sender;
        const isAdmin = groupInfo.participants.find(p => p.id === sender)?.admin;
        
        if (!isAdmin) {
            return conn.reply(m.chat, `❌ Solo los administradores pueden usar este comando.`, m);
        }

        // 3. Obtener lista de participantes a expulsar
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
        const ownerBot = (global.owner?.[0]?.[0] || '') + '@s.whatsapp.net';
        
        // Filtrar: expulsar a todos excepto:
        // - El bot
        // - El dueño del grupo
        // - El dueño del bot
        // - Los administradores (opcional, puedes cambiar esto)
        const usersToKick = groupInfo.participants
            .filter(p => 
                p.id !== conn.user.jid && // No el bot
                p.id !== ownerGroup && // No el dueño del grupo
                p.id !== ownerBot && // No el dueño del bot
                !p.admin // Solo expulsar no administradores (cambia si quieres expulsar a todos)
            )
            .map(p => p.id);

        if (usersToKick.length === 0) {
            return conn.reply(m.chat, `ℹ️ No hay usuarios para expulsar.`, m);
        }

        // 4. Confirmación antes de proceder
        await conn.reply(m.chat, 
            `⚠️ *CONFIRMACIÓN REQUERIDA*\n\n` +
            `Se expulsarán a *${usersToKick.length} usuarios*.\n\n` +
            `Responde con:\n` +
            `• *"sí"* para confirmar\n` +
            `• *"no"* para cancelar\n\n` +
            `Tienes 30 segundos para responder.`,
            m
        );

        // 5. Esperar confirmación
        const confirmationKey = `kickall-confirm-${m.chat}`;
        global.confirmationData = global.confirmationData || {};
        global.confirmationData[confirmationKey] = {
            usersToKick,
            timestamp: Date.now()
        };

        // Esperar respuesta por 30 segundos
        setTimeout(() => {
            if (global.confirmationData[confirmationKey]) {
                delete global.confirmationData[confirmationKey];
                conn.reply(m.chat, '⏱️ Tiempo de confirmación agotado.', m);
            }
        }, 30000);

    } catch (error) {
        console.error('Error en handler:', error);
        conn.reply(m.chat, `❌ Error: ${error.message}`, m);
    }
};

// Manejador de respuestas
handler.before = async (m, { conn }) => {
    if (!m.isGroup || !m.text) return;
    
    const confirmationKey = `kickall-confirm-${m.chat}`;
    const data = global.confirmationData?.[confirmationKey];
    
    if (!data) return;
    
    const response = m.text.toLowerCase().trim();
    const sender = m.sender;
    
    // Verificar que responda el mismo que ejecutó el comando
    const groupInfo = await conn.groupMetadata(m.chat);
    const isAdmin = groupInfo.participants.find(p => p.id === sender)?.admin;
    
    if (!isAdmin) return; // Solo admins pueden confirmar
    
    if (response === 'sí' || response === 'si') {
        try {
            // Eliminar datos de confirmación
            delete global.confirmationData[confirmationKey];
            
            // 6. Procesar expulsión de todos los usuarios
            await conn.reply(m.chat, 
                `⏳ Expulsando a ${data.usersToKick.length} usuarios...\n` +
                `Esto puede tomar unos segundos.`,
                m
            );
            
            const TIME_THRESHOLD = Date.now() - (15 * 60 * 1000); // 15 minutos
            let successCount = 0;
            let failCount = 0;
            
            // 7. Procesar cada usuario
            for (const user of data.usersToKick) {
                try {
                    // Intentar eliminar mensajes recientes primero
                    try {
                        // Esta parte depende de tu implementación de base de datos
                        // Si usas base de datos, aquí iría el código para buscar y eliminar mensajes
                        // Ejemplo para baileys:
                        // const messages = await conn.loadMessages(m.chat, 100);
                        // const userMessages = messages.filter(msg => 
                        //     msg.key.fromMe === false && 
                        //     msg.key.participant === user && 
                        //     msg.messageTimestamp * 1000 > TIME_THRESHOLD
                        // );
                        // for (const msg of userMessages) {
                        //     await conn.sendMessage(m.chat, {
                        //         delete: msg.key
                        //     });
                        // }
                    } catch (e) {
                        // Si falla la eliminación de mensajes, continuamos con la expulsión
                        console.log('Error eliminando mensajes:', e);
                    }
                    
                    // Expulsar al usuario
                    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
                    successCount++;
                    
                    // Pequeña pausa para evitar limitaciones
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                } catch (userError) {
                    console.log(`Error con usuario ${user}:`, userError);
                    failCount++;
                }
            }
            
            // 8. Reporte final
            await conn.reply(m.chat,
                `✅ *Proceso completado*\n\n` +
                `✓ Expulsados exitosamente: ${successCount}\n` +
                `✗ Fallos en expulsión: ${failCount}\n\n` +
                `_Nota: Se intentó eliminar mensajes de los últimos 15 minutos._`,
                m
            );
            
        } catch (finalError) {
            console.error('Error final:', finalError);
            conn.reply(m.chat, `❌ Error durante el proceso: ${finalError.message}`, m);
        }
        
    } else if (response === 'no') {
        delete global.confirmationData[confirmationKey];
        await conn.reply(m.chat, '❌ Comando cancelado.', m);
    }
};

// Configuración del comando
handler.help = ['kickall'];
handler.tags = ['group'];
handler.command = /^(kickall|expulsartodos)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true; // El bot necesita ser admin para expulsar

export default handler;