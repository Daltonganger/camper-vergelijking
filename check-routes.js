#!/usr/bin/env node
// Valideert routes-data.js vóór publicatie. Gebruik: node check-routes.js
const { ROUTES, VISITED, scoreTotaal } = require("./routes-data.js");

let fouten = 0, waarschuwingen = 0;
const err = (m) => { console.error("  ✗ " + m); fouten++; };
const warn = (m) => { console.warn("  ⚠ " + m); waarschuwingen++; };

console.log(`Controleren: ${ROUTES.length} routes, ${VISITED.length} "al geweest"-plekken\n`);

const ids = new Set();
for (const r of ROUTES) {
  const label = r.id + " (" + r.naam + ")";
  let ok = true;
  if (ids.has(r.id)) { err(label + ": dubbel id"); ok = false; }
  ids.add(r.id);
  for (const v of ["id","soort","naam","kleur","stops","dagen","score","kosten"]) {
    if (r[v] === undefined) { err(label + ": mist veld '" + v + "'"); ok = false; }
  }
  if (!["USA","China","Azie"].includes(r.soort)) { err(label + ": soort moet USA, China of Azie zijn"); ok = false; }
  if (!["A","B","C","D","park"].includes(r.lijst)) { err(label + ": lijst moet A, B, C, D of park zijn"); ok = false; }
  if (r.finalist && r.lijst !== "A") { err(label + ": finalist hoort op de A-lijst"); ok = false; }

  const nachten = r.stops.reduce((s, x) => s + (x.n || 0), 0);
  if (nachten !== 21) warn(label + ": " + nachten + " nachten (vergelijkingsmodel = 21)");
  r.stops.forEach((s, i) => {
    if (!s.naam) err(label + ` stop ${i + 1}: geen naam`);
    if (s.n < 0) err(label + ` stop ${i + 1} (${s.naam}): negatieve nachten`);
    if (!s.wiki) warn(label + ` stop ${i + 1} (${s.naam}): geen wiki-artikel → 📖 valt terug op zoeklink`);
    if (!s.klimaat) warn(label + ` stop ${i + 1} (${s.naam}): geen klimaat → ☀️/🌙 valt weg op de routepagina`);
    else if (s.klimaat.d < s.klimaat.n) err(label + ` stop ${i + 1} (${s.naam}): dagtemperatuur lager dan nachttemperatuur`);
  });

  // "al geweest"-filter: geen bezochte plek mag actief in een route zitten
  for (const s of r.stops) {
    const hit = VISITED.find((v) => s.naam.toLowerCase().includes(v.toLowerCase().split(" /")[0]));
    if (hit) err(label + `: stop "${s.naam}" staat op de al-geweest-lijst (${hit})`);
  }

  const usaKleuren = new Set(ROUTES.filter((x) => x.soort === "USA").map((x) => x.kleur));
  if (r.soort === "China" && usaKleuren.has(r.kleur)) err(label + ": China-route gebruikt een USA-kleur");

  const dagen = r.dagen.map((d) => d.d);
  if (new Set(dagen).size !== dagen.length) err(label + ": dubbele dagnummers");
  if (r.stops.some((s) => s.lat !== undefined) && r.stops.some((s) => s.lng === undefined))
    err(label + ": stop met lat maar zonder lng");

  const verwacht = scoreTotaal(r.score);
  if (r.score.totaal !== verwacht) {
    err(label + `: totaal ${r.score.totaal} ≠ formule ${verwacht} (40% wow + 20% tempo + 20% amelie + 12% weer + 8% prijs)`);
    ok = false;
  }

  console.log(`${ok ? "✓" : "✗"} ${label}: ${r.stops.length} stops, ${nachten} nachten, ${r.dagen.length} dagen, score ${r.score.totaal}${r.finalist ? "  [FINALIST]" : ""}`);
}

{
  const tot = (id) => ROUTES.find((r) => r.id === id).score.totaal;
  if (!(tot("china3") > tot("china1") && tot("china1") > tot("china2"))) {
    err("China-rangorde moet 3 > 1 > 2 zijn op totaalcijfer");
  }
}

console.log(`\nKlaar: ${fouten} fouten, ${waarschuwingen} waarschuwingen.`);
if (fouten > 0) { console.error("Data is NIET geldig — herstel bovenstaande punten."); process.exit(1); }
console.log("Data is geldig.");
