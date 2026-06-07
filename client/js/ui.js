export class UI {
    constructor() {
        this.logEl = document.getElementById("log");
        this.msgEl = document.getElementById("msg");
        this.sendBtn = document.getElementById("send");
        this.fileInput = document.getElementById("fileInput");
        this.sendFileBtn = document.getElementById("sendFile");
    }

    log(text) {
        this.logEl.value += text + "\n";
        this.logEl.scrollTop = this.logEl.scrollHeight;
    }

    onSendText(callback) {
        this.sendBtn.onclick = () => {
            const msg = this.msgEl.value;
            this.msgEl.value = "";
            callback(msg);
        };
    }

    onSendFile(callback) {
        this.sendFileBtn.onclick = () => {
            const file = this.fileInput.files[0];
            if (file) callback(file);
        };
    }

    onFileReceived(peerId, filename, blob) {
        const url = URL.createObjectURL(blob);
        this.log(`📁 Datei von ${peerId}: ${filename}`);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.textContent = "Download " + filename;

        document.body.appendChild(a);
    }
}
