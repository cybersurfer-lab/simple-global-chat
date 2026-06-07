const enc = new TextEncoder();
const dec = new TextDecoder();

// Ableitung eines Schlüssels aus Passphrase (PBKDF2 + AES-GCM)
export async function deriveKey(passphrase) {
    const salt = enc.encode("simple-global-chat-salt"); // für echte Sicherheit: pro Raum/Session zufällig
    const baseKey = await crypto.subtle.importKey(
        "raw",
        enc.encode(passphrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

// String verschlüsseln → Base64
export async function encryptString(key, plaintext) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        enc.encode(plaintext)
    );

    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);

    return btoa(String.fromCharCode(...combined));
}

// Base64 → String entschlüsseln
export async function decryptString(key, b64) {
    const data = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const ciphertext = data.slice(12);

    const plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
    );

    return dec.decode(plaintext);
}
