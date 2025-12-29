import fetch from 'node-fetch';

let propuestas = new Map(); // Guarda las propuestas: {id: {de: usuario1, para: usuario2, tiempo: Date}}
let casados = new Map(); // Guarda parejas casadas: {id1: id2, id2: id1}

const FOTO = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1767040943824.jpg';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const sender = m.sender;
  const mention = m.mentionedJid[0];
  
  if (command === 'marry' || command === 'casarse') {
    if (!mention) {
      return m.reply(`❌ *DEBES MENCIONAR A ALGUIEN*\n\nEjemplo: ${usedPrefix}marry @usuario\nO responde a un mensaje con: ${usedPrefix}marry`);
    }
    
    if (casados.has(sender)) {
      const parejaId = casados.get(sender);
      const parejaTag = `@${parejaId.split('@')[0]}`;
      return m.reply(`💑 *YA ESTÁS CASADO/A*\n\nEstás casado/a con: ${parejaTag}\n💔 Para divorciarte: ${usedPrefix}divorce`);
    }
    
    if (casados.has(mention)) {
      return m.reply(`💔 *ESA PERSONA YA ESTÁ CASADA*`);
    }
    
    // Verificar si ya hay una propuesta pendiente
    for (let [id, prop] of propuestas) {
      if (prop.de === sender && prop.para === mention) {
        const tiempo = new Date() - prop.tiempo;
        const minutos = Math.floor(tiempo / 60000);
        return m.reply(`⏳ *YA ENVIASTE UNA PROPUESTA*\n\nEspera a que responda (hace ${minutos} min)`);
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
    
    // Enviar propuesta CON LIST RESPONSE
    const mensaje = `💍 *PROPUESTA DE MATRIMONIO*\n\n${userName} le está pidiendo matrimonio a ${mentionName}\n\n*${mentionName}, ¿aceptas?*`;
    
    // Lista de opciones
    const sections = [
      {
        title: '💖 RESPUESTA A LA PROPUESTA',
        rows: [
          { title: '✅ SÍ, ACEPTO CASARME', rowId: `${usedPrefix}accept ${propuestaId}` },
          { title: '❌ NO, RECHAZO', rowId: `${usedPrefix}reject ${propuestaId}` },
          { title: '⏰ ESPERAR UN MOMENTO', rowId: `${usedPrefix}mystatus` }
        ]
      }
    ];
    
    await conn.sendMessage(m.chat, {
      text: mensaje,
      mentions: [sender, mention],
      footer: 'Tienes 5 minutos para responder',
      title: '💍 ¿Aceptas casarte?',
      buttonText: 'SELECCIONA UNA OPCIÓN',
      sections
    }, { quoted: m });
    
    // Eliminar propuesta después de 5 minutos
    setTimeout(() => {
      if (propuestas.has(propuestaId)) {
        propuestas.delete(propuestaId);
        // Notificar expiración
        conn.sendMessage(m.chat, {
          text: `⏰ *PROPUESTA EXPIRADA*\n\nLa propuesta de matrimonio ha expirado después de 5 minutos.`
        }, { quoted: m });
      }
    }, 5 * 60 * 1000);
    
  } else if (command === 'accept') {
    const propuestaId = text.split(' ')[0];
    
    if (!propuestaId || !propuestas.has(propuestaId)) {
      return m.reply('❌ *PROPUESTA NO VÁLIDA O EXPIRADA*');
    }
    
    const propuesta = propuestas.get(propuestaId);
    
    if (propuesta.para !== sender) {
      return m.reply('❌ *ESA PROPUESTA NO ES PARA TI*');
    }
    
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
        caption: `🎉 *¡SE CASARON!*\n\n💍 ${userName} 💖 ${mentionName}\n👰 ${userName}\n🤵 ${mentionName}\n📅 ${fecha.toLocaleDateString()}\n⏰ ${fecha.toLocaleTimeString()}\n\n💖 ¡Felicidades a los recién casados!`
      });
    } catch (e) {
      await conn.sendMessage(m.chat, {
        text: `🎉 *¡SE CASARON!*\n\n💍 ${userName} 💖 ${mentionName}\n👰 ${userName}\n🤵 ${mentionName}\n📅 ${fecha.toLocaleDateString()}\n📸 ${FOTO}\n💖 ¡Felicidades!`
      });
    }
    
    // Enviar mensaje de felicitación con lista
    const sectionsDivorcio = [
      {
        title: '💔 OPCIONES PARA PAREJA CASADA',
        rows: [
          { title: '📊 VER ESTADO DEL MATRIMONIO', rowId: `${usedPrefix}mystatus` },
          { title: '💔 DIVORCIARSE', rowId: `${usedPrefix}divorce` },
          { title: '💌 ENVIAR MENSAJE ROMÁNTICO', rowId: `${usedPrefix}lovemsg` }
        ]
      }
    ];
    
    setTimeout(() => {
      conn.sendMessage(m.chat, {
        text: `💑 *PAREJA REGISTRADA*\n\n${userName} y ${mentionName} ya están oficialmente casados.\n\n¿Qué desean hacer ahora?`,
        footer: '¡Que vivan los novios!',
        title: '👰💍🤵',
        buttonText: 'VER OPCIONES',
        sections: sectionsDivorcio
      });
    }, 2000);
    
  } else if (command === 'reject') {
    const propuestaId = text.split(' ')[0];
    
    if (!propuestaId || !propuestas.has(propuestaId)) {
      return m.reply('❌ *PROPUESTA NO VÁLIDA O EXPIRADA*');
    }
    
    const propuesta = propuestas.get(propuestaId);
    
    if (propuesta.para !== sender) {
      return m.reply('❌ *ESA PROPUESTA NO ES PARA TI*');
    }
    
    propuestas.delete(propuestaId);
    
    const userName = await conn.getName(propuesta.de);
    const mentionName = await conn.getName(propuesta.para);
    
    await conn.sendMessage(m.chat, {
      text: `💔 *PROPUESTA RECHAZADA*\n\n${mentionName} rechazó la propuesta de matrimonio de ${userName}\n\n😢 ${userName}, mejor suerte la próxima vez.`
    });
    
  } else if (command === 'divorce' || command === 'divorcio') {
    if (!casados.has(sender)) {
      return m.reply('💔 *NO ESTÁS CASADO/A*\n\nUsa .marry @usuario para proponer matrimonio');
    }
    
    const parejaId = casados.get(sender);
    const parejaName = await conn.getName(parejaId);
    const userName = await conn.getName(sender);
    
    // CONFIRMAR DIVORCIO CON LIST
    const sectionsConfirm = [
      {
        title: '💔 CONFIRMAR DIVORCIO',
        rows: [
          { title: '✅ SÍ, DIVORCIARME', rowId: `${usedPrefix}confirmdivorce ${sender}_${parejaId}` },
          { title: '❌ NO, CANCELAR', rowId: `${usedPrefix}canceldivorce` }
        ]
      }
    ];
    
    await conn.sendMessage(m.chat, {
      text: `💔 *¿SEGUR@ QUE QUIERES DIVORCIARTE?*\n\nEstás a punto de divorciarte de ${parejaName}\n\n⚠️ Esta acción no se puede deshacer.`,
      footer: 'Piensa bien tu decisión',
      title: 'CONFIRMAR DIVORCIO',
      buttonText: 'CONFIRMAR OPCION',
      sections: sectionsConfirm
    });
    
  } else if (command === 'confirmdivorce') {
    const [userId, parejaId] = text.split('_');
    
    if (userId !== sender) {
      return m.reply('❌ *NO PUEDES CONFIRMAR ESE DIVORCIO*');
    }
    
    if (!casados.has(sender)) {
      return m.reply('💔 *YA NO ESTÁS CASADO/A*');
    }
    
    const parejaName = await conn.getName(parejaId);
    const userName = await conn.getName(sender);
    
    // Divorciarlos
    casados.delete(sender);
    casados.delete(parejaId);
    
    await conn.sendMessage(m.chat, {
      text: `💔 *¡SE DIVORCIARON!*\n\n📄 Acta de divorcio firmada:\n${userName} 👉❌👈 ${parejaName}\n\n😭 Fin del amor virtual.\n\n💍 Para casarse de nuevo: ${usedPrefix}marry @usuario`
    });
    
  } else if (command === 'canceldivorce') {
    await m.reply('✅ *DIVORCIO CANCELADO*\n\n💖 Sigan siendo felices juntos.');
    
  } else if (command === 'mystatus' || command === 'micasamiento') {
    if (casados.has(sender)) {
      const parejaId = casados.get(sender);
      const parejaName = await conn.getName(parejaId);
      
      const sectionsEstado = [
        {
          title: '💑 OPCIONES DE PAREJA',
          rows: [
            { title: '💔 SOLICITAR DIVORCIO', rowId: `${usedPrefix}divorce` },
            { title: '💌 ENVIAR MENSAJE DE AMOR', rowId: `${usedPrefix}lovemsg` },
            { title: '📊 VER ESTADÍSTICAS', rowId: `${usedPrefix}statslove` }
          ]
        }
      ];
      
      await conn.sendMessage(m.chat, {
        text: `💑 *ESTÁS CASADO/A*\n\n💖 Con: ${parejaName}\n👤 ID: ${parejaId.split('@')[0]}\n💍 Estado: Felizmente casados`,
        footer: '¿Qué deseas hacer?',
        title: 'ESTADO DE MATRIMONIO',
        buttonText: 'VER OPCIONES',
        sections: sectionsEstado
      });
      
    } else {
      // Verificar propuestas pendientes
      let tienePropuestas = false;
      for (let [id, prop] of propuestas) {
        if (prop.para === sender || prop.de === sender) {
          tienePropuestas = true;
          break;
        }
      }
      
      const sectionsSoltero = [
        {
          title: '💍 OPCIONES PARA SOLTER@',
          rows: [
            { title: '💌 PROPONER MATRIMONIO', rowId: `${usedPrefix}marry` },
            { title: '📨 VER PROPUESTAS PENDIENTES', rowId: `${usedPrefix}checkproposals` },
            { title: '💔 HISTORIAL DE RELACIONES', rowId: `${usedPrefix}lovehistory` }
          ]
        }
      ];
      
      await conn.sendMessage(m.chat, {
        text: `💔 *ESTADO: SOLTERO/A*\n\n${tienePropuestas ? '📨 Tienes propuestas pendientes\n' : ''}💍 Para proponer matrimonio:\n${usedPrefix}marry @usuario`,
        footer: 'Encuentra tu media naranja',
        title: 'ESTADO DE SOLTER@',
        buttonText: 'VER OPCIONES',
        sections: sectionsSoltero
      });
    }
    
  } else if (command === 'checkproposals') {
    let propuestasRecibidas = [];
    let propuestasEnviadas = [];
    
    for (let [id, prop] of propuestas) {
      if (prop.para === sender) {
        const deName = await conn.getName(prop.de);
        const tiempo = new Date() - prop.tiempo;
        const minutos = Math.floor(tiempo / 60000);
        const segundosRestantes = 300 - Math.floor(tiempo / 1000); // 5 minutos = 300 segundos
        
        propuestasRecibidas.push({
          title: `💍 PROPUESTA DE ${deName}`,
          description: `Hace ${minutos} min | Expira en ${Math.floor(segundosRestantes / 60)}:${(segundosRestantes % 60).toString().padStart(2, '0')}`,
          rowId: `${usedPrefix}respond ${id}`
        });
      }
      if (prop.de === sender) {
        const paraName = await conn.getName(prop.para);
        const tiempo = new Date() - prop.tiempo;
        const minutos = Math.floor(tiempo / 60000);
        
        propuestasEnviadas.push({
          title: `💌 PARA ${paraName}`,
          description: `Esperando respuesta (${minutos} min)`,
          rowId: `${usedPrefix}viewprop ${id}`
        });
      }
    }
    
    const sections = [];
    
    if (propuestasRecibidas.length > 0) {
      sections.push({
        title: '📨 PROPUESTAS RECIBIDAS',
        rows: propuestasRecibidas
      });
    }
    
    if (propuestasEnviadas.length > 0) {
      sections.push({
        title: '📤 PROPUESTAS ENVIADAS',
        rows: propuestasEnviadas
      });
    }
    
    if (sections.length === 0) {
      return m.reply('📭 *NO HAY PROPUESTAS PENDIENTES*');
    }
    
    await conn.sendMessage(m.chat, {
      text: '📬 *PROPUESTAS PENDIENTES*',
      footer: 'Selecciona una para responder',
      title: 'MENÚ DE PROPUESTAS',
      buttonText: 'VER PROPUESTAS',
      sections
    });
    
  } else if (command === 'lovemsg') {
    if (casados.has(sender)) {
      const parejaId = casados.get(sender);
      const parejaName = await conn.getName(parejaId);
      
      const mensajes = [
        `💖 Te amo, ${parejaName}`,
        `🌹 Eres lo mejor que me ha pasado`,
        `💕 Mi corazón late por ti, ${parejaName}`,
        `✨ Eres mi sol en los días grises`,
        `💑 Contigo quiero envejecer`
      ];
      
      const mensajeAleatorio = mensajes[Math.floor(Math.random() * mensajes.length)];
      
      await conn.sendMessage(m.chat, {
        text: `💌 *MENSAJE DE AMOR PARA ${parejaName}*\n\n"${mensajeAleatorio}"\n\nDe: @${sender.split('@')[0]}`,
        mentions: [parejaId]
      });
    } else {
      return m.reply('💔 *NO ESTÁS CASADO/A PARA ENVIAR MENSAJES DE AMOR*');
    }
  }
};

handler.help = ['marry', 'divorce', 'mystatus', 'checkproposals', 'lovemsg'];
handler.tags = ['juego', 'rg'];
handler.command = /^(marry|casarse|accept|aceptar|reject|rechazar|divorce|divorcio|mystatus|micasamiento|checkproposals|lovemsg|confirmdivorce|canceldivorce)$/i;

export default handler;