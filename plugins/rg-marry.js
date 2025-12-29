import fetch from 'node-fetch';

let casados = false;
let pareja1 = 'Ana';
let pareja2 = 'Carlos';
let fechaCasamiento = null;
let fechaDivorcio = null;
let contador = 0;
const FOTO = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1767040943824.jpg';

handler.help = ['casarse', 'divorcio'];
handler.tags = ['juego'];
handler.command = /^(casarse|divorcio)$/i;

export default handler;

handler.before = async function (m, { conn, text, usedPrefix, command }) {
  const args = text.trim().split(' ');
  
  if (command === 'casarse') {
    // Si ya están casados
    if (casados) {
      const tiempo = new Date() - fechaCasamiento;
      const minutos = Math.floor(tiempo / 60000);
      const segundos = Math.floor((tiempo % 60000) / 1000);
      
      return m.reply(`💑 *YA ESTÁN CASADOS!*\n\n👰 *${pareja1}*\n🤵 *${pareja2}*\n📅 Casados hace: ${minutos}m ${segundos}s\n💔 Para divorciarse: ${usedPrefix}divorcio`);
    }
    
    // Nuevo casamiento
    const nombre1 = args[0] || 'Novia';
    const nombre2 = args[1] || 'Novio';
    
    pareja1 = nombre1;
    pareja2 = nombre2;
    casados = true;
    fechaCasamiento = new Date();
    fechaDivorcio = null;
    contador++;
    
    try {
      // Intentar enviar la imagen
      const img = await fetch(FOTO).then(res => res.buffer());
      await conn.sendMessage(m.chat, {
        image: img,
        caption: `🎉 *¡SE CASARON!*\n\n👰 *${nombre1}*\n🤵 *${nombre2}*\n📅 ${fechaCasamiento.toLocaleDateString()}\n💖 ¡Felicidades!`
      }, { quoted: m });
    } catch (e) {
      // Si falla la imagen, enviar solo texto
      await m.reply(`🎉 *¡SE CASARON!*\n\n👰 *${nombre1}*\n🤵 *${nombre2}*\n📅 ${fechaCasamiento.toLocaleDateString()}\n📸 ${FOTO}\n💖 ¡Felicidades!`);
    }
    
  } else if (command === 'divorcio') {
    // Si no están casados
    if (!casados) {
      return m.reply(`💔 *NO ESTÁN CASADOS*\n\nPrimero casense: ${usedPrefix}casarse [nombre1] [nombre2]`);
    }
    
    // Procesar divorcio
    casados = false;
    fechaDivorcio = new Date();
    
    const duracion = fechaDivorcio - fechaCasamiento;
    const minutos = Math.floor(duracion / 60000);
    const segundos = Math.floor((duracion % 60000) / 1000);
    
    const mensaje = `💔 *¡SE DIVORCIARON!*\n\n👥 ${pareja1} & ${pareja2}\n⏳ Matrimonio: ${minutos}m ${segundos}s\n📅 Divorcio: ${fechaDivorcio.toLocaleDateString()}`;
    
    // Resetear nombres
    pareja1 = 'Ana';
    pareja2 = 'Carlos';
    
    return m.reply(mensaje);
  }
};