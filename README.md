# Simple Global Chat – Anleitung für Nutzer

Willkommen beim Simple Global Chat.  
Mit diesem Chat kannst du weltweit mit anderen Menschen schreiben, Dateien austauschen und private Räume nutzen – alles ohne Anmeldung.

---

## 1. Starten

Öffne einfach die Webseite des Chats.  
Du brauchst keine Registrierung und keine Installation.

---

## 2. Benutzername eingeben

Oben auf der Seite findest du ein Feld für deinen Namen.

Gib dort ein, wie du im Chat angezeigt werden möchtest.  
Du kannst jeden beliebigen Namen verwenden.

---

## 3. Einen Raum auswählen

Darunter findest du ein Feld für den Raum.

Ein Raum ist wie ein eigener Chatbereich.  
Alle Nutzer, die denselben Raum eingeben, können miteinander schreiben.

Beispiele für Räume:
- global
- gaming
- freunde
- test

Wenn du nichts eingibst, wird automatisch „global“ verwendet.

---

## 4. Optional: Passwort für private Chats

Wenn du ein Passwort eingibst, werden deine Nachrichten verschlüsselt.

Das bedeutet:
- Niemand kann mitlesen
- Der Server sieht nur verschlüsselten Text
- Nur Nutzer mit dem gleichen Passwort können deine Nachrichten lesen

Wenn du kein Passwort eingibst, ist der Chat öffentlich.

---

## 5. Raum betreten

Klicke auf „Raum betreten“.

Jetzt bist du im Chat und kannst sofort loslegen.

---

## 6. Nachrichten senden

Unten findest du ein Textfeld.

- Schreibe deine Nachricht hinein
- Klicke auf „Senden“

Wenn du ein Passwort gesetzt hast, wird die Nachricht automatisch verschlüsselt.

---

## 7. Dateien senden

Du kannst Dateien an andere Nutzer schicken.

So geht’s:
1. Datei auswählen
2. Auf „Datei senden“ klicken

Die Datei wird direkt von deinem Gerät zum Gerät des anderen Nutzers übertragen.

---

## 8. Räume wechseln

Du kannst jederzeit den Raum wechseln.

Einfach:
- Neuen Raum eingeben
- „Raum betreten“ klicken

Du verlässt automatisch den alten Raum.

---

## 9. Dark/Light‑Theme

Oben rechts kannst du zwischen hellem und dunklem Design wechseln.

Das Theme wird gespeichert und beim nächsten Besuch automatisch geladen.

---

## 10. Nutzung auf dem Handy

Der Chat funktioniert auch auf Smartphones und Tablets.

Die Oberfläche passt sich automatisch an:
- Eingabefelder werden größer
- Buttons sind leichter zu drücken
- Alles bleibt übersichtlich

---

## 11. Sicherheit

- Du brauchst keine Anmeldung
- Es werden keine persönlichen Daten gespeichert
- Nachrichten können verschlüsselt werden
- Dateien werden direkt übertragen (Peer‑to‑Peer)

---

## 12. Zusammenfassung

Mit Simple Global Chat kannst du:

- Sofort chatten
- Dateien senden
- Private Räume nutzen
- Nachrichten verschlüsseln
- Ohne Registrierung loslegen
- Auf jedem Gerät chatten

Viel Spaß beim Chatten!


# Simple Global Chat – Anleitung und Hosting

## Überblick

Simple Global Chat ist ein weltweiter Peer-to-Peer-Chat, der ohne Anmeldung funktioniert. Nachrichten und Dateien werden direkt zwischen den Browsern der Nutzer übertragen. Der Server dient ausschließlich zur Signalisierung und sieht keine Inhalte. Der Client unterstützt Textchat, Dateiübertragung, Räume, Benutzernamen, Dark/Light-Theme, mobile Darstellung und Ende-zu-Ende-Verschlüsselung für Textnachrichten.

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
1. Server online stellen

Der Server kann kostenlos auf Render.com oder Replit.com gehostet werden.

### Option A: Render.com (empfohlen)

1. Auf render.com einloggen.
2. „New Web Service“ erstellen.
3. Dein Repository auswählen.
4. Als Root-Ordner den Ordner „server“ auswählen.
5. Sprache: Node.js.
6. Build Command: npm install
7. Start Command: node server.js
8. Deploy starten.
9. Render erzeugt eine URL wie: https://dein-server.onrender.com
10. Für WebSockets wird daraus: wss://dein-server.onrender.com
11. Diese WebSocket-URL später im Client eintragen.

### Option B: Replit.com

1. Auf replit.com einloggen.
2. Neues Repl erstellen, Sprache Node.js.
3. Die Dateien aus dem Ordner „server“ hochladen.
4. Start Command: node server.js
5. Replit erzeugt eine URL wie: https://dein-server.repl.co
6. WebSocket-URL lautet: wss://dein-server.repl.co
7. Diese WebSocket-URL später im Client eintragen.

---

## 2. Client über GitHub Pages hosten

1. In deinem Repository muss der Client im Ordner „client“ liegen.
2. GitHub öffnen, Repository auswählen.
3. Settings öffnen.
4. Links im Menü „Pages“ auswählen.
5. Source: main.
6. Folder: /client.
7. Speichern.
8. GitHub erzeugt eine URL wie: https://DEINNAME.github.io/simple-global-chat

Diese URL ist dein weltweit erreichbarer Client.

---

## 3. Client mit Server verbinden

Im Client befindet sich eine Datei namens main.js im Ordner client/js.

Dort gibt es eine Zeile, in der die WebSocket-URL eingetragen wird.

Diese Zeile muss angepasst werden, damit der Client weiß, wo dein Server läuft.

Beispiel:

const signalingUrl = "wss://dein-server.onrender.com"

Diese URL muss exakt mit der WebSocket-URL deines Servers übereinstimmen.

---

## 4. Testen

1. Öffne den Client in zwei Browserfenstern oder auf zwei Geräten.
2. Gib einen Benutzernamen ein.
3. Gib einen Raum ein, zum Beispiel „global“.
4. Optional: Gib ein Passwort ein, um Ende-zu-Ende-Verschlüsselung zu aktivieren.
5. Klicke auf „Raum betreten“.
6. Jetzt kannst du Nachrichten senden, Dateien übertragen, Räume wechseln und das Theme ändern.

---

## 5. Ende-zu-Ende-Verschlüsselung (E2EE)

Wenn ein Passwort eingegeben wird, werden Textnachrichten verschlüsselt. Der Server sieht nur verschlüsselten Text. Nur Nutzer mit dem gleichen Passwort können Nachrichten entschlüsseln. Dateien sind aktuell nicht verschlüsselt.

---

## 6. Mobile-Optimierung

Der Client ist vollständig responsive. Auf mobilen Geräten werden Eingabefelder gestapelt, Buttons vergrößert und das Layout passt sich automatisch an. Dark/Light-Theme funktioniert ebenfalls auf mobilen Geräten.

---

## 7. Projektstruktur

simple-global-chat  
├── server  
│   ├── server.js  
│   └── package.json  
└── client  
    ├── index.html  
    ├── css  
    │   └── style.css  
    └── js  
        ├── main.js  
        ├── signaling.js  
        ├── webrtc.js  
        ├── ui.js  
        └── crypto.js

---

## Wichtig

Die einzige Stelle, die du anpassen musst, ist die WebSocket-URL in der Datei main.js im Client.

---

## Fertig

Du hast jetzt alles, was du brauchst, um den globalen Chat zu hosten und zu betreiben.
