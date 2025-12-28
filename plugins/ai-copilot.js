import fetch from 'node-fetch';

async function handler(m, { text }) {
    if (!text) throw "❌ Escribe tu pregunta\n*Ejemplo:* .isagi ¿quién eres?";
    
    try {
        const url = `https://rest.alyabotpe.xyz/ai/copilot?text=${encodeURIComponent(text)}&key=stellar-t1opU0P4`;
        const res = await fetch(url);
        const data = await res.json(); 
        
    
        const responseText = data.result || data.response || data.text || data;
        
        await m.reply(`🤖 *Copilot:*\n\n${responseText}`);
    } catch (error) {
        console.error(error);
        throw "❌ Error al conectar con Copilot";
    }
}

handler.help = ["isagi"];
handler.tags = ["ai"];
handler.command = ["isagi"];
handler.limit = true;
handler.register = true;
handler.group = true;

export default handler;