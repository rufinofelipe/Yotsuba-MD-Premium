<<<<<<< HEAD
import fetch from 'node-fetch'
import { FormData, Blob } from 'formdata-node'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime) return conn.reply(m.chat, `${emoji} Por favor, responda a una *Imagen* o *Vídeo.*`, m)
  await m.react(rwait)
  
  try {
    let media = await q.download()
    
    let link = await uploadToQuax(media)
    
    let img = await (await fetch(link)).buffer()
    let txt = `乂  *L I N K - E N L A C E*  乂\n\n`
        txt += `*» Enlace* : ${link}\n`
        txt += `*» Acortado* : ${await shortUrl(link)}\n`
        txt += `*» Tamaño* : ${formatBytes(media.length)}\n`
        txt += `*» Expiración* : Permanente (qu.ax)\n\n`
        txt += `> *${dev}*`

    await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, fkontak)
    await m.react(done)
  } catch (e) {
    console.error(e)
    await m.react(error)
  }
}

handler.help = ['tourl']
handler.tags = ['transformador']
handler.register = true
handler.command = ['tourl', 'upload']

export default handler

async function uploadToQuax(buffer) {
  try {
    const { ext, mime } = await fileTypeFromBuffer(buffer)
    const blob = new Blob([buffer], { type: mime })
    const formData = new FormData()
    formData.append('files[]', blob, `file.${ext}`)
    
    const response = await fetch('https://qu.ax/upload.php', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      },
      body: formData
    })
    
    const data = await response.json()
    
    if (data.success && data.files && data.files.length > 0) {
      return data.files[0].url
    } else {
      throw new Error('Error al subir el archivo a qu.ax')
    }
  } catch (error) {
    console.error('Error en uploadToQuax:', error)
    throw error
  }
}

function formatBytes(bytes) {
  if (bytes === 0) {
    return '0 B'
  }
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`
}

async function shortUrl(url) {
  let res = await fetch(`https://tinyurl.com/api-create.php?url=${url}`)
  return await res.text()
}
=======
>>>>>>> eef1bab788040bd268ec52bf9298ba340ef1a638
