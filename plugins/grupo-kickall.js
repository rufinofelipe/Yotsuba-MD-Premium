// Comando simple y directo
let handler = async (m, { conn }) => {
    if (!m.isGroup) return;
    
    const groupMetadata = await conn.groupMetadata(m.chat);
    
    // Verificar admin
    const sender = m.sender;
    const user = groupMetadata.participants.find(p => p.id === sender);
    if (!user?.admin) return m.reply('❌ Solo admins.');
    
    // Usuarios a expulsar (todos menos admins y bot)
    const users = groupMetadata.participants
        .filter(p => !p.admin && p.id !== conn.user.jid)
        .map(p => p.id);
    
    if (users.length === 0) return m.reply('ℹ️ No hay usuarios para expulsar.');
    
    await m.reply(`Expulsando ${users.length} usuarios...`);
    
    // Expulsar
    for (const user of users) {
        try {
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
            console.log('Error con:', user, e);
        }
    }
    
    await m.reply(`✅ Expulsados: ${users.length}`);
};

handler.help = ['kickall'];
handler.tags = ['group'];
handler.command = /^kickall$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;