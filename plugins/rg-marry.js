import fetch from 'node-fetch';

let propuestas = new Map(); // Guarda las propuestas: {id: {de: usuario1, para: usuario2, tiempo: Date}}
let casados = new Map(); // Guarda parejas casadas: {id1: id2, id2: id1}

const FOTO = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1767040943824.jpg';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const sender = m.sender;
  const mention = m.mentionedJid[0];
  
  if (command === 'marry' || command === 'casarse') {
    // Verificar si mencionó a alguien
    if (!mention) {
      return m.reply(`❌ *DEBES MENCIONAR A ALGUIEN*\n\nEjemplo: ${usedPrefix}marry @usuario\nO responde a un mensaje con: ${usedPrefix}marry`);
    }
    
    // Verificar si ya está casado
    if (casados.has(sender)) {
      const parejaId = casados.get(sender);
      const parejaName = await conn.getName(parejaId);
      return m.reply(`💑 *YA ESTÁS CASADO/A*\n\nEstás casado/a con: @${parejaId.split('@')[0]}\n💔 Para divorciarte: ${usedPrefix}divorce`);
    }
    
    // Verificar si la persona mencionada ya está casada
    if (casados.has(mention)) {
      return m.reply(`💔 *ESA PERSONA YA ESTÁ CASADA*\nNo puedes proponerle matrimonio.`);
    }
    
    // Verificar si ya hay una propuesta pendiente
    for (let [id, prop] of propuestas) {
      if (prop.de === sender && prop.para === mention) {
        const tiempo = new Date() - prop.tiempo;
        const minutos = Math.floor(tiempo / 60000);
        return m.reply(`⏳ *YA ENVIASTE UNA PROPUESTA*\n\nLe propusiste matrimonio hace ${minutos} minuto(s)\nEspera a que responda.`);
      }
    }
    
    // Crear nueva propuesta
    const propuestaId = Date.now().toString();
    propuestas.set(propuestaId, {
      de: sender,
      para: mention,
      tiempo: new Date()
    });
    
    const userName = await conn.getName(sender);
    const mentionName = await conn.getName(mention);
    
    // Enviar propuesta con botones
    const mensaje = `💍 *PROPUESTA DE MATRIMONIO*\n\n@${sender.split('@')[0]} le está pidiendo matrimonio a @${mention.split('@')[0]}\n\n¿Aceptas?`;
    
    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [sender, mention],
      contextInfo: {
        mentionedJid: [sender, mention],
        externalAdReply: {
          title: '💖 ¿Aceptas casarte?',
          body: `${userName} ❤️ ${mentionName}`,
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: true
        }
      },
      footer: 'Tienes 5 minutos para responder',
      buttons: [
        { buttonId: `${usedPrefix}accept ${propuestaId}`, buttonText: { displayText: '✅ Sí, acepto' }, type: 1 },
        { buttonId: `${usedPrefix}reject ${propuestaId}`, buttonText: { displayText: '❌ No, rechazo' }, type: 1 }
      ]
    }, { quoted: m });
    
    // Eliminar propuesta después de 5 minutos
    setTimeout(() => {
      if (propuestas.has(propuestaId)) {
        propuestas.delete(propuestaId);
      }
    }, 5 * 60 * 1000);
    
  } else if (command === 'accept') {
    const propuestaId = text.split(' ')[0];
    
    if (!propuestaId || !propuestas.has(propuestaId)) {
      return m.reply('❌ *PROPUESTA NO VÁLIDA O EXPIRADA*');
    }
    
    const propuesta = propuestas.get(propuestaId);
    
    // Verificar si el que acepta es la persona correcta
    if (propuesta.para !== sender) {
      return m.reply('❌ *ESA PROPUESTA NO ES PARA TI*');
    }
    
    // Verificar si ya están casados
    if (casados.has(propuesta.de) || casados.has(propuesta.para)) {
      propuestas.delete(propuestaId);
      return m.reply('💔 *ALGUIEN YA ESTÁ CASADO*');
    }
    
    // Casarlos
    casados.set(propuesta.de, propuesta.para);
    casados.set(propuesta.para, propuesta.de);
    propuestas.delete(propuestaId);
    
    const userName = await conn.getName(propuesta.de);
    const mentionName = await conn.getName(propuesta.para);
    const fecha = new Date();
    
    // Enviar foto del casamiento
    try {
      const img = await fetch(FOTO).then(res => res.buffer());
      await conn.sendMessage(m.chat, {
        image: img,
        caption: `🎉 *¡SE CASARON!*\n\n💍 @${propuesta.de.split('@')[0]} 💖 @${propuesta.para.split('@')[0]}\n👰 ${userName}\n🤵 ${mentionName}\n📅 ${fecha.toLocaleDateString()}\n⏰ ${fecha.toLocaleTimeString()}\n\n💖 ¡Felicidades a los recién casados!`,
        mentions: [propuesta.de, propuesta.para]
      });
    } catch (e) {
      await m.reply(`🎉 *¡SE CASARON!*\n\n💍 @${propuesta.de.split('@')[0]} 💖 @${propuesta.para.split('@')[0]}\n👰 ${userName}\n🤵 ${mentionName}\n📅 ${fecha.toLocaleDateString()}\n📸 ${FOTO}\n💖 ¡Felicidades!`);
    }
    
  } else if (command === 'reject') {
    const propuestaId = text.split(' ')[0];
    
    if (!propuestaId || !propuestas.has(propuestaId)) {
      return m.reply('❌ *PROPUESTA NO VÁLIDA O EXPIRADA*');
    }
    
    const propuesta = propuestas.get(propuestaId);
    
    // Verificar si el que rechaza es la persona correcta
    if (propuesta.para !== sender) {
      return m.reply('❌ *ESA PROPUESTA NO ES PARA TI*');
    }
    
    propuestas.delete(propuestaId);
    
    const userName = await conn.getName(propuesta.de);
    
    await m.reply(`💔 *PROPUESTA RECHAZADA*\n\n@${sender.split('@')[0]} rechazó la propuesta de @${propuesta.de.split('@')[0]}\n\n😢 ${userName}, mejor suerte la próxima vez.`, 
      { mentions: [sender, propuesta.de] });
    
  } else if (command === 'divorce' || command === 'divorcio') {
    // Verificar si está casado
    if (!casados.has(sender)) {
      return m.reply('💔 *NO ESTÁS CASADO/A*\n\nUsa .marry @usuario para proponer matrimonio');
    }
    
    const parejaId = casados.get(sender);
    const parejaName = await conn.getName(parejaId);
    const userName = await conn.getName(sender);
    
    // Divorciarlos
    casados.delete(sender);
    casados.delete(parejaId);
    
    await m.reply(`💔 *¡SE DIVORCIARON!*\n\n📄 Acta de divorcio firmada:\n@${sender.split('@')[0]} 👉❌👈 @${parejaId.split('@')[0]}\n\n${userName} y ${parejaName} ya no están casados.\n😭 Fin del amor virtual.`,
      { mentions: [sender, parejaId] });
    
  } else if (command === 'mystatus' || command === 'micasamiento') {
    if (casados.has(sender)) {
      const parejaId = casados.get(sender);
      const parejaName = await conn.getName(parejaId);
      
      // Buscar propuestas enviadas
      let propuestasEnviadas = [];
      for (let [id, prop] of propuestas) {
        if (prop.de === sender) {
          const tiempo = new Date() - prop.tiempo;
          const minutos = Math.floor(tiempo / 60000);
          propuestasEnviadas.push(`⏳ Esperando respuesta (${minutos} min)`);
        }
      }
      
      let estado = `💑 *ESTÁS CASADO/A*\n\n💖 Con: @${parejaId.split('@')[0]}\n👤 Nombre: ${parejaName}\n\n`;
      
      if (propuestasEnviadas.length > 0) {
        estado += `📨 Propuestas pendientes:\n${propuestasEnviadas.join('\n')}\n\n`;
      }
      
      estado += `💔 Para divorciarte: ${usedPrefix}divorce`;
      
      return m.reply(estado, { mentions: [parejaId] });
    } else {
      // Verificar si tiene propuestas pendientes
      let propuestasRecibidas = [];
      let propuestasEnviadas = [];
      
      for (let [id, prop] of propuestas) {
        if (prop.para === sender) {
          const deName = await conn.getName(prop.de);
          const tiempo = new Date() - prop.tiempo;
          const minutos = Math.floor(tiempo / 60000);
          propuestasRecibidas.push(`💍 De: @${prop.de.split('@')[0]} (hace ${minutos} min)\n   Aceptar: ${usedPrefix}accept ${id}`);
        }
        if (prop.de === sender) {
          const paraName = await conn.getName(prop.para);
          const tiempo = new Date() - prop.tiempo;
          const minutos = Math.floor(tiempo / 60000);
          propuestasEnviadas.push(`💌 Para: @${prop.para.split('@')[0]} (hace ${minutos} min)`);
        }
      }
      
      let estado = `💔 *ESTADO: SOLTERO/A*\n\n`;
      
      if (propuestasRecibidas.length > 0) {
        estado += `📨 *Propuestas recibidas:*\n${propuestasRecibidas.join('\n\n')}\n\n`;
      }
      
      if (propuestasEnviadas.length > 0) {
        estado += `📤 *Propuestas enviadas:*\n${propuestasEnviadas.join('\n')}\n\n`;
      }
      
      if (propuestasRecibidas.length === 0 && propuestasEnviadas.length === 0) {
        estado += `💍 Para proponer matrimonio:\n${usedPrefix}marry @usuario`;
      }
      
      return m.reply(estado);
    }
  }
};

handler.help = ['marry', 'accept', 'reject', 'divorce', 'mystatus'];
handler.tags = ['juego', 'rg'];
handler.command = /^(marry|casarse|accept|aceptar|reject|rechazar|divorce|divorcio|mystatus|micasamiento)$/i;

export default handler;