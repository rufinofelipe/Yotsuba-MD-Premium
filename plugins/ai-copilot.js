import fetch from 'node-fetch';

async function handler(m, { text }) {
    if (!text) throw "❌ Escribe tu pregunta\n*Ejemplo:* .isagi ¿quién eres?";
    
    try {
        const url = `https://rest.alyabotpe.xyz/ai/copilot?text=${encodeURIComponent(text)}&key=stellar-t1opU0P4`;
        const res = await fetch(url);
        const data = await res.text();
        
        await m.reply(`🤖 *Copilot:*\n\n${data}`);
    } catch {
        throw "❌ Error al conectar con Copilot";
    }
}

handler.help = ["copilot"];
handler.tags = ["ai"];
handler.command = ["copilot"];
handler.limit = true;
handler.register = true;
handler.group = true;

export default handler;