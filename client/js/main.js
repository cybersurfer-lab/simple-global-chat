import { Signaling } from "./signaling.js";
import { WebRTCManager } from "./webrtc.js";
import { UI } from "./ui.js";

const peerId = crypto.randomUUID();

// HIER DEINE WEBSOCKET-URL EINTRAGEN
const signalingUrl = "wss://DEIN-SERVER-HIER";

const ui = new UI();
ui.log("Deine Peer-ID: " + peerId);

let currentRoom = ui.getRoom();
let signaling = null;
let rtc = null;

// Map: peerId -> username
const peerNames = new Map();
peerNames.set(peerId, "Du");

function init(room) {
    currentRoom = room;
    ui.log(`Raum: ${room}`);

    signaling = new Signaling(signalingUrl, peerId);
    rtc = new WebRTCManager(
        peerId,
        (from, msg) => {
            const name = peerNames.get(from) || from;
            ui.log(name + ": " + msg);
        },
        (from, filename, blob) => {
            const name = peerNames.get(from) || from;
            ui.onFileReceived(name, filename, blob);
        },
        (peer) => {
            const name = peerNames.get(peer) || peer;
            ui.log("Peer verbunden: " + name);
        },
        (peer) => {
            const name = peerNames.get(peer) || peer;
            ui.log("Peer getrennt: " + name);
        },
        (percent, text) => ui.setProgress(percent, text)
    );

    signaling.connect();

    signaling.on("peers", (data) => {
        // hier könnten später Namen mit übertragen werden
        data.payload.peers.forEach((p) => {
            rtc.createOffer(p, (to, offer) => {
                signaling.send("offer", currentRoom, to, offer);
            });
        });
    });

    signaling.on("offer", async (data) => {
        await rtc.handleOffer(data.from, data.payload, (to, answer) => {
            signaling.send("answer", currentRoom, to, answer);
        });
    });

    signaling.on("answer", async (data) => {
        await rtc.handleAnswer(data.from, data.payload);
    });

    signaling.on("candidate", async (data) => {
        await rtc.handleCandidate(data.from, data.payload);
    });

    signaling.on("join", (data) => {
        const name = data.payload?.username || data.from;
        peerNames.set(data.from, name);
        ui.log(`👤 ${name} ist dem Raum beigetreten`);
    });

    signaling.on("leave", (data) => {
        const name = peerNames.get(data.from) || data.from;
        ui.log(`👤 ${name} hat den Raum verlassen`);
    });

    // Raum betreten, Username mitgeben
    signaling.send("join", currentRoom, null, { username: ui.getUsername() });
}

// Text senden
ui.onSendText((msg) => {
    const myName = ui.getUsername();
    ui.log(myName + ": " + msg);
    for (const [id] of rtc.peers) {
        rtc.sendText(id, msg);
    }
});

// Datei senden
ui.onSendFile((file) => {
    ui.log(`📤 Datei senden: ${file.name}`);
    for (const [id] of rtc.peers) {
        rtc.sendFile(id, file);
    }
});

// Raum wechseln
ui.onJoinRoom((room) => {
    ui.log(`Wechsle in Raum: ${room}`);
    if (signaling) {
        signaling.leave(currentRoom);
    }
    init(room);
});

// Start
init(currentRoom);
