import fetch from 'node-fetch';

let casados = false;
let pareja1 = '';
let pareja2 = '';
let fechaCasamiento = null;
const FOTO = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1767040943824.jpg';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const args = text.trim().split(' ');
  
  if (command === 'casarse') {
    if (casados) {
      const tiempo = new Date() - fechaCasamiento;
      const minutos = Math.floor(tiempo / 60000);
      const segundos = Math.floor((tiempo % 60000) / 1000);
      
      return m.reply(`💑 *YA ESTÁN CASADOS!*\n\n👰 *${pareja1}*\n🤵 *${pareja2}*\n📅 Casados hace: ${minutos}m ${segundos}s\n💔 Para divorciarse: ${usedPrefix}divorcio`);
    }
    
    if (!args[0] || !args[1]) {
      return m.reply(`❌ *FALTAN NOMBRES*\n\nUso: ${usedPrefix}casarse [nombre1] [nombre2]\nEjemplo: ${usedPrefix}casarse Maria Juan`);
    }
    
    pareja1 = args[0];
    pareja2 = args[1];
    casados = true;
    fechaCasamiento = new Date();
    
    try {
      const img = await fetch(FOTO).then(res => res.buffer());
      await conn.sendMessage(m.chat, {
        image: img,
        caption: `🎉 *¡SE CASARON!*\n\n👰 *${pareja1}*\n🤵 *${pareja2}*\n📅 ${fechaCasamiento.toLocaleDateString()}\n⏰ ${fechaCasamiento.toLocaleTimeString()}\n💖 ¡Felicidades!`
      }, { quoted: m });
    } catch (e) {
      await m.reply(`🎉 *¡SE CASARON!*\n\n👰 *${pareja1}*\n🤵 *${pareja2}*\n📅 ${fechaCasamiento.toLocaleDateString()}\n📸 ${FOTO}\n💖 ¡Felicidades!`);
    }
    
  } else if (command === 'divorcio') {
    if (!casados) {
      return m.reply(`💔 *NO ESTÁN CASADOS*\n\nPrimero casense: ${usedPrefix}casarse [nombre1] [nombre2]`);
    }
    
    const fechaDivorcio = new Date();
    const duracion = fechaDivorcio - fechaCasamiento;
    const minutos = Math.floor(duracion / 60000);
    const segundos = Math.floor((duracion % 60000) / 1000);
    
    await m.reply(`💔 *¡SE DIVORCIARON!*\n\n👰 *${pareja1}*\n🤵 *${pareja2}*\n⏳ Matrimonio duró: ${minutos}m ${segundos}s\n📅 Divorcio: ${fechaDivorcio.toLocaleDateString()}\n😭 Fin del amor virtual`);
    
    // Resetear para nuevo casamiento
    casados = false;
    pareja1 = '';
    pareja2 = '';
    fechaCasamiento = null;
  }
};

handler.help = ['casarse', 'divorcio'];
handler.tags = ['juego'];
handler.command = /^(casarse|divorcio)$/i;

export default handler;