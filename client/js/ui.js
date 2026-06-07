export class UI {
    constructor() {
        this.logEl = document.getElementById("log");
        this.msgEl = document.getElementById("msg");
        this.sendBtn = document.getElementById("send");
        this.fileInput = document.getElementById("fileInput");
        this.sendFileBtn = document.getElementById("sendFile");
        this.usernameEl = document.getElementById("username");
        this.roomEl = document.getElementById("room");
        this.passphraseEl = document.getElementById("passphrase");
        this.joinRoomBtn = document.getElementById("joinRoom");
        this.progressFill = document.getElementById("progress-fill");
        this.progressText = document.getElementById("progress-text");
        this.themeToggle = document.getElementById("themeToggle");

        const savedTheme = localStorage.getItem("theme") || "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);
        this.themeToggle.checked = savedTheme === "light";

        this.themeToggle.addEventListener("change", () => {
            const theme = this.themeToggle.checked ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", theme);
            localStorage.setItem("theme", theme);
        });
    }

    getUsername() {
        return this.usernameEl.value.trim() || "Anon";
    }

    getRoom() {
        return this.roomEl.value.trim() || "global";
    }

    getPassphrase() {
        return this.passphraseEl.value.trim() || "";
    }

    onJoinRoom(callback) {
        this.joinRoomBtn.onclick = () => {
            callback(this.getRoom(), this.getPassphrase());
        };
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

    onFileReceived(peerName, filename, blob) {
        const url = URL.createObjectURL(blob);
        this.log(`📁 Datei von ${peerName}: ${filename}`);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.textContent = "Download " + filename;
        a.style.display = "block";
        a.style.marginTop = "5px";

        document.body.appendChild(a);
    }

    setProgress(percent, text) {
        this.progressFill.style.width = percent + "%";
        this.progressText.textContent = text || "";
    }
}
