import fetch from 'node-fetch'

let handler  = async (m, { conn, usedPrefix, command }) => {

let grupos = `⚽ *¡ATENCIÓN, JUGADOR!* 🔥

🎯 Únete a los campos de entrenamiento oficiales de Blue Lock para demostrar tu ego y convertirte en el delantero número 1...

🏆 ${namegrupo}
> *⚽* ${gp1}

⚡ ${namecomu}
> *🔥* ${comunidad1}

*⚽─🔥─🎯─💎─🏆─⚡─🎯─🔥─⚽*

🎯 ¿Enlace caducado? ¡Entra aquí para más información del entrenamiento!

💎 ${namechannel}
> *⚽* ${channel}

> ${dev} 🎯⚽`

await conn.sendFile(m.chat, catalogo, "blueLock.jpg", grupos, m)

await m.react(emojis)

}
handler.help = ['grupos', 'campos']
handler.tags = ['info']
handler.command = ['grupos', 'links', 'groups', 'campos', 'blueLock']

export default handler