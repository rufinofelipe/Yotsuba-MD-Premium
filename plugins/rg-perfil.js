let handler = async (m, { conn, args }) => {
    // ... (tu lógica para obtener userId, user, name, etc., se mantiene igual hasta la variable `perfil`) ...

    let profileText = `
⚽️ *Perfil* ◢@${userId.split('@')[0]}◤
${description}

🐱‍🏍 Edad » ${user.age || 'Desconocida'}
🎉 *Cumpleaños* » ${cumpleanos}
🚻 *Género* » ${genero}
💍 *Casado con* » ${pareja}

💫 *Experiencia* » ${exp.toLocaleString()}
📈 *Nivel* » ${nivel}
🔌 Rango » ${role}

💎 *Coins Cartera* » ${coins.toLocaleString()} ${moneda}
🎫 *Coins Banco* » ${bankCoins.toLocaleString()} ${moneda}
🔰 *Premium* » ${user.premium ? '✅' : '❌'}
  `.trim();

    // Envía la imagen de perfil y el texto de forma separada y compatible
    await conn.sendMessage(m.chat, {
        image: { url: perfil },
        caption: profileText,
        mentions: [userId] // Para mencionar al usuario en el texto
    }, { quoted: m });
};