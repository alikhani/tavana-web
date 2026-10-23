# tavana-web

Statisk landningssida för Tavana på https://tavana.app. Ren HTML/CSS – ingen build,
inget ramverk, ingen JavaScript. Inga kakor, ingen analys, inga externa typsnitt eller
CDN:er och inga formulär; sidan behandlar inga personuppgifter.

## Struktur

```
/                      svenska (rot)
├── index.html         startsida: hero, så fungerar det, dagsform, integritet, "kommer snart"
├── privacy.html       /privacy  – ram, policytext saknas (se platshållare)
├── terms.html         /terms    – ram, villkorstext saknas
├── support.html       /support  – kontaktadress (mailto) och vanliga frågor
├── delete-account.html /delete-account – radera konto i appen eller via mejl
├── 404.html           tvåspråkig 404 (Vercel använder den automatiskt)
├── en/                engelska, samma sidor och samma struktur
├── assets/            style.css, logotyper, favicon, apple-touch-icon, OG-bild
├── robots.txt, sitemap.xml
└── vercel.json        cleanUrls + säkerhetsheaders (CSP utan externa källor)
```

Vägarna `/privacy` och `/terms` länkas från iOS-appen
(`tavana-ios/Coach/Features/Consent/ConsentView.swift:4`,
`Settings/SettingsView.swift:654,666`) och får inte byta namn.

Färger kommer från `tavana-ios/Shared/Theme.swift` (`Theme.Palette`), logotypen från
`Coach/Assets.xcassets/TavanaLogo` (två varianter med fasta färger för ljust/mörkt läge,
eftersom CSP:n inte tillåter inbäddad `<style>` i SVG:n) och ikonerna är nedskalade från
`AppIcon.png`. Mörkt läge följer `prefers-color-scheme`.

Sidorna har gemensam header/footer. Ändras de måste alla elva HTML-filer uppdateras
(det finns ingen build som gör det åt dig).

## Förhandsgranska lokalt

```bash
npx serve .            # hanterar rena URL:er (/privacy) som Vercel
# eller
python3 -m http.server 8000   # rena URL:er fungerar inte här: öppna /privacy.html
```

`npx serve` läser inte `vercel.json`s headers. För att testa exakt som Vercel:
`npx vercel dev`.

## Deploya till Vercel och koppla tavana.app

1. Pusha repot till GitHub.
2. Vercel → *Add New → Project* → importera repot. Framework preset: **Other**,
   ingen build command, output directory: roten (`.`).
3. Projektets *Settings → Domains*: lägg till `tavana.app` (och gärna `www.tavana.app`
   med redirect till `tavana.app`). Domänen pekar redan på Vercel, så det räcker att
   koppla den till det här projektet.
4. Kontrollera efter deploy: `curl -sI https://tavana.app/privacy` ska ge 200 och
   headern `content-security-policy`.

Alternativt från terminalen: `npx vercel` (förhandsversion) och `npx vercel --prod`.

## Platshållare – måste fyllas i före lansering

- [ ] **Supportadress `support@tavana.app`** – inte bekräftad. Finns bara i
      `support.html` och `en/support.html` (markerad med `<!-- FYLL I -->`; både
      `mailto:`-länken, den synliga texten och raderingslänkens `mailto:`). Övriga sidor
      länkar till supportsidan. Kontrollera att adressen faktiskt tar emot mejl.
- [ ] **Integritetspolicy** – `privacy.html` och `en/privacy.html` visar bara
      "publiceras före lansering". Ersätt `.placeholder`-blocket med den granskade texten
      (se HTML-kommentaren) och fyll i "Senast uppdaterad". Publicera inte utkasten i
      `docs/legal/` som de är – de innehåller interna noteringar och `[BESLUTA]`-luckor.
- [ ] **Användarvillkor** – samma sak i `terms.html` och `en/terms.html`.
- [ ] **Radering: lagringstider/undantag** – kommentar i `delete-account.html` och
      `en/delete-account.html`; komplettera när policyn är fastställd (och när
      radering når alla mottagare, go-live-plan A3).
- [ ] **App Store-länk** – startsidan säger "Kommer snart på App Store" utan länk.
      Byt mot länk + Apples officiella märke (som lokal fil) när appen är publicerad
      (kommentar i `index.html` och `en/index.html`).
- [ ] **Copyright-raden** "© 2026 Tavana" i sidfoten – byt till personuppgiftsansvarig/
      firmanamn om det ska stå där.
- [ ] **OG-bild** – i dag appikonen (512×512). En riktig 1200×630-bild kan läggas till senare.
