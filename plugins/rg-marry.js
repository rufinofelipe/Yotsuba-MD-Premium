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
          await conn.reply(m.chat, '❀ Debes mencionar a un usuario o responder a su mensaje para proponer matrimonio.\n> Ejemplo » #marry @usuario', m);
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
        

        proposals[sender] = {
          target: target,
          timestamp: Date.now()
        };

        let proposalMsg = await conn.reply(m.chat, `♡ @${target.split('@')[0]}, ${senderName} te ha propuesto matrimonio, ¿aceptas?

⚘ Responde a este mensaje con:
> ● *aceptar* para confirmar el matrimonio.
> ● *rechazar* para declinar la propuesta.
> ● La propuesta expirará en 2 minutos.`, m, { mentions: [target] });
        
        
        proposals[sender].messageId = proposalMsg.key.id;
        
       
        setTimeout(() => {
          if (proposals[sender]) {
            delete proposals[sender];
          }
        }, 120000);
        
        break;
      }
      
      case 'aceptar': {

        if (!m.quoted) {
          return;
        }
        
        let sender = m.sender;
        let quotedSender = m.quoted.sender;
        
        
        let proposer = null;
        for (let user in proposals) {
          if (proposals[user].messageId === m.quoted.id && proposals[user].target === sender) {
            proposer = user;
            break;
          }
        }
        
        if (!proposer) {
          return; 
        }
        
        
        if (proposals[proposer].target !== sender) {
          return; 
        }
        

        if (global.db.data.users[sender].marry) {
          const partnerId = global.db.data.users[sender].marry;
          const partnerName = conn.getName(partnerId);
          await conn.reply(m.chat, `ꕥ Ya estás casado/a con ${partnerName}.`, m);
          delete proposals[proposer];
          return;
        }
        
        if (global.db.data.users[proposer].marry) {
          const partnerId = global.db.data.users[proposer].marry;
          const partnerName = conn.getName(partnerId);
          await conn.reply(m.chat, `ꕥ ${conn.getName(proposer)} ya está casado/a con ${partnerName}.`, m);
          delete proposals[proposer];
          return;
        }
        

        global.db.data.users[sender].marry = proposer;
        global.db.data.users[proposer].marry = sender;
        
        delete proposals[proposer];
        
        let senderName = conn.getName(sender);
        let proposerName = conn.getName(proposer);
        
        await conn.reply(m.chat, `✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩
¡Se han Casado! ฅ^•ﻌ•^ฅ*:･ﾟ✧

*•.¸♡ Esposo/a ${proposerName}. ♡¸.•
- .¸♡ Esposo/a ${senderName}. ♡¸.•*
\`Disfruten de su luna de miel\`
✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩`, m);
        
        break;
      }
      
      case 'rechazar': {
        if (!m.quoted) {
          return; 
        }
        
        let sender = m.sender;
        

        let proposer = null;
        for (let user in proposals) {
          if (proposals[user].messageId === m.quoted.id && proposals[user].target === sender) {
            proposer = user;
            break;
          }
        }
        
        if (!proposer) {
          return; 
        }
        

        if (proposals[proposer].target !== sender) {
          return;
        }
        
        delete proposals[proposer];
        
        let senderName = conn.getName(sender);
        let proposerName = conn.getName(proposer);
        
        await conn.reply(m.chat, `💔 ${senderName} ha rechazado la propuesta de matrimonio de ${proposerName}.`, m);
        
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
handler.command = ['marry', 'divorce', 'aceptar', 'rechazar'];
handler.group = true;

export default handler;