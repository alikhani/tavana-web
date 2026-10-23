#!/usr/bin/env node
// Byter CTA-läge på startsidan (sv + en) på ett ställe.
//
//   node scripts/set-cta.mjs appstore 1234567890          # App Store-märke + länk, Smart App Banner på
//   node scripts/set-cta.mjs testflight https://testflight.apple.com/join/XXXXXXXX
//   node scripts/set-cta.mjs soon                          # tillbaka till "Kommer snart"
//
// Ändrar: data-cta på <html> i index.html och en/index.html, <meta name="apple-itunes-app">
// (bara i appstore-läget) och redirecterna /app och /beta i vercel.json.
// Ingen build – skriptet körs en gång lokalt och resultatet committas.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pages = ["index.html", "en/index.html"];
const badges = [
  "assets/badges/app-store-badge-sv.svg",
  "assets/badges/app-store-badge-sv-white.svg",
  "assets/badges/app-store-badge-en.svg",
  "assets/badges/app-store-badge-en-white.svg",
];

const [mode, value] = process.argv.slice(2);

function fail(msg) {
  console.error(`set-cta: ${msg}`);
  process.exit(1);
}

let appUrl = "/";
let betaUrl = "/";
let banner = '<!-- <meta name="apple-itunes-app" content="app-id=FYLL-I"> -->';

if (mode === "appstore") {
  if (!/^\d{6,12}$/.test(value ?? "")) fail("ange app-id (bara siffror), t.ex. `appstore 1234567890`.");
  const missing = badges.filter((b) => !existsSync(join(root, b)));
  if (missing.length) fail(`Apples officiella märken saknas (se README):\n  ${missing.join("\n  ")}`);
  appUrl = `https://apps.apple.com/app/id${value}`;
  banner = `<meta name="apple-itunes-app" content="app-id=${value}">`;
} else if (mode === "testflight") {
  if (!/^https:\/\/testflight\.apple\.com\/join\/[A-Za-z0-9]+$/.test(value ?? ""))
    fail("ange den publika TestFlight-länken, t.ex. `testflight https://testflight.apple.com/join/AbCdEf12`.");
  betaUrl = value;
} else if (mode !== "soon") {
  fail("läge måste vara soon, appstore eller testflight.");
}

for (const page of pages) {
  const path = join(root, page);
  let html = readFileSync(path, "utf8");
  const before = html;
  html = html.replace(/(<html lang="[a-z]+") data-cta="[a-z]+"/, `$1 data-cta="${mode}"`);
  html = html.replace(
    /<!-- APP-BANNER:START -->[\s\S]*?<!-- APP-BANNER:END -->/,
    `<!-- APP-BANNER:START -->${banner}<!-- APP-BANNER:END -->`,
  );
  if (!html.includes(`data-cta="${mode}"`) || !html.includes(banner)) fail(`kunde inte uppdatera ${page}.`);
  if (html !== before) writeFileSync(path, html);
}

const vercelPath = join(root, "vercel.json");
const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
const redirect = (source) => {
  const r = vercel.redirects?.find((x) => x.source === source);
  if (!r) fail(`redirect ${source} saknas i vercel.json.`);
  return r;
};
redirect("/app").destination = appUrl;
redirect("/beta").destination = betaUrl;
writeFileSync(vercelPath, JSON.stringify(vercel, null, 2) + "\n");

console.log(`CTA-läge: ${mode}\n  /app  -> ${appUrl}\n  /beta -> ${betaUrl}\n  apple-itunes-app: ${mode === "appstore" ? "på" : "av"}`);
