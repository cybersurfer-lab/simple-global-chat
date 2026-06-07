export class Signaling {
    constructor(url, peerId) {
        this.url = url;
        this.peerId = peerId;
        this.ws = null;
        this.handlers = {};
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("Signaling connected");
        };

        this.ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            if (this.handlers[data.type]) {
                this.handlers[data.type](data);
            }
        };

        this.ws.onclose = () => console.log("Signaling closed");
        this.ws.onerror = (err) => console.error("Signaling error:", err);
    }

    on(type, callback) {
        this.handlers[type] = callback;
    }

    send(type, room, to, payload = {}) {
        this.ws.send(JSON.stringify({
            type,
            room,
            from: this.peerId,
            to,
            payload
        }));
    }

    join(room) {
        this.send("join", room, null, {});
    }

    leave(room) {
        this.send("leave", room, null, {});
    }
}
