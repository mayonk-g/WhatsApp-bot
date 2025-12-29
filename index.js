const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const express = require('express')

// Web server (for hosting)
const app = express()
app.get('/', (req, res) => res.send('WhatsApp Bot Running'))
app.listen(process.env.PORT || 3000)

// WhatsApp bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text

    if (text?.toLowerCase() === 'hi') {
      await sock.sendMessage(msg.key.remoteJid, {
        text: 'Hello! I am your WhatsApp bot 🤖'
      })
    }
  })
}

startBot()
