import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "./worker.mjs";
function setup() {
  const db = new DatabaseSync(":memory:");
  db.exec(readFileSync(new URL("schema.sql", import.meta.url), "utf8"));
  return {
    ALLOWED_ORIGINS: "http://127.0.0.1:8277",
    DB: {
      prepare(sql) {
        return {
          bind(...args) {
            return {
              async first() {
                return db.prepare(sql).get(...args);
              },
              async run() {
                return {
                  meta: { changes: db.prepare(sql).run(...args).changes },
                };
              },
            };
          },
        };
      },
    },
  };
}
const id = "a".repeat(32),
  token = "b".repeat(64);
function request(env, method, body, secret = token, path = "/rooms/" + id) {
  return worker.fetch(
    new Request("https://test" + path, {
      method,
      headers: {
        Origin: "http://127.0.0.1:8277",
        Authorization: "Bearer " + secret,
      },
      body: body ? JSON.stringify(body) : undefined,
    }),
    env,
  );
}
test("two editors merge different fields; tokens isolate rooms; values and deletions round-trip", async () => {
  const env = setup();
  assert.equal(
    (
      await request(env, "POST", {
        state: { notes: { 2: "oud" }, hotels: { "shanghai-budget": 64.5 } },
      })
    ).status,
    201,
  );
  assert.equal((await request(env, "GET", null, "c".repeat(64))).status, 404);
  const [a, b] = await Promise.all([
    request(env, "PATCH", { ops: [{ path: ["notes", "2"], value: "Ruben" }] }),
    request(env, "PATCH", {
      ops: [
        { path: ["bookings", "hotel-shanghai-budget", "total"], value: 193.5 },
        { path: ["bookings", "hotel-shanghai-budget", "paid"], value: 50 },
      ],
    }),
  ]);
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  const snapshot = await (await request(env, "GET")).json();
  assert.equal(snapshot.state.notes["2"], "Ruben");
  assert.equal(snapshot.state.bookings["hotel-shanghai-budget"].total, 193.5);
  assert.equal(snapshot.state.bookings["hotel-shanghai-budget"].paid, 50);
  assert.equal(snapshot.revision, 3);
  assert.equal(
    (await request(env, "GET", null, token, "/rooms/" + id + "?revision=3"))
      .status,
    204,
  );
  assert.equal(
    (
      await request(env, "PATCH", {
        ops: [{ path: ["hotels", "shanghai-budget"], remove: true }],
      })
    ).status,
    200,
  );
  assert.equal(
    (await (await request(env, "GET")).json()).state.hotels["shanghai-budget"],
    undefined,
  );
});
test("invalid payloads, prototype keys, unauthorized origins and guessing cannot write", async () => {
  const env = setup();
  await request(env, "POST", { state: {} });
  for (const op of [
    { path: ["notes", "__proto__"], value: "bad" },
    { path: ["bookings", "a", "constructor"], value: "bad" },
    { path: ["budget", "food"], value: -1 },
    { path: ["bookings", "a"], value: { total: 12 } },
  ])
    assert.equal((await request(env, "PATCH", { ops: [op] })).status, 400);
  const forbidden = await worker.fetch(
    new Request("https://test/rooms/" + id, {
      headers: {
        Origin: "https://evil.example",
        Authorization: "Bearer " + token,
      },
    }),
    env,
  );
  assert.equal(forbidden.status, 403);
  assert.equal(
    (
      await request(
        env,
        "PATCH",
        { ops: [{ path: ["notes", "2"], value: "bad" }] },
        "c".repeat(64),
      )
    ).status,
    404,
  );
  assert.equal(
    (await request(env, "POST", { state: { notes: { 2: { bad: true } } } }))
      .status,
    400,
  );
});

test("existing shared trips accept concurrent hotel terms, day pace and reminder changes", async () => {
  const env = setup();
  await request(env, "POST", { state: { notes: { 3: "Bund na het dutje" } } });
  const responses = await Promise.all([
    request(env, "PATCH", {
      ops: [
        {
          path: ["hotelDetails", "hotel-shanghai-budget", "breakfast"],
          value: "Inclusief",
        },
        { path: ["dayModes", "8"], value: "calm" },
      ],
    }),
    request(env, "PATCH", {
      ops: [
        {
          path: ["hotelDetails", "hotel-shanghai-budget", "cot"],
          value: "Bevestigd",
        },
        { path: ["reminders", "leadDays"], value: 3 },
        { path: ["reminders", "done-visa-check-20261201"], value: true },
      ],
    }),
  ]);
  for (const response of responses) assert.equal(response.status, 200);
  const { state } = await (await request(env, "GET")).json();
  assert.deepEqual(state.hotelDetails["hotel-shanghai-budget"], {
    breakfast: "Inclusief",
    cot: "Bevestigd",
  });
  assert.equal(state.notes[3], "Bund na het dutje");
  assert.equal(state.dayModes[8], "calm");
  assert.equal(state.reminders.leadDays, 3);
  assert.equal(state.reminders["done-visa-check-20261201"], true);
});
