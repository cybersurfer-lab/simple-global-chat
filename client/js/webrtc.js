export class WebRTCManager {
    constructor(localPeerId, onMessage, onPeerConnected, onPeerDisconnected) {
        this.localPeerId = localPeerId;
        this.peers = new Map();
        this.onMessage = onMessage;
        this.onPeerConnected = onPeerConnected;
        this.onPeerDisconnected = onPeerDisconnected;
    }

    createPeerConnection(remotePeerId) {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        const channel = pc.createDataChannel("chat");
        channel.onmessage = (e) => this.onMessage(remotePeerId, e.data);
        channel.onopen = () => this.onPeerConnected(remotePeerId);
        channel.onclose = () => this.onPeerDisconnected(remotePeerId);

        pc.onicecandidate = (e) => {
            if (e.candidate) {
                this.onIceCandidate(remotePeerId, e.candidate);
            }
        };

        this.peers.set(remotePeerId, { pc, channel });
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

    sendMessage(remotePeerId, msg) {
        const peer = this.peers.get(remotePeerId);
        if (peer && peer.channel.readyState === "open") {
            peer.channel.send(msg);
        }
    }
}
