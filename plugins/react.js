import fetch from "node-fetch"
import fs from "fs"
import path from "path"

const primaryFolder = "./primary"
if (!fs.existsSync(primaryFolder)) fs.mkdirSync(primaryFolder)

function getFilePath(groupId) {
  return path.join(primaryFolder, `${groupId}.json`)
}

async function reactToPostAPI({ postLink, reactions, token }) {
  const res = await fetch("https://foreign-marna-sithaunarathnapromax-9a005c2e.koyeb.app/api/channel/react-to-post", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "Mozilla/5.0 (Android 13; Mobile; rv:146.0) Gecko/146.0 Firefox/146.0",
      Referer: "https://asitha.top/channel-manager"
    },
    body: JSON.stringify({
      post_link: postLink,
      reacts: reactions.join(",")
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API falló: ${text}`)
  }

  return res.json()
}

const handler = async (m, { conn, text, command }) => {
  const filePath = getFilePath(m.chat)
  if (fs.existsSync(filePath)) {
    const db = JSON.parse(fs.readFileSync(filePath))
    if (db.primary && conn.user.jid !== db.primary) return
  }

  try {
    if (!text) return conn.reply(m.chat, "⚠︎ Ingresa el link del post seguido de los emojis.\nEjemplo: <link> 🔥 ❄️ 🍄", m)

    const [postLink, ...inputEmojis] = text.split(" ")
    if (!postLink || inputEmojis.length === 0) return conn.reply(m.chat, "⚠︎ Formato inválido. Debes poner el link y al menos un emoji.", m)

    const token = " 6afa872efb1feb6cc63f434e922313bfc01973365c136b9747e07d603c01221c"

    const result = await reactToPostAPI({ postLink, reactions: inputEmojis, token })
    conn.reply(m.chat, `✅ Reacción enviada correctamente!\nEmojis enviados: ${inputEmojis.join(", ")}\nRespuesta: ${JSON.stringify(result)}`, m)

  } catch (err) {
    conn.reply(m.chat, `⚠︎ Ocurrió un error: ${err.message}`, m)
  }
}

handler.command = handler.help = ['react']
handler.tags = ['utils']
handler.group = true
handler.owner = true
handler.rowner = true

export default handler