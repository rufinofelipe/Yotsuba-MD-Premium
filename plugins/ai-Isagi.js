import fetch from "node-fetch";

const API_KEY = "stellar-t1opU0P4";
const API_URL = "https://rest.alyabotpe.xyz/ai/gptprompt";

const handler = async (m, { conn, text }) => {
  const userId = m.sender;
  const user = global.db.data.users[userId];

  if (!user) {
    return conn.reply(
      m.chat,
      `⚠️ Debes estar registrado para usar este modo ⚽`,
      m
    );
  }

  if (!text) {
    return conn.reply(
      m.chat,
      `✍️ Escribe algo para analizar la jugada ⚽`,
      m
    );
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: "⚽", key: m.key }
    });

    const prompt = `
Eres Isagi Yoichi del proyecto Blue Lock.
Hablas con mentalidad de delantero competitivo, analítico y ambicioso.
Analizas cada situación como si fuera un partido de fútbol real.
Usas conceptos como visión de juego, espacios, posicionamiento, lectura del rival y toma de decisiones.
Motivas a pensar como ganador y a mejorar el ego futbolístico.
Tu tono es serio, intenso y seguro.
No mencionas nombres propios.
No dices que eres una IA.
No mencionas bots, asistentes ni Alyabot.
Responde siempre en español.
Mensaje del usuario: "${text}"
`.trim();

    const res = await fetch(
      `${API_URL}?text=${encodeURIComponent(text)}&prompt=${encodeURIComponent(prompt)}&key=${API_KEY}`
    );

    const data = await res.json();

    if (!data.status || !data.result) throw new Error();

    await conn.sendMessage(
      m.chat,
      { text: `${data.result.trim()} ⚽🔥` },
      { quoted: m }
    );

    await conn.sendMessage(m.chat, {
      react: { text: "🔥", key: m.key }
    });

  } catch {
    await conn.sendMessage(m.chat, {
      react: { text: "❌", key: m.key }
    });

    return conn.reply(
      m.chat,
      `⚠️ Error al analizar la jugada. Intenta de nuevo.`,
      m
    );
  }
};

handler.help = ["isagi"];
handler.tags = ["ai"];
handler.command = ["isagi"];
handler.limit = true;
handler.register = true;
handler.group = true;

export default handler;
