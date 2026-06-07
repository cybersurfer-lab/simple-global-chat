export class WebRTCManager {
    constructor(localPeerId, onTextMessage, onFileReceived, onPeerConnected, onPeerDisconnected, onFileProgress) {
        this.localPeerId = localPeerId;
        this.peers = new Map();
        this.onTextMessage = onTextMessage;
        this.onFileReceived = onFileReceived;
        this.onPeerConnected = onPeerConnected;
        this.onPeerDisconnected = onPeerDisconnected;
        this.onFileProgress = onFileProgress;
    }

    createPeerConnection(remotePeerId) {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        const textChannel = pc.createDataChannel("chat");
        const fileChannel = pc.createDataChannel("file");
        fileChannel.binaryType = "arraybuffer";

        let incomingFile = null;
        let incomingBuffer = [];
        let receivedBytes = 0;

        textChannel.onmessage = (e) => this.onTextMessage(remotePeerId, e.data);

        fileChannel.onmessage = (e) => {
            const data = e.data;

            if (typeof data === "string") {
                const meta = JSON.parse(data);
                incomingFile = meta;
                incomingBuffer = [];
                receivedBytes = 0;
                this.onFileProgress(0, `Empfange: ${meta.name}`);
            } else {
                incomingBuffer.push(data);
                receivedBytes += data.byteLength;
                const percent = Math.min(100, Math.round((receivedBytes / incomingFile.size) * 100));
                this.onFileProgress(percent, `Empfange: ${incomingFile.name} (${percent}%)`);

                if (receivedBytes >= incomingFile.size) {
                    const blob = new Blob(incomingBuffer);
                    this.onFileProgress(100, `Empfangen: ${incomingFile.name}`);
                    this.onFileReceived(remotePeerId, incomingFile.name, blob);
                    setTimeout(() => this.onFileProgress(0, ""), 1000);
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

        const readSlice = (o) => {
            const slice = file.slice(o, o + chunkSize);
            reader.readAsArrayBuffer(slice);
        };

        reader.onload = () => {
            peer.fileChannel.send(reader.result);
            offset += reader.result.byteLength;

            const percent = Math.min(100, Math.round((offset / file.size) * 100));
            this.onFileProgress(percent, `Sende: ${file.name} (${percent}%)`);

            if (offset < file.size) {
                readSlice(offset);
            } else {
                setTimeout(() => this.onFileProgress(0, ""), 1000);
            }
        };

        this.onFileProgress(0, `Sende: ${file.name}`);
        readSlice(0);
    }
}
