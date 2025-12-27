// Necesitas instalar node-fetch
import fetch from 'node-fetch';

// --- CREDENCIALES RULE34 ---
const R34_USER_ID = "5592834";
const R34_API_KEY = "8ba37eaec9cf4a215f62ebc95d122b1649f1037c70e0a962ad73c22afdbe32fec66e4991dc5d0c628850df990b81eb14f422a6d92c4275e1ab3a9e5beba9f857";
// --------------------------

// --- CONSTANTES ---
const rwait = "⏳";
const done = "✅";
const error = "❌";
const R34_API_URL = "https://rule34.xxx/index.php?page=dapi&s=post&q=index"; // Endpoint base
// -------------------------------------------------------------

const handler = async (m, { conn, args, usedPrefix }) => {
    // Verificación de permisos NSFW
    if (!db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply(`*nsfw🔞️* está desactivada en este grupo.\n> Un administrador puede activarla con el comando » *#nsfw on*`);
    }

    if (!args || args.length === 0) {
        // Mensaje neutro de falta de argumentos
        await conn.reply(m.chat, `Por favor, ingresa el nombre de la etiqueta que deseas buscar.\nEjemplo: *${usedPrefix}rule34 tag*`, m);
        return;
    }

    const tags = args.join('+');
    const displayTags = args.join(', ');

    // Construcción de la URL de la API con tags y autenticación
    const apiUrl = `${R34_API_URL}&tags=${tags}&json=1&user_id=${R34_USER_ID}&api_key=${R34_API_KEY}`;

    // Caption estándar
    let captionText = `Resultados encontrados para: *${displayTags}*`;

    try {
        await m.react(rwait);

        // 1. BÚSQUEDA USANDO LA API
        const response = await fetch(apiUrl);
        const textResponse = await response.text();

        // 2. Verificar errores de API (XML/Autenticación)
        if (textResponse.includes("<error>")) {
            await m.react(error);
            console.error('Error de API Rule34 (XML Response):', textResponse);
            // Mensaje de error técnico
            await conn.reply(m.chat, `Ocurrió un error con la API de Rule34. Intenta más tarde.`, m);
            return;
        }

        // Chequeo de respuesta vacía
        if (textResponse.trim() === "") {
             await m.react(error);
             await conn.reply(m.chat, `No se encontraron resultados para *${displayTags}*.`, m);
             return;
        }

        let posts;
        try {
            posts = JSON.parse(textResponse);
        } catch (e) {
            await m.react(error);
            // Error de parseo
            await conn.reply(m.chat, `Error al procesar los datos recibidos.`, m);
            return;
        }

        if (!posts || posts.length === 0) {
            await m.react(error);
            // Sin resultados
            await conn.reply(m.chat, `No se encontraron resultados para *${displayTags}*.`, m);
            return;
        }

        // 3. Seleccionar post aleatorio y obtener URL directa
        const randomIndex = Math.floor(Math.random() * posts.length);
        const randomPost = posts[randomIndex];
        const imageUrl = randomPost.file_url; // URL directa del archivo

        if (!imageUrl) {
            await m.react(error);
            // Archivo no encontrado
            await conn.reply(m.chat, `Se encontró el post pero la URL de la imagen no es válida.`, m);
            return;
        }

        // 4. Envío del archivo: Determina si es imagen o video
        const extension = imageUrl.split('.').pop().toLowerCase();
        let messageOptions = { caption: captionText, mentions: [m.sender] };

        const videoExtensions = ['mp4', 'webm', 'mov'];

        if (videoExtensions.includes(extension)) {
            // Es un video o GIF largo
            messageOptions.video = { url: imageUrl };
        } else {
            // Es una imagen (incluye GIF corto, jpg, png, etc.)
            messageOptions.image = { url: imageUrl };
        }

        await conn.sendMessage(m.chat, messageOptions);

        await m.react(done);
    } catch (e) {
        // Catch de errores fatales
        await m.react(error);
        console.error('Error FATAL en la búsqueda/envío de multimedia:', e);

        let errorDetail = e.message || 'Error desconocido.';

        await conn.reply(
          m.chat,
          `Ocurrió un error interno al procesar la solicitud.\nDetalle: ${errorDetail}`,
          m
        );
    }
};

handler.help = ['rule34 <tag>'];
handler.command = ['rule34', 'r34'];
handler.tags = ['nsfw'];

export default handler;