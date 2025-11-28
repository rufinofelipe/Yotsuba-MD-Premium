import fetch from 'node-fetch'

// Base de datos COMPLETA de jugadores con los nombres CORREGIDOS
const jugadoresDB = [
    {
        nombre: "Cristiano Ronaldo",
        foto: "https://files.catbox.moe/ny56tl.jpg",
        rareza: "⭐️⭐️⭐️⭐️⭐️",
        habilidad: "Chut Mortal",
        stats: { ATA: 97, FUE: 96, VEL: 90 },
        precio: 48000000,
        posicion: "Delantero"
    },
    {
        nombre: "Lionel Messi", 
        foto: "https://files.catbox.moe/prjre5.jpeg",
        rareza: "⭐️⭐️⭐️⭐️⭐️",
        habilidad: "Gambeta Divina", 
        stats: { ATA: 98, PAS: 95, TEC: 99 },
        precio: 50000000,
        posicion: "Delantero"
    },
    {
        nombre: "Diego Maradona",
        foto: "https://files.catbox.moe/3cd6cz.jpeg",
        rareza: "⭐️⭐️⭐️⭐️⭐️",
        habilidad: "Mano de Dios", 
        stats: { ATA: 96, TEC: 98, DRI: 97 },
        precio: 45000000,
        posicion: "Mediocampista"
    },
    {
        nombre: "Neymar Jr",
        foto: "https://files.catbox.moe/nr1h6l.jpeg",
        rareza: "⭐️⭐️⭐️⭐️",
        habilidad: "Drible Mágico",
        stats: { ATA: 92, TEC: 96, AGI: 95 },
        precio: 35000000,
        posicion: "Extremo"
    },
    {
        nombre: "Ronaldinho",
        foto: "https://files.catbox.moe/cv3ddr.jpeg",
        rareza: "⭐️⭐️⭐️⭐️⭐️",
        habilidad: "Sonrisa Mágica",
        stats: { ATA: 94, TEC: 97, DRI: 98 },
        precio: 42000000,
        posicion: "Mediocampista"
    },
    {
        nombre: "Vinicius Jr",
        foto: "https://files.catbox.moe/mpd9zn.jpeg",
        rareza: "⭐️⭐️⭐️⭐️",
        habilidad: "Velocidad Extrema",
        stats: { ATA: 91, VEL: 96, DRI: 93 },
        precio: 38000000,
        posicion: "Extremo"
    },
    {
        nombre: "Lamine Yamal",
        foto: "https://files.catbox.moe/lqeemw.jpeg",
        rareza: "⭐️⭐️⭐️⭐️",
        habilidad: "Talento Joven",
        stats: { ATA: 88, TEC: 92, VEL: 90 },
        precio: 30000000,
        posicion: "Extremo"
    },
    {
        nombre: "Luka Modrić",
        foto: "https://files.catbox.moe/gc2dat.jpeg",
        rareza: "⭐️⭐️⭐️⭐️⭐️",
        habilidad: "Control Total",
        stats: { PAS: 97, TEC: 94, VIS: 96 },
        precio: 40000000,
        posicion: "Mediocampista"
    },
    {
        nombre: "Cole Palmer",
        foto: "https://files.catbox.moe/qtnfhk.jpeg",
        rareza: "⭐️⭐️⭐️⭐️",
        habilidad: "Tiro Preciso",
        stats: { ATA: 89, PAS: 91, REM: 90 },
        precio: 32000000,
        posicion: "Mediocampista"
    },
    {
        nombre: "Pedri",
        foto: "https://files.catbox.moe/pi3jxo.jpeg",
        rareza: "⭐️⭐️⭐️⭐️",
        habilidad: "Pase Perfecto",
        stats: { PAS: 93, TEC: 92, VIS: 94 },
        precio: 35000000,
        posicion: "Mediocampista"
    }
]

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let user = global.db.data.users[m.sender]
    
    // COMANDO RWJUGADOR
    if (command === 'rwjugador' || command === 'scout') {
        let jugador = jugadoresDB[Math.floor(Math.random() * jugadoresDB.length)]
        let statsTexto = Object.entries(jugador.stats).map(([key, value]) => `${key}: ${value}`).join(' | ')
        
        let texto = `🎯 *SCOUTING ALEATORIO - LIGA RPG* ⚽\n\n🏷️ *Jugador:* ${jugador.nombre}\n📊 *Rareza:* ${jugador.rareza}\n📍 *Posición:* ${jugador.posicion}\n💫 *Habilidad:* ${jugador.habilidad}\n📈 *Stats:* ${statsTexto}\n💰 *Valor:* $${jugador.precio.toLocaleString()}\n\n💡 *Usa* ${usedPrefix}fichar ${jugador.nombre.split(' ')[0]} *para ficharlo*`

        try {
            let response = await fetch(jugador.foto)
            let buffer = await response.buffer()
            await conn.sendFile(m.chat, buffer, 'jugador.jpg', texto, m)
        } catch (e) {
            await m.reply(texto)
        }
        return
    }
    
    // COMANDO FICHAR
    if (command === 'fichar') {
        if (!user.registered) return m.reply(`❌ *Regístrate primero:* ${usedPrefix}reg <nombre>`)
        if (!user.equipo) user.equipo = []
        if (!text) return m.reply(`❌ *Especifica jugador:* ${usedPrefix}fichar Messi`)
        
        let jugador = jugadoresDB.find(j => j.nombre.toLowerCase().includes(text.toLowerCase()))
        if (!jugador) return m.reply(`❌ *Jugador no encontrado*`)
        if (user.equipo.some(p => p.nombre === jugador.nombre)) return m.reply(`❌ *Ya tienes a ${jugador.nombre}*`)
        if (user.money < jugador.precio) return m.reply(`❌ *Dinero insuficiente*\nNecesitas: $${jugador.precio.toLocaleString()}\nTienes: $${user.money.toLocaleString()}`)
        
        user.money -= jugador.precio
        user.equipo.push({
            nombre: jugador.nombre,
            foto: jugador.foto,
            rareza: jugador.rareza,
            habilidad: jugador.habilidad,
            stats: jugador.stats,
            posicion: jugador.posicion,
            nivel: 1,
            experiencia: 0
        })
        
        let textoExito = `✅ *¡FICHAJE EXITOSO!* ⚽\n\n🏷️ *Jugador:* ${jugador.nombre}\n📊 *Rareza:* ${jugador.rareza}\n📍 *Posición:* ${jugador.posicion}\n💫 *Habilidad:* ${jugador.habilidad}\n💰 *Precio:* $${jugador.precio.toLocaleString()}\n\n🎯 *Ahora en tu equipo*`
        
        try {
            let response = await fetch(jugador.foto)
            let buffer = await response.buffer()
            await conn.sendFile(m.chat, buffer, 'fichaje.jpg', textoExito, m)
        } catch (e) {
            await m.reply(textoExito)
        }
        return
    }
    
    // COMANDO MIEQUIPO
    if (command === 'miequipo') {
        if (!user.equipo || user.equipo.length === 0) return m.reply(`❌ *No tienes jugadores*\nUsa ${usedPrefix}rwjugador`)
        
        let textoEquipo = `👥 *TU EQUIPO RPG* ⚽\n\n`
        user.equipo.forEach((jugador, index) => {
            textoEquipo += `${index + 1}. *${jugador.nombre}* ${jugador.rareza}\n📍 ${jugador.posicion} | 🎯 ${jugador.habilidad}\n📊 Nvl: ${jugador.nivel} | Exp: ${jugador.experiencia}\n\n`
        })
        textoEquipo += `💵 *Dinero:* $${user.money.toLocaleString()}`
        await m.reply(textoEquipo)
        return
    }
    
    // COMANDO VENDER
    if (command === 'vender') {
        if (!text) return m.reply(`❌ *Especifica jugador:* ${usedPrefix}vender Messi`)
        
        let jugadorIndex = user.equipo.findIndex(j => j.nombre.toLowerCase().includes(text.toLowerCase()))
        if (jugadorIndex === -1) return m.reply(`❌ *No tienes a ese jugador*`)
        
        let jugador = user.equipo[jugadorIndex]
        let jugadorOriginal = jugadoresDB.find(j => j.nombre === jugador.nombre)
        let precioVenta = Math.floor(jugadorOriginal.precio * 0.7)
        
        user.money += precioVenta
        user.equipo.splice(jugadorIndex, 1)
        
        await m.reply(`💰 *VENTA EXITOSA*\n\n🏷️ *Jugador:* ${jugador.nombre}\n💵 *Ganaste:* $${precioVenta.toLocaleString()}\n\n💸 *Nuevo saldo:* $${user.money.toLocaleString()}`)
    }
}

handler.help = ['rwjugador', 'fichar', 'miequipo', 'vender']
handler.tags = ['rpg']
handler.command = ['rwjugador', 'scout', 'fichar', 'miequipo', 'vender']
export default handler