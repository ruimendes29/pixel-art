// Runs against a real MySQL/TiDB database loaded with schema.sql (CI starts one).
// Skipped when DB_HOST is not set.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

process.env.TOKEN_KEY ||= "integration-test-key";
const skip = !process.env.DB_HOST && "set DB_HOST to run the database tests";

let server, base, db, connection, userId, token;
const ids = {};

const api = async (path, options = {}) => {
  const res = await fetch(`${base}/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json" },
  });
  return { status: res.status, body: await res.json() };
};

const share = (id, tags, description = "test") =>
  api("/art/share-project", { method: "POST", body: JSON.stringify({ token, id, tags, description }) });

// Ids of this test's projects returned by a filter, so other data in the DB doesn't matter
const filter = async (tags, search) => {
  const query = new URLSearchParams();
  if (tags !== undefined) query.set("tags", JSON.stringify(tags));
  if (search !== undefined) query.set("search", search);
  const { status, body } = await api(`/art/shared-projects?${query}`);
  assert.equal(status, 200, JSON.stringify(body));
  const ours = new Set(Object.values(ids));
  return body.filter((p) => ours.has(p.id)).map((p) => p.id).sort();
};

const tagsOf = async (projectId) =>
  (await db.queryDataBase("SELECT name FROM Tag WHERE projectId=? ORDER BY name", [projectId])).map((r) => r.name);

before(async () => {
  if (skip) return;
  db = require("../resources/db");
  ({ connection } = require("../global"));
  const auth = require("../resources/auth");
  const app = require("../app");

  const name = `tags-test-${Date.now()}`;
  const user = await db.queryDataBase("INSERT INTO User (username,email,password) VALUES (?,?,?)", [
    name,
    `${name}@example.test`,
    "not-a-real-hash",
  ]);
  userId = user.insertId;
  token = await auth.sign({ username: name, id: userId });

  for (const key of ["retroCats", "retro", "dogs", "unshared", "invalid"]) {
    const project = await db.queryDataBase("INSERT INTO Project (name,author,size) VALUES (?,?,16)", [key, userId]);
    ids[key] = project.insertId;
  }
  // A tag on a project that is never shared must not make it show up
  await db.queryDataBase("INSERT INTO Tag (projectId,name) VALUES (?,?)", [ids.unshared, "Cats"]);

  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (skip) return;
  if (userId) await db.queryDataBase("DELETE FROM User WHERE id=?", [userId]); // cascades to projects and tags
  server?.close();
  await connection.promise().end();
});

test("sharing stores cleaned tags", { skip }, async () => {
  assert.equal((await share(ids.retroCats, ["  Retro   games ", "Cats", "cats", ""])).status, 200);
  assert.equal((await share(ids.retro, ["retro GAMES"])).status, 200);
  assert.equal((await share(ids.dogs, ["Dogs"], "A sleepy dog, 100% pixels")).status, 200);

  assert.deepEqual(await tagsOf(ids.retroCats), ["Cats", "Retro games"]);
});

test("sharing with invalid tags is refused and the project stays private", { skip }, async () => {
  const res = await share(ids.invalid, "Cats");
  assert.equal(res.status, 401);
  assert.match(res.body.error, /list/);
  const [project] = await db.queryDataBase("SELECT shared FROM Project WHERE id=?", [ids.invalid]);
  assert.equal(project.shared, 0);
});

test("no tags lists every shared project", { skip }, async () => {
  const all = [ids.retroCats, ids.retro, ids.dogs].sort();
  assert.deepEqual(await filter([]), all);
  assert.deepEqual(await filter(undefined), all);
});

test("one tag matches ignoring case and spacing", { skip }, async () => {
  assert.deepEqual(await filter(["retro games"]), [ids.retroCats, ids.retro].sort());
  assert.deepEqual(await filter([" RETRO   Games"]), [ids.retroCats, ids.retro].sort());
});

test("several tags only match projects that have all of them", { skip }, async () => {
  assert.deepEqual(await filter(["Retro games", "cats"]), [ids.retroCats]);
  assert.deepEqual(await filter(["Retro games", "Retro GAMES"]), [ids.retroCats, ids.retro].sort());
});

test("tags of private projects and unknown tags match nothing extra", { skip }, async () => {
  assert.deepEqual(await filter(["Cats"]), [ids.retroCats]);
  assert.deepEqual(await filter(["No such tag"]), []);
});

test("a malformed tag filter is an error, not a crash", { skip }, async () => {
  const res = await api("/art/shared-projects?tags=Cats");
  assert.equal(res.status, 401);
  assert.match(res.body.error, /JSON list/);
});

test("search matches the name or the description, ignoring case", { skip }, async () => {
  assert.deepEqual(await filter([], "RETRO"), [ids.retroCats, ids.retro].sort());
  assert.deepEqual(await filter([], "  sleepy   dog "), [ids.dogs]);
  assert.deepEqual(await filter([], "nothing like this"), []);
});

test("search treats % and _ as plain characters", { skip }, async () => {
  assert.deepEqual(await filter([], "100%"), [ids.dogs]);
  assert.deepEqual(await filter([], "_"), []);
});

test("search and tags combine", { skip }, async () => {
  assert.deepEqual(await filter(["Cats"], "retro"), [ids.retroCats]);
  assert.deepEqual(await filter(["Dogs"], "retro"), []);
});
