const express = require('express');
const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

const { state, saveState } = useSingleFileAuthState('./auth.json');

app.get('/qr', async (req, res) => {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on('connection.update', async ({ connection, qr }) => {
    if (qr) {
      const qrImage = await qrcode.toDataURL(qr);
      res.send(`<img src="${qrImage}" style="width:250px;" />`);
    }

    if (connection === 'open') {
      console.log('✅ Conectado');
      saveState();
    }

    if (connection === 'close') {
      console.log('❌ Conexão encerrada.');
    }
  });
});

app.listen(port, () => {
  console.log(`✅ Servidor rodando na porta ${port}`);
});
