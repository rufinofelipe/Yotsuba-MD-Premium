import fs from 'fs'
import path from 'path'
import webp from 'webp-converter'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn }) => {
    const notStickerMessage = `> Debes citar un sticker para convertir a imagen.`
    const q = m.quoted || m
    const mime = q.mediaType || ''
    if (!/sticker/.test(mime)) return m.reply(notStickerMessage)

    try {
        const media = await q.download()
        const tempWebp = path.join(__dirname, 'temp.webp')
        const tempJpg = path.join(__dirname, 'output.jpg')
        fs.writeFileSync(tempWebp, media)

        await webp.cwebp(tempWebp, tempJpg, "-q 80")

        const out = fs.readFileSync(tempJpg)
        await conn.sendFile(m.chat, out, 'output.jpg', null, m)

        fs.unlinkSync(tempWebp)
        fs.unlinkSync(tempJpg)
    } catch (e) {
        console.error(e)
        m.reply('Ocurrió un error al convertir el sticker a JPG.')
    }
}

handler.help = ['toimg (reply)']
handler.tags = ['sticker']
handler.command = ['toimg', 'img', 'jpg']
handler.reg = true
export default handler
