export class WebRTCManager {
    constructor(localPeerId, onTextMessage, onFileReceived, onPeerConnected, onPeerDisconnected) {
        this.localPeerId = localPeerId;
        this.peers = new Map();
        this.onTextMessage = onTextMessage;
        this.onFileReceived = onFileReceived;
        this.onPeerConnected = onPeerConnected;
        this.onPeerDisconnected = onPeerDisconnected;
    }

    createPeerConnection(remotePeerId) {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        // Text-Channel
        const textChannel = pc.createDataChannel("chat");
        textChannel.onmessage = (e) => this.onTextMessage(remotePeerId, e.data);

        // Datei-Channel
        const fileChannel = pc.createDataChannel("file");
        fileChannel.binaryType = "arraybuffer";

        let incomingFile = null;
        let incomingBuffer = [];

        fileChannel.onmessage = (e) => {
            const data = e.data;

            if (typeof data === "string") {
                const meta = JSON.parse(data);
                incomingFile = meta;
                incomingBuffer = [];
            } else {
                incomingBuffer.push(data);

                if (incomingBuffer.length * 16000 >= incomingFile.size) {
                    const blob = new Blob(incomingBuffer);
                    this.onFileReceived(remotePeerId, incomingFile.name, blob);
                }
            }
        };

        textChannel.onopen = () => this.onPeerConnected(remotePeerId);
        textChannel.onclose = () => this.onPeerDisconnected(remotePeerId);

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                this.onIceCandidate(remotePeerId, e.candidate);
            }
        };

        this.peers.set(remotePeerId, { pc, textChannel, fileChannel });
        return pc;
    }

    async handleOffer(remotePeerId, offer, sendAnswer) {
        const pc = this.createPeerConnection(remotePeerId);
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendAnswer(remotePeerId, answer);
    }

    async handleAnswer(remotePeerId, answer) {
        const peer = this.peers.get(remotePeerId);
        if (peer) {
            await peer.pc.setRemoteDescription(answer);
        }
    }

    async handleCandidate(remotePeerId, candidate) {
        const peer = this.peers.get(remotePeerId);
        if (peer) {
            await peer.pc.addIceCandidate(candidate);
        }
    }

    async createOffer(remotePeerId, sendOffer) {
        const pc = this.createPeerConnection(remotePeerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendOffer(remotePeerId, offer);
    }

    sendText(remotePeerId, msg) {
        const peer = this.peers.get(remotePeerId);
        if (peer && peer.textChannel.readyState === "open") {
            peer.textChannel.send(msg);
        }
    }

    sendFile(remotePeerId, file) {
        const peer = this.peers.get(remotePeerId);
        if (!peer || peer.fileChannel.readyState !== "open") return;

        const chunkSize = 16000;
        const reader = new FileReader();

        peer.fileChannel.send(JSON.stringify({
            name: file.name,
            size: file.size
        }));

        let offset = 0;

        reader.onload = () => {
            peer.fileChannel.send(reader.result);
            offset += reader.result.byteLength;

            if (offset < file.size) {
                readSlice(offset);
            }
        };

        const readSlice = (o) => {
            const slice = file.slice(o, o + chunkSize);
            reader.readAsArrayBuffer(slice);
        };

        readSlice(0);
    }
}
