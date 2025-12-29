let casados = false;
let pareja1 = 'Ana';
let pareja2 = 'Carlos';

handler.help = ['casarse', 'divorcio'];
handler.tags = ['juego'];
handler.command = /^(casarse|divorcio)$/i;

export default handler;

handler.before = async function (m, { conn, text, usedPrefix, command }) {
  const args = text.trim().split(' ');
  
  if (command === 'casarse') {
    if (casados) {
      return m.reply(`💑 Ya están casados!\n${pareja1} 💖 ${pareja2}\n💔 ${usedPrefix}divorcio`);
    }
    
    pareja1 = args[0] || 'Novia';
    pareja2 = args[1] || 'Novio';
    casados = true;
    
    const foto = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1767040943824.jpg';
    
    await conn.sendMessage(m.chat, {
      image: { url: foto },
      caption: `🎉 ¡${pareja1} y ${pareja2} se casaron!\n💖 ¡Felicidades!`
    }, { quoted: m });
    
  } else if (command === 'divorcio') {
    if (!casados) {
      return m.reply(`💔 No están casados\n💍 ${usedPrefix}casarse nombre1 nombre2`);
    }
    
    await m.reply(`💔 ${pareja1} y ${pareja2} se divorciaron\n😭 Fin del amor`);
    
    pareja1 = 'Ana';
    pareja2 = 'Carlos';
    casados = false;
  }
};