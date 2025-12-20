import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

let handler = async (m, { conn }) => {
  const emoji = {
    waiting: '⏳',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };

  const isagiStyle = `⚽ *ISAGI BOT* ⚽\n` +
                     `━━━━━━━━━━━━━━\n`;

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  
  if (!mime) {
    await conn.reply(m.chat, 
      `${emoji.warning} *No hay archivo detectado*\n` +
      `_Responde a una imagen, video o archivo_`, 
      m
    );
    return;
  }

  await m.react(emoji.waiting);

  try {
    let media = await q.download();
    
    if (!media || !Buffer.isBuffer(media)) {
      await m.react(emoji.error);
      await conn.reply(m.chat,
        `${emoji.error} *Error en la descarga*\n` +
        `_No se pudo obtener el archivo_`,
        m
      );
      return;
    }

    let link = await catbox(media);
    
    let txt = `${isagiStyle}` +
              `📤 *Subida Exitosa*\n\n` +
              `🔗 *Enlace:* ${link}\n` +
              `📊 *Tamaño:* ${formatBytes(media.length)}\n` +
              `⏱️ *Duración:* ${isVideo ? 'Video' : isImage ? 'Imagen' : 'Archivo'}\n` +
              `━━━━━━━━━━━━━━\n` +
              `_Mi objetivo es crear oportunidades..._ ⚽`;
    
    let isImage = /image\/(png|jpe?g|gif|webp)/.test(mime);
    let isVideo = /video\/(mp4|quicktime|webm)/.test(mime);
    let isAudio = /audio\/(mp3|ogg|mpeg)/.test(mime);
    let isSticker = /webp/.test(mime);

    if (isImage) {
      await conn.sendMessage(m.chat, {
        image: media,
        caption: txt
      }, { quoted: m });
    } else if (isVideo) {
      await conn.sendMessage(m.chat, {
        video: media,
        caption: txt
      }, { quoted: m });
    } else if (isAudio) {
      await conn.sendMessage(m.chat, {
        audio: media,
        mimetype: 'audio/mpeg',
        caption: txt
      }, { quoted: m });
    } else if (isSticker) {
      await conn.sendMessage(m.chat, {
        sticker: media
      }, { quoted: m });
      await conn.reply(m.chat, 
        `${isagiStyle}✨ *Sticker subido*\n` +
        `🔗 ${link}\n` +
        `_Directo al gol..._ ⚽`,
        m
      );
    } else {
      let ext = mime.split('/')[1] || 'bin';
      await conn.sendMessage(m.chat, {
        document: media,
        mimetype: mime,
        fileName: `archivo_isagi.${ext}`,
        caption: txt
      }, { quoted: m });
    }

    await m.react(emoji.success);
    
  } catch (err) {
    console.error('Error:', err);
    await m.react(emoji.error);
    await conn.reply(m.chat,
      `${emoji.error} *Error en la jugada*\n` +
      `_No se pudo completar la subida_\n` +
      `━━━━━━━━━━━━━━\n` +
      `🔍 *Detalle:* ${err.message}`,
      m
    );
  }
};

handler.help = ['catbox'];
handler.tags = ['herramientas'];
handler.command = ['catbox', 'subir', 'upload'];
handler.premium = false;
handler.limit = true;

export default handler;

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function catbox(content) {
  const fileType = await fileTypeFromBuffer(content) || {};
  const ext = fileType.ext || 'bin';
  const mime = fileType.mime || 'application/octet-stream';
  
  const blob = new Blob([content], { type: mime });
  const formData = new FormData();
  const randomName = crypto.randomBytes(6).toString("hex");
  
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, `isagi_${randomName}.${ext}`);
  
  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": "IsagiBot/1.0 (Blue Lock Protocol)"
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return await response.text();
}