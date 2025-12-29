const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode-terminal')
const express = require('express')

// Web server (keeps Railway alive)
const app = express()
app.get('/', (req, res) => res.send('WhatsApp Bot Running'))
app.listen(process.env.PORT || 3000)

// WhatsApp Bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')

  const sock = makeWASocket({
    auth: state
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update

    if (qr) {
      console.log('SCAN THIS QR CODE 👇')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log('✅ WhatsApp connected successfully')
    }

    if (connection === 'close') {
      console.log('❌ Connection closed, restarting...')
      startBot()
    }
  })

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
