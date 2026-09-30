"use strict";
(() => {
  const statuses = ["Nog boeken", "Aangevraagd", "Geboekt", "Geannuleerd"];
  const types = {
    hotel: "Hotel",
    train: "Trein",
    attraction: "Attractie",
    flight: "Vluchten",
  };
  const fields = { provider: 500, reference: 200, notes: 5000, label: 500 };
  function safeLink(value) {
    try {
      const url = new URL(value);
      return ["https:", "http:"].includes(url.protocol) && value.length <= 4000
        ? url.href
        : "";
    } catch {
      return "";
    }
  }
  function clean(input) {
    const out = {};
    for (const [id, value] of Object.entries(input || {})) {
      if (
        !/^[a-z0-9-]{1,120}$/.test(id) ||
        ["constructor", "prototype"].includes(id) ||
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
      )
        continue;
      const record = {};
      if (statuses.includes(value.status)) record.status = value.status;
      for (const field of ["total", "paid"])
        if (
          Number.isFinite(value[field]) &&
          value[field] >= 0 &&
          value[field] <= 1000000
        )
          record[field] = value[field];
      for (const [field, length] of Object.entries(fields))
        if (typeof value[field] === "string")
          record[field] = value[field].slice(0, length);
      if (types[value.type]) record.type = value.type;
      if (Number.isInteger(value.day) && value.day >= 1 && value.day <= 31)
        record.day = value.day;
      for (const [field, pattern] of [
        ["paymentDue", /^\d{4}-\d{2}-\d{2}$/],
        ["cancelUntil", /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/],
      ])
        if (
          typeof value[field] === "string" &&
          pattern.test(value[field]) &&
          Number.isFinite(Date.parse(value[field]))
        )
          record[field] = value[field];
      if (value.url) record.url = safeLink(value.url);
      out[id] = record;
    }
    return out;
  }
  function create({ getState, getItems, onSave, esc, euro, iso, fmt }) {
    let filter = "all";
    function items() {
      const list = getItems();
      for (const [id, record] of Object.entries(getState().bookings))
        if (
          !list.some((item) => item.id === id) &&
          record.label &&
          record.type &&
          record.day
        )
          list.push({
            id,
            label: record.label,
            type: record.type,
            day: record.day,
            previous: true,
          });
      return list;
    }
    function recordFor(item) {
      return {
        status: item.status || "Nog boeken",
        ...getState().bookings[item.id],
      };
    }
    function remaining(record) {
      return Math.max(0, (record.total || 0) - (record.paid || 0));
    }
    function dateLabel(value, time = false) {
      if (!value) return "";
      const date = time
        ? new Date(value + "+08:00")
        : new Date(value + "T12:00:00Z");
      return new Intl.DateTimeFormat("nl-NL", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...(time
          ? { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai" }
          : { timeZone: "UTC" }),
      }).format(date);
    }
    function deadlines() {
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Shanghai",
      });
      return items()
        .flatMap((item) => {
          const r = recordFor(item);
          if (r.status === "Geannuleerd") return [];
          const deadlines = [];
          if (r.cancelUntil)
            deadlines.push({
              label: item.label,
              date: r.cancelUntil.slice(0, 10),
              text:
                "Gratis annuleren tot " +
                dateLabel(r.cancelUntil, true) +
                " · Chinatijd",
            });
          if (r.paymentDue && (r.total === undefined || remaining(r) > 0))
            deadlines.push({
              label: item.label,
              date: r.paymentDue,
              text: "Betalen vóór " + dateLabel(r.paymentDue),
            });
          return deadlines;
        })
        .filter((d) => d.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date));
    }
    function render() {
      const all = items(),
        active = all.filter((i) => recordFor(i).status !== "Geannuleerd");
      const records = active.map(recordFor),
        known = records.filter((r) => r.total !== undefined);
      const total = known.reduce((n, r) => n + r.total, 0),
        paid = records.reduce((n, r) => n + (r.paid || 0), 0),
        open = known.reduce((n, r) => n + remaining(r), 0);
      document.querySelector("#booking-summary").innerHTML =
        `<div><span>Opgegeven totaal</span><strong>${euro(total)}</strong></div><div><span>Al betaald</span><strong>${euro(paid)}</strong></div><div><span>Nog te betalen</span><strong>${euro(open)}</strong></div><div><span>Geboekt</span><strong>${records.filter((r) => r.status === "Geboekt").length}<small> / ${active.length}</small></strong></div><p class="caption">Op basis van eigen invoer · ${active.length - known.length} bedragen nog onbekend. Geannuleerde boekingen tellen niet mee. Je reisbudget blijft daarnaast beschikbaar.</p>`;
      const next = deadlines().slice(0, 3);
      document.querySelector("#booking-deadlines").innerHTML = next.length
        ? next
            .map(
              (d) =>
                `<div><strong>${esc(d.label)}</strong><span>${esc(d.text)}</span></div>`,
            )
            .join("")
        : '<p class="caption">Vul annulerings- en betaaldeadlines in om ze hier terug te zien.</p>';
      document.querySelector("#booking-ledger").innerHTML = all
        .filter((i) => filter === "all" || i.type === filter)
        .map((item) => {
          const r = recordFor(item),
            price =
              r.total === undefined ? "Bedrag nog invullen" : euro(r.total),
            statusClass = r.status === "Geboekt" ? "green" : "gold";
          return `<details class="booking-entry" data-booking-entry="${item.id}"><summary><div><p class="eyebrow">${types[item.type]} · D${item.day} · ${fmt(iso(item.day))}${item.previous ? " · Eerdere keuze" : ""}</p><h3>${esc(item.label)}</h3>${item.previous ? '<p class="caption">Controleer of deze eerdere keuze nog geboekt is.</p>' : ""}</div><div class="booking-entry-summary"><span class="tag ${statusClass}">${esc(r.status)}</span><strong>${price}</strong>${r.total !== undefined ? `<small>Betaald ${euro(r.paid || 0)} · open ${euro(remaining(r))}</small>` : ""}${r.cancelUntil ? `<small>Annuleren tot ${dateLabel(r.cancelUntil, true)} · Chinatijd</small>` : ""}</div></summary>
          <form data-booking-form="${item.id}" data-item="${esc(JSON.stringify(item))}" class="booking-form">
          <label>Status<select name="status">${statuses.map((v) => `<option ${v === r.status ? "selected" : ""}>${v}</option>`).join("")}</select></label>
          <label>Totaalbedrag (€)<input name="total" type="number" min="0" max="1000000" step="0.01" value="${r.total ?? ""}" placeholder="${item.suggested ?? "Nog invullen"}"></label>
          <label>Al betaald (€)<input name="paid" type="number" min="0" max="1000000" step="0.01" value="${r.paid ?? ""}" placeholder="0"></label>
          <label>Betalen vóór (optioneel)<input name="paymentDue" type="date" value="${r.paymentDue || ""}"></label>
          <label>Gratis annuleren tot · Chinatijd UTC+8<input name="cancelUntil" type="datetime-local" value="${r.cancelUntil || ""}"></label>
          <label>Boekingsnummer<input name="reference" maxlength="200" value="${esc(r.reference || "")}"></label>
          <label>Geboekt bij<input name="provider" maxlength="500" value="${esc(r.provider || "")}" placeholder="Hotel, 12306, Trip.com…"></label>
          <label>Boekingslink (optioneel)<input name="url" type="url" maxlength="4000" value="${esc(r.url || "")}" placeholder="https://…"></label>
          <label class="full">Notities<textarea name="notes" rows="3" maxlength="5000">${esc(r.notes || "")}</textarea></label>
          <p class="caption full">${item.suggested !== undefined ? "Planning / kamerprijs: " + euro(item.suggested) + ". Vul hierboven jullie totale boekingsbedrag in." : ""} Betalingen en reserveringen voer je zelf in; deze pagina voert geen boeking uit.</p>
          <button class="button primary" type="submit">Boeking opslaan</button>
          </form></details>`;
        })
        .join("");
    }
    document
      .querySelector("#booking-filter")
      .addEventListener("change", (event) => {
        filter = event.target.value;
        render();
      });
    function trackField(event) {
      const form = event.target.closest("form[data-booking-form]");
      if (!form || !event.target.name) return;
      if (event.target.name === "url") event.target.setCustomValidity("");
      const changed = new Set(
        (form.dataset.changed || "").split(",").filter(Boolean),
      );
      changed.add(event.target.name);
      form.dataset.changed = [...changed].join(",");
    }
    document.addEventListener("input", trackField);
    document.addEventListener("change", trackField);
    document.addEventListener("submit", (event) => {
      const form = event.target,
        id = form.dataset.bookingForm;
      if (!id) return;
      event.preventDefault();
      const item =
        items().find((i) => i.id === id) || JSON.parse(form.dataset.item);
      const values = Object.fromEntries(new FormData(form)),
        urlInput = form.elements.namedItem("url");
      urlInput.setCustomValidity("");
      if (values.url && !safeLink(values.url)) {
        urlInput.setCustomValidity("Gebruik een http://- of https://-link.");
        urlInput.reportValidity();
        return;
      }
      if (!form.reportValidity()) return;
      const existing = getState().bookings[id];
      const record = {
        ...existing,
        label: item.label,
        type: item.type,
        day: item.day,
      };
      if (!record.status) record.status = item.status || "Nog boeken";
      const changed = new Set((form.dataset.changed || "").split(","));
      for (const [field, value] of Object.entries(values)) {
        if (!changed.has(field)) continue;
        if (["total", "paid"].includes(field)) {
          if (value === "") delete record[field];
          else record[field] = Number(value);
        } else if (["cancelUntil", "paymentDue"].includes(field) && !value)
          delete record[field];
        else record[field] = value;
      }
      onSave(item, clean({ [id]: record })[id]);
      render();
      const summary = document.querySelector(
        `[data-booking-entry="${id}"] summary`,
      );
      summary.focus({ preventScroll: true });
    });
    return { render, deadlines, items, recordFor };
  }
  window.ChinaBookings = { clean, create };
})();
