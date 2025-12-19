let handler = async (m, { conn, usedPrefix, command, participants }) => {
    try {
        // 1. Verificar si es grupo
        if (!m.isGroup) {
            return conn.reply(m.chat, `⚠️ Este comando solo funciona en grupos.`, m);
        }

        // 2. Verificar que el bot sea administrador
        const groupMetadata = await conn.groupMetadata(m.chat);
        
        // Obtener información del bot
        const botParticipant = groupMetadata.participants.find(p => p.id === conn.user.jid);
        if (!botParticipant?.admin) {
            return conn.reply(m.chat, `❌ El bot debe ser administrador para usar este comando.`, m);
        }

        // 3. Verificar que el remitente sea administrador
        // WhatsApp puede usar diferentes formatos para el ID (con o sin :)
        const sender = m.sender;
        const senderId = sender.includes(':') ? sender.split(':')[0] : sender;
        
        const userParticipant = groupMetadata.participants.find(p => {
            const participantId = p.id.includes(':') ? p.id.split(':')[0] : p.id;
            return participantId === senderId;
        });

        if (!userParticipant) {
            return conn.reply(m.chat, `❌ No se pudo verificar tu participación en el grupo.`, m);
        }

        if (!userParticipant.admin) {
            return conn.reply(m.chat, `❌ Solo los administradores pueden usar este comando.`, m);
        }

        // 4. Obtener lista de participantes a expulsar
        const ownerGroup = groupMetadata.owner || groupMetadata.participants.find(p => p.admin === 'superadmin')?.id;
        const ownerBot = (global.owner?.[0]?.[0] || '') + '@s.whatsapp.net';
        
        // Filtrar participantes para expulsar
        const usersToKick = groupMetadata.participants
            .filter(p => {
                const participantId = p.id.includes(':') ? p.id.split(':')[0] : p.id;
                const botId = conn.user.jid.includes(':') ? conn.user.jid.split(':')[0] : conn.user.jid;
                const ownerGroupId = ownerGroup?.includes(':') ? ownerGroup.split(':')[0] : ownerGroup;
                const ownerBotId = ownerBot?.includes(':') ? ownerBot.split(':')[0] : ownerBot;
                
                return (
                    participantId !== botId && // No el bot
                    participantId !== ownerGroupId && // No el dueño del grupo
                    participantId !== ownerBotId && // No el dueño del bot
                    !p.admin // Solo expulsar no administradores
                );
            })
            .map(p => p.id);

        if (usersToKick.length === 0) {
            return conn.reply(m.chat, `ℹ️ No hay usuarios para expulsar.`, m);
        }

        // 5. Confirmación antes de proceder
        await conn.reply(m.chat, 
            `⚠️ *CONFIRMACIÓN REQUERIDA*\n\n` +
            `Se expulsarán a *${usersToKick.length} usuarios*.\n\n` +
            `Responde con:\n` +
            `• *"sí"* para confirmar\n` +
            `• *"no"* para cancelar\n\n` +
            `Tienes 30 segundos para responder.`,
            m
        );

        // 6. Esperar confirmación
        const confirmationKey = `kickall-confirm-${m.chat}-${senderId}`;
        global.confirmationData = global.confirmationData || {};
        global.confirmationData[confirmationKey] = {
            usersToKick,
            timestamp: Date.now(),
            senderId: senderId
        };

        // Limpiar después de 30 segundos
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
    try {
        if (!m.isGroup || !m.text) return;
        
        const sender = m.sender;
        const senderId = sender.includes(':') ? sender.split(':')[0] : sender;
        const confirmationKey = `kickall-confirm-${m.chat}-${senderId}`;
        const data = global.confirmationData?.[confirmationKey];
        
        if (!data) return;
        
        const response = m.text.toLowerCase().trim();
        
        if (response === 'sí' || response === 'si') {
            // Eliminar datos de confirmación
            delete global.confirmationData[confirmationKey];
            
            // 7. Procesar expulsión de todos los usuarios
            await conn.reply(m.chat, 
                `⏳ Expulsando a ${data.usersToKick.length} usuarios...\n` +
                `Esto puede tomar unos segundos.`,
                m
            );
            
            let successCount = 0;
            let failCount = 0;
            let reportMessage = '';
            
            // 8. Procesar cada usuario
            for (const user of data.usersToKick) {
                try {
                    // Expulsar al usuario
                    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
                    successCount++;
                    
                    // Pequeña pausa para evitar limitaciones de WhatsApp
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (userError) {
                    console.log(`Error con usuario ${user}:`, userError);
                    const username = user.split('@')[0];
                    reportMessage += `✗ ${username}: ${userError.message}\n`;
                    failCount++;
                }
            }
            
            // 9. Reporte final
            const finalMessage = 
                `✅ *Proceso completado*\n\n` +
                `✓ Expulsados exitosamente: ${successCount}\n` +
                `✗ Fallos en expulsión: ${failCount}\n`;
            
            if (reportMessage) {
                await conn.reply(m.chat, finalMessage + `\n📋 Detalles de fallos:\n${reportMessage}`, m);
            } else {
                await conn.reply(m.chat, finalMessage, m);
            }
            
        } else if (response === 'no') {
            delete global.confirmationData[confirmationKey];
            await conn.reply(m.chat, '❌ Comando cancelado.', m);
        }
    } catch (error) {
        console.error('Error en before handler:', error);
        conn.reply(m.chat, `❌ Error: ${error.message}`, m);
    }
};

// Función alternativa más simple (sin confirmación)
const simpleKickAll = async (m, { conn }) => {
    try {
        if (!m.isGroup) return;
        
        const groupMetadata = await conn.groupMetadata(m.chat);
        
        // Verificar que el bot sea admin
        const botParticipant = groupMetadata.participants.find(p => p.id === conn.user.jid);
        if (!botParticipant?.admin) {
            return conn.reply(m.chat, '❌ El bot debe ser administrador.', m);
        }
        
        // Verificar que el usuario sea admin
        const sender = m.sender;
        const userParticipant = groupMetadata.participants.find(p => p.id === sender);
        if (!userParticipant?.admin) {
            return conn.reply(m.chat, '❌ Solo los administradores pueden usar este comando.', m);
        }
        
        // Obtener usuarios a expulsar
        const usersToKick = groupMetadata.participants
            .filter(p => !p.admin && p.id !== conn.user.jid)
            .map(p => p.id);
        
        if (usersToKick.length === 0) {
            return conn.reply(m.chat, 'ℹ️ No hay usuarios para expulsar.', m);
        }
        
        await conn.reply(m.chat, `Expulsando a ${usersToKick.length} usuarios...`, m);
        
        // Expulsar en lotes pequeños
        const batchSize = 3;
        for (let i = 0; i < usersToKick.length; i += batchSize) {
            const batch = usersToKick.slice(i, i + batchSize);
            try {
                await conn.groupParticipantsUpdate(m.chat, batch, 'remove');
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.error('Error en batch:', e);
            }
        }
        
        await conn.reply(m.chat, `✅ Se expulsaron ${usersToKick.length} usuarios.`, m);
        
    } catch (error) {
        console.error('Error en simpleKickAll:', error);
        conn.reply(m.chat, `❌ Error: ${error.message}`, m);
    }
};

// Configuración del comando
handler.help = ['kickall'];
handler.tags = ['group'];
handler.command = /^(kickall|expulsartodos|echaratodos)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true; // El bot necesita ser admin para expulsar

export default handler;