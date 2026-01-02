import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*


global.botNumber = '' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.owner = [
// <-- Número @s.whatsapp.net -->
['18096758983', 'nevi', true],
['573196722008', 'DuarteXV', true], 
['50493732693', 'Hsjajzh', true],
['51933000214', 'Ander', true],
['573135180876','Duarte', true],
  
// <-- Número @lid -->
  ['212137662218436', 'DuarteXV', true]
];

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.mods = []
global.suittag = ['573135180876'] 
global.prems = []

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.libreria = 'Baileys'
global.baileys = 'V 6.7.17' 
global.vs = '2.2.5'
global.nameqr = '⚡Zenitsu Bot⚡'
global.namebot = 'Z E N I T Z U - B O T'
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 


//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.packname = '⚡𝙕𝙚𝙣𝙞𝙩𝙨𝙪 𝘽𝙤𝙩 ⚡'
global.botname = '⚡𝙕𝙚𝙣𝙞𝙩𝙨𝙪 𝘽𝙤𝙩 ⚡'
global.wm = '⚡𝙕𝙚𝙣𝙞𝙩𝙨𝙪 𝘽𝙤𝙩 ⚡'
global.author = '© Rufino ✝️'
global.dev = '© 𝗽𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗥𝘂𝗳𝗶𝗻𝗼 ✝️'
global.textbot = 'El mejor bot'
global.etiqueta = 'Rufino✝️'

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.moneda = 'Zenitsu-coins'
global.welcom1 = '! Bienvenido \n soy ⚡𝙕𝙚𝙣𝙞𝙩𝙨𝙪 𝘽𝙤𝙩 ⚡ \n⚽️ Edita este mensaje con setwelcome ⚽️'
global.welcom2 = '💫 ¡Hasta la próxima! Gracias por haber estado con nosotros ⚡ \n⚽️ ¡Esperamos verte pronto en el campo! ⚽️ \n🔥 Edita este mensaje con setbye 🔥'
global.banner = 'https://qu.ax/zjtGm'
global.avatar = 'https://qu.ax/zjtGm'

global.api = {
  url: 'https://api.stellarwa.xyz',
  key: 'Angelithixyz'
}

global.playlistApiKey = 'f9e54e5c6amsh8b4dfc0bfb94abap19bab2jsne8b65338207e'


global.apikey = 'adonix-key'
global.APIKeys = {
  'https://api.xteam.xyz': 'YOUR_XTEAM_KEY',
  'https://api.lolhuman.xyz': 'API_KEY',
  'https://api.betabotz.eu.org': 'API_KEY',
  'https://mayapi.ooguy.com': 'may-f53d1d49'
}

global.APIs = {
  ryzen: 'https://api.ryzendesu.vip',
  xteam: 'https://api.xteam.xyz',
  lol: 'https://api.lolhuman.xyz',
  delirius: 'https://delirius-apiofc.vercel.app',
  siputzx: 'https://api.siputzx.my.id',
  mayapi: 'https://mayapi.ooguy.com'
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.gp1 = 'https://chat.whatsapp.com/EFUkB3vLyAzAc4ZQzLabsp'
global.comunidad1 = 'https://chat.whatsapp.com/LRQrf8vv50BDtwN8JWfhrX'
global.channel = 'https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i'
global.channel2 = 'https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i'
global.md = 'https://github.com/Brauliovh3/HATSUNE-MIKU'
global.correo = 'rufinofelipe495@gmail.com' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*


global.rcanal = { 
  contextInfo: { 
    isForwarded: true, 
    forwardedNewsletterMessageInfo: { 
      newsletterJid: "120363350523130615@newsletter", 
      serverMessageId: 100, 
      newsletterName: "⚡𝙕𝙚𝙣𝙞𝙩𝙨𝙪 𝘽𝙤𝙩 ⚡"
    }
  }
}


global.redes = 'https://whatsapp.com/channel/0029VbBUHyQCsU9IpJ0oIO2i'
global.dev = '© 𝗽𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗥𝘂𝗳𝗶𝗻𝗼 ✝️ '
global.emoji = '⚡'
global.emoji2 = '🤖'
global.emoji3 = '🔥'

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.catalogo = 'mienlace'
global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: packname, orderTitle: 'Bang', thumbnail: catalogo, sellerJid: '0@s.whatsapp.net'}}}
global.ch = {
ch1: '120363420979328566@newsletter',
}
global.multiplier = 60

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment

global.opts = {
  ...global.opts,
  autoread: true,  
  queque: false 
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'settings.js'"))
  import(`${file}?update=${Date.now()}`)
})
