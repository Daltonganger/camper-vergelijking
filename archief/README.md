# Camperreis 2027 — projectmap

Keuzeproces voor de reis in mei/juni 2027 (2 volwassenen + Amelie, ±1 jaar oud):
**3 China-rondreizen vs. 6 camperroutes Noord-Amerika**, alles op één meetlat.

**Status: shortlist (A-lijst)**

1. **Denver 6B-light** — natuur-/camperdroom (Yellowstone, Teton, Black Hills)
2. **China 3** — meest complete actieve rondreis (Beijing → … → Shanghai, 6 bases)
3. **Atlanta 4-plus** — prettigste gezinscampervakantie (Appalachen + 4 strandnachten)

Geparkeerd voor een ander seizoen: **Dallas/Big Bend** (39–42 °C in mei/juni is niet verantwoord met Amelie). B-lijst: China 1 (rustigere terugvaloptie) en China 2 (alleen als Zhangjiajie zwaarder weegt dan Yangshuo). C-lijst: Atlanta Gulf, Vancouver, Toronto.

## Wat staat er in deze map?

| Bestand | Wat het is |
|---|---|
| `Rondreis_2027_3x_China_6x_Amerika_volledig.md` | **Hoofddocument (versie 4).** Alle 9 routes dag voor dag, scores, kosten, beslisboom, boekingskalender, bronnen. Start hier. |
| `index.html` | **De website (18 aug 2026, Apple-stijl).** Rustige lichte one-pager met paginarouter: overzichtspagina + 9 losse routepagina's met zachte overgangen (vorige/volgende, pijltjestoetsen, terug-knop). Mediaknoppen per stop, bewerkmodus. Dubbelklikken werkt (kaarttegels hebben internet nodig). |
| `routes-data.js` | **De enige bron van waarheid voor de site.** Alle 9 routes: stops, nachten, dagen, kosten, scores, al-geweest-lijst. Hier pas je routes aan (of via de bewerkmodus + export). |
| `check-routes.js` | Controlescript: `node check-routes.js` valideert de data (nachtensom, verplichte velden, geen bezochte parken actief). |
| `PLAN-website-2027.md` | Plan van aanpak + actuele status van de ombouw. |
| `archief/route-6b-light.kml` / `archief/route-4-plus.kml` | Google My Maps-exports van de twee finalisten (exacte stops + coördinaten). |
| `archief/` | **Oude site-generaties en hulpbestanden** (18 aug 2026): `camper-vergelijking.html` (generatie 1), `routekaart-6b-light.html` + `routekaart-route-4-plus.html` (generatie 2), `samenvatting-camperreis-2027.html`, `camper-vergelijking-SAMENVATTING.md`, de twee KML's en de og-cards. |
| `archief/og-card.png` / `archief/og-card.svg` | WhatsApp-preview in de stijl van de site (de site verwijst ernaar via de og:image-meta-tag). |

## Routenummering: let op de vertaling

De HTML-pagina's nummeren **Route 1–6**; het hoofddocument gebruikt **USA 1–6**. Ze komen gelijk overeen:

| HTML | Hoofddocument | Route |
|---|---|---|
| Route 1 | USA 1 | Denver / Rockies |
| Route 2 | USA 2 | Atlanta → Hunting Island |
| Route 3 | USA 3 | Atlanta → Gulf |
| Route 4 | USA 4 | Vancouver / Banff |
| Route 5 | USA 5 | Toronto / Niagara |
| Route 6 | USA 6 | Dallas / Big Bend |

De 3 China-routes (China 1/2/3) staan alleen in het hoofddocument — er is (nog) geen interactieve pagina voor.

## Bekende verouderingen / aandachtspunten

- De oude site-generaties staan in `archief/` (inhoud is volledig opgenomen in de nieuwe site).
- De nieuwe site tekent exact de Google Maps-routes; de 19 bezochte plekken staan als filter in `routes-data.js` (`node check-routes.js` waarschuwt als er ooit één in een route opduikt).
- China 3 heeft een gedocumenteerde **Hongkong-variant** (Guilin → West Kowloon per hogesnelheidstrein i.p.v. vlucht naar Shanghai) — zie de "Let op"-lijst bij de route.
- **`samenvatting-camperreis-2027.html` §8 verwijst naar bestanden die niet in deze map staan** (`route-6b-light.kml`, `route-4-plus.kml`, `optie-6-en-7-routevoorstellen.md`, `optie-6b-denver-warm-water.md`, `drie-vragen-6b-timing-muggen.md`, `vluchten-goedkopere-gateways.md`). Die leven in het originele project (map `AI-Sync`); neem ze over als je ze hier nodig hebt.
- Alle seizoensdata en openingstijden in de documenten zijn van **2026** en moeten voor 2027 opnieuw gecheckt (hoofddocument §29 heeft de checklist).

## Volgende concrete stappen (uit hoofddocument §28)

1. **Tot eind 2026:** vliegtarieven volgen (open-jaw AMS–Beijing/Shanghai vs. retours Denver/Atlanta); camperoffertes Denver + Atlanta all-in vergelijken.
2. **December 2026:** reserveringsvensters Yellowstone/Teton/Hunting Island volgen; visumstatus China checken (visumvrije regeling loopt nominaal t/m 31 dec 2026).
3. **Jan–feb 2027:** tickets boeken, camper definitief, annuleerbare hotels.
