// ============================================================================
// REIS 2027 — DE ENIGE BRON VAN WAARHEID VOOR DE WEBSITE
// ----------------------------------------------------------------------------
// ROUTES AANPASSEN? Dit is het bestand. Per route kun je:
//   - een stop weghalen:       regel {naam:...} verwijderen
//   - een stop erbij:          {naam:"Naam", n:2, lat:40.1, lng:-105.2, note:"...",
//                                wiki:"Engelse Wikipedia-titel"}   ← wiki is de
//                              exacte titel van het Engelstalige Wikipedia-artikel
//                              (bijv. "Badlands National Park"); zonder wiki valt
//                              de 📖-knop terug op een NL-zoeklink.
//                              (lat/lng zijn optioneel; zonder verschijnt de stop
//                               wel in de lijst/tijdlijn maar niet op de kaart)
//                                klimaat:{d:24,n:9}  ← gemiddelde dag- (d) en
//                              nachttemperatuur (n) in °C voor eind mei–juni;
//                              klimatologisch gemiddelde, geen garantie.
//   - nachten wijzigen:        het getal achter n: aanpassen
//   - dagen aanpassen:         in de dagen-array {d:1,t:"titel",x:"tekst"}
// Na afloop:  node check-routes.js   → groen? dan is de data geldig.
// Op de site zelf kan ook: knop "Bewerken" (wijzigingen gelden dan alleen in
// die browser; exporteer ze naar dit bestand om ze te bewaren).
// ============================================================================


// Totaalcijfer = gewogen som, afgerond op 1 decimaal.
// Tempo = past het ritme bij de gewenste rondreis (om de 3–4 dagen iets nieuws).
// Hoog tempo ≠ langzaam/comfortabel. China 1 is rustig, maar te statisch → lage temposcore.
const SCORE_GEWICHTEN = { wow: 0.40, tempo: 0.20, amelie: 0.20, weer: 0.12, prijs: 0.08 };
function scoreTotaal(s) {
  const t = s.wow * 0.40 + s.tempo * 0.20 + s.amelie * 0.20 + s.weer * 0.12 + s.prijs * 0.08;
  return Math.round(t * 10) / 10;
}

const ROUTES = [

// ════════════════════════════════ USA 1 ═══════════════════════════════════
{
  id:"usa1", soort:"USA", naam:"Rockies & Yellowstone", lijst:"A",
  alias:"Rockies, Yellowstone & Black Hills",
  kleur:"#1f6f63", km:3700, tempo:"gemiddeld-actief", finalist:true,
  gmaps:"https://maps.app.goo.gl/L62sySaPAxtigzqg9",
  etappes:[
    {van:"Denver → Cody", url:"https://www.google.com/maps/dir/Denver,+CO/Cherry+Creek+State+Park,+Aurora,+CO/Lake+McConaughy,+Ogallala,+NE/Badlands+National+Park,+SD/Custer+State+Park,+SD/Wind+Cave+National+Park,+SD/Devils+Tower+National+Monument,+WY/Meadowlark+Lake,+WY/Hot+Springs+State+Park,+Thermopolis,+WY/Cody,+WY"},
    {van:"Cody → Jackson", url:"https://www.google.com/maps/dir/Cody,+WY/Fishing+Bridge,+Yellowstone+National+Park,+WY/Canyon+Village,+Yellowstone+National+Park,+WY/Lamar+Valley,+Yellowstone+National+Park,+WY/Mammoth+Hot+Springs,+WY/Madison+Campground,+Yellowstone+National+Park,+WY/Old+Faithful,+WY/Colter+Bay+Village,+WY/Jenny+Lake,+WY/Astoria+Hot+Springs+Park,+Jackson,+WY"},
    {van:"Jackson → Denver", url:"https://www.google.com/maps/dir/Jackson,+WY/Pinedale,+WY/Rawlins,+WY/Walden,+CO/Grand+Lake,+CO/Alpine+Visitor+Center,+Estes+Park,+CO/Moraine+Park+Campground,+Estes+Park,+CO/Denver,+CO"}
  ],
  parks:["Yellowstone NP","Grand Teton NP","Badlands NP","Rocky Mountain NP","Wind Cave NP","Devils Tower NM"],
  fotos:["Yellowstone National Park","Grand Prismatic Spring","Grand Teton National Park","Badlands National Park"],
  video:{id:"mpLJKAXJ9t0", titel:"Yellowstone & Grand Teton — Family Trip 2025 (4K)"},
  score:{wow:10,amelie:8,tempo:8,weer:7,prijs:7,totaal:8.6},
  kosten:{excl:"€5.900–€8.200",incl:"€6.700–€9.600",bron:"jullie eigen projectraming"},
  weer:"Badlands/Black Hills prettig voorseizoen · Yellowstone nachten rond/vroeg bevroren · Teton fris met sneeuw op de bergen · RMNP voorjaarscondities op hoogte",
  amelie:"Sterk: eigen bed elke nacht, wildlife vanaf de weg, korte boardwalks, eigen koelkast. Lastig: 3.700 km autostoel, hoogte, koude nachten — camperverwarming essentieel.",
  plus:["Yellowstone + Grand Teton achter elkaar","beste wildlife van het continent (bizons, beren, wolven vanaf de weg)","route klimt slim van laag naar hoog","warme baden in Thermopolis en Astoria als vaste watermomenten"],
  min:["duurste vlucht, altijd met overstap","onzekerheid over wegopeningen (Trail Ridge, Dunraven)","koude nachten","geen echt warm strand"],
  quote:"We gaan naar Noord-Amerika voor de natuur die nergens anders hetzelfde voelt.",
  letop:["Trail Ridge Road opent weersafhankelijk eind mei (2026: 29 mei) — alternatief achter de hand","Dunraven Pass/Beartooth 2026 gepland vanaf 22 mei","RMNP timed-entry reservering nodig","Yellowstone/Teton-campings: reserveringsvensters volgen vanaf winter 2026"],
  stops:[
    {naam:"Denver, Colorado", n:1, lat:39.74, lng:-104.99, note:"Aankomsthotel; camper ophalen bij Cruise America Longmont", wiki:"Denver", klimaat:{d:25,n:10}},
    {naam:"Lake McConaughy, Nebraska", n:1, lat:41.23, lng:-101.72, note:"Eerste campernacht + strandavond", wiki:"Lake McConaughy", klimaat:{d:26,n:11}},
    {naam:"Badlands NP — Cedar Pass Campground", n:2, lat:43.75, lng:-101.94, note:"Loop Road, boardwalks, zonsondergang", wiki:"Badlands National Park", klimaat:{d:24,n:10}},
    {naam:"Custer State Park — Game Lodge CG", n:3, lat:43.76, lng:-103.40, note:"Wildlife Loop, Sylvan Lake, Needles; Wind Cave NP op een dag", wiki:"Custer State Park", klimaat:{d:22,n:8}},
    {naam:"Devils Tower NM — Belle Fourche River CG", n:1, lat:44.59, lng:-104.70, note:"Rondwandeling bij avondlicht", wiki:"Devils Tower", klimaat:{d:22,n:8}},
    {naam:"Bighorn Mountains — Meadowlark Lake", n:1, lat:44.04, lng:-107.20, note:"Scenic drive US-16 over de pas", wiki:"Bighorn Mountains", klimaat:{d:15,n:1}},
    {naam:"Thermopolis, Wyoming", n:1, lat:43.65, lng:-108.21, note:"Gratis warme bronnen 40 °C — verwarmd tussendoel", wiki:"Thermopolis, Wyoming", klimaat:{d:25,n:9}},
    {naam:"Yellowstone — Bridge Bay / Fishing Bridge RV", n:2, lat:44.54, lng:-110.44, note:"West Thumb, Lake Yellowstone", wiki:"Yellowstone National Park", klimaat:{d:16,n:0}},
    {naam:"Yellowstone — Canyon Village CG", n:2, lat:44.74, lng:-110.49, note:"Canyon, Hayden Valley; dagtocht Lamar Valley + Mammoth", wiki:"Yellowstone National Park", klimaat:{d:16,n:0}},
    {naam:"Grand Teton — Colter Bay Village", n:2, lat:43.90, lng:-110.64, note:"Jackson Lake, Oxbow Bend", wiki:"Grand Teton National Park", klimaat:{d:19,n:2}},
    {naam:"Grand Teton — Gros Ventre CG", n:1, lat:43.58, lng:-110.67, note:"Jenny Lake, Schwabacher Landing, Astoria Hot Springs (kinderbad)", wiki:"Grand Teton National Park", klimaat:{d:19,n:2}},
    {naam:"Rawlins, Wyoming (transit)", n:1, lat:41.79, lng:-107.24, note:"Bewust transitnacht om geen monsterdag te rijden", wiki:"Rawlins, Wyoming", klimaat:{d:21,n:5}},
    {naam:"Rocky Mountain NP — Timber Creek CG (west)", n:1, lat:40.38, lng:-105.85, note:"Kawuneeche Valley, Grand Lake", wiki:"Rocky Mountain National Park", klimaat:{d:18,n:3}},
    {naam:"Rocky Mountain NP — Moraine Park CG (oost)", n:1, lat:40.36, lng:-105.59, note:"Trail Ridge Road 3.595 m (alleen indien open)", wiki:"Rocky Mountain National Park", klimaat:{d:18,n:3}},
    {naam:"Denver — laatste nacht", n:1, lat:39.74, lng:-104.99, note:"Camper inleveren, hotel vlak bij vliegveld", wiki:"Denver", klimaat:{d:25,n:10}}
  ],
  dagen:[
    {d:1,t:"Amsterdam → Denver",x:"Aankomsthotel; camper pas dag 2 ophalen"},
    {d:2,t:"Camper ophalen → Lake McConaughy",x:"Boodschappen, kinderzitje, camper leren kennen; strandavond"},
    {d:3,t:"→ Badlands-regio",x:"Lange maar rechte transfer, regelmatig stoppen"},
    {d:4,t:"Badlands NP",x:"Loop Road, korte boardwalks, zonsondergang"},
    {d:5,t:"→ Custer State Park",x:"Via de Black Hills; niet alles op één dag proppen"},
    {d:6,t:"Custer Wildlife Loop (+ Wind Cave)",x:"Bizons en stops langs de weg — perfect met jong kind"},
    {d:7,t:"Sylvan Lake / Needles / rust",x:"Korte wandeling, picknick, zwemmen als het meezit"},
    {d:8,t:"→ Devils Tower",x:"Rustige verplaatsing + rondwandeling"},
    {d:9,t:"→ Bighorn → Thermopolis",x:"Scenic drive; warme bronnen als rustmoment"},
    {d:10,t:"→ Yellowstone (via Cody)",x:"Route afstemmen op actuele wegstatus"},
    {d:11,t:"Lamar Valley / Mammoth",x:"Wildlife-dag; vroeg opstaan loont hier wél"},
    {d:12,t:"Canyon / Hayden Valley",x:"Watervallen + wildlife"},
    {d:13,t:"Geysers",x:"Old Faithful, Grand Prismatic — niet alle basins"},
    {d:14,t:"Yellowstone buffer",x:"Weer, wildlife of favoriete zone herhalen"},
    {d:15,t:"→ Grand Teton",x:"Korte route met viewpoints"},
    {d:16,t:"Grand Teton noord",x:"Oxbow Bend, Jackson Lake, korte trails"},
    {d:17,t:"Grand Teton zuid",x:"Jenny Lake, Schwabacher, Jackson optioneel; Astoria Hot Springs"},
    {d:18,t:"→ Rawlins (transit)",x:"Start terugweg; bewust geen monsterdag"},
    {d:19,t:"→ Rocky Mountain NP west",x:"Grand Lake / Kawuneeche Valley"},
    {d:20,t:"Trail Ridge Road → oostzijde",x:"Alleen indien open; anders alternatieve route"},
    {d:21,t:"Estes Park → Denver",x:"Laatste rit; camper inleveren of hotel"},
    {d:22,t:"Denver → Amsterdam",x:"Vlucht huiswaarts"}
  ]
},

// ════════════════════════════════ USA 2 ═══════════════════════════════════
{
  id:"usa2", soort:"USA", naam:"Appalachen & Oceaan", lijst:"A",
  alias:"Appalachen, Blue Ridge Parkway & Hunting Island",
  kleur:"#2d7f9e", km:4150, tempo:"gemiddeld", finalist:true,
  gmaps:"https://maps.app.goo.gl/M35kMhxU27LkTkx36",
  etappes:[
    {van:"Atlanta → Shenandoah", url:"https://www.google.com/maps/dir/Atlanta,+GA/Cloudland+Canyon+State+Park,+GA/Mammoth+Cave+National+Park,+KY/Natural+Bridge+State+Resort+Park,+KY/New+River+Gorge+Bridge,+WV/Babcock+State+Park,+WV/Big+Meadows,+Shenandoah+National+Park,+VA"},
    {van:"Shenandoah → Smokies (via Parkway)", url:"https://www.google.com/maps/dir/Big+Meadows,+Shenandoah+National+Park,+VA/Peaks+of+Otter,+VA/Mabry+Mill,+VA/Doughton+Park,+NC/Julian+Price+Park,+NC/Mount+Mitchell+State+Park,+NC/Mount+Pisgah,+Blue+Ridge+Parkway,+NC/Smokemont+Campground,+NC/Kuwohi,+Great+Smoky+Mountains+National+Park/Cades+Cove,+TN"},
    {van:"Smokies → Atlanta (via kust)", url:"https://www.google.com/maps/dir/Cades+Cove,+TN/Congaree+National+Park,+SC/James+Island+County+Park,+Charleston,+SC/Hunting+Island+State+Park,+SC/Beaufort,+SC/Skidaway+Island+State+Park,+GA/Savannah,+GA/Atlanta,+GA"}
  ],
  parks:["Great Smoky Mountains NP","Shenandoah NP","Mammoth Cave NP","New River Gorge NP&P","Congaree NP","Blue Ridge Parkway"],
  fotos:["Great Smoky Mountains National Park","Craggy Gardens","Hunting Island State Park","Charleston, South Carolina"],
  video:{id:"ti2I616otFo", titel:"Blue Ridge Parkway — 18 things to do on the road trip"},
  score:{wow:8.5,amelie:9,tempo:7,weer:9,prijs:8.5,totaal:8.4},
  kosten:{excl:"€5.300–€7.000",incl:"€6.100–€8.400",bron:"jullie eigen projectraming"},
  weer:"Bergen aangenaam tot warm met regenkans · kust warm en vochtig · oceaan ±27 °C · géén sneeuw- of pasrisico",
  amelie:"De gemakkelijkste camperfinalist: geen hoogte, echte rustblokken, vier strandnachten, steden voor afwisseling. Aandacht: teken in de Appalachen, knutjes aan de kust, hitte/schaduw in steden.",
  plus:["volwaardig strandonderdeel (4 nachten oceaan)","nonstop vlucht uit Amsterdam — goedkoopste gateway","geen seizoensrisico: half mei werkt net zo goed als half juni","meest gevarieerd: bergen, parken, steden, strand"],
  min:["4.150 km totale afstand","Parkway is traag (max 45 mph, 755 km)","tien nachten zonder stroomaansluiting","natuur mooi maar niet spectaculair"],
  quote:"We willen dat het óók een gezinsvakantie is en niet alleen een expeditie.",
  letop:["Blue Ridge Parkway: na orkaan Helene nog herstelwerk/afsluitingen — actuele NPS-status checken vóór definitieve etappes","Hunting Island en populaire parkcampings: zodra 2027-vensters open gaan reserveren","Kuwohi heette tot 2024 Clingmans Dome"],
  stops:[
    {naam:"Atlanta, Georgia", n:1, lat:33.75, lng:-84.39, note:"Aankomsthotel; camper ophalen", wiki:"Atlanta", klimaat:{d:28,n:18}},
    {naam:"Mammoth Cave NP, Kentucky", n:2, lat:37.19, lng:-86.10, note:"Grottour vooraf kiezen; onderweg evt. Cloudland Canyon SP", wiki:"Mammoth Cave National Park", klimaat:{d:27,n:15}},
    {naam:"New River Gorge, West Virginia", n:2, lat:37.98, lng:-80.95, note:"Bridge, Babcock SP (glade-molen); onderweg Natural Bridge/Red River Gorge", wiki:"New River Gorge National Park and Preserve", klimaat:{d:24,n:12}},
    {naam:"Shenandoah NP — Big Meadows CG", n:2, lat:38.52, lng:-78.44, note:"Skyline Drive, korte hikes", wiki:"Shenandoah National Park", klimaat:{d:21,n:10}},
    {naam:"Blue Ridge Parkway (noord→zuid)", n:3, lat:35.68, lng:-82.38, note:"Campings o.a. Peaks of Otter, Doughton Park, Julian Price, Mount Pisgah; Mount Mitchell 2.037 m", wiki:"Blue Ridge Parkway", klimaat:{d:18,n:9}},
    {naam:"Great Smoky Mountains NP", n:3, lat:35.60, lng:-83.78, note:"Smokemont + Cades Cove; Kuwohi 2.025 m", wiki:"Great Smoky Mountains National Park", klimaat:{d:24,n:11}},
    {naam:"Charleston, South Carolina", n:2, lat:32.78, lng:-79.93, note:"James Island County Park; Congaree NP als middagstop", wiki:"Charleston, South Carolina", klimaat:{d:29,n:20}},
    {naam:"Hunting Island State Park", n:4, lat:32.38, lng:-80.44, note:"Vier nachten strand, palmettobos, vuurtoren", wiki:"Hunting Island State Park", klimaat:{d:30,n:21}},
    {naam:"Savannah, Georgia", n:1, lat:32.08, lng:-81.09, note:"Skidaway Island SP; compacte historische kern", wiki:"Savannah, Georgia", klimaat:{d:31,n:21}},
    {naam:"Atlanta — inleveren/vlucht", n:1, lat:33.75, lng:-84.39, note:"Laatste rijdag 's ochtends", wiki:"Atlanta", klimaat:{d:28,n:18}}
  ],
  dagen:[
    {d:1,t:"Amsterdam → Atlanta",x:"Nonstop; aankomsthotel"},
    {d:2,t:"Camper → richting Mammoth Cave",x:"Eerste eenvoudige camperdag"},
    {d:3,t:"Mammoth Cave",x:"Geschikte grottour kiezen; rest van de dag rustig"},
    {d:4,t:"→ New River Gorge",x:"Viewpoints, brugomgeving"},
    {d:5,t:"New River Gorge",x:"Korte wandelingen, Babcock SP"},
    {d:6,t:"→ Shenandoah",x:"Skyline Drive rustig beginnen"},
    {d:7,t:"Shenandoah",x:"Korte hikes + viewpoints"},
    {d:8,t:"Blue Ridge Parkway deel 1",x:"Peaks of Otter, Mabry Mill; niet op kilometers jagen"},
    {d:9,t:"Parkway deel 2",x:"Doughton Park, Julian Price; scenic stops, picknick"},
    {d:10,t:"Parkway deel 3",x:"Mount Mitchell, Mount Pisgah; langzaam rijden is de bedoeling"},
    {d:11,t:"→ Smokies",x:"Smokemont-kant"},
    {d:12,t:"Smokies: Cades Cove",x:"Wildlife, historische gebouwen"},
    {d:13,t:"Smokies: Kuwohi + Oconaluftee",x:"Hoogtepunt 2.025 m, korte trail, rust"},
    {d:14,t:"→ Charleston",x:"Congaree NP als middagstop (hitte/insecten checken)"},
    {d:15,t:"Charleston",x:"Historische kern vroeg op de dag; park, lunch"},
    {d:16,t:"→ Hunting Island",x:"Vanaf hier vakantie-in-de-roadtrip"},
    {d:17,t:"Hunting Island",x:"Strand"},
    {d:18,t:"Hunting Island",x:"Strand/natuur, vuurtoren"},
    {d:19,t:"Hunting Island",x:"Volledige vrije dag"},
    {d:20,t:"→ Savannah",x:"Mooie compacte stad"},
    {d:21,t:"Savannah → Atlanta",x:"Laatste serieuze rijdag"},
    {d:22,t:"Inleveren / vlucht",x:"Camper afgeven, naar huis"}
  ]
},

// ════════════════════════════════ USA 3 ═══════════════════════════════════
{
  id:"usa3", soort:"USA", naam:"Deep South & Golfstrand", lijst:"C",
  alias:"Smokies, Nashville, New Orleans & Florida-strand",
  kleur:"#7a8f3d", km:3100, tempo:"gemiddeld", finalist:false,
  gmaps:"https://maps.app.goo.gl/YvP9XnLt2238JZUW6",
  parks:["Great Smoky Mountains NP","Mammoth Cave NP","Gulf Islands NS"],
  fotos:["Great Smoky Mountains National Park","French Quarter","Natchez Trace Parkway","Gulf Islands National Seashore"],
  video:{id:"RqkTPY1zGz8", titel:"Southern Road to New Orleans — Smoky Mountains & Deep South"},
  score:{wow:8,amelie:8,tempo:7.5,weer:6.5,prijs:8.5,totaal:7.8},
  kosten:{excl:"€5.200–€7.100",incl:"€6.000–€8.500",bron:"planningsbandbreedte"},
  weer:"Warm tot heet en vochtig naarmate je zuidelijker komt; vanaf 1 juni officieel Atlantisch orkaanseizoen (geen reden tot paniek, wél een extra factor)",
  amelie:"Korte natuurwandelingen, veel strand, camper als koele basis. Lastig: middaghitte — airco is geen luxe; Nashville/New Orleans zijn meer volwassen bestemmingen.",
  plus:["foodtrip: Nashville, Natchez, New Orleans","warm strand aan de Golf","logische lus zonder lange lege stukken"],
  min:["minder indrukwekkende natuur dan de finalisten","warmste/vochtigste Atlanta-optie","stormseizoen begint in juni"],
  quote:"New Orleans en Nashville zijn voor ons echte highlights, niet alleen namen op de kaart.",
  letop:["Natchez Trace is traag rijden met weinig voorzieningen — tanken vooraf","orkaanverwachting volgen; B-plan (binnenland) hebben"],
  stops:[
    {naam:"Atlanta, Georgia", n:1, lat:33.75, lng:-84.39, note:"Aankomst; camper ophalen", wiki:"Atlanta", klimaat:{d:28,n:18}},
    {naam:"Great Smoky Mountains NP", n:3, lat:35.61, lng:-83.47, note:"Cades Cove + Oconaluftee", wiki:"Great Smoky Mountains National Park", klimaat:{d:24,n:11}},
    {naam:"Mammoth Cave NP, Kentucky", n:2, lat:37.19, lng:-86.10, note:"Grottour = hittevrije dag", wiki:"Mammoth Cave National Park", klimaat:{d:27,n:15}},
    {naam:"Nashville, Tennessee", n:2, lat:36.16, lng:-86.78, note:"Muziekstad; kindvriendelijke dagactiviteiten kiezen", wiki:"Nashville, Tennessee", klimaat:{d:28,n:17}},
    {naam:"Natchez / Natchez Trace", n:2, lat:31.56, lng:-91.40, note:"Scenic rijdag + historische rivierstad", wiki:"Natchez Trace Parkway", klimaat:{d:30,n:20}},
    {naam:"New Orleans, Louisiana", n:3, lat:29.95, lng:-90.07, note:"French Quarter vroeg op de dag; tempo laag door hitte", wiki:"New Orleans", klimaat:{d:31,n:22}},
    {naam:"Gulf Islands NS (Gulf Breeze)", n:3, lat:30.35, lng:-87.04, note:"Wit zandstrand, warme Golf", wiki:"Gulf Islands National Seashore", klimaat:{d:30,n:21}},
    {naam:"St. George Island, Florida", n:3, lat:29.64, lng:-84.90, note:"Rustig eilandstrand", wiki:"St. George Island (Florida)", klimaat:{d:30,n:22}},
    {naam:"Transit richting Atlanta", n:1, lat:32.46, lng:-84.99, note:"Via Dothan/Columbus", wiki:"Columbus, Georgia", klimaat:{d:30,n:19}},
    {naam:"Atlanta — inleveren/vlucht", n:1, lat:33.75, lng:-84.39, note:"Camper afronden", wiki:"Atlanta", klimaat:{d:28,n:18}}
  ],
  dagen:[
    {d:1,t:"Amsterdam → Atlanta",x:"Aankomsthotel"},
    {d:2,t:"Camper → Smokies",x:"Eerste rit de bergen in"},
    {d:3,t:"Smokies west/centraal",x:"Cades Cove of rustige wandeling"},
    {d:4,t:"Smokies oost",x:"Oconaluftee / Newfound Gap afhankelijk weer"},
    {d:5,t:"→ Mammoth Cave",x:"Rustdag-rit"},
    {d:6,t:"Mammoth Cave",x:"Grottour; koel ondergronds"},
    {d:7,t:"→ Nashville",x:"Korte rit"},
    {d:8,t:"Nashville",x:"Dagactiviteiten, niet alleen avondprogramma"},
    {d:9,t:"Natchez Trace",x:"Scenic rijdag met stops"},
    {d:10,t:"Natchez",x:"Historische stad / Mississippi"},
    {d:11,t:"→ New Orleans",x:"Aankomst; avond kwartier in"},
    {d:12,t:"New Orleans",x:"French Quarter vroeg; parkeren/streetcar regelen"},
    {d:13,t:"New Orleans",x:"Tweede dag, tempo laag door hitte"},
    {d:14,t:"→ Gulf Islands",x:"Naar de kust"},
    {d:15,t:"Gulf Islands",x:"Strand"},
    {d:16,t:"Gulf Islands",x:"Strand/natuur"},
    {d:17,t:"→ St. George Island",x:"Door langs de kust"},
    {d:18,t:"St. George Island",x:"Strand"},
    {d:19,t:"St. George Island",x:"Rustdag"},
    {d:20,t:"→ transit",x:"Richting Atlanta, transitnacht"},
    {d:21,t:"→ Atlanta-regio",x:"Camper afronden"},
    {d:22,t:"Inleveren / vlucht",x:"Terug"}
  ]
},

// ════════════════════════════════ USA 4 ═══════════════════════════════════
{
  id:"usa4", soort:"USA", naam:"Vancouver & Banff", lijst:"C",
  alias:"Vancouver Island, Olympic, Rainier en de Canadese Rockies",
  kleur:"#c97f2d", km:3750, tempo:"actief", finalist:false,
  gmaps:"https://maps.app.goo.gl/YWMUmH9v15Ew75LU7",
  parks:["Banff NP","Olympic NP","Mount Rainier NP","North Cascades NP","Pacific Rim NP Reserve"],
  fotos:["Tofino","Olympic National Park","Moraine Lake","Banff National Park"],
  video:{id:"XPEQhmulA80", titel:"Canada — Cinematic Road Trip (Banff to Vancouver Island)"},
  score:{wow:9.5,amelie:6.5,tempo:6,weer:7,prijs:6.5,totaal:7.7},
  kosten:{excl:"€6.200–€8.800",incl:"€7.000–€10.200",bron:"planningsbandbreedte"},
  weer:"Vier klimaatzones: regen aan de Pacifische kust, sneeuw op hoogte in Rainier/North Cascades, droger in Osoyoos, fris bergweer in Banff",
  amelie:"Grootste nadeel is niet de afstand maar de vele schakels: ferryplanning, twee grensovergangen met de camper, lange laatste week. Vancouver Island zelf is erg gezinsvriendelijk.",
  plus:["oceaan + regenwoud + vulkanen + Rockies in één reis","misschien wel de mooiste route op papier","weinig extreme hitte"],
  min:["te veel logistieke schakels (ferries + 2× grens)","Banff komt laat in de reis","zware terugrit","eigenlijk 24–25 dagen waard"],
  quote:"We willen maximale variatie en accepteren dat de reis logistiek een project wordt.",
  letop:["huurvoorwaarden camper voor grenspassage VS↔Canada schriftelijk bevestigen","ferry-reserveringen BC Ferries + Port Angeles–Victoria vroeg boeken","Parks Canada/Banff-campings: reserveringsvenster volgen"],
  stops:[
    {naam:"Vancouver, BC", n:1, lat:49.28, lng:-123.12, note:"Aankomsthotel", wiki:"Vancouver", klimaat:{d:19,n:11}},
    {naam:"Tofino (Vancouver Island)", n:3, lat:49.15, lng:-125.91, note:"Pacific Rim: stranden + regenwoud-boardwalks; ferry dag 2", wiki:"Tofino", klimaat:{d:17,n:9}},
    {naam:"Victoria, BC", n:2, lat:48.43, lng:-123.37, note:"Havenstad, Butchart Gardens", wiki:"Victoria, British Columbia", klimaat:{d:18,n:10}},
    {naam:"Olympic NP (Hoh/Hurricane Ridge)", n:3, lat:47.86, lng:-123.60, note:"Hoh Rain Forest, Ruby Beach, Lake Crescent; ferry Port Angeles", wiki:"Olympic National Park", klimaat:{d:17,n:9}},
    {naam:"Mount Rainier NP", n:2, lat:46.79, lng:-121.74, note:"Paradise; voorjaarstrails laag/middelhoog", wiki:"Mount Rainier", klimaat:{d:14,n:4}},
    {naam:"North Cascades NP", n:2, lat:48.71, lng:-121.25, note:"Scenic drive Highway 20, diablo Lake", wiki:"North Cascades National Park", klimaat:{d:20,n:7}},
    {naam:"Osoyoos, BC", n:1, lat:49.03, lng:-119.47, note:"Grens terug Canada; wijnstreek", wiki:"Osoyoos", klimaat:{d:24,n:10}},
    {naam:"Kootenay Lake (transit)", n:1, lat:49.65, lng:-116.83, note:"Ferry over het meer, richting Rockies", wiki:"Kootenay Lake", klimaat:{d:20,n:8}},
    {naam:"Banff NP", n:3, lat:51.18, lng:-115.57, note:"Lake Louise, Moraine Lake (shuttle/reservering!)", wiki:"Banff National Park", klimaat:{d:17,n:4}},
    {naam:"Revelstoke/Golden", n:1, lat:51.00, lng:-118.20, note:"Start terugweg", wiki:"Revelstoke, British Columbia", klimaat:{d:19,n:7}},
    {naam:"Kamloops (transit)", n:1, lat:50.67, lng:-120.33, note:"Lange rijdag", wiki:"Kamloops", klimaat:{d:22,n:9}},
    {naam:"Vancouver — inleveren/vlucht", n:1, lat:49.28, lng:-123.12, note:"Bij vroege vlucht: extra nacht nodig", wiki:"Vancouver", klimaat:{d:19,n:11}}
  ],
  dagen:[
    {d:1,t:"Amsterdam → Vancouver",x:"Hotel"},
    {d:2,t:"Camper + ferry → Vancouver Island",x:"Niet dezelfde dag nog naar Tofino pushen"},
    {d:3,t:"→ Tofino",x:"Pacific Rim-route"},
    {d:4,t:"Tofino",x:"Strand, rainforest boardwalk"},
    {d:5,t:"Tofino",x:"Tweede natuurdag / rust"},
    {d:6,t:"→ Victoria",x:"Over het eiland"},
    {d:7,t:"Victoria",x:"Stad, haven, park"},
    {d:8,t:"Ferry/grens → Olympic NP",x:"Logistieke dag (Port Angeles)"},
    {d:9,t:"Olympic westzijde",x:"Hoh / Ruby Beach"},
    {d:10,t:"Olympic noordzijde",x:"Hurricane Ridge / Lake Crescent"},
    {d:11,t:"→ Mount Rainier",x:"Rit langs Puget Sound"},
    {d:12,t:"Mount Rainier",x:"Voorjaarscondities; lage/middelhoge trails"},
    {d:13,t:"→ North Cascades",x:"Highway 20"},
    {d:14,t:"North Cascades",x:"Scenic drive / viewpoints"},
    {d:15,t:"→ Osoyoos",x:"Grens terug naar Canada"},
    {d:16,t:"→ Kootenay Lake",x:"Transit + veer over het meer"},
    {d:17,t:"→ Banff",x:"Aankomst in de Rockies"},
    {d:18,t:"Banff",x:"Lake Louise e.o.; reserveringsregels checken"},
    {d:19,t:"Banff",x:"Tweede volle dag"},
    {d:20,t:"→ Revelstoke/Golden",x:"Start terugweg"},
    {d:21,t:"→ Kamloops",x:"Lange rijdag"},
    {d:22,t:"→ Vancouver / inleveren",x:"Zwaarste slotdag; vroege vlucht = extra nacht"}
  ]
},

// ════════════════════════════════ USA 5 ═══════════════════════════════════
{
  id:"usa5", soort:"USA", naam:"Toronto & Appalachen", lijst:"C",
  alias:"Niagara, Finger Lakes, Washington DC en de Smokies",
  kleur:"#a4583c", km:3063, tempo:"gemiddeld-actief", finalist:false,
  gmaps:"https://maps.app.goo.gl/iCYdckwknNqdDgYL6",
  parks:["Shenandoah NP","Great Smoky Mountains NP","New River Gorge NP&P","Blue Ridge Parkway","C&O Canal NHP"],
  fotos:["Niagara Falls","Finger Lakes","New River Gorge Bridge","Washington, D.C."],
  video:{id:"TzN4KthAEYM", titel:"Toronto + Niagara Falls — Travel Guide"},
  score:{wow:8,amelie:7,tempo:6.5,weer:8,prijs:7,totaal:7.4},
  kosten:{excl:"€5.900–€8.200",incl:"€6.700–€9.600",bron:"planningsbandbreedte"},
  weer:"Redelijk gunstig: Ontario/Finger Lakes fris tot aangenaam, Appalachen warm, minder kusthitte, kans op regen",
  amelie:"Meren, veel korte stops, Toronto aan het eind geeft rust. Lastig: internationale grens met de camper en de lange aansluiting Finger Lakes → Shenandoah en weer terug.",
  plus:["Niagara + wijnstreek Finger Lakes geeft iets dat Atlanta niet heeft","sterke bergcomponent","Toronto als rustige finale"],
  min:["geografisch inefficiënt: honderden km aanvoer naar dezelfde Appalachen-as als Appalachen & Oceaan","geen oceaanstrand","grenslogistiek"],
  quote:"Niagara en Toronto horen net zo sterk op onze wishlist als de Smokies.",
  letop:["camper meenemen over de grens: voorwaarden verhuurder checken","Washington DC: gratis maar tijdslot-museums ver van tevoren reserveren","Parkway-status (Helene-herstel) checken"],
  stops:[
    {naam:"Toronto, Ontario", n:1, lat:43.65, lng:-79.38, note:"Aankomsthotel", wiki:"Toronto", klimaat:{d:22,n:12}},
    {naam:"Niagara Falls + Niagara-on-the-Lake", n:2, lat:43.09, lng:-79.08, note:"Falls vroeg op de dag; wijngebied", wiki:"Niagara Falls, Ontario", klimaat:{d:23,n:12}},
    {naam:"Finger Lakes, New York", n:3, lat:42.38, lng:-76.87, note:"Watkins Glen, wijngaarden, dorpjes; rustdag inbegrepen", wiki:"Finger Lakes", klimaat:{d:22,n:11}},
    {naam:"Shenandoah NP", n:2, lat:38.52, lng:-78.44, note:"Skyline Drive", wiki:"Shenandoah National Park", klimaat:{d:21,n:10}},
    {naam:"Washington DC (daguitstapje)", n:0, lat:38.89, lng:-77.04, note:"Onderweg tussen Shenandoah en Parkway; geen eigen overnachting", wiki:"Washington, D.C.", klimaat:{d:27,n:17}},
    {naam:"Blue Ridge Parkway", n:3, lat:35.68, lng:-82.38, note:"Langzaam rijden, viewpoints", wiki:"Blue Ridge Parkway", klimaat:{d:18,n:9}},
    {naam:"Great Smoky Mountains NP", n:3, lat:35.61, lng:-83.47, note:"Twee volle dagen + rust", wiki:"Great Smoky Mountains National Park", klimaat:{d:24,n:11}},
    {naam:"New River Gorge, West Virginia", n:2, lat:37.87, lng:-81.05, note:"Brug, viewpoints, korte trails", wiki:"New River Gorge National Park and Preserve", klimaat:{d:24,n:12}},
    {naam:"Lake Erie (Erie, PA)", n:2, lat:42.13, lng:-80.09, note:"Rustiger dag langs het meer", wiki:"Lake Erie", klimaat:{d:22,n:13}},
    {naam:"Toronto — finale", n:3, lat:43.65, lng:-79.38, note:"Stadsdag + buffer + camper afronden", wiki:"Toronto", klimaat:{d:22,n:12}}
  ],
  dagen:[
    {d:1,t:"Amsterdam → Toronto",x:"Aankomsthotel"},
    {d:2,t:"Camper → Niagara",x:"Korte eerste dag"},
    {d:3,t:"Niagara",x:"Falls vroeg, Niagara-on-the-Lake later"},
    {d:4,t:"→ Finger Lakes",x:"Naar de wijnstreek"},
    {d:5,t:"Finger Lakes",x:"Watervallen / dorpjes"},
    {d:6,t:"Finger Lakes (rustdag)",x:"Nuttig vóór de lange zuidwaartse lus"},
    {d:7,t:"→ Shenandoah",x:"Lange transfer- en grensdag"},
    {d:8,t:"Shenandoah (+ DC-optioneel)",x:"Skyline Drive; evt. uitstapje Washington DC"},
    {d:9,t:"Blue Ridge Parkway noord",x:"Langzaam beginnen"},
    {d:10,t:"Parkway midden",x:"Scenic stops"},
    {d:11,t:"Parkway zuid",x:"Laatste Parkway-deel"},
    {d:12,t:"→ Smokies",x:"Binnenrollen"},
    {d:13,t:"Smokies",x:"Cades Cove e.a."},
    {d:14,t:"Smokies",x:"Tweede dag"},
    {d:15,t:"→ New River Gorge",x:"Noordwaarts"},
    {d:16,t:"New River Gorge",x:"Brug + korte trails"},
    {d:17,t:"→ Lake Erie",x:"Transit richting Ohio"},
    {d:18,t:"Lake Erie",x:"Rustige dag"},
    {d:19,t:"→ Toronto",x:"Grens over, laatste etappe"},
    {d:20,t:"Toronto",x:"Stadsdag"},
    {d:21,t:"Toronto",x:"Buffer / camper afronden"},
    {d:22,t:"Inleveren / vlucht",x:"Huiswaarts"}
  ]
},

// ════════════════════════════════ USA 6 ═══════════════════════════════════
{
  id:"usa6", soort:"USA", naam:"Dallas, Big Bend & Padre", lijst:"park",
  alias:"Woestijnparken van Texas en New Mexico + Golfstrand",
  kleur:"#8a6ba8", km:3470, tempo:"gemiddeld", finalist:false,
  geparkeerd:"Mei/juni is het verkeerde seizoen: Big Bend gemiddeld 39 °C in mei en 42 °C in juni. Route is top in februari–maart — bewaren voor een andere reis.",
  gmaps:"https://maps.app.goo.gl/5UPh3NY9mF63TWpNA",
  parks:["Big Bend NP","Guadalupe Mountains NP","Carlsbad Caverns NP","White Sands NP","Padre Island NS"],
  fotos:["Big Bend National Park","White Sands National Park","Carlsbad Caverns National Park","Guadalupe Mountains National Park"],
  video:{id:"XAicH2q5AW8", titel:"Big Bend — A Texas Size Adventure (4K)"},
  score:{wow:9,amelie:4,tempo:7,weer:3,prijs:8,totaal:6.8},
  kosten:{excl:"€5.400–€7.400",incl:"€6.200–€8.800",bron:"planningsbandbreedte"},
  weer:"Extreem: Rio Grande Village gemiddeld 39 °C in mei, 42 °C in juni. Buitenleven alleen vroeg/laat; camperairco wordt overlevingsvoorwaarde",
  amelie:"Met een éénjarige niet verantwoord in mei/juni: middaghitte, weinig marge bij pech, laaggelegen canyon- en rivierdelen juist dan onbruikbaar.",
  plus:["vier unieke parken: Big Bend, Guadalupe, Carlsbad, White Sands","strandblok op Padre Island","financieel prima","heel andere natuur dan de andere routes"],
  min:["extreme hitte in mei/juni","lange lege stukken","weinig marge met baby","laaggelegen hoogtepunten vallen juist weg"],
  quote:"Niet voor mei/juni 2027 — bewaren voor februari/maart.",
  letop:["enige check die telt: opnieuw concluderen dat mei/juni te heet is, tenzij jullie het seizoen veranderen"],
  stops:[
    {naam:"Dallas, Texas", n:1, lat:32.78, lng:-96.80, note:"Aankomst; camper ophalen", wiki:"Dallas", klimaat:{d:31,n:22}},
    {naam:"Guadalupe Mountains NP", n:2, lat:31.92, lng:-104.87, note:"Alleen vroeg buiten zijn", wiki:"Guadalupe Mountains National Park", klimaat:{d:27,n:11}},
    {naam:"Carlsbad Caverns NP", n:2, lat:32.14, lng:-104.53, note:"Grotten = hittevrije hoofdattractie", wiki:"Carlsbad Caverns National Park", klimaat:{d:30,n:14}},
    {naam:"White Sands NP", n:2, lat:32.79, lng:-106.33, note:"Zonsopgang + zonsondergang; middag vermijden", wiki:"White Sands National Park", klimaat:{d:31,n:13}},
    {naam:"Big Bend NP (Chisos)", n:4, lat:29.27, lng:-103.30, note:"Hooggelegen deel het hele jaar het mildst", wiki:"Big Bend National Park", klimaat:{d:30,n:14}},
    {naam:"San Antonio", n:2, lat:29.43, lng:-98.49, note:"River Walk vroeg/laat op de dag", wiki:"San Antonio", klimaat:{d:32,n:21}},
    {naam:"Padre Island NS", n:4, lat:27.09, lng:-97.38, note:"Strandblok aan de Golf", wiki:"Padre Island National Seashore", klimaat:{d:30,n:24}},
    {naam:"Hill Country (Fredericksburg)", n:2, lat:30.27, lng:-98.87, note:"Transit + wijnstreekje", wiki:"Fredericksburg, Texas", klimaat:{d:31,n:20}},
    {naam:"Dallas — inleveren/vlucht", n:2, lat:32.78, lng:-96.80, note:"Laatste nachten + vlucht", wiki:"Dallas", klimaat:{d:31,n:22}}
  ],
  dagen:[
    {d:1,t:"Amsterdam → Dallas",x:"Aankomst"},
    {d:2,t:"Camper + westwaarts",x:"Lange eerste beweging opsplitsen"},
    {d:3,t:"Guadalupe Mountains",x:"Alleen vroeg buiten"},
    {d:4,t:"→ Carlsbad",x:"Korte rit"},
    {d:5,t:"Carlsbad Caverns",x:"Ondergronds tegen de hitte"},
    {d:6,t:"→ White Sands",x:"Rit door New Mexico"},
    {d:7,t:"White Sands",x:"Vroege ochtend + avond; middag skip"},
    {d:8,t:"→ Big Bend",x:"Lang, leeg, mooi"},
    {d:9,t:"Big Bend Chisos",x:"Hooggelegen deel"},
    {d:10,t:"Big Bend",x:"Hitte-verantwoorde activiteiten"},
    {d:11,t:"Big Bend",x:"Rust / Chisos"},
    {d:12,t:"Big Bend",x:"Santa Elena alleen vroeeg — seizoen bepaalt"},
    {d:13,t:"→ San Antonio",x:"Uit de woestijn"},
    {d:14,t:"San Antonio",x:"River Walk vroeg/laat"},
    {d:15,t:"→ Padre Island",x:"Naar de kust"},
    {d:16,t:"Padre Island",x:"Strand"},
    {d:17,t:"Padre Island",x:"Strand"},
    {d:18,t:"Padre Island",x:"Strand"},
    {d:19,t:"→ Hill Country",x:"Fredericksburg-kant"},
    {d:20,t:"Hill Country",x:"Rustige dag"},
    {d:21,t:"→ Dallas",x:"Camper afronden"},
    {d:22,t:"Dallas → Amsterdam",x:"Vlucht"}
  ]
},

// ═══════════════════════════════ CHINA 1 ══════════════════════════════════
{
  id:"china1", soort:"China", naam:"Het Klassieke China", lijst:"B",
  alias:"Beijing · Xi'an · Chengdu · Yangshuo · Shanghai",
  kleur:"#9c2030", km:0, treinkm:5800, tempo:"rustig", finalist:false,
  gmaps:"",
  parks:["Grote Muur (Mutianyu)","Verboden Stad","Terracottaleger","Chengdu Panda Base","Li River / Yangshuo-karst"],
  fotos:["Forbidden City","Terracotta Army","Chengdu Research Base of Giant Panda Breeding","Li River"],
  video:{id:"03DFrojtwTk", titel:"12-Day China Highlights: Pandas, Great Wall, Guilin & Shanghai"},
  score:{wow:9,amelie:9,tempo:6,weer:7,prijs:9,totaal:8.2},
  kosten:{excl:"€4.400–€6.800",incl:"€5.100–€7.900",bron:"planningsbandbreedte (5 hotels, 3 treinen, 1 vlucht)"},
  weer:"Beijing warm en vaak prima · Xi'an warm tot heet · Chengdu vochtig · Yangshuo nat seizoen (zwakke plek) · Shanghai vochtiger richting juni. Vier Yangshuo-nachten = regen mag één dag opeten",
  amelie:"Beste comfort van alle negen: weinig hotelwissels, trein i.p.v. autostoel, meerdere vrije middagen, centrale hotels. Aandacht: draagzak + lichte buggy, eigen treinstoel voor lange ritten, grotere kamers boeken, kinderzitje privétransfers schriftelijk regelen.",
  plus:["beste rust/afwisseling-verhouding van alle negen routes","cultuur totaal anders dan Noord-Amerika","weinig autostoeluren","zeer geschikt als eerste China-reis"],
  min:["vijf bases kan te rustig voelen (gem. 4,2 nachten per plaats)","vijf nachten Shanghai is luxe","Yangshuo kan nat zijn","minder spectaculaire bergnatuur dan China 2/3"],
  quote:"We willen China goed beleven en niet na twee weken verlangen naar een vakantie van onze vakantie.",
  letop:["visumvrije regeling loopt nominaal t/m 31 december 2026 — status december 2026 herchecken","kind onder 6 reist gratis mee op de trein (geen eigen stoel) — eigen stoel boeken voor de lange ritten","Alipay/WeChat Pay gekoppeld aan Nederlandse kaart regelen vóór vertrek","12306-account aanmaken met paspoortgegevens"],
  stops:[
    {naam:"Beijing", n:5, lat:39.90, lng:116.41, vervoer:"Vlucht Amsterdam → Beijing", note:"Jetlag + Grote Muur + Verboden Stad + Summer Palace", wiki:"Beijing", klimaat:{d:28,n:17}},
    {naam:"Xi'an", n:3, lat:34.34, lng:108.94, vervoer:"Hogesnelheidstrein ±4–6 u", note:"Terracottaleger, stadsmuur, Muslim Quarter", wiki:"Xi'an", klimaat:{d:28,n:17}},
    {naam:"Chengdu", n:4, lat:30.57, lng:104.07, vervoer:"Hogesnelheidstrein ±3–4 u", note:"Panda Base, People's Park, theehuizen, vrije dag", wiki:"Chengdu", klimaat:{d:27,n:19}},
    {naam:"Yangshuo", n:4, lat:24.78, lng:110.49, vervoer:"Snelle trein naar Guilin ±5–8 u + transfer", note:"Karstlandschap, Yulong River, Xingping, zwembad/regenbuffer", wiki:"Yangshuo County", klimaat:{d:29,n:22}},
    {naam:"Shanghai", n:5, lat:31.23, lng:121.47, vervoer:"Binnenlandse vlucht ±2–2,5 u", note:"Bund, Yu Garden, French Concession, Suzhou-dagtrip", wiki:"Shanghai", klimaat:{d:26,n:19}}
  ],
  dagen:[
    {d:1,t:"Amsterdam → Beijing",x:"Overnight vlucht, bij voorkeur rechtstreeks"},
    {d:2,t:"Beijing: aankomen",x:"Privétransfer, korte buurtwandeling, vroeg eten"},
    {d:3,t:"Hutongs + Jingshan Park",x:"Rustige jetlagdag, middag vrij"},
    {d:4,t:"Verboden Stad",x:"Eén grote bezienswaardigheid, niets erbij proppen"},
    {d:5,t:"Mutianyu Great Wall",x:"Privéauto, kabelbaan, draagzak mee"},
    {d:6,t:"Summer Palace + buffer",x:"Bootje/tuinen, middag vrij"},
    {d:7,t:"Trein → Xi'an",x:"Comfortabele HSL-rit; Amelie kan bewegen"},
    {d:8,t:"Terracottaleger",x:"Vroeg vertrek, halve dag, daarna rust"},
    {d:9,t:"Xi'an",x:"Stadsmuur, Bell/Drum Tower, Muslim Quarter"},
    {d:10,t:"Trein → Chengdu",x:"Na aankomst alleen buurtwandeling en eten"},
    {d:11,t:"Panda Base",x:"Vroeg beginnen — dieren dan actiever"},
    {d:12,t:"People's Park + theehuis",x:"China beleven i.p.v. checklisttoerisme"},
    {d:13,t:"Vrije keuzedag",x:"Leshan, Dujiangyan of helemaal niets"},
    {d:14,t:"Chengdu rustig",x:"Park, laundry, zwembad vóór de transfer"},
    {d:15,t:"Trein → Guilin/Yangshuo",x:"Zwaarste transferdag (±5–8 u + transfer)"},
    {d:16,t:"Yulong River / platteland",x:"Kort dagdeel buiten, middag zwembad"},
    {d:17,t:"Xingping / Li River",x:"Landschap, dorp, korte bootervaring"},
    {d:18,t:"Volledige vrije familiedag",x:"Expres leeg — regen- en goededagbuffer"},
    {d:19,t:"Guilin → Shanghai",x:"Binnenlandse vlucht ±2–2,5 u"},
    {d:20,t:"Bund + Yu Garden",x:"Vroege Bund, later oude stad"},
    {d:21,t:"French Concession",x:"Wandelen, parken, lunch, geen deadline"},
    {d:22,t:"Suzhou of Shanghai",x:"Suzhou per HSL als iedereen energie heeft"},
    {d:23,t:"Terugreis",x:"Schema-afhankelijk; Suzhou kan vervallen"}
  ]
},

// ═══════════════════════════════ CHINA 2 ══════════════════════════════════
{
  id:"china2", soort:"China", naam:"Keizersteden & Avatarbergen", lijst:"B",
  alias:"Beijing · Xi'an · Chengdu · Zhangjiajie · Shanghai",
  kleur:"#c03a2b", km:0, treinkm:6000, tempo:"rustig-gemiddeld", finalist:false,
  gmaps:"",
  parks:["Grote Muur (Mutianyu)","Verboden Stad","Terracottaleger","Chengdu Panda Base","Zhangjiajie NP (Avatar-bergen)"],
  fotos:["Mutianyu","Zhangjiajie National Forest Park","Tianmen Mountain","The Bund"],
  video:{id:"MIWXK7fPRTY", titel:"Ultimate Zhangjiajie Travel Guide: The Avatar Mountains"},
  score:{wow:9.5,amelie:8,tempo:6,weer:6.5,prijs:8.5,totaal:8.1},
  kosten:{excl:"€4.700–€7.200",incl:"€5.400–€8.300",bron:"planningsbandbreedte (Zhangjiajie maakt excursies duurder)"},
  weer:"Zhangjiajie in mei/juni groen en fotogeniek, maar regen en mist mogelijk — uitzicht minder voorspelbaar dan in een stad. Daarom vier nachten en één flexdag",
  amelie:"Voordeel: weinig hotelwissels. Nadeel: Zhangjiajie is geen buggybestemming — draagzak essentieel; reken op wachtrijen, kabelbanen, liften en drukke shuttles.",
  plus:["spectaculairste landschap van de drie China-varianten","nog steeds vijf bases met veel rust ertussen","geen extra Yangshuo-transfer"],
  min:["minder vakantiegevoel dan Yangshuo (geen zwembad/resortblok)","sterkere weersafhankelijkheid","minder buggyvriendelijk","5-nachten-blokken blijven"],
  quote:"We willen niet sneller reizen, maar wél het spectaculairste landschap.",
  letop:["visumstatus december 2026 herchecken","trein Chengdu → Zhangjiajie: ± halve dag deur-tot-deur","Tianmen Mountain: bij mist niet forceren — flexdag inbouwen (zit erin)","zelfde praktische punten als Het Klassieke China (Alipay, 12306, kinderzitjes)"],
  stops:[
    {naam:"Beijing", n:5, lat:39.90, lng:116.41, vervoer:"Vlucht Amsterdam → Beijing", note:"Zelfde programma als Het Klassieke China", wiki:"Beijing", klimaat:{d:28,n:17}},
    {naam:"Xi'an", n:3, lat:34.34, lng:108.94, vervoer:"Hogesnelheidstrein ±4–6 u", note:"Terracottaleger + oude stad", wiki:"Xi'an", klimaat:{d:28,n:17}},
    {naam:"Chengdu", n:4, lat:30.57, lng:104.07, vervoer:"Hogesnelheidstrein ±3–4 u", note:"Panda's + theehuizen + bufferdag", wiki:"Chengdu", klimaat:{d:27,n:19}},
    {naam:"Zhangjiajie", n:4, lat:29.13, lng:110.48, vervoer:"Trein ± halve dag deur-tot-deur", note:"Forest Park (Yuanjiajie, Bailong Elevator), Tianzi Mountain, Tianmen", wiki:"Zhangjiajie", klimaat:{d:26,n:18}},
    {naam:"Shanghai", n:5, lat:31.23, lng:121.47, vervoer:"Binnenlandse vlucht ±2 u", note:"Bund, Yu Garden, French Concession, Suzhou-option", wiki:"Shanghai", klimaat:{d:26,n:19}}
  ],
  dagen:[
    {d:1,t:"Amsterdam → Beijing",x:"Overnight vlucht"},
    {d:2,t:"Beijing: aankomen",x:"Rust"},
    {d:3,t:"Hutongs + Jingshan",x:"Jetlagdag"},
    {d:4,t:"Verboden Stad",x:"Eén groot hoogtepunt"},
    {d:5,t:"Mutianyu Great Wall",x:"Privéauto + kabelbaan"},
    {d:6,t:"Summer Palace + buffer",x:"Tuinen + vrije middag"},
    {d:7,t:"Trein → Xi'an",x:"HSL"},
    {d:8,t:"Terracottaleger",x:"Halve dag, vroeg"},
    {d:9,t:"Xi'an oude stad",x:"Muur + Muslim Quarter"},
    {d:10,t:"Trein → Chengdu",x:"Rustige aankomst"},
    {d:11,t:"Panda Base",x:"Vroeg"},
    {d:12,t:"People's Park / theehuis",x:"Rustige stadsdag"},
    {d:13,t:"Leshan, Dujiangyan of vrij",x:"Keuzedag"},
    {d:14,t:"Chengdu buffer",x:"Bewust rustig vóór Zhangjiajie"},
    {d:15,t:"→ Zhangjiajie",x:"± halve dag deur-tot-deur; na aankomst niets"},
    {d:16,t:"Forest Park: Yuanjiajie",x:"Bailong Elevator, viewpoints, korte loopstukken; draagzak"},
    {d:17,t:"Tianzi Mountain",x:"Shuttle/kabelbaan + geselecteerde viewpoints"},
    {d:18,t:"Tianmen Mountain óf weerdag",x:"Flexdag; bij mist de duurste excursie niet verbranden"},
    {d:19,t:"Vlucht → Shanghai",x:"Rechtstreekse vlucht ±2 u"},
    {d:20,t:"Bund + Yu Garden",x:"Vroeg de Bund in"},
    {d:21,t:"French Concession",x:"Wandelen zonder deadline"},
    {d:22,t:"Suzhou of vrije Shanghai-dag",x:"Energie bepaalt"},
    {d:23,t:"Terugreis",x:"Schema-afhankelijk"}
  ]
},

// ═══════════════════════════════ CHINA 3 ══════════════════════════════════
{
  id:"china3", soort:"China", naam:"China Compleet", lijst:"A",
  alias:"Beijing · Xi'an · Chengdu · Zhangjiajie · Yangshuo · Shanghai",
  kleur:"#6e1423", km:0, treinkm:6600, tempo:"actief", finalist:true,
  gmaps:"",
  parks:["Grote Muur (Mutianyu)","Verboden Stad","Terracottaleger","Chengdu Panda Base","Zhangjiajie NP","Li River / Yangshuo-karst"],
  fotos:["Mutianyu","Zhangjiajie National Forest Park","Li River","Shanghai"],
  video:{id:"8KbiBD_1tl4", titel:"10 Days in China — Family Trip: Beijing, Xi'an, Chengdu, Shanghai"},
  varianten:[
    {modus:"vervang",
     label:"Hongkong-finale",
     vervangStop:"Shanghai",
     door:{naam:"Hongkong", n:4, lat:22.30, lng:114.17, wiki:"Hong Kong", klimaat:{d:30,n:25},
       vervoer:"Hogesnelheidstrein Guilin → West Kowloon ±3,5–4 u (2026-netwerk)",
       note:"Victoria Harbour, skyline, Star Ferry, The Peak; aparte SAR-immigratie en regelgeving, duidelijk duurdere hotels; terugvlucht vanaf HKG"},
     dagtekst:"Shanghai valt weg als finale: dag 20–22 worden hogesnelheidstrein naar West Kowloon, Victoria Harbour &amp; skyline, Star Ferry / Central / The Peak, en dag 23 de terugvlucht vanuit Hongkong. Het weer is er prachtig (☀️ 30° / 🌙 25°), maar de hotelprijzen en de extra immigratiestap zijn de prijs van de wereldstad-finale.",
     tip:"Hongkong heeft een eigen visumregeling (NL-paspoort: 90 dagen visumvrij) — de mainland-visumstatus apart checken."},
    {modus:"extra",
     label:"Hongkong als 7e bestemming",
     setNachten:{"Beijing":3,"Xi'an":3,"Chengdu":3,"Zhangjiajie":3,"Yangshuo":3,"Shanghai":3},
     voegInNa:"Yangshuo",
     nieuwStop:{naam:"Hongkong", n:3, lat:22.30, lng:114.17, wiki:"Hong Kong", klimaat:{d:30,n:25},
       vervoer:"Hogesnelheidstrein Guilin → West Kowloon ±3,5–4 u (2026-netwerk)",
       note:"Victoria Harbour &amp; skyline, Star Ferry / The Peak; daarna vlucht HKG → Shanghai ±2,5 u"},
     dagtekst:"Zeven bases, elk exact drie nachten: 3-3-3-3-3-3-3 (sommen nog steeds 21). Na Yangshuo per hogesnelheidstrein naar Hongkong, drie nachten wereldstad, en per vlucht (±2,5 u) door naar Shanghai als slot. Beijing krimpt naar aankomst + 2 volle dagen (Muur en Verboden Stad blijven, Summer Palace wordt keuze) en Yangshuo verliest zijn regenbuffer.",
     tip:"Eerlijk: 7 verhuisdagen op 21 nachten = 33% — boven de ±24% die we elders als bovengrens met Amelie aanhielden. Dit is de maximaal-actieve versie: prachtig ritme, maar de krapste met een jong kind."}
  ],
  score:{wow:10,amelie:7.5,tempo:9,weer:6.5,prijs:8,totaal:8.7},
  kosten:{excl:"€4.900–€7.600",incl:"€5.600–€8.700",bron:"planningsbandbreedte (extra transfer + extra natuurblok)"},
  weer:"Twee vochtige natuurregio's mee = hogere kans op een regendag, maar ook kleinere kans dat één regio de natuurcomponent verpest",
  amelie:"De grens van wat verantwoord is: zes bases, nooit korter dan drie nachten, langste transfer per trein (±7 u) en Yangshuo direct daarna als herstelblok. Vijf verhuisdagen op 21 nachten is de bovengrens.",
  plus:["meest complete China-ervaring: keizerrijk → oud → panda's → Avatar-bergen → karst → megastad","tempo voelt écht als rondreis (4-3-3-3-4-4)","beide natuuriconen zitten erin","Shanghai en Yangshuo geven aan het eind stabiliteit en herstel"],
  min:["zwaarste China-variant (5× volledig inpakken)","één treinrit van ±7 uur","twee natte regio's","minder ruimte om een dag volledig te verliezen"],
  quote:"Wij worden juist blij van om de 3–4 dagen een nieuwe plek en vinden vijf bases te weinig voor drie weken.",
  letop:["Zhangjiajie → Yangshuo wordt een volle reisdag (rechtstreekse snelle trein ±7 u naar Guilin + transfer) — geen sightseeingdag maken","in Chengdu géén Leshan-dagtrip in deze variant — die rustdag is nodig","visumstatus december 2026 herchecken","zelfde praktische punten als Het Klassieke China","Variant-slot: Shanghai is bewust de finale (goedkoopste binnenlandse vlucht, geen extra grens, modern-China-thema). Wil je Hongkong: er rijdt een directe hogesnelheidstrein Guilin → West Kowloon (±3,5–4 u, 2026-netwerk) — ruilt Shanghai dan in voor 2 nachten Hongkong + vlucht AMS. Meerprijs hotels, extra immigratiestop en aparte SAR-regels; wel een wereldstad-finale. Aan te passen via ✏️ Bewerken of in dit bestand"],
  stops:[
    {naam:"Beijing", n:4, lat:39.90, lng:116.41, vervoer:"Vlucht Amsterdam → Beijing", note:"3 echte dagen na aankomst", wiki:"Beijing", klimaat:{d:28,n:17}},
    {naam:"Xi'an", n:3, lat:34.34, lng:108.94, vervoer:"Hogesnelheidstrein ±4–6 u", note:"Precies genoeg", wiki:"Xi'an", klimaat:{d:28,n:17}},
    {naam:"Chengdu", n:3, lat:30.57, lng:104.07, vervoer:"Hogesnelheidstrein ±3–4 u", note:"Panda's + 1 vrije dag", wiki:"Chengdu", klimaat:{d:27,n:19}},
    {naam:"Zhangjiajie", n:3, lat:29.13, lng:110.48, vervoer:"Trein ± halve dag deur-tot-deur", note:"2 volle natuurdagen (Forest Park + Tianzi óf Tianmen)", wiki:"Zhangjiajie", klimaat:{d:26,n:18}},
    {naam:"Yangshuo", n:4, lat:24.78, lng:110.49, vervoer:"Snelle trein ±7 u naar Guilin + transfer — de concessiedag", note:"Herstelblok: zwembad, Yulong River, Xingping, regendag", wiki:"Yangshuo County", klimaat:{d:29,n:22}},
    {naam:"Shanghai", n:4, lat:31.23, lng:121.47, vervoer:"Binnenlandse vlucht ±2–2,5 u", note:"3 volle dagen / buffer vóór terugvlucht", wiki:"Shanghai", klimaat:{d:26,n:19}}
  ],
  dagen:[
    {d:1,t:"Amsterdam → Beijing",x:"Overnight vlucht"},
    {d:2,t:"Beijing aankomst",x:"Alleen landen"},
    {d:3,t:"Verboden Stad + Jingshan",x:"In deze snellere route iets meer combineren"},
    {d:4,t:"Mutianyu Great Wall",x:"Privéauto"},
    {d:5,t:"Summer Palace + hutongs",x:"Twee lichte blokken met middagrust ertussen"},
    {d:6,t:"Trein → Xi'an",x:"Aankomst eind middag"},
    {d:7,t:"Terracottaleger",x:"Hoofdactiviteit"},
    {d:8,t:"Stadsmuur + Muslim Quarter",x:"Volle maar eenvoudige stadsdag"},
    {d:9,t:"Trein → Chengdu",x:"People's Park als energie over is"},
    {d:10,t:"Panda Base",x:"Vroeg"},
    {d:11,t:"Chengdu vrije dag",x:"Theehuis, park, eten — Leshan schrappen in deze route"},
    {d:12,t:"Trein → Zhangjiajie",x:"± halve dag deur-tot-deur"},
    {d:13,t:"Zhangjiajie Forest Park",x:"Yuanjiajie / viewpoints"},
    {d:14,t:"Tianzi óf Tianmen",x:"Kiezen op weer en energie — niet beide"},
    {d:15,t:"Trein → Guilin/Yangshuo",x:"Concessiedag: ±7 u trein + transfer; snacks, eigen stoel, hoteltransfer geregeld"},
    {d:16,t:"Yangshuo: niets hoeft",x:"Zwembad, platteland, korte wandeling"},
    {d:17,t:"Yulong River",x:"Rustig buitenprogramma"},
    {d:18,t:"Xingping / Li River",x:"Halve tot driekwart dag"},
    {d:19,t:"Vrije regen-/familiedag",x:"Bewust herstel na Zhangjiajie + trein"},
    {d:20,t:"Vlucht → Shanghai",x:"Guilin → Shanghai"},
    {d:21,t:"Bund + Yu Garden",x:"Vroeg de Bund in"},
    {d:22,t:"French Concession / Shanghai",x:"Eventueel laatste volle dag"},
    {d:23,t:"Terugreis",x:"Schema-afhankelijk"}
  ]
},

// ═══════════════════════════════ CHINA 4 ══════════════════════════════════
{
  id:"china4", soort:"China", naam:"Groot China & Yunnan", lijst:"D",
  alias:"Beijing · Xi'an · Chengdu · Zhangjiajie · Yangshuo · Hongkong · Lijiang · Dali · Shanghai",
  kleur:"#d4455a", km:0, treinkm:8500, tempo:"actief", finalist:false,
  melding:"Deze route rekent met 26 nachten (28 dagen) — vijf nachten méér dan het vergelijkingsmodel van 21 nachten. De extra tijd betaalt het Hongkong-blok en Yunnan (Lijiang + Dali). Vergelijk de totaalscore daarom niet één-op-één met de negen 21-nachten-routes.",
  gmaps:"",
  parks:["Grote Muur (Mutianyu)","Verboden Stad","Terracottaleger","Chengdu Panda Base","Zhangjiajie NP","Li River / Yangshuo-karst","Jade Dragon Snow Mountain","Erhai Lake"],
  fotos:["Jade Dragon Snow Mountain","Lijiang","Victoria Harbour","Erhai Lake"],
  video:{id:"nHug3VataZk", titel:"Yunnan Travel Guide — Dali & Lijiang (planning)"},
  score:{wow:10,amelie:7,tempo:8,weer:7,prijs:6.5,totaal:8.4},
  kosten:{excl:"€6.800–€9.800",incl:"€7.700–€11.200",bron:"planningsbandbreedte (5 extra nachten, Hongkong-hotels en 2 extra binnenlandse vluchten)"},
  weer:"Beijing/Xi'an warm · Chengdu/Yangshuo vochtig · Hongkong heet en vochtig (30/25) · Yunnan op 2.000–2.400 m het prettigst van heel China: dag 24–25°, nacht 11–13°; mei nog droog, vanaf juni bouwt de regentijd op",
  amelie:"Langste variant maar met rustige bouwstenen: overal minimaal 2 (meestal 3) nachten, herstelblokken in Yangshuo, Dali en Shanghai. Aandacht: 9 bases = 8× verhuizen, 2 extra vliegtrajecten (HKG→Lijiang vaak met tussenstop) en hoogte in Lijiang (2.400 m).",
  plus:["wow 10: Zhangjiajie én Yangshuo én Jade Dragon én Erhai in één reis","Yunnan is in mei/juni klimatologisch het prettigste deel van China","tempo blijft human dankzij 3-nachtblokken","Shanghai-finale met buffer"],
  min:["26 nachten = andere vakantie-indeling dan de 21-nachten-routes","duurste China-variant (meer nachten, Hongkong, extra vluchten)","9 bases met Amelie is de absolute bovengrens","HKG→Lijiang vaak met tussenstop — verbindingen 2027 checken"],
  quote:"We hebben de tijd — dan pakken we ook het oude Lijiang en Erhai-meer erbij.",
  letop:["visumstatus mainland én aparte SAR-regel Hongkong december 2026 herchecken","vlucht Hongkong → Lijiang: rechtstreeks bestaat niet altijd; reken op 1 tussenstop (Kunming/Guangzhou)","trein Lijiang → Dali ±2–3 u","Jade Dragon Snow Mountain: kabelbaan naar 4.506 m — met Amelie het bezoekerscentrum/lagere delen overwegen","hoogte Lijiang 2.400 m: eerste dag rustig doen"],
  stops:[
    {naam:"Beijing", n:4, lat:39.90, lng:116.41, vervoer:"Vlucht Amsterdam → Beijing", note:"Aankomst + Verboden Stad + Muur + Summer Palace", wiki:"Beijing", klimaat:{d:28,n:17}},
    {naam:"Xi'an", n:2, lat:34.34, lng:108.94, vervoer:"Hogesnelheidstrein ±4–6 u", note:"Terracottaleger + oude stad op één dag", wiki:"Xi'an", klimaat:{d:28,n:17}},
    {naam:"Chengdu", n:2, lat:30.57, lng:104.07, vervoer:"Hogesnelheidstrein ±3–4 u", note:"Panda Base + People's Park", wiki:"Chengdu", klimaat:{d:27,n:19}},
    {naam:"Zhangjiajie", n:3, lat:29.13, lng:110.48, vervoer:"Trein ± halve dag deur-tot-deur", note:"Forest Park + Tianzi óf Tianmen (weer bepaalt)", wiki:"Zhangjiajie", klimaat:{d:26,n:18}},
    {naam:"Yangshuo", n:3, lat:24.78, lng:110.49, vervoer:"Snelle trein ±7 u naar Guilin + transfer", note:"Yulong River, Xingping / Li River", wiki:"Yangshuo County", klimaat:{d:29,n:22}},
    {naam:"Hongkong", n:3, lat:22.30, lng:114.17, vervoer:"Hogesnelheidstrein Guilin → West Kowloon ±3,5–4 u", note:"HK Island / Peak / Star Ferry; Kowloon + vrije middag", wiki:"Hong Kong", klimaat:{d:30,n:25}},
    {naam:"Lijiang", n:3, lat:26.87, lng:100.23, vervoer:"Vlucht (vaak 1 tussenstop)", note:"Oude stad + Baisha; Jade Dragon-regio óf plattelandsdag; 2.400 m hoogte", wiki:"Lijiang", klimaat:{d:24,n:11}},
    {naam:"Dali", n:3, lat:25.61, lng:100.27, vervoer:"Trein ±2–3 u", note:"Erhai Lake / Bai-dorpen; vrije dag / Cangshan", wiki:"Dali City", klimaat:{d:25,n:13}},
    {naam:"Shanghai", n:3, lat:31.23, lng:121.47, vervoer:"Binnenlandse vlucht", note:"Bund + Yu Garden; French Concession + modern Shanghai", wiki:"Shanghai", klimaat:{d:26,n:19}}
  ],
  dagen:[
    {d:1,t:"Amsterdam → Beijing",x:"Overnight vlucht"},
    {d:2,t:"Aankomst Beijing",x:"Niets hoeven — landen, installeren, vroeg eten"},
    {d:3,t:"Verboden Stad + Jingshan",x:"Eén groot hoogtepunt; Jingshan voor het overzicht"},
    {d:4,t:"Mutianyu Great Wall",x:"Privéauto + kabelbaan"},
    {d:5,t:"Summer Palace + hutongs",x:"Twee lichte blokken met middagrust"},
    {d:6,t:"Trein → Xi'an",x:"Hogesnelheidstrein"},
    {d:7,t:"Terracottaleger + Xi'an",x:"Vroeg naar het leger, middag oude stad"},
    {d:8,t:"Trein → Chengdu",x:"Aankomst middag; theehuis als energie er is"},
    {d:9,t:"Panda Base + People's Park",x:"Vroeg naar de panda's, middag park"},
    {d:10,t:"Trein → Zhangjiajie",x:"± halve dag deur-tot-deur"},
    {d:11,t:"Zhangjiajie Forest Park",x:"Yuanjiajie / viewpoints; draagzak"},
    {d:12,t:"Tianzi óf Tianmen",x:"Weer en energie bepalen — niet beide"},
    {d:13,t:"Trein → Guilin → Yangshuo",x:"Concessiedag ±7 u + transfer; geen sightseeing"},
    {d:14,t:"Yulong River",x:"Rustig buitenprogramma"},
    {d:15,t:"Xingping / Li River",x:"Karstlandschap, dorp, korte boot"},
    {d:16,t:"Trein → Hongkong",x:"Guilin → West Kowloon ±3,5–4 u; immigratie op het station"},
    {d:17,t:"Hong Kong Island",x:"Peak, Star Ferry, Victoria Harbour"},
    {d:18,t:"Kowloon + vrije middag",x:"Markten, waterfront; rust voor de vlucht"},
    {d:19,t:"Vlucht → Lijiang",x:"Vaak 1 tussenstop (Kunming/Guangzhou); aankomst = rusten op 2.400 m"},
    {d:20,t:"Lijiang + Baisha",x:"Oude stad en Naxi-dorp Baisha"},
    {d:21,t:"Jade Dragon-regio óf platteland",x:"Kabelbaan/lagere delen óf rustige dorpjesdag"},
    {d:22,t:"Trein → Dali",x:"±2–3 u door Yunnan"},
    {d:23,t:"Erhai Lake / Bai-dorpen",x:"Meer, dorpjes, fietsen of boot"},
    {d:24,t:"Dali vrije dag / Cangshan",x:"Oude stad; optioneel Cangshan-bergen"},
    {d:25,t:"Vlucht → Shanghai",x:"Binnenlandse vlucht"},
    {d:26,t:"Bund + Yu Garden",x:"Vroege Bund, later oude stad"},
    {d:27,t:"French Concession + modern Shanghai",x:"Wandelen, parken, laatste avond"},
    {d:28,t:"Shanghai → Amsterdam",x:"Terugvlucht"}
  ]
}
];

// ─────────────────────────── AL GEWEEST (filter) ───────────────────────────
// Deze plekken hebben jullie al bezien (Zuidwesten VS / Californië, eerdere reis).
// check-routes.js waarschuwt als een actieve route een van deze namen bevat.
const VISITED = [
  "Death Valley","Mammoth Lakes","Yosemite National Park","San Francisco",
  "Watsonville","San Simeon","Los Angeles","Joshua Tree National Park",
  "Lake Havasu","Kingman / Route 66","Sedona","Grand Canyon National Park",
  "Page","Monument Valley","Arches National Park","Capitol Reef National Park",
  "Bryce Canyon","Zion National Park","Las Vegas Strip"
];

if (typeof window !== "undefined") {
  window.ROUTES = ROUTES; window.VISITED = VISITED;
  window.SCORE_GEWICHTEN = SCORE_GEWICHTEN; window.scoreTotaal = scoreTotaal;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ROUTES, VISITED, SCORE_GEWICHTEN, scoreTotaal };
}
