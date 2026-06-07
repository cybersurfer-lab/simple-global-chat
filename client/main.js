const signalingUrl = 'WSS_URL_HIER_EINTRAGEN'; // z.B. wss://deinserver.repl.co
const ws = new WebSocket(signalingUrl);

let pc;
let dataChannel;

function setupPeerConnection() {
  pc = new RTCPeerConnection();

  dataChannel = pc.createDataChannel('chat');
  dataChannel.onmessage = e => log('Peer: ' + e.data);

  pc.onicecandidate = e => {
    if (e.candidate) {
      ws.send(JSON.stringify({ type: 'candidate', candidate: e.candidate }));
    }
  };
}

function log(text) {
  const logEl = document.getElementById('log');
  logEl.value += text + '\n';
}

ws.onopen = () => {
  setupPeerConnection();
  pc.createOffer().then(offer => {
    pc.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: 'offer', offer }));
  });
};

ws.onmessage = async e => {
  const msg = JSON.parse(e.data);

  if (msg.type === 'offer') {
    setupPeerConnection();
    await pc.setRemoteDescription(msg.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    ws.send(JSON.stringify({ type: 'answer', answer }));
  } else if (msg.type === 'answer') {
    await pc.setRemoteDescription(msg.answer);
  } else if (msg.type === 'candidate') {
    try {
      await pc.addIceCandidate(msg.candidate);
    } catch (err) {
      console.error(err);
    }
  }
};

document.getElementById('send').onclick = () => {
  const msg = document.getElementById('msg').value;
  if (dataChannel && dataChannel.readyState === 'open') {
    dataChannel.send(msg);
    log('Du: ' + msg);
  }
};
