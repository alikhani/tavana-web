# tavana-web

Statisk promosida för Tavana på https://tavana.app. Ren HTML/CSS – ingen build, inget
ramverk och ingen JavaScript i webbläsaren. Inga kakor, ingen analys, inga externa
typsnitt eller CDN:er och inga formulär; sidan behandlar inga personuppgifter.

## Struktur

```
/                       svenska (rot)
├── index.html          startsida (promosida, se "Startsidans upplägg")
├── privacy.html        /privacy  – ram, policytext saknas (se platshållare)
├── terms.html          /terms    – ram, villkorstext saknas
├── support.html        /support  – kontaktadress (mailto) och vanliga frågor
├── delete-account.html /delete-account – radera konto i appen eller via mejl
├── 404.html            tvåspråkig 404 (Vercel använder den automatiskt)
├── en/                 engelska, samma sidor och samma struktur
├── assets/
│   ├── style.css       all CSS (ljust + mörkt läge via prefers-color-scheme)
│   ├── fonts/          Fraunces + Inter (woff2, latin) och licenserna OFL-*.txt
│   ├── badges/         (saknas än) Apples App Store-märken, se "CTA-lägen"
│   ├── og-sv.png, og-en.png   delningsbilder 1200×630
│   └── logo*.svg, favicon, apple-touch-icon, icon-512.png
├── og-src/             källa för OG-bilderna (deployas inte, se .vercelignore)
├── scripts/set-cta.mjs byter CTA-läge (deployas inte)
├── robots.txt, sitemap.xml
└── vercel.json         cleanUrls, redirecterna /app och /beta, säkerhetsheaders
```

Vägarna `/privacy` och `/terms` länkas från iOS-appen
(`tavana-ios/Coach/Features/Consent/ConsentView.swift:4`,
`Settings/SettingsView.swift:654,666`) och får inte byta namn.

Sidorna har gemensam header/footer utan build. Ändras de måste alla elva HTML-filer
uppdateras.

## Design

- **Färger** från `tavana-ios/Shared/Theme.swift` (`Theme.Palette`): bakgrund `#FBF8F1`,
  brand `#4A5A3D`, varm accent `#E8A838`/`#80600F`, readiness grön/gul/röd, och
  motsvarande mörka värden. Alla definieras som CSS-variabler överst i `style.css`.
- **Typsnitt**: Fraunces (rubriker, variabel vikt, rak + kursiv) och Inter (brödtext),
  båda SIL Open Font License 1.1, hämtade från npm-paketen `@fontsource-variable/fraunces`
  och `@fontsource-variable/inter` 5.3.0, latin-delmängd. Licenserna ligger i
  `assets/fonts/OFL-*.txt`.
- **Animationer**: svag in-tonung av hero, flytande kort och scroll-reveal via
  `animation-timeline: view()` (bara där det stöds). Allt stängs av vid
  `prefers-reduced-motion: reduce`.
- **CSP**: `default-src 'none'` – inga inline-stilar eller inline-skript. Använd klasser.
  JSON-LD (`<script type="application/ld+json">`) är ett datablock som inte körs, så
  CSP:n påverkar det inte.

## Startsidans upplägg

Hero (rubrik, CTA, telefonmockup) → "Känner du igen dig?" (vardagsscener) → Så funkar
det (fyra steg + check-in-mockup) → En dag med Tavana (tidslinje + pass-mockup) →
Dagsform (grön/gul/röd) → För återstartare → Integritet → Vanliga frågor → avslutande CTA.

**Sanningskrav:** sidan påstår bara det appen gör i Release A. Nämn inte AI-coachen
(avstängd i Release A), pris, Apple Watch, cykeldata eller resultatlöften, och inga
påhittade citat, betyg eller siffror.

## CTA-lägen

CTA:n finns i hero, i avslutningsbandet och (i App Store-/TestFlight-läget) som knapp i
headern. Läget styrs av `data-cta` på `<html>` i `index.html` och `en/index.html`:

| Läge | Visar | Länk |
|---|---|---|
| `soon` (nu) | "Kommer snart till iPhone" | – |
| `appstore` (nästa) | Apples officiella App Store-märke + "Hämta appen" i headern | `/app` → App Store |
| `testflight` (sekundärt) | "Testa betan på iPhone" | `/beta` → publik TestFlight-länk |

**Byt läge med ett kommando** (ändra inte filerna för hand):

```bash
node scripts/set-cta.mjs appstore 1234567890      # app-id från App Store Connect
node scripts/set-cta.mjs testflight https://testflight.apple.com/join/XXXXXXXX
node scripts/set-cta.mjs soon
```

App-id är det enda som behövs för App Store-läget. Skriptet sätter `data-cta` på båda
startsidorna, slår på `<meta name="apple-itunes-app" content="app-id=…">` (Safaris Smart
App Banner, mellan `APP-BANNER`-markörerna i `<head>`) och pekar redirecten `/app` i
`vercel.json` på `https://apps.apple.com/app/id<app-id>`. Committa och deploya sedan.
`/app` och `/beta` fungerar också som korta länkar att dela (t.ex. tavana.app/app i en
bio). Tills ett läge är påslaget pekar båda på `/`.

**Före App Store-läget: lägg in Apples officiella märken.** Skriptet vägrar byta läge
om de saknas. Ladda ned från Apple Marketing Tools
(https://tools.applemarketingtools.com/ → "App Store Badges", eller via
https://developer.apple.com/app-store/marketing/guidelines/) som SVG och spara som:

```
assets/badges/app-store-badge-sv.svg        svart märke, svenska ("Ladda ned på App Store")
assets/badges/app-store-badge-sv-white.svg  vitt märke, svenska (mörkt läge + mörkt band)
assets/badges/app-store-badge-en.svg        svart märke, engelska ("Download on the App Store")
assets/badges/app-store-badge-en-white.svg  vitt märke, engelska
```

Ändra inte märkena (färg, text, proportioner) – Apples riktlinjer kräver originalet.
Märket visas 52 px högt; justera inte under Apples minsta storlek.

Efter lansering: uppdatera också "När kommer appen?" i `support.html` och
`en/support.html` och "Android kommer senare"-raderna om det ändras.

## Telefonmockups → riktiga skärmdumpar

Mockuperna är HTML/CSS-illustrationer (märkta "Illustration av appen") som speglar
appens riktiga copy, t.ex. "Tavana rekommenderar ett lättare pass"
(`tavana-ios/Coach/Features/Today/HeroDecisionCard.swift:484`). Byt till riktiga
skärmdumpar så här:

1. Ta skärmdumpar på iPhone 15/16 Pro Max-format, **1290×2796 px**, ljust läge, och
   spara som WebP (kvalitet ~80, gärna < 150 KB styck):
   `assets/screens/sv/today.webp`, `checkin.webp`, `workout.webp` och samma under
   `assets/screens/en/`.
2. I `index.html` och `en/index.html`: ersätt innehållet i varje `<div class="phone-screen">`
   med raden i HTML-kommentaren som står först i den, t.ex.
   `<img src="/assets/screens/sv/today.webp" width="1290" height="2796" alt="">`
   (CSS:en fyller ramen med `object-fit: cover`). Behåll `aria-label` på `.phone`, men
   justera texten så att den beskriver skärmdumpen, och ta bort bildtexten
   "Illustration av appen".
3. Generera om OG-bilderna (nedan) om hero-skärmen ändras.

## OG-bilder

`assets/og-sv.png` och `assets/og-en.png` (1200×630) genereras från `og-src/og-*.html`
med headless Chrome mot en lokal server:

```bash
npx serve -l 8766 . &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --hide-scrollbars --force-prefers-reduced-motion --blink-settings=preferredColorScheme=1 \
  --window-size=1200,630 --screenshot=assets/og-sv.png http://localhost:8766/og-src/og-sv.html
```

## Förhandsgranska lokalt

```bash
npx serve .            # hanterar rena URL:er (/privacy) och 404 som Vercel
```

`npx serve` läser inte `vercel.json`s headers eller redirects. För att testa exakt som
Vercel: `npx vercel dev`.

## Deploya till Vercel och koppla tavana.app

1. Pusha repot till GitHub.
2. Vercel → *Add New → Project* → importera repot. Framework preset: **Other**,
   ingen build command, output directory: roten (`.`).
3. Projektets *Settings → Domains*: lägg till `tavana.app` (och gärna `www.tavana.app`
   med redirect till `tavana.app`).
4. Kontrollera efter deploy: `curl -sI https://tavana.app/privacy` ska ge 200 och
   headern `content-security-policy`.

## Platshållare – måste fyllas i före lansering

- [ ] **Supportadress `support@tavana.app`** – inte bekräftad. Finns bara i
      `support.html` och `en/support.html` (markerad med `<!-- FYLL I -->`).
- [ ] **Integritetspolicy** – `privacy.html` och `en/privacy.html` visar bara
      "publiceras före lansering". Ersätt `.placeholder`-blocket med den granskade texten
      (se HTML-kommentaren) och fyll i "Senast uppdaterad". Publicera inte utkasten i
      `docs/legal/` som de är.
- [ ] **Användarvillkor** – samma sak i `terms.html` och `en/terms.html`.
- [ ] **Radering: lagringstider/undantag** – kommentar i `delete-account.html` och
      `en/delete-account.html`.
- [ ] **App Store** – lägg in märkena och kör `node scripts/set-cta.mjs appstore <app-id>`
      (se "CTA-lägen").
- [ ] **Riktiga skärmdumpar** – se "Telefonmockups → riktiga skärmdumpar".
- [ ] **Copyright-raden** "© 2026 Tavana" i sidfoten – byt till personuppgiftsansvarig/
      firmanamn om det ska stå där.
