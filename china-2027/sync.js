"use strict";
(() => {
  const storageKey = "china2027-shared-v1";
  const groups = [
    "checks",
    "notes",
    "trains",
    "hotels",
    "choices",
    "customHotels",
    "budget",
    "bookings",
    "hotelDetails",
    "dayModes",
    "reminders",
  ];
  const recordGroups = new Set(["customHotels", "bookings", "hotelDetails"]);
  function leaves(state) {
    const out = new Map();
    for (const group of groups)
      for (const [key, value] of Object.entries(state[group] || {})) {
        if (recordGroups.has(group))
          for (const [field, v] of Object.entries(value))
            out.set(JSON.stringify([group, key, field]), v);
        else out.set(JSON.stringify([group, key]), value);
      }
    return out;
  }
  function diff(previous, next) {
    const before = leaves(previous),
      after = leaves(next),
      ops = [];
    for (const key of new Set([...before.keys(), ...after.keys()])) {
      if (
        before.get(key) === after.get(key) &&
        before.has(key) === after.has(key)
      )
        continue;
      const op = { path: JSON.parse(key) };
      if (after.has(key)) op.value = after.get(key);
      else op.remove = true;
      ops.push(op);
    }
    return ops;
  }
  function overlay(state, ops) {
    const next = structuredClone(state);
    for (const op of ops) {
      const [group, key, field] = op.path;
      if (
        !groups.includes(group) ||
        ["__proto__", "constructor", "prototype"].includes(key)
      )
        continue;
      next[group] ??= {};
      if (op.path.length === 2) {
        if (op.remove) delete next[group][key];
        else next[group][key] = op.value;
      } else {
        next[group][key] ??= {};
        if (op.remove) delete next[group][key][field];
        else next[group][key][field] = op.value;
      }
    }
    return next;
  }
  function validSession(value) {
    return (
      value &&
      /^[a-f0-9]{32}$/.test(value.id) &&
      /^[a-f0-9]{64}$/.test(value.token)
    );
  }
  function randomHex(size) {
    return [...crypto.getRandomValues(new Uint8Array(size))]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("");
  }
  function create({ api, getState, onState, onBackup, onStatus }) {
    const $ = (s) => document.querySelector(s);
    api = api.replace(/\/$/, "");
    let session = null,
      revision = 0,
      pending = new Map(),
      shadow = structuredClone(getState());
    let failures = 0,
      nextAttempt = 0;
    let busy = false,
      timer,
      epoch = 0,
      lastUpdate = 0,
      invitation = null;
    const match = location.hash.match(
      /^#samen=([a-f0-9]{32})\.([a-f0-9]{64})$/,
    );
    if (match) invitation = { id: match[1], token: match[2] };
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved?.api === api && validSession(saved)) {
        session = { id: saved.id, token: saved.token };
        revision = saved.revision || 0;
        for (const op of saved.pending || []) {
          if (
            Array.isArray(op.path) &&
            [2, 3].includes(op.path.length) &&
            groups.includes(op.path[0]) &&
            /^[a-zA-Z0-9-]{1,120}$/.test(op.path[1]) &&
            (op.path.length === 2 || /^[a-zA-Z0-9]+$/.test(op.path[2]))
          )
            pending.set(JSON.stringify(op.path), op);
        }
      }
    } catch {
      /* Local planner remains usable when sharing metadata cannot be read. */
    }
    if (invitation) history.replaceState(null, "", "#samen");
    function persist() {
      if (!session) return;
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            api,
            ...session,
            revision,
            pending: [...pending.values()],
          }),
        );
      } catch {
        status(
          "Deze browser kan de gedeelde verbinding niet bewaren. Maak een back-up.",
          "error",
        );
      }
    }
    function status(text, kind = "ready") {
      $("#sync-status").textContent = text;
      $("#sync-status").className =
        "tag " + (kind === "error" ? "red" : "green");
      onStatus?.(text);
    }
    function controls() {
      const linked = !!session && !invitation;
      $("#sync-create").hidden = linked || !!invitation || !api;
      $("#sync-join").hidden = !invitation || !api;
      $("#sync-copy").hidden = !linked;
      $("#sync-retry").hidden = !linked;
      $("#sync-leave").hidden = !linked;
      $("#sync-link-box").hidden = !linked;
      if (linked) {
        const u = new URL(location.href);
        u.hash = "samen=" + session.id + "." + session.token;
        u.search = "";
        $("#sync-invite").value = u.href;
        $("#sync-title").textContent = "Jullie gezamenlijke reisboek.";
        $("#sync-description").textContent =
          "Kopieer de persoonlijke link voor Martine. Na openen delen jullie hotelkeuzes, notities, bedragen en boekingen. Wijzigingen op verschillende onderdelen worden samengevoegd.";
      } else if (invitation) {
        $("#sync-title").textContent =
          "Er staat een gezamenlijke reis voor je klaar.";
        $("#sync-description").textContent =
          "Open de gedeelde reis om samen verder te plannen. Je huidige lokale versie blijft als herstelkopie op dit apparaat bewaard.";
      }
      if (!api) {
        status("Online opslag nog niet gekoppeld", "error");
        $("#sync-description").textContent =
          "De online opslag moet nog worden gekoppeld. Tot die tijd kun je alles lokaal invullen en met een back-up meenemen.";
      }
    }
    async function request(
      method,
      body,
      connection = session,
      knownRevision = null,
    ) {
      const query = knownRevision !== null ? "?revision=" + knownRevision : "";
      const response = await fetch(api + "/rooms/" + connection.id + query, {
        method,
        headers: {
          Authorization: "Bearer " + connection.token,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 204) return null;
      if (!response.ok) {
        const error = Error("http");
        error.status = response.status;
        throw error;
      }
      return response.json();
    }
    function receive(snapshot) {
      if (!snapshot) return;
      revision = snapshot.revision;
      lastUpdate = snapshot.updatedAt;
      onState(overlay(snapshot.state, [...pending.values()]));
      shadow = structuredClone(getState());
      persist();
      $("#sync-last-update").textContent =
        "Laatste update: " +
        new Intl.DateTimeFormat("nl-NL", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(lastUpdate));
    }
    async function synchronize(force = false) {
      if (
        !session ||
        !api ||
        busy ||
        invitation ||
        (force !== true && Date.now() < nextAttempt)
      )
        return;
      busy = true;
      const currentEpoch = epoch;
      try {
        const sent = [...pending.values()];
        const snapshot = await request(
          sent.length ? "PATCH" : "GET",
          sent.length ? { ops: sent } : null,
          session,
          sent.length ? null : revision,
        );
        if (epoch !== currentEpoch) return;
        for (const op of sent) {
          const key = JSON.stringify(op.path);
          if (JSON.stringify(pending.get(key)) === JSON.stringify(op))
            pending.delete(key);
        }
        receive(snapshot);
        persist();
        failures = 0;
        nextAttempt = 0;
        status(
          pending.size ? "Wijzigingen worden verzonden…" : "Samen bijgewerkt",
        );
      } catch (error) {
        if (epoch !== currentEpoch) return;
        failures++;
        nextAttempt =
          Date.now() + Math.min(60000, 5000 * 2 ** Math.min(failures - 1, 4));
        if (error.status === 404)
          status(
            "Verbinding niet gevonden. Open de uitnodigingslink opnieuw.",
            "error",
          );
        else
          status(
            pending.size
              ? "Offline · wijzigingen wachten op verbinding"
              : "Verbinding onderbroken · we proberen opnieuw",
            "error",
          );
      } finally {
        if (epoch === currentEpoch) {
          busy = false;
          if (pending.size && navigator.onLine)
            schedule(Math.max(800, nextAttempt - Date.now()));
        }
      }
    }
    function schedule(delay = 800) {
      clearTimeout(timer);
      timer = setTimeout(synchronize, delay);
    }
    function queue() {
      if (!session || invitation || !api) return;
      const now = getState();
      for (const op of diff(shadow, now))
        pending.set(JSON.stringify(op.path), op);
      shadow = structuredClone(now);
      persist();
      if (pending.size) {
        status("Wijzigingen worden verzonden…");
        schedule();
      }
    }
    async function start(join = false) {
      if (!api || busy) return;
      try {
        onBackup();
      } catch {
        status(
          "Bewaren lukt niet. Download eerst een lokale back-up.",
          "error",
        );
        return;
      }
      const previousSession = session,
        previousPending = pending;
      session = join ? invitation : { id: randomHex(16), token: randomHex(32) };
      pending = new Map();
      shadow = structuredClone(getState());
      revision = 0;
      epoch++;
      busy = true;
      $("#sync-create").disabled = true;
      $("#sync-join").disabled = true;
      status(
        join
          ? "Gedeelde reis wordt geopend…"
          : "Gezamenlijke reis wordt aangemaakt…",
      );
      try {
        const snapshot = await request(
          join ? "GET" : "POST",
          join ? null : { state: structuredClone(shadow) },
        );
        invitation = null;
        receive(snapshot);
        controls();
        persist();
        status("Samen bijgewerkt");
      } catch (error) {
        session = previousSession;
        pending = previousPending;
        controls();
        status(
          error.status === 404
            ? "De uitnodigingslink is niet geldig of de reis bestaat niet meer."
            : "Verbinden lukt nu niet. Je lokale gegevens zijn bewaard.",
          "error",
        );
      } finally {
        busy = false;
        $("#sync-create").disabled = false;
        $("#sync-join").disabled = false;
      }
    }
    $("#sync-create").addEventListener("click", () => start(false));
    $("#sync-join").addEventListener("click", () => start(true));
    $("#sync-copy").addEventListener("click", async () => {
      const input = $("#sync-invite");
      try {
        await navigator.clipboard.writeText(input.value);
        status("Persoonlijke uitnodigingslink gekopieerd");
      } catch {
        input.focus();
        input.select();
        status("Selecteer en kopieer de persoonlijke link.");
      }
    });
    $("#sync-retry").addEventListener("click", () => synchronize(true));
    $("#sync-leave").addEventListener("click", () => {
      if (pending.size) {
        status(
          "Er staan nog wijzigingen klaar. Synchroniseer eerst of download een back-up.",
          "error",
        );
        return;
      }
      epoch++;
      session = null;
      busy = false;
      pending.clear();
      clearTimeout(timer);
      localStorage.removeItem(storageKey);
      $("#sync-title").textContent = "Je werkt nu op dit apparaat.";
      $("#sync-description").textContent =
        "De laatst ontvangen reisgegevens blijven hier bewaard. De gezamenlijke reis op andere apparaten blijft bestaan.";
      controls();
      status("Alleen op dit apparaat");
    });
    setInterval(() => {
      if (!document.hidden) synchronize();
    }, 5000);
    window.addEventListener("online", () => synchronize(true));
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) synchronize();
    });
    controls();
    if (session && !invitation && api) synchronize();
    return { queue, synchronize };
  }
  window.ChinaSync = { create, diff, overlay };
})();
