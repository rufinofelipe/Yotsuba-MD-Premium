import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    // Base de datos de jugadores reales
    const jugadoresRPG = [
        {
            nombre: "Lionel Messi",
            foto: "https://files.catbox.moe/3cd6cz.jpeg",
            rareza: "⭐️⭐️⭐️⭐️⭐️",
            habilidad: "Gambeta Divina",
            stats: "ATA: 98 | PAS: 95 | TEC: 99",
            precio: "💰 Valor: 50,000,000",
            posicion: "⚽ Delantero"
        },
        {
            nombre: "Cristiano Ronaldo", 
            foto: "https://files.catbox.moe/pi3jxo.jpeg",
            rareza: "⭐️⭐️⭐️⭐️⭐️",
            habilidad: "Chut Mortal",
            stats: "ATA: 97 | FUE: 96 | VEL: 90",
            precio: "💰 Valor: 48,000,000",
            posicion: "⚽ Delantero"
        },
        {
            nombre: "Neymar Jr",
            foto: "https://files.catbox.moe/qtnfhk.jpeg",
            rareza: "⭐️⭐️⭐️⭐️",
            habilidad: "Drible Mágico", 
            stats: "ATA: 92 | TEC: 96 | AGI: 95",
            precio: "💰 Valor: 35,000,000",
            posicion: "⚽ Extremo"
        },
        {
            nombre: "Kylian Mbappé",
            foto: "https://files.catbox.moe/gc2dat.jpeg",
            rareza: "⭐️⭐️⭐️⭐️⭐️",
            habilidad: "Velocidad Explosiva",
            stats: "ATA: 95 | VEL: 98 | AGI: 93",
            precio: "💰 Valor: 45,000,000",
            posicion: "⚽ Delantero"
        },
        {
            nombre: "Erling Haaland",
            foto: "https://files.catbox.moe/lqeemw.jpeg", 
            rareza: "⭐️⭐️⭐️⭐️⭐️",
            habilidad: "Fuerza Brutal",
            stats: "ATA: 96 | FUE: 97 | REM: 95",
            precio: "💰 Valor: 42,000,000",
            posicion: "⚽ Delantero"
        },
        {
            nombre: "Kevin De Bruyne",
            foto: "https://files.catbox.moe/mpd9zn.jpeg",
            rareza: "⭐️⭐️⭐️⭐️",
            habilidad: "Pase Perfecto",
            stats: "ATA: 88 | PAS: 97 | VIS: 96",
            precio: "💰 Valor: 38,000,000",
            posicion: "⚽ Mediocampista"
        },
        {
            nombre: "Virgil van Dijk",
            foto: "https://files.catbox.moe/cv3ddr.jpeg",
            rareza: "⭐️⭐️⭐️⭐️",
            habilidad: "Muro Defensivo",
            stats: "DEF: 96 | FUE: 94 | TAC: 95",
            precio: "💰 Valor: 32,000,000",
            posicion: "🛡️ Defensa"
        },
        {
            nombre: "Luka Modrić",
            foto: "https://files.catbox.moe/nr1h6l.jpeg",
            rareza: "⭐️⭐️⭐️⭐️",
            habilidad: "Control Total",
            stats: "PAS: 94 | TEC: 93 | VIS: 95",
            precio: "💰 Valor: 30,000,000",
            posicion: "⚽ Mediocampista"
        },
        {
            nombre: "Robert Lewandowski",
            foto: "https://files.catbox.moe/ny56tl.jpg",
            rareza: "⭐️⭐️⭐️⭐️⭐️",
            habilidad: "Remate Letal",
            stats: "ATA: 97 | REM: 96 | POS: 95",
            precio: "💰 Valor: 40,000,000",
            posicion: "⚽ Delantero"
        }
    ]

    // Seleccionar jugador aleatorio
    let jugador = jugadoresRPG[Math.floor(Math.random() * jugadoresRPG.length)]
    
    // Texto del mensaje
    let texto = `🎯 *SCOUTING ALEATORIO - LIGA RPG* ⚽

🏷️ *Jugador:* ${jugador.nombre}
📊 *Rareza:* ${jugador.rareza}
📍 *Posición:* ${jugador.posicion}
💫 *Habilidad Especial:* ${jugador.habilidad}
📈 *Estadísticas:* ${jugador.stats}
${jugador.precio}

⚠️ *Este jugador está disponible para fichar*
💡 *Usa .fichar [nombre] para agregarlo a tu equipo*`

    try {
        // Descargar imagen del jugador
        let response = await fetch(jugador.foto)
        let buffer = await response.buffer()
        
        // Enviar mensaje con imagen
        await conn.sendFile(m.chat, buffer, 'jugador.jpg', texto, m)
        
    } catch (e) {
        // Si falla la imagen, enviar solo texto
        await m.reply(`❌ Error al cargar la imagen\n\n${texto}`)
    }
}

handler.help = ['rwjugador', 'scout', 'buscarjugador']
handler.tags = ['rpg']
handler.command = ['rwjugador', 'scout', 'buscarjugador', 'randomplayer']

export default handler