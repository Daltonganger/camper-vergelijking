#!/usr/bin/env node
// Controleert data.js en plan-extras.js van de China-planner vóór publicatie.
// Gebruik: node china-2027/check-data.js
const fs = require("fs");
const path = require("path");
const vm = require("vm");

let fouten = 0,
  waarschuwingen = 0;
const err = (m) => {
  console.error("  ✗ " + m);
  fouten++;
};
const warn = (m) => {
  console.warn("  ⚠ " + m);
  waarschuwingen++;
};

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, "data.js"), "utf8"),
  sandbox,
);
const data = sandbox.window.CHINA2027;
if (!data) {
  console.error("data.js zet geen window.CHINA2027");
  process.exit(1);
}

const kinds = ["vlucht", "rust", "cultuur", "keuze", "trein", "natuur", "transfer"];
const dagVelden = ["title", "sub", "am", "pm", "eve", "baby", "backup", "reserve", "cost"];

console.log(
  `Controleren: ${data.days.length} dagen, ${data.stays.length} verblijven, ${data.trains.length} treinritten\n`,
);

// Dagen: 1..31, compleet en in volgorde
const nummers = data.days.map((d) => d.d);
if (nummers.join() !== Array.from({ length: 31 }, (_, i) => i + 1).join())
  err("dagen moeten exact 1 t/m 31 zijn, op volgorde");
for (const d of data.days) {
  const label = "D" + d.d;
  if (!kinds.includes(d.kind)) err(`${label}: onbekend dagtype '${d.kind}'`);
  for (const veld of dagVelden)
    if (typeof d[veld] !== "string" || !d[veld].trim())
      err(`${label}: mist of heeft leeg veld '${veld}'`);
  if (d.city !== "reis" && !data.stays.some((s) => s.id === d.city))
    err(`${label}: city '${d.city}' bestaat niet als verblijf`);
}

// Verblijven: 28 nachten, aaneengesloten vanaf dag 2
const nachten = data.stays.reduce((n, s) => n + s.nights, 0);
if (nachten !== 28) err(`verblijven tellen ${nachten} nachten, verwacht 28`);
let verwachteStart = 2;
for (const s of data.stays) {
  if (s.start !== verwachteStart)
    err(`${s.id}: start op dag ${s.start}, verwacht ${verwachteStart}`);
  if (!Number.isFinite(s.lat) || !Number.isFinite(s.lng))
    err(`${s.id}: lat/lng ontbreekt`);
  if (!s.klimaat || !Number.isFinite(s.klimaat.d) || !Number.isFinite(s.klimaat.n))
    err(`${s.id}: klimaat {d,n} ontbreekt`);
  else if (s.klimaat.d < s.klimaat.n)
    err(`${s.id}: dagtemperatuur ${s.klimaat.d}° lager dan nachttemperatuur ${s.klimaat.n}°`);
  if (typeof s.weer !== "string" || !s.weer.trim())
    warn(`${s.id}: geen 'weer'-regel, de klimaatchip heeft dan geen uitleg`);
  verwachteStart = s.start + s.nights;
}
if (verwachteStart !== 30)
  err(`laatste verblijf eindigt op dag ${verwachteStart - 1}, verwacht 29`);

// Treinen: 9 ritten, gekoppeld aan een treindag, met geldige vrijgavetijd
if (data.trains.length !== 9) err(`${data.trains.length} treinritten, verwacht 9`);
for (const t of data.trains) {
  const label = "trein D" + t.day;
  for (const veld of ["from", "to", "time", "note"])
    if (typeof t[veld] !== "string" || !t[veld].trim())
      err(`${label}: mist of heeft leeg veld '${veld}'`);
  if (!(t.low <= t.high)) err(`${label}: laag ${t.low} > hoog ${t.high}`);
  const dag = data.days.find((d) => d.d === t.day);
  if (!dag) err(`${label}: geen dag ${t.day}`);
  else if (dag.kind !== "trein") err(`${label}: dag ${t.day} is geen treindag maar '${dag.kind}'`);
  if (t.release === undefined) warn(`${label}: geen vrijgavetijd; in de app opzoeken`);
  else if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(t.release))
    err(`${label}: vrijgavetijd '${t.release}' is geen HH:MM`);
}

// Rustvarianten: elke dag heeft er één
const extras = fs.readFileSync(path.join(__dirname, "plan-extras.js"), "utf8");
const calmDagen = [...extras.matchAll(/^ {4}(\d+): \[$/gm)].map((m) => Number(m[1]));
const verwacht = Array.from({ length: 31 }, (_, i) => i + 1);
if (calmDagen.join() !== verwacht.join())
  err(
    `plan-extras.js mist rustvarianten: aanwezig [${calmDagen.join(", ")}], verwacht 1 t/m 31`,
  );

// Klimaat hoort gelijk te zijn aan de april-waarden op de vergelijkingspagina
let routes = null;
try {
  ({ ROUTES: routes } = require("../routes-data.js"));
} catch (e) {
  warn("routes-data.js niet te lezen; klimaatvergelijking overgeslagen");
}
if (routes) {
  const spoor27 = routes.find((r) => r.id === "spoor27");
  const perNaam = {
    Shanghai: "Shanghai",
    Hangzhou: "Hangzhou",
    Beijing: "Beijing",
    "Xi’an": "Xi'an",
    Chengdu: "Chengdu",
    Chongqing: "Chongqing",
    Wulingyuan: "Zhangjiajie (Wulingyuan)",
    Yangshuo: "Yangshuo",
    "Longji / Ping’an": "Longji-rijstterrassen (Ping'an)",
    "Guangzhou / Kanton": "Guangzhou (doorreis)",
  };
  for (const [eigen, daar] of Object.entries(perNaam)) {
    const a = data.stays.find((s) => s.name === eigen);
    const b = spoor27 && spoor27.stops.find((s) => s.naam === daar);
    if (!a || !b || !b.klimaat) {
      warn(`klimaat ${eigen}: niet gevonden op de vergelijkingspagina, overgeslagen`);
      continue;
    }
    if (a.klimaat.d !== b.klimaat.d || a.klimaat.n !== b.klimaat.n)
      err(
        `klimaat ${eigen}: ${a.klimaat.d}/${a.klimaat.n}° hier tegen ${b.klimaat.d}/${b.klimaat.n}° op de vergelijkingspagina`,
      );
  }
}

console.log(`\nKlaar: ${fouten} fouten, ${waarschuwingen} waarschuwingen.`);
if (fouten > 0) {
  console.error("Data is NIET geldig — herstel bovenstaande punten.");
  process.exit(1);
}
console.log("Data is geldig.");
