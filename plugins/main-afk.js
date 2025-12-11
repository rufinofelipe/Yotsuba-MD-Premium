export function before(m) {
  const user = global.db.data.users[m.sender];
  if (user.afk > -1) {
    const tiempo = new Date() - user.afk;
    const tiempoFormateado = msToTime(tiempo);
    
    conn.reply(m.chat, `${emoji} Dejastes De Estar Inactivo\n${user.afkReason ? 'Motivo De La Inactividad: ' + user.afkReason : ''}\n\n*Tiempo Inactivo: ${tiempoFormateado}*`, m);
    user.afk = -1;
    user.afkReason = '';
  }
  
  const jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])];
  for (const jid of jids) {
    const user = global.db.data.users[jid];
    if (!user) {
      continue;
    }
    const afkTime = user.afk;
    if (!afkTime || afkTime < 0) {
      continue;
    }
    const reason = user.afkReason || '';
    const tiempo = new Date() - afkTime;
    const tiempoFormateado = msToTime(tiempo);
    
    conn.reply(m.chat, `${emoji2} El Usuario Esta Inactivo No Lo Etiquetes.\n*Tiempo Inactivo: ${tiempoFormateado}*${reason ? '\n*Motivo: ' + reason + '*' : ''}`, m);
  }
  return true;
}

function msToTime(ms) {
  const segundos = Math.floor((ms / 1000) % 60);
  const minutos = Math.floor((ms / (1000 * 60)) % 60);
  const horas = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const dias = Math.floor(ms / (1000 * 60 * 60 * 24));
  
  let resultado = [];
  if (dias > 0) resultado.push(`${dias}d`);
  if (horas > 0) resultado.push(`${horas}h`);
  if (minutos > 0) resultado.push(`${minutos}m`);
  if (segundos > 0) resultado.push(`${segundos}s`);
  
  return resultado.join(' ') || '0s';
}