const groups = new Set([
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
]);
const recordFields = {
  hotelDetails: new Set(["breakfast", "cot", "location", "cancellation"]),
  customHotels: new Set(["name", "price", "url", "area", "room", "notes"]),
  bookings: new Set([
    "status",
    "total",
    "paid",
    "cancelUntil",
    "paymentDue",
    "reference",
    "provider",
    "url",
    "notes",
    "label",
    "type",
    "day",
  ]),
};
const keyPattern = /^[a-zA-Z0-9-]{1,120}$/;
const maxSize = 1000000;
export function validateOp(op) {
  if (!op || !Array.isArray(op.path) || ![2, 3].includes(op.path.length))
    return false;
  const [group, key, field] = op.path;
  if (
    !groups.has(group) ||
    typeof key !== "string" ||
    !keyPattern.test(key) ||
    ["constructor", "prototype"].includes(key)
  )
    return false;
  if (recordFields[group]) {
    if (op.path.length === 2) return op.remove === true;
    if (!recordFields[group].has(field)) return false;
  } else if (op.path.length !== 2) return false;
  if (op.remove === true) return true;
  const value = op.value;
  if (typeof value === "string") return value.length <= 10000;
  if (typeof value === "boolean") return true;
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 1000000
  );
}
export function applyOps(state, ops) {
  const next = structuredClone(state);
  for (const op of ops) {
    const [group, key, field] = op.path;
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
function initialState(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw Error("state");
  const ops = [];
  for (const [group, values] of Object.entries(input)) {
    if (
      !groups.has(group) ||
      !values ||
      typeof values !== "object" ||
      Array.isArray(values)
    )
      throw Error("group");
    for (const [key, value] of Object.entries(values)) {
      if (recordFields[group]) {
        if (!value || typeof value !== "object" || Array.isArray(value))
          throw Error("record");
        for (const [field, v] of Object.entries(value))
          ops.push({ path: [group, key, field], value: v });
      } else ops.push({ path: [group, key], value });
    }
  }
  if (!ops.every(validateOp)) throw Error("operation");
  const state = applyOps(
    Object.fromEntries([...groups].map((g) => [g, {}])),
    ops,
  );
  if (JSON.stringify(state).length > maxSize) throw Error("size");
  return state;
}
async function hash(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",");
    if (origin && !allowed.includes(origin))
      return new Response("Origin not allowed", { status: 403 });
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin":
        origin || allowed[0] || "https://daltonganger.github.io",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
      "Access-Control-Allow-Headers": "Authorization,Content-Type",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };
    const reply = (body, status = 200) =>
      new Response(body === null ? null : JSON.stringify(body), {
        status,
        headers,
      });
    if (request.method === "OPTIONS") return reply(null, 204);
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET")
      return reply({ ok: true });
    const match = url.pathname.match(/^\/rooms\/([a-f0-9]{32})$/);
    if (!match) return reply({ error: "not-found" }, 404);
    const token =
      request.headers.get("Authorization")?.replace(/^Bearer /, "") || "";
    if (!/^[a-f0-9]{64}$/.test(token))
      return reply({ error: "not-found" }, 404);
    const id = match[1],
      tokenHash = await hash(token);
    const read = () =>
      env.DB.prepare(
        "SELECT state,revision,updated_at FROM rooms WHERE id = ? AND token_hash = ?",
      )
        .bind(id, tokenHash)
        .first();
    const snapshot = (row) => ({
      state: JSON.parse(row.state),
      revision: row.revision,
      updatedAt: row.updated_at,
    });
    let body;
    if (["POST", "PATCH"].includes(request.method)) {
      const text = await request.text();
      if (text.length > maxSize + 100000)
        return reply({ error: "too-large" }, 413);
      try {
        body = JSON.parse(text);
      } catch {
        return reply({ error: "invalid-json" }, 400);
      }
    }
    try {
      if (request.method === "POST") {
        const state = initialState(body?.state);
        const creator = await hash(
          request.headers.get("CF-Connecting-IP") || "local",
        );
        const now = Date.now();
        // Anonymous creation is limited; every existing room requires its private capability.
        const counts = await env.DB.prepare(
          "SELECT COUNT(*) AS total, SUM(CASE WHEN creator_hash = ? AND created_at > ? THEN 1 ELSE 0 END) AS recent FROM rooms",
        )
          .bind(creator, now - 86400000)
          .first();
        if (counts.total >= 200 || counts.recent >= 5)
          return reply({ error: "creation-limit" }, 429);
        const result = await env.DB.prepare(
          "INSERT OR IGNORE INTO rooms (id,token_hash,creator_hash,state,created_at,updated_at) VALUES (?,?,?,?,?,?)",
        )
          .bind(id, tokenHash, creator, JSON.stringify(state), now, now)
          .run();
        if (!result.meta.changes) return reply({ error: "exists" }, 409);
        return reply(snapshot(await read()), 201);
      }
      const row = await read();
      if (!row) return reply({ error: "not-found" }, 404);
      if (request.method === "GET") {
        if (url.searchParams.get("revision") === String(row.revision))
          return reply(null, 204);
        return reply(snapshot(row));
      }
      if (request.method !== "PATCH") return reply({ error: "method" }, 405);
      if (
        !Array.isArray(body?.ops) ||
        !body.ops.length ||
        body.ops.length > 5000 ||
        !body.ops.every(validateOp)
      )
        return reply({ error: "invalid-operations" }, 400);
      let current = row;
      for (let attempt = 0; attempt < 8; attempt++) {
        const next = applyOps(JSON.parse(current.state), body.ops);
        const text = JSON.stringify(next);
        if (text.length > maxSize) return reply({ error: "too-large" }, 413);
        const now = Date.now();
        const result = await env.DB.prepare(
          "UPDATE rooms SET state = ?, revision = revision + 1, updated_at = ? WHERE id = ? AND token_hash = ? AND revision = ?",
        )
          .bind(text, now, id, tokenHash, current.revision)
          .run();
        if (result.meta.changes)
          return reply({
            state: next,
            revision: current.revision + 1,
            updatedAt: now,
          });
        current = await read();
        if (!current) return reply({ error: "not-found" }, 404);
      }
      return reply({ error: "retry" }, 409);
    } catch (error) {
      if (
        ["POST"].includes(request.method) &&
        ["state", "group", "record", "operation", "size"].includes(
          error.message,
        )
      )
        return reply({ error: "invalid-state" }, 400);
      return reply({ error: "server-error" }, 500);
    }
  },
};
