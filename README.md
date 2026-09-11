# certonis.com

Website der **Certonis GmbH** — statisch, ohne Build-Schritt, gehostet auf GitHub Pages.

Keine Frameworks, keine Tracker, keine Cookies. Schriften liegen lokal im Repo
(DSGVO-konform, kein Google-Fonts-Aufruf).

---

## Struktur

Die HTML-Dateien im Wurzelverzeichnis werden **erzeugt**. Bearbeitet wird
ausschließlich `src/`, danach `node build.js`.

```
src/layout.html        HTML-Gerüst (head, Meta, Skripte)
src/partials/nav.html  Navigation und mobiles Menü
src/partials/footer.html
src/sections/*.html    Die Inhaltsbausteine (hero, preise, faq, …)
src/pages/*.html       Ganzseiten-Inhalte (Impressum, Datenschutz, AGB, 404)
build.js               Setzt daraus die Seiten und die sitemap.xml zusammen

index.html             Startseite — kurz, mit Kacheln zu den Unterseiten
leistungen.html        Leistungen + Odoo-Module
ablauf.html            Sechs Schritte + Zeitplan
ki.html                Warum KI + Ausgangslage
preise.html            Preise
sicherheit.html        Sicherheit & Datenschutz
faq.html               Häufige Fragen
kontakt.html           Kontaktformular
impressum.html         Impressum (§ 5 ECG, § 14 UGB, MedienG)
datenschutz.html       Datenschutzerklärung
agb.html               AGB (Entwurf — bitte anwaltlich prüfen lassen)
404.html               Fehlerseite

css/main.css           Komplettes Designsystem
js/config.js           ► Einstellungen: Kontakt-Endpoint, E-Mail, Buchungslink
js/i18n.js             Sprachumschaltung DE/EN
js/app.js              Scroll-, Reveal- und Interaktions-Engine
js/form.js             Kontaktformular
js/gl.js               WebGL-Hintergrund (Shader)

assets/fonts/          Inter + Space Grotesk (variable woff2, selbst gehostet)
assets/img/            Bildwelt (mit generativer KI erstellt)
assets/icons/          Logo, Favicon, PWA-Icons

worker/                Cloudflare Worker: Formular → Microsoft 365 (optional)
CNAME                  certonis.com
```

## Inhalte ändern

```bash
# 1. Baustein bearbeiten, z. B. einen Preis
nano src/sections/preise.html

# 2. Seiten neu erzeugen
node build.js

# 3. Ansehen, dann committen und pushen
python3 -m http.server 8000
```

Die erzeugten Dateien tragen oben einen Hinweis und dürfen nicht direkt
bearbeitet werden — der nächste Build überschreibt sie. Der Deploy-Workflow
prüft, ob Erzeugtes und `src/` zusammenpassen, und bricht sonst ab.

**Neue Seite anlegen:** Baustein in `src/sections/` ablegen, in `build.js` einen
Eintrag im Array `PAGES` ergänzen (Datei, Pfad, Titel, Description, englische
Fassung, Bausteine) und die Navigation in `src/partials/nav.html` erweitern.
Sitemap und Breadcrumb-Daten entstehen automatisch.

**Texte:** Deutsch steht direkt im Markup, Englisch in `js/i18n.js` unter dem
jeweiligen `data-i18n`-Schlüssel. Wird ein deutscher Text geändert, gehört der
englische mitgepflegt. Titel und Description je Seite stehen in `build.js`.

## Lokal ansehen

```bash
python3 -m http.server 8000
# http://localhost:8000
```

---

## 1. DNS für certonis.com

Beim Domain-Anbieter folgende Einträge setzen. **A- und AAAA-Records auf die
Apex-Domain, ein CNAME für www.** Bestehende A-/AAAA-Records für `@` vorher
löschen (z. B. Parking-Seiten des Registrars).

| Typ   | Name / Host | Wert                  | TTL  |
|-------|-------------|-----------------------|------|
| A     | `@`         | `185.199.108.153`     | 3600 |
| A     | `@`         | `185.199.109.153`     | 3600 |
| A     | `@`         | `185.199.110.153`     | 3600 |
| A     | `@`         | `185.199.111.153`     | 3600 |
| AAAA  | `@`         | `2606:50c0:8000::153` | 3600 |
| AAAA  | `@`         | `2606:50c0:8001::153` | 3600 |
| AAAA  | `@`         | `2606:50c0:8002::153` | 3600 |
| AAAA  | `@`         | `2606:50c0:8003::153` | 3600 |
| CNAME | `www`       | `certoclavdevelopment-ux.github.io` | 3600 |

Der CNAME-Wert ist der GitHub-Account, unter dem dieses Repository liegt
(`certoclavdevelopment-ux`) — **nicht** der Repository-Name. Wechselt der
Account, muss dieser Eintrag mitwandern.

Manche Oberflächen zeigen den Wert mit Punkt am Ende
(`certoclavdevelopment-ux.github.io.`). Das ist dieselbe Angabe: der Punkt
markiert in der DNS-Schreibweise einen absoluten Namen. Bei IONOS wird er
automatisch ergänzt, dort genügt die Eingabe ohne Punkt.

E-Mail für info@certonis.com läuft unabhängig davon über die MX-Einträge von
Microsoft 365. Diese bleiben unverändert; GitHub Pages betrifft nur A, AAAA und
den www-CNAME.

### GitHub Pages aktivieren

1. Repository → **Settings → Pages**
2. *Source*: **GitHub Actions**
3. *Custom domain*: `certonis.com` eintragen und speichern
4. Nach der DNS-Prüfung **Enforce HTTPS** aktivieren
   (das Zertifikat wird automatisch ausgestellt, das dauert bis zu einer Stunde)

Die Datei `CNAME` im Repository sorgt dafür, dass die Domain bei jedem Deploy
erhalten bleibt. `.nojekyll` verhindert, dass GitHub die Dateien durch Jekyll
schickt.

---

## 2. Kontaktformular scharf schalten

Ohne Konfiguration öffnet das Formular das E-Mail-Programm der Besucherin mit
fertig ausgefüllter Anfrage — es geht also nie eine Anfrage verloren. Für echten
Serverversand gibt es zwei Wege.

### Variante A — Cloudflare Worker mit Microsoft 365 (empfohlen)

Versendet direkt über das Postfach `info@certonis.com`.

**In Microsoft Entra ID (Azure AD):**

1. **App-Registrierungen → Neue Registrierung**, Name z. B. `certonis-website-contact`
2. Aus der Übersicht notieren: **Anwendungs-ID (Client)** und **Verzeichnis-ID (Mandant)**
3. **Zertifikate & Geheimnisse → Neuer geheimer Clientschlüssel** → Wert kopieren
   (wird nur einmal angezeigt)
4. **API-Berechtigungen → Microsoft Graph → Anwendungsberechtigungen → `Mail.Send`**
   hinzufügen, danach **Administratorzustimmung erteilen**
5. Empfohlen: Zugriff auf das eine Postfach einschränken (Exchange Online PowerShell)

   ```powershell
   New-ApplicationAccessPolicy -AppId <CLIENT_ID> `
     -PolicyScopeGroupId info@certonis.com `
     -AccessRight RestrictAccess `
     -Description "Certonis website contact form"
   ```

**Worker deployen:**

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put MS_TENANT_ID
npx wrangler secret put MS_CLIENT_ID
npx wrangler secret put MS_CLIENT_SECRET
npx wrangler deploy
```

Die ausgegebene URL in `js/config.js` eintragen:

```js
contactEndpoint: "https://certonis-contact.<subdomain>.workers.dev",
```

Die Secrets liegen ausschließlich bei Cloudflare, nie im Repository.

### Variante B — Formspree oder Web3Forms

Ohne eigenen Server, dafür mit einem Drittanbieter in der Kette
(Datenschutzerklärung entsprechend ergänzen):

```js
// Formspree
contactEndpoint: "https://formspree.io/f/XXXXXXXX",

// Web3Forms
contactEndpoint: "https://api.web3forms.com/submit",
web3formsKey: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
```

---

## 3. Weitere Einstellungen

Alles Wichtige steckt in `js/config.js`:

| Feld              | Bedeutung |
|-------------------|-----------|
| `contactEndpoint` | Ziel des Formulars (leer = mailto-Fallback) |
| `web3formsKey`    | nur für Web3Forms |
| `email`           | Kontaktadresse für Fallback und Anzeige |
| `bookingUrl`      | Calendly / Cal.com / MS Bookings — füllt alle „Discovery Call"-Buttons. Leer = Sprung zum Formular |
| `successRedirect` | Optionale Danke-Seite nach erfolgreichem Versand |

Texte stehen direkt im HTML (Deutsch) und in `js/i18n.js` (Englisch). Wird ein
deutscher Text geändert, gehört der passende Schlüssel in `i18n.js` mitgepflegt.

---

## 4. Bilder neu erzeugen

Die Bildwelt wurde mit der OpenAI Image API erstellt. Die Prompts liegen nicht im
Repository; erzeugte Dateien sind als WebP/JPEG eingecheckt. Zum Austauschen
einfach die Dateien in `assets/img/` ersetzen (gleiche Namen, gleiche Seitenverhältnisse).

---

## Barrierefreiheit und Performance

- Vollständig ohne JavaScript lesbar; Animationen sind Zugabe, nicht Voraussetzung
- `prefers-reduced-motion` schaltet Shader, Grain und alle Bewegungen ab
- Tastaturbedienbar, sichtbarer Fokus, Skip-Link, ARIA-Zustände an Menü und FAQ
- Schriften und Bilder lokal, keine externen Requests zur Laufzeit
