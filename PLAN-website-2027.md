# Plan — één perfecte reiswebsite 2027

**Doel:** één website waarin alle 9 routes (6 Amerika + 3 China) volledig en gelijkwaardig zijn uitgewerkt, in één consistent design, met data die klopt met de Google Maps-routes en het hoofddocument.

> **STATUS — 18 augustus 2026, na bouw:**
> - ✅ Fase 0 — Inputs binnen (al-geweest-lijst, KML's, Google Maps = waarheid, keuzes goedgekeurd)
> - ✅ Fase 1 — `routes-data.js` (alle 9 routes) + `check-routes.js` → draait groen
> - ✅ Fase 2 — nieuwe hoofdpagina `index.html` uit de data (vergelijking, overzichtskaart, scroll-design)
> - ✅ Fase 3 — alle 6 Amerika-routes in één uniform detailformaat (kaart, stops, tijdlijn, kosten, plus/min)
> - ✅ Fase 4 — China-module: 3 routes in eigen kleurfamilie (karmozijn/goud) met gestippelde treinverbindingen
> - ✅ Bewerkmodus — per route stops toevoegen/verwijderen, nachten wijzigen; opslag in browser + export naar `routes-data.js` (getest in browser)
> - ⬜ Fase 5 — nog open: `og-card` vernieuwen (nu nog "zes routes, één camper"), oude pagina's naar `archief/`, pushen naar GitHub Pages
> - ✅ Restyle 18 aug (later op de dag): donkere Rockstar-look vervangen door rustige Apple-stijl (licht, systeemtypografie, CARTO light-kaart) mét paginarouter — overzicht + 9 losse routepagina's, zachte overgangen, vorige/volgende + pijltjestoetsen + terug-knop; alles opnieuw getest
> - ⬜ Nog open: pushen naar GitHub Pages (live staat nog op de donkere versie tot de volgende push)
> - 💡 Optioneel later: gecureerde foto's/YouTube-video's per stop i.p.v. zoeklinks (nu: YouTube/Afbeeldingen/Wikipedia/Maps-knop per stop — altijd geldig, nul onderhoud)

---

## 1. De audit: waarom de huidige site niet klopt

De site bestaat nu uit **drie generaties door elkaar**:

1. **Generatie 1 — de getekende routes op `camper-vergelijking.html` / `index.html`.** Dit zijn de oorspronkelijke zes routes uit de eerste verkenning. Onder andere Route 1 is nog een Colorado/Utah-lus **met Arches en Canyonlands NP** — daar zijn jullie al geweest, dus die route is dood.
2. **Generatie 2 — de Google Maps-knoppen op dezelfde pagina.** Die linken allang naar de **nieuwe** routes (6B-light, 4-plus, etc.). Iedere knop op de site wijst dus naar een ándere route dan het kaartje en de tabel ernaast tonen.
3. **Generatie 3 — `routekaart-6b-light.html` en `routekaart-route-4-plus.html`.** Alleen Denver en Atlanta zijn goed en volledig uitgewerkt, maar in een **ander design** en met een **andere kaarttechniek** (Leaflet + online kaarttegels in plaats van het offline getekende kaartje).

Daarnaast: de 3 China-routes staan helemaal niet op het web, de Texas-rangschikking op de site is achterhaald (hitteprobleem mei/juni), en de km-aantallen/parklijsten/drukte-teksten van alle zes routes zijn generatie-1.

### Getekende route vs. Google Maps-knop per route

| Route op site | Kaartje/tabel toont (generatie 1) | Google Maps-knop linkt naar (huidig) | Oordeel |
|---|---|---|---|
| 1 Rocky Mountains | Denver–RMNP–Dinosaur–**Arches**–Canyonlands–Aspen–Breckenridge (2.878 km) | **6B-light**: Longmont→McConaughy→Badlands→Custer→Wind Cave→Devils Tower→Bighorn→Lamar Valley→Teton→Astoria→Saratoga→Trail Ridge | ❌ Totaal andere route; bevat Arches |
| 2 Oostkust Zuid | Smokies–Asheville–Wilmington–Myrtle Beach–Charleston–Hunting Island (3.267 km) | **4-plus**: Mammoth Cave→New River Gorge→Shenandoah→BRP→Smokies→Congaree→Charleston→Hunting Island→Savannah | ❌ Zelfde regio, ander verloop en andere km's |
| 3 Golf van Mexico | Montgomery–Mobile–Gulf Shores–Panama City–Destin (3.101 km) | Smokies→Mammoth Cave→Nashville→Natchez→New Orleans→Gulf Islands→St. George Island | ❌ Andere route |
| 4 Canadese Rockies | Whistler–Kamloops–Revelstoke–Banff–Jasper–Waterton (3.042 km) | **Vancouver-eilandlus**: Tofino→Victoria→Olympic→Rainier→North Cascades→Osoyoos→Kootenay Lake→Banff | ❌ Andere lus |
| 5 Oostkust Noord | Cleveland–Pittsburgh–Washington DC–Virginia Beach–Assateague–Philadelphia | **Toronto-lus**: Niagara→Finger Lakes→Shenandoah→**Washington DC**→BRP→Smokies→New River Gorge→Lake Erie | ❌ Andere route |
| 6 Texas & New Mexico | Big Bend→El Paso→Roswell→Santa Fe→Taos→Amarillo | Guadalupe→Carlsbad→White Sands→Big Bend→San Antonio→Padre Island | ❌ Zelfde regio, ander verloop |

**Kleine verschillen tussen Google Maps en het hoofddocument die bij de herbouw verwerkt moeten worden:**

- De Toronto-route op Google Maps bevat **Washington DC** — het hoofddocument (USA 5) noemt DC niet. Keuze nodig.
- De Vancouver-route rijdt via **Kootenay Lake** tussen Osoyoos en Banff — hoofddocument zegt alleen "transit Rockies".
- De Denver-route start/eindigt bij **Cruise America, Longmont CO** (concrete verhuurder) — handig, dat mag op de site terugkomen.

---

## 2. Doelarchitectuur

**Kernprincipe: één databron, één design, één pagina.** Het probleem van nu (drie generaties door elkaar) ontstaat doordat iedere pagina zijn eigen kopie van de routes bevat. Dat lossen we structureel op:

```
routes-data.js          ← de enige bron van waarheid (alle 9 routes, gestructureerd)
index.html              ← vergelijkingsoverzicht + kaart + per-route detailweergave
  └ ?route=1 … ?route=9   deep links (delen via WhatsApp blijft werken)
check-routes.js         ← klein controlescript: valideert routes-data.js
archief/                ← oude generatie-bestanden (camper-vergelijking.html,
                           routekaart-*.html) bewaard maar uit de weg
```

**Per route in de data (en dus op de site):** naam, regio, stops met coördinaten, nachtenverdeling (som = 21), km, parken/monumenten, "al geweest"-markering, weer-mei/juni, drukte, plus/min, kostenband, Google Maps-link, seizoenswaarschuwingen, en per Amerika-route de etappe-links die nu in de twee routekaart-pagina's zitten.

**Kaarttechniek:** Leaflet (zoals de twee goede routekaart-pagina's al doen) voor de routekaarten; het overzichtskaartje van de vergelijkingssite blijft als compacte totale blik. Consequentie: de site heeft dan internet nodig voor de kaarttegels (nu mixed). Tekst, tabellen en vergelijking werken ook zonder.

**China op de kaart:** geen rijroutes maar steden als punten met gestileerde trein/vliegverbindingen als lijnen. Bron: hoofddocument §4–6 (dagprogramma's staan daar al volledig).

**Design:** het palet en de typografie van de vergelijkingssite (groen/oranje/papier — staat al live op GitHub Pages) doorgetrokken naar de detailweergaven. De detailweergave krijgt het formaat van de huidige routekaart-pagina's (dag-voor-dag schema, reserveringsdeadlines) maar dan in dat ene design.

---

## 3. Stappenplan

### Fase 0 — Inputs en beslissingen (jij, ±15 minuten)
Zie §4 en §5 hieronder. Zonder deze inputs bouw ik door met aannames die je later kunt bijstellen.

### Fase 1 — Eén databron bouwen
- `routes-data.js` opzetten met alle 9 routes; bron: de zes Google Maps-links (zojuist geresolved), het hoofddocument v4 en de twee routekaart-pagina's.
- Arches/Canyonlands e.d. verdwijnen hier definitief uit (en krijgen een `visited`-vlag zodat ze nooit meer stiekem terugkomen).
- `check-routes.js`: controleert per route — som van nachten = 21, verplichte velden aanwezig, geen `visited`-parken actief, unieke naam/kleur. Draaien vóór iedere publicatie.
- **Klaar wanneer:** script draait groen op 9 routes.

### Fase 2 — Hoofdpagina herbouwen uit de data
- Vergelijkingstabel, overzichtskaart en scores opnieuw renderen uit `routes-data.js` — nu synchroon met hoofddocument v4 (waaronder: Denver 6B-light vervangt de oude Route 1; Texas krijgt de seizoenswaarschuwing i.p.v. de nr. 2-positie).
- Routevolgorde en -namen gelijk trekken aan het hoofddocument (USA 1–6 = Route 1–6, + China 1–3).
- **Klaar wanneer:** de zes Amerika-routes op de site zijn exact de routes waar de Google Maps-knoppen al naartoe wijzen.

### Fase 3 — Alle zes Amerika-routes in detail
- Het detailformaat van de twee routekaart-pagina's (kaart, dag-schema, etappe-links, reserveringsdeadlines) wordt één template in het hoofd-design, gevoed door de data.
- Eerst Denver en Atlanta overzetten (inhoud bestaat al), daarna Gulf, Vancouver, Toronto en Dallas volledig uitwerken.
- **Klaar wanneer:** alle 6 routes even diep uitgewerkt zijn als 6B-light en 4-plus nu zijn.

### Fase 4 — China-module
- China 1, 2 en 3 in hetzelfde detailformaat: stedenkaart met trein/vliegverbindingen, nachtenverdeling, transfers, kosten, weer, plus/min.
- Vergelijkingstabel en scores uitbreiden naar 9 routes.
- **Klaar wanneer:** de drie China-routes zijn gelijkwaardig aan de Amerika-routes qua detailniveau.

### Fase 5 — Afronden en publiceren
- og-cards (WhatsApp-preview) per categorie; deep links `?route=N` getest; mobiel getest.
- Oude bestanden naar `archief/`, GitHub Pages updaten, `README.md` en `camper-vergelijking-SAMENVATTING.md` synchroniseren.
- **Klaar wanneer:** live op daltonganger.github.io, alle kwaliteitschecks (§6) groen.

**Volgorde is bewust zo:** eerst data (fouten eruit), dan Amerika (grootste kans op slagen), dan China (nieuw), dan harmoniseren. Na fase 2 is de site alweer deelbaar zonder dat er leugens op staan.

---

## 4. Beslispunten voor jou (met mijn aanbeveling)

1. **Oude Route 1 (Colorado/Utah met Arches) definitief schrappen?** → Aanbeveling: ja, vervangen door Denver 6B-light.
2. **Dallas op de site houden?** → Aanbeveling: ja, maar met duidelijke "verkeerd seizoen mei/juni — bewaren voor feb/maart"-banner, zoals het hoofddocument.
3. **Washington DC in de Toronto-route opnemen** (staat wel in Google Maps, niet in hoofddocument)? → Aanbeveling: opnemen; het is een logische stop en staat al in jullie eigen link.
4. **Eén lange pagina met alles, of hoofdpagina + losse routepagina's?** → Aanbeveling: één pagina met `?route=N` deep links — één bestand om te onderhouden, delen blijft werken.
5. **Online kaarttegels accepteren** (Leaflet, mooier en schaalbaar) **of volledig offline houden** (eenvoudiger kaartjes, geen internet nodig)? → Aanbeveling: online tegels; op de bank/telefoon heb je toch internet, en alle tekst werkt ook zonder.
6. **Designbasis:** palet/typografie van de vergelijkingssite (groen/oranje/papier) → Aanbeveling: ja, tenzij jij een andere voorkeur hebt.

## 5. Wat ik van jou nodig heb

1. **De "al geweest"-lijst:** waar zijn jullie in de VS/Canada al geweest? Nu bekend: Arches. Wat nog meer (Canyonlands? andere parken/regio's?) — dit bepaalt welke stops gemarkeerd of geschrapt worden.
2. **De zes originele projectbestanden uit de AI-Sync-map erbij zetten** (staan niet in deze map): `route-6b-light.kml`, `route-4-plus.kml`, `optie-6-en-7-routevoorstellen.md`, `optie-6b-denver-warm-water.md`, `drie-vragen-6b-timing-muggen.md`, `vluchten-goedkopere-gateways.md`. Vooral de KML's leveren exacte stops + coördinaten.
3. **Bevestiging dat de zes Google Maps-routes de bron van waarheid zijn** voor de Amerika-routes (de knoppen op de huidige site linken er al naartoe — ik heb ze geresolved en ze kloppen met het hoofddocument, op de twee punten na in §1).
4. **Voor China:** heb je daar ook Google Maps-materiaal of hotel-/treinvoorkeuren buiten het hoofddocument om, of bouw ik China volledig uit het hoofddocument?
5. **Jouw antwoorden op de beslispunten 1 t/m 6 hierboven** (of "doe maar al je aanbevelingen").

## 6. Wanneer is de site "klaar" (kwaliteitscriteria)

- 9 routes, één design, één databron; `check-routes.js` draait groen.
- Per route: kaart + dag-schema + nachten (som = 21) + km + parken + kosten + plus/min + Google Maps-link(s).
- Geen enkele "al geweest"-stop actief in een route.
- Vergelijkingstabel en scores exact synchroon met hoofddocument v4.
- Deep links en WhatsApp-previews werken; mobiel bruikbaar; live op GitHub Pages.

## 7. Risico's en randvoorwaarden

- **Shortlinks bevatten alleen hoofdstops**, geen tussenstops of campingkeuzes — vandaar de vraag om de KML's; anders vul ik tussenstops zelf aan en leg ze je ter review voor.
- **Alle seizoenscijfers zijn 2026-waarden** — op de site als "indicatief, herchecken voor boeken" labelen (checklist staat in hoofddocument §29).
- **GitHub Pages is publiek.** Prima voor delen via WhatsApp, maar er mogen geen persoonlijke data (achternaam Amelie, adresgegevens) op.
- **China-kaartmateriaal:** OpenStreetMap dekt China goed (Google Maps zelf niet importeren); treinlijnen worden gestileerde indicaties, geen exacte sporen.
