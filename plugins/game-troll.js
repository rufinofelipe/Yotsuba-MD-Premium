const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        
        if (!msg.message || msg.key.fromMe) return;

        const messageText = msg.message.conversation || 
                           msg.message.extendedTextMessage?.text || 
                           msg.message.imageMessage?.caption || 
                           '';

        // Verificar si el mensaje contiene "follar" (case insensitive)
        if (messageText.toLowerCase().includes('follar')) {
            const videoUrl = 'https://files.catbox.moe/clgbnh.mp4';
            
            try {
                await sock.sendMessage(msg.key.remoteJid, {
                    video: { url: videoUrl },
                    caption: '¡Aquí tienes el video! 🎥',
                    gifPlayback: false // Cambia a true si quieres que se reproduzca como GIF
                });
            } catch (error) {
                console.error('Error al enviar el video:', error);
            }
        }
    });
}

startBot().catch(console.error);