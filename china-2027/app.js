"use strict";
(() => {
  const data = window.CHINA2027;
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => [...document.querySelectorAll(q)];
  const esc = (s = "") =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const euro = (n) =>
    new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  const preciseEuro = (n) =>
    new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(n);
  const base = Date.UTC(2027, 2, 28);
  const iso = (day) =>
    new Date(base + (day - 1) * 86400000).toISOString().slice(0, 10);
  const shift = (date, days) =>
    new Date(Date.parse(date + "T12:00:00Z") + days * 86400000)
      .toISOString()
      .slice(0, 10);
  const fmt = (date, opts = { day: "numeric", month: "short" }) =>
    new Intl.DateTimeFormat("nl-NL", { ...opts, timeZone: "UTC" }).format(
      new Date(date + "T12:00:00Z"),
    );
  const stayFor = (d) =>
    d >= 2 && d <= 29
      ? data.stays.find((s) => d >= s.start && d < s.start + s.nights)
      : null;
  const types = {
    vlucht: "Vliegdag",
    rust: "Rust & ruimte",
    cultuur: "Cultuur",
    keuze: "Flexibele dag",
    trein: "Treindag",
    natuur: "Natuur",
    transfer: "Transfer",
  };
  const trainKey = (t) => t.id || String(t.day);
  const nightsText = (n) => `${n} ${n === 1 ? "nacht" : "nachten"}`;
  const key = "china2027-planner-v1";
  let state = {
    checks: {},
    notes: {},
    trains: {},
    hotels: {},
    choices: {},
    customHotels: {},
    bookings: {},
    hotelDetails: {},
    dayModes: {},
    reminders: {},
    budget: {},
  };
  let extras;
  let sharedSync;
  let bookingLedger;
  let storageOK = true;
  function hotelLink(value) {
    if (typeof value !== "string" || !value.trim() || value.length > 4000)
      return "";
    try {
      const url = new URL(value.trim());
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }
  function cleanCustomHotel(input) {
    if (!input || typeof input !== "object" || Array.isArray(input))
      return null;
    if (typeof input.name !== "string" || !input.name.trim()) return null;
    if (
      !Number.isFinite(input.price) ||
      input.price < 0 ||
      input.price > 100000
    )
      return null;
    const hotel = { name: input.name.trim().slice(0, 200), price: input.price };
    for (const field of ["area", "room", "notes"])
      hotel[field] =
        typeof input[field] === "string"
          ? input[field].slice(0, field === "notes" ? 5000 : 500)
          : "";
    hotel.url = hotelLink(input.url);
    return hotel;
  }
  function cleanState(input) {
    const out = {
      checks: {},
      notes: {},
      trains: {},
      hotels: {},
      choices: {},
      customHotels: {},
      bookings: {},
      hotelDetails: {},
      dayModes: {},
      reminders: {},
      budget: {},
    };
    if (!input || typeof input !== "object" || Array.isArray(input))
      throw Error("Ongeldige back-up");
    for (const [k, v] of Object.entries(input.checks || {}))
      if (
        /^(pre|attraction|pack|hotel)-[a-z0-9-]+$/.test(k) &&
        typeof v === "boolean"
      )
        out.checks[k] = v;
    for (const [k, v] of Object.entries(input.notes || {}))
      if (/^(?:[1-9]|[12][0-9]|3[01])$/.test(k) && typeof v === "string")
        out.notes[k] = v.slice(0, 10000);
    // Keep the former D27 status in backups, but never apply it to either new leg.
    const trainKeys = [...data.trains.map(trainKey), "27"];
    for (const id of trainKeys)
      if (["Nog boeken", "Aangevraagd", "Geboekt"].includes(input.trains?.[id]))
        out.trains[id] = input.trains[id];
    for (const s of data.stays) {
      const custom = cleanCustomHotel(input.customHotels?.[s.id]);
      if (custom) out.customHotels[s.id] = custom;
      const choice = input.choices?.[s.id];
      if (
        ["budget", "comfort"].includes(choice) ||
        (choice === "custom" && custom)
      )
        out.choices[s.id] = choice;
      for (const id of [
        s.id,
        s.id + "-budget",
        s.id + "-comfort",
        s.id + "-custom",
      ])
        if (
          typeof input.hotels?.[id] === "number" &&
          input.hotels[id] >= 0 &&
          input.hotels[id] <= 100000
        )
          out.hotels[id] = input.hotels[id];
    }
    for (const k of [
      "flights",
      "trains",
      "food",
      "transfers",
      "activities",
      "extras",
    ])
      if (
        typeof input.budget?.[k] === "number" &&
        input.budget[k] >= 0 &&
        input.budget[k] <= 1000000
      )
        out.budget[k] = input.budget[k];
    out.hotelDetails = window.ChinaExtras.cleanDetails(input.hotelDetails);
    for (const [id, mode] of Object.entries(input.dayModes || {}))
      if (/^(?:[1-9]|[12][0-9]|3[01])$/.test(id) && mode === "calm")
        out.dayModes[id] = mode;
    for (const [id, value] of Object.entries(input.reminders || {})) {
      if (id === "leadDays" && [1, 3, 7].includes(value))
        out.reminders[id] = value;
      else if (/^done-[a-z0-9-]{1,115}$/.test(id) && typeof value === "boolean")
        out.reminders[id] = value;
    }
    out.bookings = window.ChinaBookings.clean(input.bookings);
    return out;
  }
  try {
    const saved = localStorage.getItem(key);
    if (saved) state = cleanState(JSON.parse(saved));
  } catch {
    storageOK = false;
    $("#storage-warning").hidden = false;
  }
  function save({ sync = true } = {}) {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      storageOK = true;
      $("#storage-warning").hidden = true;
      $("#save-status").textContent = "Bewaard op dit apparaat.";
    } catch {
      storageOK = false;
      $("#storage-warning").hidden = false;
      $("#save-status").textContent =
        "Niet bewaard. Download een back-up om je wijzigingen te bewaren.";
    }
    if (sync) sharedSync?.queue();
  }
  let toastTimer;
  function toast(message) {
    $("#toast").textContent = message;
    $("#toast").classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3800);
  }
  let selectedDay = 2;
  let currentView = "planning";
  let map;
  let mapReady = false;
  const cities = Object.fromEntries(data.stays.map((s) => [s.id, s.name]));
  cities.reis = "Onderweg";
  const bookingURL = (s) => {
    const u = new URL("https://www.booking.com/searchresults.nl.html");
    u.searchParams.set("ss", s.hotel);
    u.searchParams.set("checkin", iso(s.start));
    u.searchParams.set("checkout", iso(s.start + s.nights));
    u.searchParams.set("group_adults", "2");
    u.searchParams.set("no_rooms", "1");
    u.searchParams.set("group_children", "1");
    u.searchParams.set("age", "0");
    return u.href;
  };
  const checks = {
    pre: [
      [
        "flights",
        "Vluchten vastleggen, inclusief eigen stoel voor Amélie",
        "Alle vier segmenten, uitvoerende maatschappijen en zitplaatsen controleren.",
      ],
      [
        "seat",
        "Eén kinderzitje schriftelijk laten accepteren",
        "SWISS, Cathay en Lufthansa; model, afmetingen, vliegtuigtype en heupgordelinstallatie.",
      ],
      [
        "passports",
        "Drie geldige paspoorten controleren",
        "Namen exact overnemen op vlucht-, trein- en attractietickets.",
      ],
      [
        "visa",
        "Visum-/visumvrijregels voor 2027 controleren",
        "Max 30 dagen per binnenkomst; de reis van 27 dagen past daarbinnen. In december 2026 en opnieuw 6–8 weken vóór vertrek; Hongkong apart. Komt er in januari 2027 geen verlenging, vraag dan L-visums aan voor alle drie.",
      ],
      [
        "hotels",
        "Hotels met passende voorwaarden boeken",
        "Babybed, rookvrije kamer, totale prijs en annuleerbaarheid bevestigen.",
      ],
      [
        "early",
        "Shanghai vroeg inchecken & Hongkong late checkout",
        "Een extra nacht of dagkamer apart meenemen in het budget.",
      ],
      [
        "rail",
        "12306-account en alle passagiers voorbereiden",
        "Registreer alle drie de paspoorten ruim vooraf: verificatie duurt dagen. Zet de gratis-kindregistratie van Amélie op het ticket, test betalen en zet een alarm op de vrijgavetijd van elk station.",
      ],
      [
        "payments",
        "Alipay / WeChat Pay en mobiele data testen",
        "Offline adressen, ticketkopieën en hotelcontacten opslaan.",
      ],
      [
        "transfers",
        "Grote transfers met kinderzitje regelen",
        "PVG, stations, Wulingyuan, Yangshuo, Longji, Kanton en HKG; exacte stationnamen delen.",
      ],
      [
        "insurance",
        "Reisverzekering en babyvoorbereiding afronden",
        "Medische dekking/repatriëring; reisarts of consultatiebureau raadplegen.",
      ],
    ],
    attraction: [
      [
        "forbidden",
        "Forbidden City · bezoek 4 april",
        "28 maart 20:00 Beijing / 14:00 Nederland: huidige opening. Maximaal 40.000 per dag, geen verkoop aan de deur, maandag dicht behalve op feestdagen. Neem het originele paspoort mee waarmee geboekt is; ook Amélie registreren en hulp vooraf regelen.",
      ],
      [
        "tiananmen",
        "Tiananmen Square · alleen als extra stop gewenst",
        "Eigen reservering en toegangsroute controleren; niet automatisch gedekt door het paleisticket.",
      ],
      [
        "mutianyu",
        "Mutianyu · bezoek 6 april",
        "Chauffeur, gesloten kabelbaan en entree vooraf; bewust op dinsdag 6 april, buiten het Qingming-blok van 3–5 april.",
      ],
      [
        "terracotta",
        "Terracottaleger · bezoek 8 april",
        "¥120 in het piekseizoen met tijdslot, kinderen onder 1,20 m gratis, ticket op naam. Uiterlijk een week vooraf verkoopvenster en transfer controleren.",
      ],
      [
        "pandas",
        "Panda Base · bezoek 10 april",
        "Vooraf een tijdslot op naam boeken, met dezelfde paspoorten bij de ingang. April is piek: bij opening gaan.",
      ],
      [
        "park",
        "Zhangjiajie National Forest Park · 14–15 april",
        "Kaartje circa ¥225–228, vier dagen geldig met face-scan; parkbussen inbegrepen, lift en kabelbaan apart. Paspoort mee en geen grote koffer het park in.",
      ],
      [
        "tianmen",
        "Tianmen / weerbuffer · 16 april",
        "Apart tijdslot en actuele kabelbaan-/roltraproute; 3–5 dagen vooruit boeken. Grand Canyon blijft tweede keuze.",
      ],
    ],
    pack: [
      [
        "carrier",
        "Draagzak, goed passend en getest",
        "Voor Great Wall, Zhangjiajie, Longji en drukte.",
      ],
      [
        "buggy",
        "Lichte buggy + regenhoes",
        "Voor steden en vlakke wandelingen.",
      ],
      [
        "seat",
        "Bevestigd vliegtuiggeschikt kinderzitje",
        "Keuringslabel, handleiding en airline-akkoorden meenemen.",
      ],
      [
        "baby",
        "Voeding, luiers en reserves in de dagtas",
        "Ook een onverwacht lange transfer of vlucht aankunnen.",
      ],
      [
        "layers",
        "Warme lagen, regenjas & schoenen met grip",
        "Koele Beijing-ochtenden en natte bergpaden.",
      ],
      [
        "sleep",
        "Slaapspullen en hotelbabybedden checken",
        "Bekend slaapritueel, passende slaapzak en babybedbevestigingen.",
      ],
      [
        "docs",
        "Offline documenten & contactgegevens",
        "Paspoorten, tickets, polis en Chinese hotel-/stationadressen.",
      ],
    ],
  };
  function checkHTML(group, item) {
    const [id, label, note] = item;
    const k = group + "-" + id;
    return `<label class="check-line ${state.checks[k] ? "checked" : ""}"><input type="checkbox" data-check="${k}" ${state.checks[k] ? "checked" : ""}><span>${esc(label)}${note ? `<small>${esc(note)}</small>` : ""}</span></label>`;
  }
  function renderChecks() {
    for (const group of ["pre", "attraction", "pack"])
      $(
        "#" +
          {
            pre: "pre-checks",
            attraction: "attraction-checks",
            pack: "packing-checks",
          }[group],
      ).innerHTML = checks[group].map((i) => checkHTML(group, i)).join("");
  }
  function renderList() {
    const query = $("#search").value.trim().toLowerCase();
    const city = $("#city-filter").value;
    const kind = $("#kind-filter").value;
    const filtered = data.days.filter((d) => {
      const text = [d.title, d.sub, d.am, d.pm, d.eve, cities[d.city]]
        .join(" ")
        .toLowerCase();
      const kindMatch =
        kind === "all" ||
        (kind === "reizen" &&
          ["vlucht", "trein", "transfer"].includes(d.kind)) ||
        (kind === "rust" && d.kind === "rust") ||
        (kind === "beleven" && ["cultuur", "natuur", "keuze"].includes(d.kind));
      return (
        (!query || text.includes(query)) &&
        (city === "all" || d.city === city) &&
        kindMatch
      );
    });
    $("#result-count").textContent = filtered.length + " dagen";
    if (filtered.length && !filtered.some((d) => d.d === selectedDay))
      selectedDay = filtered[0].d;
    let last = "";
    $("#day-list").innerHTML = filtered.length
      ? filtered
          .map((d) => {
            const group =
              d.city !== last
                ? `<div class="day-group">${esc(cities[d.city])}</div>`
                : "";
            last = d.city;
            return (
              group +
              `<button class="day-item ${d.d === selectedDay ? "selected" : ""}" data-day="${d.d}" aria-pressed="${d.d === selectedDay}"><span class="day-number">${String(d.d).padStart(2, "0")}<small>Dag</small></span><span><span class="day-item-meta"><span>${fmt(iso(d.d), { weekday: "short", day: "numeric", month: "short" })}</span><span>${esc(types[d.kind])}</span></span><span class="day-item-title">${esc(d.title)}${state.dayModes[d.d] === "calm" ? " · rustig" : ""}</span><span class="day-item-meta">${esc(d.sub)}</span></span></button>`
            );
          })
          .join("")
      : `<div class="empty-results">Geen dagen gevonden.<button class="button secondary" id="clear-filters">Wis de filters</button></div>`;
    if (filtered.length) renderDetail();
    else {
      $("#day-detail").className = "day-detail is-empty";
      $("#day-detail").innerHTML =
        "<h3>Even een andere zoekopdracht.</h3><p>Zoek bijvoorbeeld op panda, Beijing of rivier, of wis de filters om alle 31 dagen terug te zien.</p>";
    }
  }
  function plannedDay(d) {
    return window.ChinaExtras.dayPlan(d, state.dayModes);
  }
  function renderDetail() {
    const d = plannedDay(data.days[selectedDay - 1]);
    const s = stayFor(d.d);
    const isTravel = ["trein", "transfer", "vlucht"].includes(d.kind);
    let dayColor = "green";
    if (d.kind === "rust") dayColor = "gold";
    else if (isTravel) dayColor = "red";
    $("#day-detail").className = "day-detail";
    $("#day-detail").innerHTML =
      `<header class="detail-head"><div class="detail-top"><span class="eyebrow" style="margin:0">Dag ${String(d.d).padStart(2, "0")} · ${fmt(iso(d.d), { weekday: "long", day: "numeric", month: "long" })}</span><span class="tag ${dayColor}">${esc(types[d.kind])}</span></div><h3>${esc(d.title)}</h3><p class="detail-subtitle">${esc(d.sub)}</p></header><div class="detail-body">${s && s.klimaat ? `<p class="day-weather"><span class="tag weather">☀ ${s.klimaat.d}° · ☾ ${s.klimaat.n}°</span><span>${esc(s.weer || "")}</span></p>` : ""}<div class="day-pace"><div><strong>${state.dayModes[d.d] === "calm" ? "Vandaag doen we minder." : "Past het tempo bij vandaag?"}</strong><p class="caption">Een korter programma bij regen, weinig energie of een slechte nacht. Controleer zelf de voorwaarden van bezoeken die vervallen.</p></div><button class="button ${state.dayModes[d.d] === "calm" ? "primary" : "secondary"}" data-day-mode="${d.d}" aria-pressed="${state.dayModes[d.d] === "calm"}">${state.dayModes[d.d] === "calm" ? "Terug naar basisprogramma" : "Rustiger programma"}</button></div><div class="detail-timeline">${[
        ["Ochtend", d.am],
        ["Middag", d.pm],
        ["Avond", d.eve],
      ]
        .map(
          ([time, text]) =>
            `<div class="time-block"><span class="time-label">${time}</span><p>${esc(text)}</p></div>`,
        )
        .join(
          "",
        )}</div><div class="day-baby"><strong>Voor Amélie</strong>${esc(d.baby)}</div><div class="detail-info"><div><h4>Vooraf regelen</h4><p>${esc(d.reserve)}</p></div><div><h4>Als het anders loopt</h4><p>${esc(d.backup)}</p></div></div><div class="sleep-box"><div><p class="eyebrow">${s ? "Hier slapen we" : "Vannacht"}</p><strong>${esc(s ? hotelOption(s).hotel : d.sleep)}</strong>${s ? `<p class="caption">${esc(s.name)} · ${hotelCostLabel(s)}</p>` : ""}</div>${s ? `<button data-hotel="${s.id}">Bekijk het hotel</button>` : ""}</div><p class="caption"><strong>Uitgavenindicatie:</strong> ${esc(d.cost)}</p><details class="day-notes"><summary>Onze notities voor deze dag</summary><label class="sr-only" for="day-note">Notities voor dag ${d.d}</label><textarea id="day-note" data-note="${d.d}" placeholder="Bijvoorbeeld: boekingstijd, restaurant of een plan B…">${esc(state.notes[d.d] || "")}</textarea><p class="caption">Automatisch bewaard. Met Samen plannen delen jullie ook deze notities.</p></details></div><div class="detail-nav"><button data-next="${d.d - 1}" ${d.d === 1 ? "disabled" : ""}>Vorige dag</button><span class="local-save">${d.d} / 31</span><button data-next="${d.d + 1}" ${d.d === 31 ? "disabled" : ""}>Volgende dag</button></div>`;
  }
  function showDay(day, { reset = true, scroll = true } = {}) {
    if (day < 1 || day > 31) return;
    selectedDay = day;
    if (reset) {
      $("#search").value = "";
      $("#city-filter").value = "all";
      $("#kind-filter").value = "all";
    }
    setView("planning", false);
    renderList();
    history.replaceState(null, "", "#dag-" + day);
    const selected = $(".day-item.selected");
    if (selected) {
      const list = $("#day-list");
      if (innerWidth <= 600)
        list.scrollTo({
          left: selected.offsetLeft - list.offsetLeft - 2,
          behavior: scroll ? "smooth" : "auto",
        });
      else
        list.scrollTo({
          top: selected.offsetTop - list.offsetTop - 100,
          behavior: scroll ? "smooth" : "auto",
        });
    }
    if (scroll) {
      if (innerWidth <= 600)
        $("#day-detail").scrollIntoView({ behavior: "smooth", block: "start" });
      else
        $("#planning").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  function setView(view, scroll = true) {
    if (
      ![
        "planning",
        "route",
        "hotels",
        "boeken",
        "praktisch",
        "budget",
        "boekingen",
        "samen",
      ].includes(view)
    )
      view = "planning";
    currentView = view;
    $$(".view").forEach((s) => {
      s.hidden = s.id !== view;
      s.classList.toggle("active", s.id === view);
    });
    $$("nav a[data-view]").forEach((a) => {
      if (a.dataset.view === view) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    document.body.classList.toggle("inner-view", view !== "planning");
    if (view === "route") initMap();
    if (view === "hotels") renderHotels();
    if (view === "boekingen") bookingLedger?.render();
    if (view === "boeken") extras?.renderReminders();
    if (scroll)
      $("#main").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function navigateHash(scroll = true) {
    const hash = location.hash.slice(1);
    if (hash.startsWith("samen=")) {
      setView("samen", scroll);
      return;
    }
    const match = hash.match(/^dag-(\d+)$/);
    if (match) {
      showDay(Number(match[1]), { scroll });
      return;
    }
    setView(hash || "planning", scroll);
  }
  const hotelChoiceLabels = {
    budget: "budget",
    comfort: "comfort",
    custom: "eigen hotel",
  };
  function hotelChoice(s) {
    const choice = state.choices[s.id];
    if (choice === "custom" && !state.customHotels[s.id]) return "budget";
    return choice ?? (state.hotels[s.id] !== undefined ? "comfort" : "budget");
  }
  function hotelOption(s, choice = hotelChoice(s)) {
    if (choice === "budget") return { ...s, ...s.budget };
    if (choice !== "custom") return s;
    const own = state.customHotels[s.id];
    const price = state.hotels[s.id + "-custom"] ?? own.price;
    return {
      ...s,
      hotel: own.name,
      low: price,
      high: price,
      area: own.area || "Eigen accommodatie",
      room: own.room || "Eigen kamertype",
      why: own.notes || "Door ons gevonden.",
      url: own.url,
    };
  }
  function hotelCostLabel(s) {
    const h = hotelOption(s);
    if (hotelChoice(s) === "custom")
      return `eigen prijs ${preciseEuro(h.low)} / nacht`;
    return `kamerbudget ${euro(h.low)}–${euro(h.high)} / nacht`;
  }
  function customHotelForm(s) {
    const own = state.customHotels[s.id];
    const values = own ? { ...own, price: hotelOption(s, "custom").low } : {};
    const fields = [
      [
        "name",
        "Hotelnaam",
        "text",
        "Bijvoorbeeld: ons eigen hotel",
        "required maxlength=200",
      ],
      [
        "price",
        "Prijs per kamer / nacht (€)",
        "number",
        "Inclusief toeslagen",
        'required min="0" max="100000" step="0.01"',
      ],
      [
        "url",
        "Hotel- of boekingslink (optioneel)",
        "url",
        "https://…",
        "maxlength=4000",
      ],
      [
        "area",
        "Adres / buurt (optioneel)",
        "text",
        "Handig voor de transfer",
        "maxlength=500",
      ],
      [
        "room",
        "Kamer / babybed (optioneel)",
        "text",
        "Kamertype, babybed…",
        "maxlength=500",
      ],
    ];
    return `<details class="custom-editor"><summary>${own ? "Eigen hotel aanpassen" : "+ Eigen hotel toevoegen"}</summary>
      <form data-custom-hotel="${s.id}" class="custom-hotel-form">
      ${fields.map(([field, label, type, placeholder, attrs]) => `<label class="${field === "url" ? "full" : ""}" for="custom-${s.id}-${field}">${label}<input id="custom-${s.id}-${field}" name="${field}" type="${type}" placeholder="${placeholder}" value="${esc(values[field] ?? "")}" ${attrs}></label>`).join("")}
      <label class="full" for="custom-${s.id}-notes">Notities (optioneel)<textarea id="custom-${s.id}-notes" name="notes" rows="3" maxlength="5000" placeholder="Bijvoorbeeld ontbijt, annulering of transferafspraken…">${esc(values.notes || "")}</textarea></label>
      <p class="caption full">${fmt(iso(s.start))} – ${fmt(iso(s.start + s.nights))} · ${nightsText(s.nights)} · één kamer voor twee volwassenen + Amélie. Vul de totale kamerprijs inclusief toeslagen in.</p>
      <button type="submit" class="button primary full">Opslaan en gebruiken</button>
      </form></details>`;
  }
  function renderCustomHotel(s) {
    const own = state.customHotels[s.id];
    const active = hotelChoice(s) === "custom";
    let content = `<h4>Jullie eigen vondst.</h4><p>Voeg een derde hotel toe voor ${esc(s.name)}. De budget- en comfortopties blijven beschikbaar.</p>`;
    if (own) {
      const h = hotelOption(s, "custom");
      content = `<div class="hotel-option-top"><h4>${esc(h.hotel)}</h4><strong>${preciseEuro(h.low)}<small>kamer / nacht · eigen prijs</small></strong></div>
        <p class="hotel-area">${esc(h.area)}<br>${esc(h.room)}</p><p class="custom-hotel-notes">${esc(own.notes)}</p>
        <div class="hotel-total"><span>${nightsText(s.nights)} · 1 kamer</span><strong>${preciseEuro(h.low * s.nights)}</strong></div>
        <div class="hotel-links">${h.url ? `<a href="${esc(h.url)}" target="_blank" rel="noopener">Onze hotellink ↗</a>` : ""}<a href="${esc(bookingURL(h))}" target="_blank" rel="noopener">Zoek op onze data ↗</a></div>
        <button class="button ${active ? "primary" : "secondary"} hotel-choice" data-choice="${s.id}" data-option="custom" aria-pressed="${active}">${active ? "✓ In ons plan" : "Kies eigen hotel"}</button>
        ${checkHTML("hotel", [s.id + "-custom", "Dit hotel geboekt & babybed bevestigd", "Zelf afvinken na bevestiging van dit hotel."])}`;
    }
    return `<div class="hotel-option custom-hotel ${active ? "selected" : ""}"><p class="eyebrow">03 · Eigen hotel</p>${content}${customHotelForm(s)}</div>`;
  }
  function renderHotels() {
    const lo = data.stays.reduce(
      (n, s) => n + s.nights * hotelOption(s).low,
      0,
    );
    const hi = data.stays.reduce(
      (n, s) => n + s.nights * hotelOption(s).high,
      0,
    );
    $("#hotel-range").textContent = euro(lo) + "–" + euro(hi);
    $("#hotel-grid").innerHTML = data.stays
      .map((s, i) => {
        const options = ["budget", "comfort"]
          .map((choice) => {
            const h = hotelOption(s, choice);
            const active = hotelChoice(s) === choice;
            return `<div class="hotel-option ${active ? "selected" : ""}"><div class="hotel-option-top"><span class="tag ${choice === "budget" ? "green" : ""}">${choice === "budget" ? "Budget" : "Comfort"}</span><strong>${euro(h.low)}–${euro(h.high)}<small>kamer / nacht · raming</small></strong></div><h4>${esc(h.hotel)}</h4><p class="hotel-area">${esc(h.area)}<br>${esc(h.room)}</p><p>${esc(h.why)}</p><details class="hotel-questions"><summary>Voor Amélie & vóór boeken</summary><p>${esc(h.check)}</p></details><div class="hotel-total"><span>${nightsText(s.nights)} · 1 kamer</span><strong>${euro(h.low * s.nights)}–${euro(h.high * s.nights)}</strong></div><div class="hotel-links"><a href="${esc(bookingURL(h))}" target="_blank" rel="noopener">Check onze data & prijs ↗</a><a href="${esc(h.url)}" target="_blank" rel="noopener">Hotelinformatie ↗</a></div><button class="button ${active ? "primary" : "secondary"} hotel-choice" data-choice="${s.id}" data-option="${choice}" aria-pressed="${active}">${active ? "✓ In ons plan" : "Kies " + (choice === "budget" ? "budget" : "comfort")}</button>${checkHTML("hotel", [s.id + "-" + choice, "Dit hotel geboekt & babybed bevestigd", "Zelf afvinken na bevestiging van dit hotel."])}</div>`;
          })
          .join("");
        return `<article class="hotel-card" id="hotel-${s.id}"><header class="hotel-card-top"><div><p class="eyebrow">${String(i + 1).padStart(2, "0")} · ${esc(s.cn)} · ${nightsText(s.nights)}</p><h3>${esc(s.name)}</h3><p class="caption">${fmt(iso(s.start))} – ${fmt(iso(s.start + s.nights))} 2027</p></div></header><div class="hotel-options">${options}${renderCustomHotel(s)}</div>${extras.compare(s, hotelChoice(s))}</article>`;
      })
      .join("");
  }
  function renderTrains() {
    $("#train-rows").innerHTML = data.trains
      .map(
        (t) =>
          `<tr><td>D${t.day}<small>${fmt(iso(t.day), { weekday: "short", day: "numeric", month: "short" })}</small></td><td><strong>${esc(t.from)}<br>${esc(t.to)}</strong><small>${esc(t.note)}</small></td><td>${esc(t.time)}<br>${euro(t.low)}–${euro(t.high)}<small>2e klas · raming per volwassene</small></td><td><span class="book-date">${fmt(shift(iso(t.day), -14))}</span><small>12306-venster: 15 dagen</small></td><td>${t.release ? `<span class="book-date">${esc(t.release)}</span><small>Beijing-tijd</small>` : `<small>Opzoeken in de 12306-app: het vrijgavetijdstip verschilt per station.</small>`}</td><td><label class="sr-only" for="train-${t.day}">Status trein dag ${t.day}</label><select id="train-${t.day}" data-train="${trainKey(t)}">${["Nog boeken", "Aangevraagd", "Geboekt"].map((v) => `<option ${state.trains[trainKey(t)] === v ? "selected" : ""}>${v}</option>`).join("")}</select></td></tr>`,
      )
      .join("");
  }
  function renderRoute() {
    $("#route-stops").innerHTML = data.stays
      .map(
        (s, i) =>
          `<button class="route-stop" data-route-day="${s.start}"><span class="stop-number">${String(i + 1).padStart(2, "0")}</span><h3>${esc(s.name)}</h3><p>${esc(s.highlight)}</p><span class="tag green">${nightsText(s.nights)} · ${fmt(iso(s.start))}</span>${s.klimaat ? `<span class="tag weather" title="${esc(s.weer || "")}">☀ ${s.klimaat.d}° · ☾ ${s.klimaat.n}°</span>` : ""}</button>`,
      )
      .join("");
  }
  function initMap() {
    if (!window.L) {
      $("#map-fallback").hidden = false;
      return;
    }
    $("#map-fallback").hidden = true;
    if (!mapReady) {
      map = L.map("map", { scrollWheelZoom: false }).setView([30.8, 112.5], 4);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);
      const coords = data.stays.map((s) => [s.lat, s.lng]);
      L.polyline(coords, {
        color: "#aa4138",
        weight: 3,
        opacity: 0.8,
        dashArray: "6 7",
      }).addTo(map);
      data.stays.forEach((s, i) => {
        const marker = L.marker([s.lat, s.lng], {
          icon: L.divIcon({
            className: "map-marker",
            html: String(i + 1),
            iconSize: [27, 27],
          }),
        }).addTo(map);
        const popup = document.createElement("div");
        popup.innerHTML = `<strong>${esc(s.name)}</strong><br>${nightsText(s.nights)} · ${fmt(iso(s.start))}<br><button>Open de dagplanning</button>`;
        popup
          .querySelector("button")
          .addEventListener("click", () => showDay(s.start));
        marker.bindPopup(popup);
      });
      map.fitBounds(L.latLngBounds(coords), { padding: [35, 35] });
      mapReady = true;
    }
    requestAnimationFrame(() => map.invalidateSize());
  }
  function renderVideos() {
    const images = ["shanghai", "zhangjiajie", "yangshuo"];
    $("#videos").innerHTML = data.videos
      .map(
        (v, i) =>
          `<article class="video-card"><div class="video-frame" id="video-${v.id}"><img src="assets/${images[i]}.jpg" alt="${esc(v.area)}" loading="lazy"><button class="play-button" data-video="${v.id}" aria-label="Speel video: ${esc(v.title)}"><span aria-hidden="true">▶</span></button></div><div class="video-copy"><p class="eyebrow">${esc(v.area)}</p><h3>${esc(v.title)}</h3><p>${esc(v.note)}<br>${esc(v.credit)}</p><a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">Bekijk op YouTube</a></div></article>`,
      )
      .join("");
  }
  const budgetDefaults = {
    flights: data.flightTotal,
    trains: Math.round(data.trains.reduce((n, t) => n + t.low + t.high, 0)),
    food: 26 * 30 + 3 * 55,
    transfers: 850,
    activities: 650,
    extras: 150,
  };
  const budgetLabels = {
    flights: [
      "Internationale vluchten",
      "Door jullie opgegeven: €1.671,68 · eigen stoel Amélie nog bevestigen",
    ],
    trains: [
      `${data.trains.length} grote treinritten`,
      "Twee volwassenen · 2e klas · geen babytreinstoel",
    ],
    food: [
      "Eten & drinken",
      "Gezin: 26 dagen mainland × €30 + 3 dagen Hongkong × €55 · raming",
    ],
    transfers: [
      "Transfers & lokaal vervoer",
      "Privéauto’s, stationsritten, ferry en taxi",
    ],
    activities: [
      "Entrees & activiteiten",
      "Inclusief de gezamenlijke Zhangjiajie-pot",
    ],
    extras: [
      "Extra’s",
      "Bijv. dagkamer, optioneel Leshan en extra babytreinstoelen",
    ],
  };
  const hotelPrice = (s, choice = hotelChoice(s)) => {
    const h = hotelOption(s, choice);
    if (choice === "custom") return h.low;
    return (
      state.hotels[s.id + "-" + choice] ??
      (choice === "comfort" ? state.hotels[s.id] : undefined) ??
      Math.round((h.low + h.high) / 2)
    );
  };
  const budgetValue = (k) => state.budget[k] ?? budgetDefaults[k];
  function renderBudget() {
    $("#budget-fields").innerHTML =
      `<div class="budget-field"><label>Hotels<small>28 nachten · pas kamerprijzen hieronder aan</small></label><span class="value" id="hotel-total-value"></span></div>` +
      Object.entries(budgetLabels)
        .map(
          ([k, [name, note]]) =>
            `<div class="budget-field"><label for="budget-${k}">${name}<small>${note}</small></label><span class="money-input">€ <input id="budget-${k}" data-budget="${k}" type="number" min="0" max="1000000" step="0.01" placeholder="Nog invullen" value="${budgetValue(k)}"></span></div>`,
        )
        .join("");
    $("#hotel-budget-fields").innerHTML = data.stays
      .map(
        (s) =>
          `<div class="budget-field"><label for="price-${s.id}">${esc(s.name)}<small>${nightsText(s.nights)} · ${esc(hotelOption(s).hotel)} · ${hotelChoiceLabels[hotelChoice(s)]}</small></label><span class="money-input">€ <input id="price-${s.id}" data-price="${s.id}-${hotelChoice(s)}" type="number" min="0" max="100000" step="0.01" value="${hotelPrice(s)}"></span></div>`,
      )
      .join("");
    updateBudget();
  }
  function budgetTotals() {
    const hotels = data.stays.reduce((n, s) => n + hotelPrice(s) * s.nights, 0);
    const amounts = {
      hotels,
      ...Object.fromEntries(
        Object.keys(budgetDefaults).map((k) => [k, budgetValue(k)]),
      ),
    };
    const flights = amounts.flights;
    delete amounts.flights;
    const land = Object.values(amounts).reduce((n, v) => n + v, 0);
    const reserve = Math.round(land * 0.1);
    return {
      amounts,
      land,
      reserve,
      flights,
      total: land + reserve + flights,
    };
  }
  function scenarioTotal(choice) {
    const b = budgetTotals();
    const hotels = data.stays.reduce((n, s) => {
      const h = hotelOption(s, choice);
      return n + Math.round((h.low + h.high) / 2) * s.nights;
    }, 0);
    const land = b.land - b.amounts.hotels + hotels;
    return land + Math.round(land * 0.1) + b.flights;
  }
  function updateBudget() {
    const b = budgetTotals();
    $("#hotel-total-value").textContent = euro(b.amounts.hotels);
    $("#budget-total").textContent = euro(b.total);
    $("#budget-flight-note").textContent =
      "Inclusief vluchten en 10% reserve over landkosten · Amélies eigen stoel nog bevestigen";
    $("#per-day").textContent = euro(b.total / 31);
    $("#per-adult-day").textContent = euro(b.total / (31 * 2));
    $("#comparison-budget").textContent = euro(scenarioTotal("budget"));
    $("#comparison-comfort").textContent = euro(scenarioTotal("comfort"));
    const names = {
      hotels: "Hotels",
      trains: "Treinen",
      food: "Eten & drinken",
      transfers: "Transfers",
      activities: "Activiteiten",
      extras: "Extra’s",
      reserve: "Reserve",
      flights: "Vluchten",
    };
    $("#budget-bars").innerHTML = Object.entries({
      ...b.amounts,
      reserve: b.reserve,
      flights: b.flights,
    })
      .map(
        ([k, v]) =>
          `<div class="budget-row"><span>${names[k]}</span><strong>${euro(v)}</strong><div class="bar"><span style="width:${b.total ? (v / b.total) * 100 : 0}%"></span></div></div>`,
      )
      .join("");
  }
  function download(text, name, type) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  const icsEscape = (s) =>
    String(s)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  function calendar(events, name) {
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Reis27//China2027//NL",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:" + name,
    ];
    for (const e of events) {
      lines.push(
        "BEGIN:VEVENT",
        "UID:" + e.id + "@china2027.reis27",
        "DTSTAMP:" +
          new Date()
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d{3}Z$/, "Z"),
        e.timed
          ? "DTSTART:" + e.start
          : "DTSTART;VALUE=DATE:" + e.start.replaceAll("-", ""),
        e.timed
          ? "DTEND:" + e.end
          : "DTEND;VALUE=DATE:" + e.end.replaceAll("-", ""),
        "SUMMARY:" + icsEscape(e.title),
        "DESCRIPTION:" + icsEscape(e.description),
      );
      if (e.location) lines.push("LOCATION:" + icsEscape(e.location));
      if (e.url) lines.push("URL:" + e.url);
      for (const minutes of e.alarms || [])
        lines.push(
          "BEGIN:VALARM",
          "ACTION:DISPLAY",
          "DESCRIPTION:" + icsEscape(e.title),
          "TRIGGER:-PT" + minutes + "M",
          "END:VALARM",
        );
      lines.push("END:VEVENT");
    }
    lines.push("END:VCALENDAR");
    // RFC 5545: fold at 75 octets, without splitting a UTF-8 character.
    const encoder = new TextEncoder();
    return (
      lines
        .map((line) => {
          let out = "",
            part = "",
            bytes = 0;
          for (const c of line) {
            const size = encoder.encode(c).length;
            if (bytes + size > 75) {
              out += part + "\r\n";
              part = " ";
              bytes = 1;
            }
            part += c;
            bytes += size;
          }
          return out + part;
        })
        .join("\r\n") + "\r\n"
    );
  }
  function journeyCalendar() {
    const events = data.days.map((original) => {
      const d = plannedDay(original);
      const s = stayFor(d.d);
      return {
        id: "day-" + d.d,
        start: iso(d.d),
        end: shift(iso(d.d), 1),
        title: "China D" + d.d + " · " + d.title,
        description: [
          "Ochtend: " + d.am,
          "Middag: " + d.pm,
          "Avond: " + d.eve,
          "Amélie: " + d.baby,
          "Vooraf: " + d.reserve,
          "Plan B: " + d.backup,
          "Slapen: " + (s ? hotelOption(s).hotel : d.sleep),
          ...(s ? hotelTerms(s) : []),
          ...(s && hotelChoice(s) === "custom"
            ? [
                "Hoteladres: " + hotelOption(s).area,
                "Hotelprijs per nacht: " + preciseEuro(hotelPrice(s)),
                "Hotelnotities: " + state.customHotels[s.id].notes,
                "Hotellink: " + hotelOption(s).url,
              ]
            : []),
          "Tijden zijn lokale suggesties; treinen/hotels nog te bevestigen.",
        ].join("\n\n"),
        location: s ? s.name : d.sub,
      };
    });
    download(
      calendar(events, "China 2027 · reisplanning"),
      "china-2027-reisplanning.ics",
      "text/calendar;charset=utf-8",
    );
    toast("31 reisdagen gedownload. Open het .ics-bestand in je agenda.");
  }
  // 12306 geeft per station een vrijgavetijd in Beijing-tijd (UTC+8, geen zomertijd).
  function releaseMoment(date, time, minutes = 0) {
    const m = /^(\d{2}):(\d{2})$/.exec(time || "");
    if (!m) return "";
    const total = Number(m[1]) * 60 + Number(m[2]) - 480 + minutes;
    const day = shift(date, Math.floor(total / 1440));
    const rest = ((total % 1440) + 1440) % 1440;
    return (
      day.replaceAll("-", "") +
      "T" +
      String(Math.floor(rest / 60)).padStart(2, "0") +
      String(rest % 60).padStart(2, "0") +
      "00Z"
    );
  }
  function bookingEvents() {
    const events = data.trains
      .filter((t) => state.trains[trainKey(t)] !== "Geboekt")
      .map((t) => {
        const start = shift(iso(t.day), -14);
        const open = releaseMoment(start, t.release);
        return {
          id: "book-train-" + t.day,
          start: open || start,
          end: open ? releaseMoment(start, t.release, 30) : shift(start, 1),
          timed: Boolean(open),
          title: "Boek China-trein D" + t.day,
          description: `Reisdatum ${fmt(iso(t.day), { day: "numeric", month: "long", year: "numeric" })}: ${t.from} → ${t.to}.\nHuidig 15-dagenvenster inclusief reisdag. ${t.release ? `Vrijgave van de tickets: ${t.release} Beijing-tijd op ${fmt(start, { day: "numeric", month: "long" })}.` : "Vrijgavetijd van dit station nog opzoeken in de 12306-app."} 2027-regels vooraf controleren.\n${t.note}`,
          url: "https://www.12306.cn/en/",
        };
      });
    if (!state.checks["attraction-forbidden"])
      events.push({
        id: "book-forbidden",
        start: "20270328T120000Z",
        end: "20270328T123000Z",
        timed: true,
        title: "Boek Forbidden City voor 4 april",
        description:
          "Huidige opening: 28 maart 20:00 Beijing = 14:00 Nederland (CEST). Jullie zijn dan onderweg na vertrek AMS 09:50. Bereid boeken en eventuele hulp vóór vertrek voor. Venster opnieuw controleren voor 2027.",
        url: "https://intl.dpm.org.cn/visit",
      });
    if (!state.checks["pre-visa"])
      events.push({
        id: "visa-check",
        start: "2026-12-01",
        end: "2026-12-02",
        title: "China: visumregels 2027 controleren",
        description:
          "Huidige visumvrijstelling is slechts bevestigd t/m 31 december 2026. Voor alle drie paspoorten controleren; zo nodig visum aanvragen. Hongkong apart.",
        url: "https://www.visaforchina.cn/",
      });
    const pendingVisits = checks.attraction.filter(
      ([id]) => id !== "forbidden" && !state.checks["attraction-" + id],
    );
    if (pendingVisits.length)
      events.push({
        id: "prepare-attractions",
        start: "2027-02-14",
        end: "2027-02-15",
        title: "Attractietickets & tijdslotvensters controleren",
        description:
          "Zes weken vóór vertrek de exacte verkoopvensters, babyregistratie en voorwaarden op de officiële sites bevestigen. Openingsdagen/tijden voor 2027 zijn nog niet vastgelegd. Nog controleren: " +
          pendingVisits.map(([, label]) => label).join("; "),
        url: "https://daltonganger.github.io/camper-vergelijking/china-2027/#boeken",
      });
    for (const item of bookingLedger.items()) {
      const r = bookingLedger.recordFor(item);
      if (r.status === "Geannuleerd") continue;
      if (r.cancelUntil) {
        const start = new Date(r.cancelUntil + "+08:00");
        const end = new Date(start.getTime() + 15 * 60000);
        const stamp = (date) =>
          date.toISOString().replace(/[-:]/g, "").replace(".000", "");
        events.push({
          id: "cancel-" + item.id,
          timed: true,
          start: stamp(start),
          end: stamp(end),
          title: "Annuleringsdeadline · " + item.label,
          description:
            "Gratis annuleren tot " +
            r.cancelUntil.replace("T", " ") +
            " Chinatijd (UTC+8). Bevestiging en voorwaarden controleren.",
          url: r.url || undefined,
        });
      }
      if (
        r.paymentDue &&
        (r.total === undefined || Math.max(0, r.total - (r.paid || 0)) > 0)
      )
        events.push({
          id: "payment-" + item.id,
          start: r.paymentDue,
          end: shift(r.paymentDue, 1),
          title: "Betaaldeadline · " + item.label,
          description:
            "Eigen ingevulde betaaldeadline; bedrag en voorwaarden volgens boekingsbevestiging.",
          url: r.url || undefined,
        });
    }
    return events;
  }
  function bookingCalendar() {
    const days = state.reminders.leadDays || 1;
    const events = extras.reminderEvents().map((e) => ({
      ...e,
      alarms: e.timed ? [days * 1440, 60] : [days * 1440],
    }));
    download(
      calendar(events, "China 2027 · boekingsmomenten"),
      "china-2027-boekingsmomenten.ics",
      "text/calendar;charset=utf-8",
    );
    toast(
      "Herinneringen met agenda-meldingen gedownload. Controleer meldingen na import.",
    );
  }
  function customHotelFingerprint(s) {
    const own = state.customHotels[s.id];
    let value = 2166136261;
    for (const c of own.name + "|" + own.url)
      value = Math.imul(value ^ c.charCodeAt(0), 16777619);
    return (value >>> 0).toString(16);
  }
  function hotelBookingId(s, choice = hotelChoice(s)) {
    const suffix =
      choice === "custom" ? "custom-" + customHotelFingerprint(s) : choice;
    return "hotel-" + s.id + "-" + suffix;
  }
  function bookingItems() {
    const hotels = data.stays.map((s) => {
      const choice = hotelChoice(s);
      return {
        id: hotelBookingId(s, choice),
        type: "hotel",
        label: s.name + " · " + hotelOption(s).hotel,
        day: s.start,
        suggested: hotelPrice(s) * s.nights,
        status: state.checks["hotel-" + s.id + "-" + choice]
          ? "Geboekt"
          : "Nog boeken",
      };
    });
    const trains = data.trains.map((t) => ({
      id: "train-" + trainKey(t),
      type: "train",
      label: t.from + " → " + t.to,
      day: t.day,
      suggested: t.low + t.high,
      status: state.trains[trainKey(t)] || "Nog boeken",
      trainKey: trainKey(t),
    }));
    const visits = {
      forbidden: 8,
      tiananmen: 8,
      mutianyu: 9,
      terracotta: 12,
      pandas: 14,
      park: 18,
      tianmen: 20,
    };
    const attractions = checks.attraction.map(([id, label]) => ({
      id: "attraction-" + id,
      type: "attraction",
      label,
      day: visits[id],
      status: state.checks["attraction-" + id] ? "Geboekt" : "Nog boeken",
      checkKey: "attraction-" + id,
    }));
    return [
      ...hotels,
      ...trains,
      ...attractions,
      {
        id: "flight-international",
        type: "flight",
        label: "Internationale vluchten · AMS–Shanghai / Hongkong–AMS",
        day: 1,
        suggested: budgetValue("flights"),
        status: state.checks["pre-flights"] ? "Geboekt" : "Nog boeken",
      },
    ];
  }
  function hotelTerms(s) {
    const terms = state.hotelDetails[hotelBookingId(s)] || {};
    return [
      ["Ontbijt", terms.breakfast],
      ["Babybed", terms.cot],
      ["Ligging", terms.location],
      ["Annulering", terms.cancellation],
    ]
      .filter(([, value]) => value)
      .map(([label, value]) => label + ": " + value);
  }
  function customHotelPrintInfo(s) {
    if (hotelChoice(s) !== "custom") return "";
    const h = hotelOption(s);
    const link = h.url ? `<br><a href="${esc(h.url)}">Hotellink</a>` : "";
    return `<br>${esc(h.area)}<br>${esc(state.customHotels[s.id].notes)}${link}`;
  }
  function renderPrint() {
    const b = budgetTotals();
    const bookings = bookingLedger
      .items()
      .filter((item) => state.bookings[item.id])
      .map((item) => {
        const r = bookingLedger.recordFor(item);
        return `<tr><td>${esc(item.label)}</td><td>${esc(r.status)}</td><td>${r.total !== undefined ? preciseEuro(r.total) : "Nog invullen"}</td><td>${preciseEuro(r.paid || 0)}</td><td>${esc(r.reference || "")}</td><td>${esc(r.cancelUntil?.replace("T", " ") || "")}<br>${r.paymentDue ? "Betalen vóór " + esc(r.paymentDue) : ""}</td></tr>`;
      })
      .join("");
    $("#print-plan").innerHTML =
      `<h1>China 2027 · samen, per spoor</h1><p>Ruben, Martine & Amélie · 28 maart – 27 april 2027 · 31 reisdagen · 28 hotelnachten</p><p>Heen: SWISS · AMS 28 maart 09:50 → ZRH → PVG 29 maart 06:30.<br>Terug: Cathay Pacific + Lufthansa · HKG 26 april 23:55 → FRA → AMS 27 april 10:35.</p><p>Dagindeling is flexibel; tijden zijn lokale suggesties. Exacte treinverbindingen, hotelprijzen en reserveringen nog bevestigen. Huidige boekingsregels gecontroleerd 30 september 2026.</p><h2>Hotels</h2><table><thead><tr><th>Plek / hotel</th><th>Verblijf</th><th>Nachten</th><th>Kamerbudget / nacht</th></tr></thead><tbody>${data.stays
        .map(
          (s) =>
            `<tr><td>${esc(s.name)} · ${esc(hotelOption(s).hotel)}${customHotelPrintInfo(s)}${hotelTerms(
              s,
            )
              .map((t) => "<br>" + esc(t))
              .join(
                "",
              )}</td><td>${fmt(iso(s.start))} – ${fmt(iso(s.start + s.nights))}</td><td>${s.nights}</td><td>${preciseEuro(hotelPrice(s))} · raming / eigen invoer</td></tr>`,
        )
        .join("")}</tbody></table><h2>Dagprogramma</h2>${data.days
        .map((original) => {
          const d = plannedDay(original);
          const s = stayFor(d.d);
          return `<article class="print-day"><h3>D${d.d} · ${fmt(iso(d.d), { weekday: "long", day: "numeric", month: "long" })} · ${esc(d.title)}</h3><p><b>Ochtend:</b> ${esc(d.am)}</p><p><b>Middag:</b> ${esc(d.pm)}</p><p><b>Avond:</b> ${esc(d.eve)}</p><p><b>Amélie:</b> ${esc(d.baby)}</p><p><b>Vooraf:</b> ${esc(d.reserve)}</p><p><b>Plan B:</b> ${esc(d.backup)}</p><p><b>Slapen:</b> ${esc(s ? hotelOption(s).hotel : d.sleep)}</p><p><b>Uitgavenindicatie:</b> ${esc(d.cost)}</p>${state.notes[d.d] ? `<p class="print-note"><b>Eigen notitie:</b> ${esc(state.notes[d.d])}</p>` : ""}</article>`;
        })
        .join(
          "",
        )}<div class="print-booking"><h2>Boekingskalender</h2><table><thead><tr><th>Treinreis</th><th>Reisdatum</th><th>Boeken vanaf</th><th>Vrijgave (Beijing)</th><th>Status</th></tr></thead><tbody>${data.trains.map((t) => `<tr><td>${esc(t.from)} → ${esc(t.to)}</td><td>${fmt(iso(t.day))}</td><td>${fmt(shift(iso(t.day), -14))}</td><td>${t.release ? esc(t.release) : "—"}</td><td>${esc(state.trains[trainKey(t)] || "Nog boeken")}</td></tr>`).join("")}</tbody></table><p>Treinvenster: 15 dagen inclusief de reisdag. De vrijgavetijd verschilt per station (officiële 12306-waarden, najaar 2026): Shanghai Hongqiao 13:45, Hangzhou East 10:45, Beijing West 08:00, Xi'an North 10:30, Chengdu East 08:45, Zhangjiajie West 16:30, Guangzhou South 10:15 en Hong Kong West Kowloon 08:00. Voor Chongqing en Guilin nog opzoeken; in 2027 opnieuw controleren. Forbidden City voor 4 april: 28 maart 20:00 Beijing / 14:00 Nederland. Visumvrij China voor 2027 nog niet bevestigd.</p><h2>Budget</h2><p>${euro(b.total)} inclusief ingevulde vluchten · 10% reserve over landkosten inbegrepen. Hotel-, trein-, transfer- en activiteitenbedragen zijn ramingen of eigen invoer.</p>${bookings ? `<h2>Onze boekingen</h2><p>Annuleringsdeadlines in Chinatijd (UTC+8).</p><table><thead><tr><th>Boeking</th><th>Status</th><th>Totaal</th><th>Betaald</th><th>Nummer</th><th>Deadline</th></tr></thead><tbody>${bookings}</tbody></table>` : ""}<h2>Voor vertrek</h2>${checks.pre.map(([id, label]) => `<p>${state.checks["pre-" + id] ? "☑" : "☐"} ${esc(label)}</p>`).join("")}<h2>Temperaturen in april</h2>${data.stays.map((s) => `<p>${esc(s.name)}: ${s.klimaat.d}° overdag · ${s.klimaat.n}° ’s nachts. ${esc(s.weer)}</p>`).join("")}<h2>Inpakken</h2>${checks.pack.map(([id, label]) => `<p>${state.checks["pack-" + id] ? "☑" : "☐"} ${esc(label)}</p>`).join("")}</div>`;
  }
  $("#city-filter").insertAdjacentHTML(
    "beforeend",
    data.stays
      .map((s) => `<option value="${s.id}">${esc(s.name)}</option>`)
      .join("") + '<option value="reis">Onderweg</option>',
  );
  extras = window.ChinaExtras.create({
    getState: () => state,
    getHotel: hotelOption,
    getHotelId: hotelBookingId,
    priceFor: hotelPrice,
    getEvents: bookingEvents,
    esc,
    euro: preciseEuro,
    fmt,
    iso,
    onSave(update) {
      if (update.hotelId) {
        state.hotelDetails[update.hotelId] = update.details;
        if (update.price)
          state.hotels[update.price.stay + "-" + update.price.choice] =
            update.price.price;
        save();
        renderHotels();
        renderBudget();
        renderDetail();
        const stay = data.stays.find((s) =>
          ["budget", "comfort", "custom"].some(
            (choice) =>
              (choice !== "custom" || state.customHotels[s.id]) &&
              hotelBookingId(s, choice) === update.hotelId,
          ),
        );
        if (stay) {
          const comparison = $("#hotel-" + stay.id + " .hotel-comparison");
          comparison.open = true;
          comparison.querySelector("summary").focus({ preventScroll: true });
        }
        toast("Hotelprijs en voorwaarden opgeslagen.");
      } else if (update.reminder) {
        state.reminders["done-" + update.reminder] = update.done;
        save();
        extras.renderReminders();
      } else {
        state.reminders.leadDays = update.leadDays;
        save();
        toast(
          "Herinnering ingesteld. Exporteer de agenda opnieuw om deze keuze mee te nemen.",
        );
      }
    },
  });
  bookingLedger = window.ChinaBookings.create({
    getState: () => state,
    getItems: bookingItems,
    esc,
    euro: preciseEuro,
    iso,
    fmt,
    onSave(item, record) {
      state.bookings[item.id] = record;
      if (item.trainKey) {
        state.trains[item.trainKey] =
          record.status === "Geannuleerd" ? "Nog boeken" : record.status;
        renderTrains();
      }
      if (item.checkKey) {
        state.checks[item.checkKey] = record.status === "Geboekt";
        renderChecks();
      }
      save();
      extras.renderReminders();
      toast("Boeking opgeslagen. Bedragen en deadlines zijn bijgewerkt.");
    },
  });
  bookingLedger.render();
  extras.renderReminders();
  renderChecks();
  renderHotels();
  renderTrains();
  renderRoute();
  renderVideos();
  renderBudget();
  renderList();
  navigateHash(false);
  window.addEventListener("load", () => {
    if (currentView === "route") initMap();
  });
  window.addEventListener("hashchange", () => navigateHash());
  window.addEventListener("beforeprint", renderPrint);
  $("#search").addEventListener("input", renderList);
  $("#city-filter").addEventListener("change", renderList);
  $("#kind-filter").addEventListener("change", renderList);
  document.addEventListener("click", (event) => {
    const target = event.target.closest(
      "[data-day-mode],[data-view],[data-day],[data-next],[data-hotel],[data-route-day],[data-video],[data-choice],[data-preset],#clear-filters",
    );
    if (!target) return;
    if (target.dataset.dayMode) {
      const day = target.dataset.dayMode;
      if (state.dayModes[day] === "calm") delete state.dayModes[day];
      else state.dayModes[day] = "calm";
      save();
      renderList();
    } else if (target.dataset.choice || target.dataset.preset) {
      if (target.dataset.choice)
        state.choices[target.dataset.choice] = target.dataset.option;
      else
        for (const s of data.stays) state.choices[s.id] = target.dataset.preset;
      save();
      renderHotels();
      renderBudget();
      renderDetail();
      toast("Hotelkeuze bijgewerkt in planning en budget.");
    } else if (target.dataset.view) {
      event.preventDefault();
      history.pushState(null, "", "#" + target.dataset.view);
      setView(target.dataset.view);
    } else if (target.dataset.day) {
      showDay(Number(target.dataset.day), {
        reset: false,
        scroll: innerWidth <= 600,
      });
    } else if (target.dataset.next) {
      showDay(Number(target.dataset.next));
    } else if (target.dataset.routeDay) {
      showDay(Number(target.dataset.routeDay));
    } else if (target.dataset.hotel) {
      history.pushState(null, "", "#hotels");
      setView("hotels", false);
      $("#hotel-" + target.dataset.hotel).scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else if (target.dataset.video) {
      const video = data.videos.find((v) => v.id === target.dataset.video);
      if (video) {
        const frame = document.createElement("iframe");
        frame.src =
          "https://www.youtube-nocookie.com/embed/" + video.id + "?autoplay=1";
        frame.title = video.title;
        frame.allow = "autoplay; encrypted-media; picture-in-picture";
        frame.allowFullscreen = true;
        $("#video-" + video.id).replaceChildren(frame);
      }
    } else if (target.id === "clear-filters") showDay(2);
  });
  $("#start-planning").addEventListener("click", (e) => {
    e.preventDefault();
    showDay(2);
  });
  document.addEventListener("submit", (event) => {
    const form = event.target;
    const id = form.dataset.customHotel;
    if (!id) return;
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const nameInput = form.elements.namedItem("name");
    nameInput.setCustomValidity(
      values.name.trim() ? "" : "Vul een hotelnaam in.",
    );
    const urlInput = form.elements.namedItem("url");
    urlInput.setCustomValidity("");
    if (values.url && !hotelLink(values.url)) {
      urlInput.setCustomValidity(
        "Gebruik een link die begint met https:// of http://.",
      );
      urlInput.reportValidity();
      return;
    }
    if (!form.reportValidity()) return;
    const previous = state.customHotels[id];
    let candidate = { ...values, price: Number(values.price) };
    if (previous) {
      candidate = {
        ...previous,
        price: state.hotels[id + "-custom"] ?? previous.price,
      };
      const changed = new Set((form.dataset.changed || "").split(","));
      for (const [field, value] of Object.entries(values))
        if (changed.has(field))
          candidate[field] = field === "price" ? Number(value) : value;
    }
    const hotel = cleanCustomHotel(candidate);
    if (!hotel) return;
    if (
      previous &&
      (previous.name !== hotel.name || previous.url !== hotel.url)
    )
      delete state.checks["hotel-" + id + "-custom"];
    state.customHotels[id] = hotel;
    state.choices[id] = "custom";
    delete state.hotels[id + "-custom"];
    save();
    renderHotels();
    renderBudget();
    renderDetail();
    const editor = $("#hotel-" + id + " .custom-editor");
    editor.querySelector("summary").focus({ preventScroll: true });
    toast(
      storageOK
        ? "Eigen hotel opgeslagen en gekozen voor planning en budget."
        : "Eigen hotel gekozen. Download een back-up om het te bewaren.",
    );
  });
  document.addEventListener("change", (event) => {
    const el = event.target;
    if (el.dataset.check) {
      state.checks[el.dataset.check] = el.checked;
      if (el.dataset.check.startsWith("attraction-")) {
        const booking = state.bookings[el.dataset.check];
        if (booking) booking.status = el.checked ? "Geboekt" : "Nog boeken";
      }
      el.closest("label").classList.toggle("checked", el.checked);
      save();
      extras.renderReminders();
    }
    if (el.dataset.train) {
      state.trains[el.dataset.train] = el.value;
      const booking = state.bookings["train-" + el.dataset.train];
      if (booking) booking.status = el.value;
      save();
      extras.renderReminders();
    }
  });
  document.addEventListener("input", (event) => {
    const el = event.target;
    if (["name", "url"].includes(el.name) && el.closest("[data-custom-hotel]"))
      el.setCustomValidity("");
    if (el.dataset.note) {
      state.notes[el.dataset.note] = el.value;
      save();
    }
    if (el.dataset.budget || el.dataset.price) {
      if (!el.validity.valid) return;
      const amount = el.value === "" ? null : Number(el.value);
      if (el.dataset.budget) {
        if (amount === null) delete state.budget[el.dataset.budget];
        else state.budget[el.dataset.budget] = amount;
      } else {
        if (amount === null) delete state.hotels[el.dataset.price];
        else state.hotels[el.dataset.price] = amount;
      }
      save();
      updateBudget();
      if (el.dataset.price?.endsWith("-custom")) {
        renderHotels();
        renderDetail();
      }
    }
  });
  $("#calendar").addEventListener("click", journeyCalendar);
  $("#booking-calendar").addEventListener("click", bookingCalendar);
  $("#print").addEventListener("click", () => {
    renderPrint();
    window.print();
  });
  $("#export").addEventListener("click", () => {
    download(
      JSON.stringify(
        { version: 1, exported: new Date().toISOString(), ...state },
        null,
        2,
      ),
      "china-2027-backup.json",
      "application/json",
    );
    toast("Back-up gedownload: eigen hotels, notities, statussen en budget.");
  });
  $("#import").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 1000000) throw Error("Te groot");
      const parsed = JSON.parse(await file.text());
      if (parsed.version !== 1) throw Error("Verkeerde versie");
      const restored = cleanState(parsed);
      for (const group of [
        "checks",
        "notes",
        "trains",
        "hotels",
        "choices",
        "customHotels",
        "bookings",
        "hotelDetails",
        "dayModes",
        "reminders",
        "budget",
      ])
        state[group] = { ...state[group], ...restored[group] };
      save();
      renderChecks();
      renderHotels();
      renderTrains();
      renderBudget();
      renderList();
      bookingLedger.render();
      extras.renderReminders();
      toast("Back-up toegevoegd; andere eigen gegevens zijn behouden.");
    } catch {
      toast("Deze back-up is niet geldig. Kies een China 2027-back-upbestand.");
    }
    event.target.value = "";
  });
  let sharedRenderPending = false;
  function renderSharedState() {
    if (
      document.activeElement?.matches("input, textarea, select") ||
      document.querySelector("form[data-dirty]")
    ) {
      sharedRenderPending = true;
      return;
    }
    sharedRenderPending = false;
    renderChecks();
    renderHotels();
    renderTrains();
    renderBudget();
    renderList();
    bookingLedger.render();
    extras.renderReminders();
  }
  document.addEventListener("input", (event) => {
    const form = event.target.closest(
      "form[data-custom-hotel], form[data-booking-form]",
    );
    if (form) {
      form.dataset.dirty = "true";
      const changed = new Set(
        (form.dataset.changed || "").split(",").filter(Boolean),
      );
      if (event.target.name) changed.add(event.target.name);
      form.dataset.changed = [...changed].join(",");
    }
  });
  document.addEventListener("change", (event) => {
    const form = event.target.closest("form[data-booking-form]");
    if (form) form.dataset.dirty = "true";
  });
  document.addEventListener("focusout", () => {
    setTimeout(() => {
      if (sharedRenderPending) renderSharedState();
    }, 0);
  });
  const localSharingBackup = $("#sync-local-backup");
  function sharingBackup() {
    try {
      return localStorage.getItem("china2027-before-sharing");
    } catch {
      return null;
    }
  }
  if (sharingBackup()) localSharingBackup.hidden = false;
  localSharingBackup.addEventListener("click", () => {
    const previous = sharingBackup();
    if (previous)
      download(
        previous,
        "china-2027-voor-samen-plannen.json",
        "application/json",
      );
  });
  sharedSync = window.ChinaSync.create({
    api: window.CHINA_SYNC_CONFIG.api,
    getState: () => state,
    onState(next) {
      state = cleanState(next);
      save({ sync: false });
      renderSharedState();
    },
    onBackup() {
      localStorage.setItem(
        "china2027-before-sharing",
        JSON.stringify({ version: 1, ...state }),
      );
      localSharingBackup.hidden = false;
    },
    onStatus(text) {
      $("#save-status").textContent = text;
    },
  });
  setInterval(() => {
    if (
      !document.hidden &&
      currentView === "boeken" &&
      !document.activeElement?.matches("input,textarea,select")
    )
      extras.renderReminders();
  }, 60000);
  if (storageOK)
    $("#save-status").textContent =
      "Eigen wijzigingen worden automatisch op dit apparaat bewaard.";
})();
