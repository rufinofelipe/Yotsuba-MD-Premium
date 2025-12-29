import { promises as fs } from 'fs';

let proposals = {};

let handler = async (m, { conn, command, usedPrefix, args }) => {
  try {
    switch (command) {
      case 'marry': {
        let sender = m.sender;
        let mentioned = m.mentionedJid;
        let target = mentioned && mentioned.length > 0 ? mentioned[0] : m.quoted ? m.quoted.sender : null;
        
        if (!target) {
          await conn.reply(m.chat, '❀ Debes mencionar a un usuario o responder a su mensaje para proponer o aceptar matrimonio.\n> Ejemplo » #marry @usuario o responde a un mensaje con #marry', m);
          return;
        }
        
        if (sender === target) {
          await m.reply('ꕥ No puedes proponerte matrimonio a ti mismo.');
          return;
        }
        
        let senderName = conn.getName(sender);
        let targetName = conn.getName(target);
        
        if (global.db.data.users[sender].marry) {
          const partnerId = global.db.data.users[sender].marry;
          const partnerName = conn.getName(partnerId);
          await conn.reply(m.chat, `ꕥ Ya estás casado/a con ${partnerName}.`, m);
          return;
        }
        
        if (global.db.data.users[target].marry) {
          const partnerId = global.db.data.users[target].marry;
          const partnerName = conn.getName(partnerId);
          await conn.reply(m.chat, `ꕥ ${targetName} ya está casado/a con ${partnerName}.`, m);
          return;
        }
        
        setTimeout(() => {
          if (proposals[sender]) delete proposals[sender];
        }, 120000);
        
        if (proposals[target] && proposals[target] === sender) {
          delete proposals[target];
          global.db.data.users[sender].marry = target;
          global.db.data.users[target].marry = sender;
          await conn.reply(m.chat, `✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩
¡Se han Casado! ฅ^•ﻌ•^ฅ*:･ﾟ✧

*•.¸♡ Esposo/a ${senderName}. ♡¸.•
- .¸♡ Esposo/a ${targetName}. ♡¸.•*
\`Disfruten de su luna de miel\`
✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩`, m);
        } else {
          proposals[sender] = target;
          await conn.reply(m.chat, `♡ @${target.split('@')[0]}, ${senderName} te ha propuesto matrimonio, ¿aceptas?

⚘ Responde con:
> ● ${usedPrefix + command} @${sender.split('@')[0]} para confirmar.
> ● La propuesta expirará en 2 minutos.`, m, { mentions: [target, sender] });
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
        let senderName = conn.getName(sender);
        let partnerName = conn.getName(partnerId);
        
        global.db.data.users[sender].marry = '';
        global.db.data.users[partnerId].marry = '';
        
        await conn.reply(m.chat, `ꕥ ${senderName} y ${partnerName} se han divorciado.`, m);
        break;
      }
    }
  } catch (error) {
    await m.reply(`⚠ Se ha producido un problema.\n> Usa ${usedPrefix}report para informarlo.\n\n${error.message}`);
  }
};

handler.help = ['marry', 'divorce'];
handler.tags = ['gacha'];
handler.command = ['marry', 'divorce'];
handler.group = true;

export default handler;