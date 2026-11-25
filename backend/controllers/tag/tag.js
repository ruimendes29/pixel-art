// The shared tag catalog (table TagName): every tag people can pick when
// filtering or sharing. Users can add tags, up to a limit each.
const sqlController = require("../../resources/db");
const auth = require("../../resources/auth");
const { spec, ValidationError } = require("../../resources/fields");

const MAX_PER_USER = spec.limits.maxTagsCreatedPerUser;

const createdBy = async (userId) =>
  (await sqlController.queryDataBase(`SELECT COUNT(*) AS n FROM TagName WHERE createdBy=?`, [userId]))[0].n;

// All tags, A to Z ignoring case. With a valid token, also how many that user created.
const listTags = async (token) => {
  const rows = await sqlController.queryDataBase(`SELECT name FROM TagName ORDER BY LOWER(name)`);
  let mine = 0;
  if (token) {
    try {
      mine = await createdBy((await auth.verify(token)).id);
    } catch {
      // not logged in: the list is still public
    }
  }
  return { tags: rows.map((r) => r.name), createdByMe: mine, maxPerUser: MAX_PER_USER };
};

// `name` was already checked against the "newTag" field rule by the router
// shortcut: count-then-insert can let a user go one over the limit with parallel requests; fine for a hobby app, use a transaction if it matters
const createTag = async (token, name) => {
  const user = await auth.verify(token);
  if ((await createdBy(user.id)) >= MAX_PER_USER) {
    throw new ValidationError(`You can create at most ${MAX_PER_USER} tags`, "newTag");
  }
  const existing = await sqlController.queryDataBase(`SELECT name FROM TagName WHERE LOWER(name)=LOWER(?)`, [name]);
  if (existing.length) throw new ValidationError(`The tag "${existing[0].name}" already exists`, "newTag");
  await sqlController.queryDataBase(`INSERT INTO TagName (name,createdBy) VALUES (?,?)`, [name, user.id]);
  return name;
};

// Tags sent when sharing must be in the catalog; returns them spelled as stored
const resolveTags = async (names) => {
  if (names.length === 0) return [];
  const rows = await sqlController.queryDataBase(`SELECT name FROM TagName WHERE LOWER(name) IN (?)`, [
    names.map((n) => n.toLowerCase()),
  ]);
  const byLower = new Map(rows.map((r) => [r.name.toLowerCase(), r.name]));
  const unknown = names.filter((n) => !byLower.has(n.toLowerCase()));
  if (unknown.length) throw new ValidationError(`Unknown tag: ${unknown.join(", ")}`, "tags");
  return names.map((n) => byLower.get(n.toLowerCase()));
};

module.exports = { listTags, createTag, resolveTags, MAX_PER_USER };
