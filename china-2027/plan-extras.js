"use strict";
(() => {
  const detailFields = ["breakfast", "cot", "location", "cancellation"];
  function cleanDetails(input) {
    const out = {};
    for (const [id, record] of Object.entries(input || {})) {
      if (
        !/^hotel-[a-z0-9-]{1,110}$/.test(id) ||
        !record ||
        typeof record !== "object"
      )
        continue;
      out[id] = {};
      for (const field of detailFields)
        if (typeof record[field] === "string")
          out[id][field] = record[field].slice(0, 1000);
    }
    return out;
  }
  const calm = {
    1: [
      "Alleen naar Schiphol, inchecken en rustig aan boord voor vertrek AMS 09:50 via Zürich. Houd de handbagage met voeding en verschoning bereikbaar.",
      "De overstap in Zürich en de vlucht blijven staan. Gebruik vrije tijd voor voeding, verschonen en een rustig hoekje.",
      "Geen extra plannen: eten en slapen tijdens de vlucht, op Amélies tempo.",
    ],
    2: [
      "Na aankomst PVG 06:30 direct met de afgesproken transfer naar het hotel. Vroege kamertoegang vooraf bevestigen.",
      "Slapen, douchen en een eenvoudige maaltijd in of naast het hotel.",
      "Op tijd naar bed. Vandaag is het hotel het hele programma.",
    ],
    3: [
      "Langzaam ontbijten. Alleen een kort rondje bij het hotel als iedereen er zin in heeft.",
      "Hotelpauze en een overdekte lunch; Yu Garden mag vervallen.",
      "Hooguit een korte Bund-wandeling als het droog is. Anders diner dicht bij het hotel.",
    ],
    4: [
      "Rustig ontbijt en een café in de buurt.",
      "Eén klein rondje Wukang / Anfu als het droog is; geen Tower of uitstap naar Zhujiajiao.",
      "Terug naar het hotel voor eten en een vroege avond.",
    ],
    5: [
      "Ontbijt, uitchecken en ruim op tijd naar Shanghai Hongqiao. De trein naar Hangzhou blijft staan.",
      "Na de trein rechtstreeks naar het hotel; dutje en lunch.",
      "Eten bij het hotel. De meerwandeling mag wachten.",
    ],
    6: [
      "Ontbijt en alleen een korte vlakke West Lake-wandeling bij droog weer.",
      "Hotelrust of een rustig theehuis. Longjing en Lingyin vervallen vandaag.",
      "Eenvoudig diner en bagage alvast klaarzetten voor de lange treindag.",
    ],
    7: [
      "Alleen de transfer naar Hangzhou East en de trein naar Beijing.",
      "Voeding, dutjes en verschonen in de trein; geen bezoek plannen bij aankomst.",
      "Direct naar het hotel in Beijing en daar eten.",
    ],
    8: [
      "Ontbijt en, alleen als iedereen fit is, een korte wandeling in de buurt.",
      "Hotelrust. Forbidden City en Jingshan vervallen in dit alternatief.",
      "Rustig diner. Een nieuw paleisbezoek alleen met een nieuw bevestigd tijdslot; D9 en de trein blijven staan.",
    ],
    9: [
      "Een korte buurtwandeling of alleen ontbijten in het hotel.",
      "Dutje en een rustige lunch; Temple of Heaven, hutongs en Summer Palace hoeven vandaag niet.",
      "Diner vlakbij en een rustige avond.",
    ],
    10: [
      "Rustig ontbijten en de Muur-uitstap overslaan als weer of energie tegenvalt.",
      "Hotelpauze en een klein lokaal rondje bij droog weer.",
      "Vroeg eten en rustig inpakken voor Xi’an. De muur halen we op een andere reis in.",
    ],
    11: [
      "Uitchecken en naar Beijing West voor de trein naar Xi’an North.",
      "De treinrit en daarna de hoteltransfer; geen extra tussenstop.",
      "Hotel, eenvoudige maaltijd en slapen.",
    ],
    12: [
      "Langzaam ontbijten. Het Terracottaleger mag vandaag volledig vervallen.",
      "Hotelpauze; als iedereen opknapt hooguit een korte wandeling bij de Bell Tower.",
      "Eten dicht bij het hotel. Controleer eerst de voorwaarden van al geboekte entrees of vervoer.",
    ],
    13: [
      "Naar Xi’an North voor de trein naar Chengdu East; bagage en voeding bij de hand.",
      "Na aankomst direct naar het hotel en rusten.",
      "Diner bij het hotel. Geen theehuis of avondwandeling nodig.",
    ],
    14: [
      "Slapen en rustig ontbijten; de Panda Base mag vervallen bij een slechte nacht.",
      "Hotelpauze. Hooguit een klein park of café vlakbij.",
      "Rustig eten en op tijd terug op de kamer.",
    ],
    15: [
      "Langzaam ontbijten. Geen Leshan-excursie vandaag.",
      "Dutje; eventueel een korte theepauze in Heming, anders in het hotel blijven.",
      "Vroeg diner en spullen klaarzetten voor Chongqing.",
    ],
    16: [
      "Alleen uitchecken en de trein naar Chongqing.",
      "Na de hoteltransfer rustig lunchen en slapen.",
      "Hongya Dong overslaan. Diner en uitzicht vanuit het hotel zijn genoeg.",
    ],
    17: [
      "Ruim op tijd naar het juiste Chongqing-station; de trein naar Zhangjiajie West blijft staan.",
      "Alleen de vooraf geregelde transfer naar Wulingyuan en inchecken.",
      "Hotel en diner. De parkkeuze pas na een weer- en energiecheck maken.",
    ],
    18: [
      "Bij mist of weinig energie eerst rustig ontbijten; geen bergroute forceren.",
      "Hotelpauze, of bij droog weer een kort vlak rondje in Wulingyuan.",
      "Diner dichtbij. Yuanjiajie alleen naar D19/D20 schuiven als tickets, weer en transfer dat toelaten.",
    ],
    19: [
      "Tianzi Mountain overslaan. Alleen bij geschikt weer een kort heen-en-terugdeel van Golden Whip Stream.",
      "Terug voor het dutje en lunch; bij regen de hele middag hotelrust.",
      "Eten bij het hotel. Geen extra uitkijkpunten toevoegen.",
    ],
    20: [
      "Rustig ontbijten en de bagage klaarzetten. Geen Tianmen of Grand Canyon.",
      "Hotelrust en hooguit een kort dorpsrondje; bevestig de transfer naar de trein van morgen.",
      "Eten en slapen. De trein van morgen vertrekt rond het middaguur, dus een rustige start kan.",
    ],
    21: [
      "Alleen de transfer naar Zhangjiajie West en de lange treinrit naar Guilin North. De trein van 12:02 en de transfer blijven staan.",
      "Rechtstreekse rit; daarna de vooraf geregelde transfer naar Yangshuo.",
      "Late check-in en maaltijd bij het hotel laten regelen. Geen uitstap meer.",
    ],
    22: [
      "Langzaam ontbijten en vanuit het hotel naar de bergen kijken.",
      "Dutje en een café; alleen bij droog weer een korte vlakke Yulong-wandeling.",
      "Diner dichtbij. Geen boot- of bamboerafttocht nodig.",
    ],
    23: [
      "Rustig ontbijt. De rit naar Xingping en Li River vervallen vandaag.",
      "Hotelrust en eventueel een korte wandeling in Yangshuo.",
      "Diner bij het hotel. Xingping alleen naar D24 schuiven als iedereen daar dan zin in heeft.",
    ],
    24: [
      "Uitslapen en ontbijten, zonder gereserveerde uitstap.",
      "Dutje, boekje, koffie en eventueel even naar buiten.",
      "Vroeg eten en voorbereiden op de transfer naar Longji.",
    ],
    25: [
      "Alleen de afgesproken transfer van Yangshuo naar Ping’an.",
      "Bij aankomst met eventuele bagagehulp naar het gastenhuis; geen uitzichtwandeling.",
      "Diner in het hotel en kijken naar dorp of terrassen vanaf een beschutte plek.",
    ],
    26: [
      "Ontbijt in het gastenhuis; geen lange terrassenwandeling.",
      "Dutje en hooguit een kort dorpsrondje als het droog en veilig begaanbaar is.",
      "Eten in het hotel en transfer naar Guilin West bevestigen.",
    ],
    27: [
      "De transfer van Ping’an naar Guilin West blijft staan, met ruime marge.",
      "Trein naar Guangzhou South en direct met transfer naar het hotel in Kanton.",
      "Alleen hotel en diner. Geen avondattractie nodig.",
    ],
    28: [
      "Dim sum in of vlakbij het hotel. Shamian overslaan.",
      "Ruim op tijd naar Guangzhou South voor de trein naar Hong Kong West Kowloon en de grensformaliteiten.",
      "Direct naar het Hongkong-hotel, eten en rust.",
    ],
    29: [
      "Langzaam ontbijten. Alleen een kort rondje Kowloon als het droog is.",
      "Hotelpauze; Peak, Central en Ngong Ping vervallen in dit alternatief.",
      "Eventueel kort bij Victoria Harbour kijken; anders diner in het hotel.",
    ],
    30: [
      "Rustig ontbijten en uitchecken. Bagageopslag en eventueel een dagkamer vooraf bevestigen.",
      "Rust in hotel/dagkamer en een eenvoudige maaltijd. Geen attractie met vaste eindtijd.",
      "De transfer naar HKG en de vlucht van 23:55 blijven staan; houd ruime luchthavenmarge.",
    ],
    31: [
      "De overstap in Frankfurt en vlucht naar Amsterdam blijven staan.",
      "Na aankomst om 10:35 direct naar huis, eten en uitrusten.",
      "Geen bezoekafspraken of feestprogramma; ruimte om te herstellen.",
    ],
  };
  function dayPlan(day, modes) {
    if (modes[day.d] !== "calm") return day;
    const [am, pm, eve] = calm[day.d];
    return {
      ...day,
      title: day.title + " · rustig",
      am,
      pm,
      eve,
      baby: "Vandaag staan voeding, dutjes en nabijheid voorop. Neem de draagzak of buggy mee voor het korte rondje dat bij de plek past.",
      reserve:
        day.reserve +
        " Rustiger kiezen verandert geen boeking. Controleer zelf annuleringskosten of tijdslots voordat een bezoek vervalt.",
    };
  }
  function create({
    getState,
    getHotel,
    getHotelId,
    priceFor,
    getEvents,
    esc,
    euro,
    fmt,
    iso,
    onSave,
  }) {
    function compare(stay, selected) {
      const choices = [
        "budget",
        "comfort",
        ...(getState().customHotels[stay.id] ? ["custom"] : []),
      ];
      const columns = choices.map((choice) => {
        const h = getHotel(stay, choice),
          id = getHotelId(stay, choice),
          facts = getState().hotelDetails[id] || {},
          booking = getState().bookings[id] || {};
        const nightly = priceFor(stay, choice);
        const cancel = booking.cancelUntil
          ? "Gratis tot " +
            booking.cancelUntil.replace("T", " ") +
            " (Chinatijd)"
          : "Nog bevestigen";
        return { choice, h, id, facts, nightly, cancel };
      });
      function row(label, render) {
        return `<tr><th scope="row">${label}</th>${columns.map((c) => `<td>${render(c)}</td>`).join("")}</tr>`;
      }
      return `<details class="hotel-comparison"><summary>Vergelijk hotels & voorwaarden · ${choices.length} opties</summary><p class="caption">Eén kamer · ${stay.nights} nachten · twee volwassenen + Amélie. Op mobiel kun je de tabel opzij schuiven. Kamerprijzen zijn ramingen of eigen invoer; ontbijt, babybed en annulering zijn pas zeker na bevestiging van jullie tarief.</p><div class="comparison-scroll" tabindex="0" aria-label="Hotelvergelijking ${esc(stay.name)}"><table><caption class="sr-only">Hotels in ${esc(stay.name)} vergelijken</caption><thead><tr><th scope="col">Ons verblijf</th>${columns.map((c) => `<th scope="col">${esc(c.h.hotel)}<small>${c.choice === selected ? "✓ In ons plan" : { budget: "Budget", comfort: "Comfort", custom: "Eigen hotel" }[c.choice]}</small></th>`).join("")}</tr></thead><tbody>${row("Kamer / nacht", (c) => euro(c.nightly))}${row("Alle nachten", (c) => `<strong>${euro(c.nightly * stay.nights)}</strong>`)}${row("Ontbijt", (c) => esc(c.facts.breakfast || "Nog bevestigen"))}${row("Babybed", (c) => esc(c.facts.cot || "Nog bevestigen"))}${row("Ligging", (c) => esc(c.facts.location || c.h.area))}${row("Annuleren", (c) => esc(c.facts.cancellation || c.cancel))}</tbody></table></div><div class="comparison-editors">${columns
        .map(
          (c) =>
            `<details><summary>Voorwaarden · ${esc(c.h.hotel)}</summary><form data-hotel-details="${c.id}" class="hotel-facts-form"><label>Kamerprijs per nacht (€)<input type="number" name="price" min="0" max="100000" step="0.01" value="${c.nightly}" data-stay="${stay.id}" data-option="${c.choice}" required></label>${[
              ["breakfast", "Ontbijt", "Bijv. inbegrepen voor 2 volwassenen"],
              ["cot", "Babybed", "Bijv. schriftelijk bevestigd, gratis"],
              ["location", "Ligging / adres", c.h.area],
              [
                "cancellation",
                "Annuleringsvoorwaarden",
                "Bijv. niet restitueerbaar / flexibel tarief",
              ],
            ]
              .map(
                ([field, label, placeholder]) =>
                  `<label>${label}<input name="${field}" maxlength="1000" value="${esc(c.facts[field] || "")}" placeholder="${esc(placeholder)}"></label>`,
              )
              .join(
                "",
              )}<p class="caption">Voor een herinnering: vul de exacte annuleringsdeadline bij Boekingen in. Ontbijt- en babybedtoeslagen alleen in de kamerprijs opnemen als jullie offerte ze bevat.</p><button class="button primary" type="submit">Prijs & voorwaarden opslaan</button></form></details>`,
        )
        .join("")}</div></details>`;
    }
    function reminderId(e) {
      return e.id + "-" + e.start.replace(/[-:]/g, "").toLowerCase();
    }
    function reminderEvents() {
      return getEvents().filter(
        (e) => !getState().reminders["done-" + reminderId(e)],
      );
    }
    function eventTime(e) {
      if (!e.timed) return Date.parse(e.start + "T23:59:59+08:00");
      const v = e.start;
      return Date.parse(
        `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}T${v.slice(9, 11)}:${v.slice(11, 13)}:${v.slice(13, 15)}Z`,
      );
    }
    function renderReminders() {
      const now = Date.now(),
        all = getEvents().sort((a, b) => eventTime(a) - eventTime(b));
      const active = all.filter(
        (e) => !getState().reminders["done-" + reminderId(e)],
      );
      const done = all.filter(
        (e) => getState().reminders["done-" + reminderId(e)],
      );
      function card(e, completed = false) {
        const delta = eventTime(e) - now,
          days = Math.ceil(delta / 86400000);
        let label = "Over " + days + " dagen";
        if (completed) label = "Afgehandeld";
        else if (delta < 0) label = "Datum verstreken · controleren";
        else if (days <= 1) label = "Binnen 24 uur";
        let date;
        if (e.timed)
          date =
            new Intl.DateTimeFormat("nl-NL", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Europe/Amsterdam",
            }).format(new Date(eventTime(e))) + " · Nederland";
        else date = fmt(e.start);
        return `<article class="reminder-card"><div><span class="tag ${!completed && days <= 3 ? "red" : "green"}">${label}</span><h4>${esc(e.title)}</h4><p>${esc(date)}</p><details><summary>Wat moet er gebeuren?</summary><p>${esc(e.description)}</p>${e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">Bekijk bron / boeking ↗</a>` : ""}</details></div><button class="button secondary" data-reminder="${reminderId(e)}" data-done="${completed ? "false" : "true"}">${completed ? "Terugzetten" : "Afgehandeld"}</button></article>`;
      }
      document.querySelector("#reminder-list").innerHTML = active.length
        ? active.map((e) => card(e)).join("")
        : "<p>Alles is afgehandeld. Nieuwe ingevulde deadlines verschijnen hier automatisch.</p>";
      document.querySelector("#reminder-count").textContent =
        active.length + " open acties";
      document.querySelector("#reminder-completed").innerHTML = done.length
        ? `<details><summary>Afgehandeld · ${done.length}</summary>${done.map((e) => card(e, true)).join("")}</details>`
        : "";
      document.querySelector("#reminder-lead").value = String(
        getState().reminders.leadDays || 1,
      );
    }
    document.addEventListener("input", (event) => {
      const form = event.target.closest("form[data-hotel-details]");
      if (!form || !event.target.name) return;
      form.dataset.dirty = "true";
      const fields = new Set(
        (form.dataset.changed || "").split(",").filter(Boolean),
      );
      fields.add(event.target.name);
      form.dataset.changed = [...fields].join(",");
    });
    document.addEventListener("submit", (event) => {
      const form = event.target,
        id = form.dataset.hotelDetails;
      if (!id) return;
      event.preventDefault();
      if (!form.reportValidity()) return;
      const changed = new Set((form.dataset.changed || "").split(",")),
        record = { ...getState().hotelDetails[id] };
      for (const field of detailFields)
        if (changed.has(field))
          record[field] = form.elements.namedItem(field).value;
      const price = form.elements.namedItem("price");
      const update = changed.has("price")
        ? {
            stay: price.dataset.stay,
            choice: price.dataset.option,
            price: Number(price.value),
          }
        : null;
      delete form.dataset.dirty;
      onSave({ hotelId: id, details: record, price: update });
    });
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-reminder]");
      if (button)
        onSave({
          reminder: button.dataset.reminder,
          done: button.dataset.done === "true",
        });
    });
    document
      .querySelector("#reminder-lead")
      .addEventListener("change", (event) =>
        onSave({ leadDays: Number(event.target.value) }),
      );
    return { compare, renderReminders, reminderEvents };
  }
  window.ChinaExtras = { cleanDetails, dayPlan, create };
})();
