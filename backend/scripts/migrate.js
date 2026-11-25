// Brings an existing database up to schema.sql WITHOUT deleting anything:
// creates missing tables (schema.sql only uses CREATE TABLE IF NOT EXISTS) and
// fills the tag catalog with the built-in tags and every tag already used by a
// project. Safe to run more than once.
//
//   npm run migrate
const fs = require("fs");
const path = require("path");
const { connection } = require("../global");
const { queryDataBase: q } = require("../resources/db");
const PRESET_TAGS = require("../resources/preset-tags");

const main = async () => {
  const schema = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8").replace(/^--.*$/gm, "");
  for (const statement of schema.split(";").map((s) => s.trim()).filter(Boolean)) await q(statement);

  const used = (await q(`SELECT DISTINCT name FROM Tag`)).map((r) => r.name);
  const known = new Set((await q(`SELECT name FROM TagName`)).map((r) => r.name.toLowerCase()));
  let added = 0;
  for (const tag of [...PRESET_TAGS, ...used]) {
    if (known.has(tag.toLowerCase())) continue; // the catalog ignores case
    await q(`INSERT INTO TagName (name) VALUES (?)`, [tag]);
    known.add(tag.toLowerCase());
    added++;
  }
  console.log(`Database ${process.env.DB_NAME} is up to date; ${added} tags added to the catalog.`);
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => connection.end());
