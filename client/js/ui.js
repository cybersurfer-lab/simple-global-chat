export class UI {
    constructor() {
        this.logEl = document.getElementById("log");
        this.msgEl = document.getElementById("msg");
        this.sendBtn = document.getElementById("send");
    }

    log(text) {
        this.logEl.value += text + "\n";
        this.logEl.scrollTop = this.logEl.scrollHeight;
    }

    onSend(callback) {
        this.sendBtn.onclick = () => {
            const msg = this.msgEl.value;
            this.msgEl.value = "";
            callback(msg);
        };
    }
}
