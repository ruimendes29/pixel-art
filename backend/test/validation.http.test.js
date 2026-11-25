// Calls the API directly, like a script skipping the forms would, and checks the
// shared field rules answer 400 before anything reaches the database.
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../app");

let server, base;
before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://localhost:${server.address().port}/api`;
});
// the DB pool would keep the process alive after the login test
after(() => {
  server.close();
  require("../global").connection.end();
});

const post = async (path, body) => {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, error: (await res.json()).error };
};

test("a canvas outside 10 to 100 is refused", async () => {
  assert.deepEqual(await post("/art/add-project", { token: "x", name: "Cat", size: 5000 }), {
    status: 400,
    error: "Canvas size must be between 10 and 100",
  });
});

test("a fractional canvas size is refused", async () => {
  const { status, error } = await post("/art/add-project", { token: "x", name: "Cat", size: 20.5 });
  assert.equal(status, 400);
  assert.equal(error, "Canvas size must be a whole number");
});

test("a weak password is refused at sign-up", async () => {
  const form = new FormData();
  form.set("name", "rui");
  form.set("email", "rui@example.com");
  form.set("password", "password");
  const res = await fetch(`${base}/users/add-user`, { method: "POST", body: form });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /^Password needs: an uppercase letter, a number, a symbol/);
});

test("every problem is listed at once", async () => {
  const { status, error } = await post("/users/login", { name: " ", password: "" });
  assert.equal(status, 400);
  assert.equal(error, "Username can't be empty. Password can't be empty");
});

test("a too long description is refused when sharing", async () => {
  const { status, error } = await post("/art/share-project", { token: "x", id: 1, tags: [], description: "a".repeat(1001) });
  assert.equal(status, 400);
  assert.equal(error, "Description can be at most 1000 characters");
});

test("an id that is not a number is refused", async () => {
  const { status, error } = await post("/likes/like", { token: "x", projectId: "1 OR 1=1" });
  assert.equal(status, 400);
  assert.equal(error, "Id must be a number");
});

test("a single problem says which input it belongs to", async () => {
  const res = await fetch(`${base}/art/add-project`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "x", name: "Cat", size: 5000 }),
  });
  assert.equal((await res.json()).field, "canvasSize");
});

// Needs a database (a username that surely doesn't exist)
const noDb = !process.env.DB_HOST && "set DB_HOST to run the database tests";
test("an unknown username is reported on the username input", { skip: noDb }, async () => {
  const res = await fetch(`${base}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: `nobody-${Date.now()}`, password: "x" }),
  });
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: "No account has this username", field: "username" });
});
