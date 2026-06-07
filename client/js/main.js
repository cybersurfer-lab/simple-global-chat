import { Signaling } from "./signaling.js";
import { WebRTCManager } from "./webrtc.js";
import { UI } from "./ui.js";

const peerId = crypto.randomUUID();
const room = "global";

// HIER DEINE WEBSOCKET-URL EINTRAGEN
const signalingUrl = "wss://DEIN-SERVER-HIER";

const ui = new UI();
ui.log("Deine Peer-ID: " + peerId);

const signaling = new Signaling(signalingUrl, peerId);
const rtc = new WebRTCManager(
    peerId,
    (from, msg) => ui.log(from + ": " + msg),
    (from, filename, blob) => ui.onFileReceived(from, filename, blob),
    (peer) => ui.log("Peer verbunden: " + peer),
    (peer) => ui.log("Peer getrennt: " + peer)
);

signaling.connect();

signaling.on("peers", (data) => {
    data.payload.peers.forEach((p) => {
        rtc.createOffer(p, (to, offer) => {
            signaling.send("offer", room, to, offer);
        });
    });
});

signaling.on("offer", async (data) => {
    await rtc.handleOffer(data.from, data.payload, (to, answer) => {
        signaling.send("answer", room, to, answer);
    });
});

signaling.on("answer", async (data) => {
    await rtc.handleAnswer(data.from, data.payload);
});

signaling.on("candidate", async (data) => {
    await rtc.handleCandidate(data.from, data.payload);
});

signaling.join(room);

ui.onSendText((msg) => {
    ui.log("Du: " + msg);
    for (const [peerId] of rtc.peers) {
        rtc.sendText(peerId, msg);
    }
});

ui.onSendFile((file) => {
    ui.log("📤 Datei senden: " + file.name);
    for (const [peerId] of rtc.peers) {
        rtc.sendFile(peerId, file);
    }
});
