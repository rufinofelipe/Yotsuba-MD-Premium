import fetch from 'node-fetch';

const API_KEY = 'stellar-t1opU0P4';
const API_URL = 'https://rest.alyabotpe.xyz/ai/copilot';

async function handler(m, { text }) {
    if (!text) {
        throw "❌ Escribe tu pregunta\n*Ejemplo:* .copilot ¿quién eres?";
    }
    
    try {

        const url = `${API_URL}?text=${encodeURIComponent(text)}&key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        
        console.log('Respuesta de la API:', JSON.stringify(data, null, 2));
    
        const responseText = data.result || data.response || data.answer || data.text || data.message || JSON.stringify(data);
        
        await m.reply(`${responseText}`);
        
    } catch (error) {
        console.error('Error en Copilot:', error);
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