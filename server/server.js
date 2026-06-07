const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: process.env.PORT || 3030 });

let clients = new Set();

wss.on('connection', ws => {
  clients.add(ws);

  ws.on('message', msg => {
    // Nachricht einfach an alle anderen weiterleiten (Signalisierung)
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

console.log('Signaling server running on port 3030');
