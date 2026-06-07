const WebSocket = require('ws');

const PORT = process.env.PORT || 3030;
const wss = new WebSocket.Server({ port: PORT });

const rooms = new Map();   // roomName -> Set<Client>
const clients = new Map(); // ws -> Client

function getOrCreateRoom(name) {
  if (!rooms.has(name)) {
    rooms.set(name, new Set());
  }
  return rooms.get(name);
}

function broadcastToRoom(roomName, message, exceptWs = null) {
  const room = rooms.get(roomName);
  if (!room) return;
  for (const client of room) {
    if (client.ws.readyState === WebSocket.OPEN && client.ws !== exceptWs) {
      client.ws.send(JSON.stringify(message));
    }
  }
}

function sendToPeerInRoom(roomName, targetPeerId, message) {
  const room = rooms.get(roomName);
  if (!room) return;
  for (const client of room) {
    if (client.peerId === targetPeerId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
      break;
    }
  }
}

function removeClient(ws) {
  const client = clients.get(ws);
  if (!client) return;

  const { room, peerId } = client;
  if (room && rooms.has(room)) {
    const roomSet = rooms.get(room);
    roomSet.delete(client);
    // anderen Peers mitteilen, dass dieser Peer weg ist
    broadcastToRoom(room, {
      type: 'leave',
      room,
      from: peerId,
      to: null,
      payload: {}
    }, ws);

    if (roomSet.size === 0) {
      rooms.delete(room);
    }
  }

  clients.delete(ws);
}

wss.on('connection', ws => {
  // neuen Client registrieren
  const client = { ws, peerId: null, room: null };
  clients.set(ws, client);

  ws.on('message', msg => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.error('Invalid JSON:', msg);
      return;
    }

    const { type, room, from, to, payload } = data;

    if (!type) return;

    switch (type) {
      case 'join': {
        if (!room || !from) return;

        client.peerId = from;
        client.room = room;

        const roomSet = getOrCreateRoom(room);
        roomSet.add(client);

        // Liste der vorhandenen Peers im Raum an neuen Client
        const peers = Array.from(roomSet)
          .filter(c => c.peerId !== from)
          .map(c => c.peerId);

        ws.send(JSON.stringify({
          type: 'peers',
          room,
          from: 'server',
          to: from,
          payload: { peers }
        }));

        // anderen mitteilen, dass neuer Peer da ist
        broadcastToRoom(room, {
          type: 'join',
          room,
          from,
          to: null,
          payload: {}
        }, ws);

        break;
      }

      case 'leave': {
        removeClient(ws);
        break;
      }

      case 'offer':
      case 'answer':
      case 'candidate': {
        if (!room || !from || !to) return;
        // gezielt an Ziel‑Peer weiterleiten
        sendToPeerInRoom(room, to, { type, room, from, to, payload });
        break;
      }

      default:
        console.warn('Unknown message type:', type);
    }
  });

  ws.on('close', () => {
    removeClient(ws);
  });

  ws.on('error', err => {
    console.error('WebSocket error:', err);
    removeClient(ws);
  });
});

console.log(`Signaling server running on port ${PORT}`);
