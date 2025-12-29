import fetch from 'node-fetch';

const casamientoState = {
  casados: false,
  pareja1: 'Ana',
  pareja2: 'Carlos',
  fechaCasamiento: null,
  fechaDivorcio: null,
  contador: 0
};

const FOTO_CASAMIENTO = 'https://raw.githubusercontent.com/ANDERSONARRUE/Img.2/main/upload_1767040943824.jpg';

handler.help = ['casarse', 'divorcio', 'estadocasamiento', 'fotocasamiento', 'certificado'];
handler.tags = ['juego', 'rg', 'fun'];
handler.command = /^(casarse|matrimonio|wedding|divorcio|divorciar|estadocasamiento|fotocasamiento|certificadocasamiento)$/i;

export default handler;

handler.before = async function (m, { conn, text, usedPrefix, command }) {
  const args = text.trim().split(' ');
  const comando = command.toLowerCase();
  
  try {
    // 📌 COMANDO: CASARSE
    if (/^(casarse|matrimonio|wedding)$/i.test(command)) {
      const nombre1 = args[0] || 'Persona1';
      const nombre2 = args[1] || 'Persona2';
      
      if (casamientoState.casados) {
        const tiempo = new Date() - casamientoState.fechaCasamiento;
        const segundos = Math.floor(tiempo / 1000);
        const minutos = Math.floor(segundos / 60);
        const horas = Math.floor(minutos / 60);
        
        let tiempoTexto = '';
        if (horas > 0) tiempoTexto = `${horas}h ${minutos % 60}m`;
        else if (minutos > 0) tiempoTexto = `${minutos}m ${segundos % 60}s`;
        else tiempoTexto = `${segundos}s`;
        
        return m.reply(`💑 *¡YA ESTÁN CASADOS!*\n\n` +
          `👰 *Novia:* ${casamientoState.pareja1}\n` +
          `🤵 *Novio:* ${casamientoState.pareja2}\n` +
          `📅 *Casados desde:* ${tiempoTexto}\n` +
          `💔 *Para divorciarse:* ${usedPrefix}divorcio`);
      }
      
      casamientoState.pareja1 = nombre1;
      casamientoState.pareja2 = nombre2;
      casamientoState.casados = true;
      casamientoState.fechaCasamiento = new Date();
      casamientoState.fechaDivorcio = null;
      casamientoState.contador++;
      
      try {
        const img = await fetch(FOTO_CASAMIENTO).then(res => res.buffer());
        await conn.sendMessage(m.chat, {
          image: img,
          caption: `🎉 *¡FELICIDADES! SE HAN CASADO* 🎉\n\n` +
            `👰 *Novia:* ${nombre1}\n` +
            `🤵 *Novio:* ${nombre2}\n` +
            `📅 *Fecha:* ${casamientoState.fechaCasamiento.toLocaleDateString('es-ES')}\n` +
            `⏰ *Hora:* ${casamientoState.fechaCasamiento.toLocaleTimeString('es-ES')}\n\n` +
            `💖 *"Los declaro marido y mujer"*\n` +
            `💔 *Para divorciarse:* ${usedPrefix}divorcio\n` +
            `📊 *Ver estado:* ${usedPrefix}estadocasamiento`
        }, { quoted: m });
      } catch {
        await m.reply(`🎉 *¡FELICIDADES! SE HAN CASADO* 🎉\n\n` +
          `👰 *Novia:* ${nombre1}\n` +
          `🤵 *Novio:* ${nombre2}\n` +
          `📅 *Fecha:* ${casamientoState.fechaCasamiento.toLocaleDateString('es-ES')}\n\n` +
          `📸 *Foto del casamiento:*\n${FOTO_CASAMIENTO}\n\n` +
          `💖 *"Los declaro marido y mujer"*\n` +
          `💔 *Divorcio:* ${usedPrefix}divorcio`);
      }
      return;
    }
    
    // 📌 COMANDO: DIVORCIO
    if (/^(divorcio|divorciar)$/i.test(command)) {
      if (!casamientoState.casados) {
        return m.reply(`💔 *NO ESTÁN CASADOS*\n\n` +
          `Primero deben casarse usando:\n` +
          `${usedPrefix}casarse [nombre1] [nombre2]\n\n` +
          `Ejemplo: ${usedPrefix}casarse Ana Carlos`);
      }
      
      casamientoState.casados = false;
      casamientoState.fechaDivorcio = new Date();
      
      const duracion = casamientoState.fechaDivorcio - casamientoState.fechaCasamiento;
      const segundos = Math.floor(duracion / 1000);
      const minutos = Math.floor(segundos / 60);
      const horas = Math.floor(minutos / 60);
      
      let duracionTexto = '';
      if (horas > 0) duracionTexto = `${horas}h ${minutos % 60}m`;
      else if (minutos > 0) duracionTexto = `${minutos}m ${segundos % 60}s`;
      else duracionTexto = `${segundos}s`;
      
      const mensaje = `💔 *¡SE HAN DIVORCIADO!* 💔\n\n` +
        `📄 *Acta de Divorcio*\n` +
        `👥 *Pareja:* ${casamientoState.pareja1} & ${casamientoState.pareja2}\n` +
        `📅 *Fecha divorcio:* ${casamientoState.fechaDivorcio.toLocaleDateString('es-ES')}\n` +
        `⏳ *Duración matrimonio:* ${duracionTexto}\n\n` +
        `💰 *División de bienes:*\n` +
        `• ${casamientoState.pareja1}: 💍👗💄\n` +
        `• ${casamientoState.pareja2}: 👔🎩💼\n\n` +
        `💑 *Para casarse de nuevo:*\n${usedPrefix}casarse`;
      
      // Resetear para próximo casamiento
      casamientoState.pareja1 = 'Ana';
      casamientoState.pareja2 = 'Carlos';
      
      return m.reply(mensaje);
    }
    
    // 📌 COMANDO: ESTADO CASAMIENTO
    if (/^estadocasamiento$/i.test(command)) {
      if (casamientoState.casados) {
        const tiempo = new Date() - casamientoState.fechaCasamiento;
        const segundos = Math.floor(tiempo / 1000);
        const minutos = Math.floor(segundos / 60);
        const horas = Math.floor(minutos / 60);
        
        let tiempoTexto = '';
        if (horas > 0) tiempoTexto = `${horas}h ${minutos % 60}m`;
        else if (minutos > 0) tiempoTexto = `${minutos}m ${segundos % 60}s`;
        else tiempoTexto = `${segundos}s`;
        
        return m.reply(`📊 *ESTADO: CASADOS* 💑\n\n` +
          `👫 *Pareja:* ${casamientoState.pareja1} & ${casamientoState.pareja2}\n` +
          `📅 *Casados hace:* ${tiempoTexto}\n` +
          `🏆 *Casamientos totales:* ${casamientoState.contador}\n\n` +
          `💔 *Divorcio:* ${usedPrefix}divorcio\n` +
          `📸 *Foto:* ${usedPrefix}fotocasamiento\n` +
          `📜 *Certificado:* ${usedPrefix}certificadocasamiento`);
      } else {
        return m.reply(`📊 *ESTADO: SOLTEROS* 💔\n\n` +
          `👥 *Última pareja:* ${casamientoState.pareja1} & ${casamientoState.pareja2}\n` +
          `📅 *Último divorcio:* ${casamientoState.fechaDivorcio ? 
            casamientoState.fechaDivorcio.toLocaleDateString('es-ES') : 'Nunca'}\n` +
          `🏆 *Casamientos totales:* ${casamientoState.contador}\n\n` +
          `💑 *Para casarse:*\n${usedPrefix}casarse [nombre1] [nombre2]\n` +
          `Ejemplo: ${usedPrefix}casarse María José`);
      }
    }
    
    // 📌 COMANDO: FOTO CASAMIENTO
    if (/^fotocasamiento$/i.test(command)) {
      try {
        const img = await fetch(FOTO_CASAMIENTO).then(res => res.buffer());
        return conn.sendMessage(m.chat, {
          image: img,
          caption: `📸 *FOTO DEL CASAMIENTO*\n\n` +
            `👰🤵 *Pareja actual:* ${casamientoState.pareja1} & ${casamientoState.pareja2}\n` +
            `📅 *Fecha:* ${casamientoState.fechaCasamiento ? 
              casamientoState.fechaCasamiento.toLocaleDateString('es-ES') : 'No casados aún'}\n\n` +
            `💑 *Para casarse:* ${usedPrefix}casarse\n` +
            `📊 *Ver estado:* ${usedPrefix}estadocasamiento`
        }, { quoted: m });
      } catch {
        return m.reply(`📸 *FOTO DEL CASAMIENTO*\n\n` +
          `${FOTO_CASAMIENTO}\n\n` +
          `👰🤵 *Pareja actual:* ${casamientoState.pareja1} & ${casamientoState.pareja2}\n` +
          `💑 *Para casarse:* ${usedPrefix}casarse`);
      }
    }
    
    // 📌 COMANDO: CERTIFICADO CASAMIENTO
    if (/^certificadocasamiento$/i.test(command)) {
      if (!casamientoState.casados) {
        return m.reply(`📜 *NO HAY CERTIFICADO*\n\n` +
          `Primero deben casarse usando:\n` +
          `${usedPrefix}casarse [nombre1] [nombre2]\n\n` +
          `Ejemplo: ${usedPrefix}casarse Luis Ana`);
      }
      
      const certificado = `📜 *CERTIFICADO DE MATRIMONIO VIRTUAL*\n\n` +
        `✨ *Certificamos que* ✨\n\n` +
        `         💖 ${casamientoState.pareja1} 💖\n` +
        `            Y\n` +
        `         💖 ${casamientoState.pareja2} 💖\n\n` +
        `📅 *Se unieron en matrimonio el:*\n` +
        `${casamientoState.fechaCasamiento.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}\n` +
        `⏰ *A las:* ${casamientoState.fechaCasamiento.toLocaleTimeString('es-ES')}\n\n` +
        `🏛️ *Registro Virtual N°:* #${casamientoState.contador.toString().padStart(4, '0')}\n\n` +
        `⚠️ *Sin valor legal - Solo simulación*\n` +
        `💔 *Para divorciarse:* ${usedPrefix}divorcio`;
      
      return m.reply(certificado);
    }
    
  } catch (error) {
    console.error(error);
    return m.reply(`❌ *Error en el sistema de casamiento*\n\n` +
      `💡 *Comandos disponibles:*\n` +
      `• ${usedPrefix}casarse [nombre1] [nombre2]\n` +
      `• ${usedPrefix}divorcio\n` +
      `• ${usedPrefix}estadocasamiento\n` +
      `• ${usedPrefix}fotocasamiento\n` +
      `• ${usedPrefix}certificadocasamiento`);
  }
};