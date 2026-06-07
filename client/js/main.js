import { Signaling } from "./signaling.js";
import { WebRTCManager } from "./webrtc.js";
import { UI } from "./ui.js";
import { deriveKey, encryptString, decryptString } from "./crypto.js";

const peerId = crypto.randomUUID();

// HIER DEINE WEBSOCKET-URL EINTRAGEN
const signalingUrl = "wss://DEIN-SERVER-HIER";

const ui = new UI();
ui.log("Deine Peer-ID: " + peerId);

let currentRoom = ui.getRoom();
let signaling = null;
let rtc = null;
let cryptoKey = null;

// Map: peerId -> username
const peerNames = new Map();
peerNames.set(peerId, "Du");

async function setupCrypto(passphrase) {
    if (!passphrase) {
        cryptoKey = null;
        ui.log("⚠️ Keine E2EE: kein Passwort gesetzt.");
        return;
    }
    cryptoKey = await deriveKey(passphrase);
    ui.log("🔐 E2EE aktiv für diesen Raum.");
}

function displayIncomingMessage(from, plaintext) {
    const name = peerNames.get(from) || from;
    ui.log(name + ": " + plaintext);
}

function init(room, passphrase) {
    currentRoom = room;
    ui.log(`Raum: ${room}`);

    signaling = new Signaling(signalingUrl, peerId);
    rtc = new WebRTCManager(
        peerId,
        async (from, msg) => {
            // eingehende Textnachricht (evtl. verschlüsselt)
            if (cryptoKey) {
                try {
                    const decrypted = await decryptString(cryptoKey, msg);
                    displayIncomingMessage(from, decrypted);
                } catch (e) {
                    ui.log("❌ Entschlüsselung fehlgeschlagen (falsches Passwort?)");
                }
            } else {
                displayIncomingMessage(from, msg);
            }
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

    // Crypto vorbereiten
    setupCrypto(passphrase);
}

// Text senden
ui.onSendText(async (msg) => {
    const myName = ui.getUsername();
    let toSend = msg;

    if (cryptoKey) {
        try {
            toSend = await encryptString(cryptoKey, msg);
            ui.log(`(🔐) ${myName}: ${msg}`);
        } catch (e) {
            ui.log("❌ Verschlüsselung fehlgeschlagen, sende Klartext.");
        }
    } else {
        ui.log(myName + ": " + msg);
    }

    for (const [id] of rtc.peers) {
        rtc.sendText(id, toSend);
    }
});

// Datei senden (noch ohne E2EE)
ui.onSendFile((file) => {
    ui.log(`📤 Datei senden: ${file.name}`);
    for (const [id] of rtc.peers) {
        rtc.sendFile(id, file);
    }
});

// Raum wechseln
ui.onJoinRoom((room, passphrase) => {
    ui.log(`Wechsle in Raum: ${room}`);
    if (signaling) {
        signaling.leave(currentRoom);
    }
    init(room, passphrase);
});

// Start
init(currentRoom, ui.getPassphrase());
