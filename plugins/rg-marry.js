import { promises as fs } from 'fs';

let proposals = {};

let handler = async (m, { conn, command, usedPrefix, args }) => {
  try {
    switch (command) {
      case 'marry': {
        let sender = m.sender;
        let mentioned = await m.mentionedJid;
        let target = mentioned && mentioned.length > 0 ? mentioned[0] : m.quoted ? await m.quoted.sender : null;

        if (!target) {
          await conn.reply(m.chat, '❀ Debes mencionar aún usuario o responder a su mensaje para proponer o aceptar matrimonio.\n> Ejemplo » *#marry @usuario* o responde a un mensaje con *#marry*', m);
          return;
        }

        if (sender === target) {
          await m.reply('ꕥ No puedes proponerte matrimonio a ti mismo.');
          return;
        }

        if (global.db.data.users[sender].marry) {
          const partnerId = global.db.data.users[sender].marry;
          await conn.reply(m.chat, 'ꕥ Ya estás casado/a con *' + global.db.data.users[partnerId].name + '*.', m);
          return;
        }

        if (global.db.data.users[target].marry) {
          const partnerId = global.db.data.users[target].marry;
          await conn.reply(m.chat, 'ꕥ *' + global.db.data.users[target].name + '* ya está casado/a con *' + global.db.data.users[partnerId].name + '*.', m);
          return;
        }

        setTimeout(() => {
          if (proposals[sender]) delete proposals[sender];
        }, 120000);

        if (proposals[target] && proposals[target] === sender) {
          delete proposals[target];
          global.db.data.users[sender].marry = target;
          global.db.data.users[target].marry = sender;
          await conn.reply(m.chat, '✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩\n¡Se han Casado! ฅ^•ﻌ•^ฅ*:･ﾟ✧\n\n*•.¸♡ Esposo/a ' + global.db.data.users[sender].name + '. ♡¸.•*\n*•.¸♡ Esposo/a ' + global.db.data.users[target].name + '.⁩ ♡¸.•*\n\n`Disfruten de su luna de miel`\n✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩', m);
        } else {
          proposals[sender] = target;
          await conn.reply(m.chat, '♡ *' + global.db.data.users[target].name + '*, *' + global.db.data.users[sender].name + '* te ha propuesto matrimonio, ¿aceptas?\n\n⚘ *Responde con:*\n> ● *' + (usedPrefix + command) + ' ' + global.db.data.users[sender].name + '* para confirmar.\n> ● La propuesta expirará en 2 minutos.', m);
        }
        break;
      }

      case 'divorce': {
        let sender = m.sender;

        if (!global.db.data.users[sender].marry) {
          await m.reply('✎ Tú no estás casado con nadie.');
          return;
        }

        let partnerId = global.db.data.users[sender].marry;
        global.db.data.users[sender].marry = '';
        global.db.data.users[partnerId].marry = '';
        await conn.reply(m.chat, 'ꕥ *' + global.db.data.users[sender].name + '* y *' + global.db.data.users[partnerId].name + '* se han divorciado.', m);
        break;
      }
    }
  } catch (error) {
    await m.reply('⚠︎ Se ha producido un problema.\n> Usa *' + usedPrefix + 'report* para informarlo.\n\n' + error.message);
  }
};

handler.help = ['marry'];
handler.tags = ['marry', 'divorce'];
handler.command = ['marry', 'divorce'];
handler.group = true;

export default handler;