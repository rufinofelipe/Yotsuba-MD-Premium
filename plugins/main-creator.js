import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn }) => {
    // Reaccionar al mensaje
    await m.react('👋');

    // Número del propietario
    let ownerNumber = global.owner[0].replace(/[^0-9]/g, '');

    // Crear vCard mínima
    let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:Propietario
TEL;waid=${ownerNumber}:${PhoneNumber('+' + ownerNumber).getNumber('international')}
END:VCARD`.trim();

    // Enviar contacto
    await conn.sendMessage(m.chat, {
        contacts: {
            displayName: 'Propietario',
            contacts: [{ vcard, displayName: 'Propietario' }]
        }
    }, { quoted: m });
}

handler.help = ["owner"];
handler.tags = ["info"];
handler.command = ['owner', 'creador', 'dueño'];

export default handler;