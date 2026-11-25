// Test data generator: DELETES EVERYTHING in the database named by DB_NAME
// (backend/.env), recreates the tables from schema.sql and fills them with users,
// groups, drawings, tags and likes. Prints how to log in as each user.
//
//   npm run seed -- --wipe=<DB_NAME>
//
// The --wipe value must repeat the database name, so it can't run by accident
// against the wrong database. Passwords are random on every run (the repository
// is public, so fixed ones would let anyone log in).
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { connection } = require("../global");
const { queryDataBase: q } = require("../resources/db");
const { assertFields } = require("../resources/fields");
const { normalizeTags } = require("../resources/tags");
const PRESET_TAGS = require("../resources/preset-tags");

// ---------------------------------------------------------------- PNG drawing

const PALETTE = {
  k: "#1f1f2e", w: "#ffffff", r: "#e63946", o: "#f4a261", y: "#f2c230",
  g: "#6ab04c", d: "#2d6a4f", b: "#3a86ff", n: "#8d5524", p: "#ff8fab",
  c: "#3bbfbf", s: "#ffd6a5", l: "#9aa5b1", m: "#7a5cc7",
};

// Minimal PNG encoder (RGBA, no filtering), enough for small pixel art
const png = (width, height, rgba) => {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8 bits, RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

// A sprite (rows of palette letters, "." = empty) centred on a size x size grid,
// drawn `cell` pixels per square. The editor reads the centre of each square back.
const drawing = (rows, size, cell = 16) => {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const scale = Math.max(1, Math.floor(Math.min(size / w, size / h)));
  const top = Math.floor((size - h * scale) / 2);
  const left = Math.floor((size - w * scale) / 2);
  const px = size * cell;
  const rgba = Buffer.alloc(px * px * 4);
  rows.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      const hex = PALETTE[ch];
      if (!hex) return;
      const [R, G, B] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
      for (let y = (top + r * scale) * cell; y < (top + (r + 1) * scale) * cell; y++)
        for (let x = (left + c * scale) * cell; x < (left + (c + 1) * scale) * cell; x++)
          rgba.set([R, G, B, 255], (y * px + x) * 4);
    })
  );
  return png(px, px, rgba);
};

const avatar = (color) =>
  drawing(
    ["xxxxxxxx", "xxxxxxxx", "xkxxxxkx", "xxxxxxxx", "xkxxxxkx", "xxkkkkxx", "xxxxxxxx", "xxxxxxxx"].map((r) =>
      r.replace(/x/g, color)
    ),
    8
  );

const SPRITES = {
  heart: ["..rrrr....rrrr..", ".rrrrrr..rrrrrr.", ".rwwrrrrrrrrrrr.", ".rwrrrrrrrrrrrr.", ".rrrrrrrrrrrrrr.", "..rrrrrrrrrrrr..", "...rrrrrrrrrr...", "....rrrrrrrr....", ".....rrrrrr.....", "......rrrr......", ".......rr......."],
  mushroom: ["....rrrrrr....", "..rrwwrrrrrr..", ".rrwwwwrrwwrr.", ".rrrwwrrrwwwr.", "rrrrrrrrrrwwrr", "rwwrrrrrrrrrrr", "rwwwrrwwwrrrrr", ".rrrrrwwwrrrr.", "...ssssssss...", "...sskssksss..", "...ssssssss...", "....ssssss...."],
  tree: [".....dd.....", "....dggd....", "...dggggd...", "..dgggggd...", "...dgggd....", "..dgggggd...", ".dgggggggd..", "..dgggggd...", ".dgggggggd..", "dgggggggggd.", "....nn......", "....nn......", "...nnnn....."],
  ghost: ["....wwwww....", "..wwwwwwwww..", ".wwwwwwwwwww.", ".wwkkwwwkkww.", ".wwkbwwwkbww.", "wwwwwwwwwwwww", "wwwwwwwwwwwww", "wwwwwppwwwwww", "wwwwwwwwwwwww", "ww.www.www.ww", "w...w...w...w"],
  sword: ["..........ll", ".........lwl", "........lwl.", ".......lwl..", "......lwl...", ".....lwl....", "..n.lwl.....", "..nnwl......", "...nn.......", "..nkn.......", ".nk.........", "kk.........."],
  potion: [".....nn.....", ".....kk.....", "....kwwk....", "....kwwk....", "...kwwwwk...", "..kmmmmmmk..", ".kmmwmmmmmk.", ".kmwmmmmmmk.", ".kmmmmmmmmk.", ".kmmmmmmmmk.", "..kmmmmmmk..", "...kkkkkk..."],
  cactus: [".....gg.....", "....gggg....", "....gggg....", ".g..gggg....", "gg..gggg..g.", "gg..gggg.gg.", "ggggggggggg.", ".ggggggggg..", "....gggg....", "....gggg....", "....gggg....", "..oooooooo..", "...oooooo..."],
  sun: ["....yyyy....", "..yyyyyyyy..", ".yyyyyyyyyy.", "yyykyyyykyyy", "yyyyyyyyyyyy", "yyyyyyyyyyyy", "yykyyyyyykyy", "yyykkkkkkyyy", ".yyyyyyyyyy.", "..yyyyyyyy..", "....yyyy...."],
  house: ["......rr......", ".....rrrr.....", "....rrrrrr....", "...rrrrrrrr...", "..rrrrrrrrrr..", ".rrrrrrrrrrrr.", "..wwwwwwwwww..", "..wbbwwwwbbw..", "..wbbwwwwbbw..", "..wwwwnnwwww..", "..wwwwnnwwww..", "..wwwwnnwwww..", "gggggggggggggg"],
};

// ---------------------------------------------------------------- the data

// Login is by username; the email is shown too since sign-up asks for it
const USERS = [
  { username: "ana_pixels", email: "ana@example.com", color: "p" },
  { username: "bruno8bit", email: "bruno@example.com", color: "b" },
  { username: "carla.draws", email: "carla@example.com", color: "y" },
  { username: "new_user", email: "new@example.com", color: "c" }, // no projects: empty states
];

// size: canvas squares per side; sprite: null for a project never saved
const PROJECTS = [
  { author: "ana_pixels", name: "Mushroom", sprite: "mushroom", size: 16, shared: true, tags: ["Retro games", "Nature"], description: "A red mushroom with white spots." },
  { author: "ana_pixels", name: "Little house", sprite: "house", size: 32, shared: true, tags: ["Porto"], description: "A house with a red roof, drawn on a 32 by 32 canvas." },
  { author: "ana_pixels", name: "Heart", sprite: "heart", size: 16, group: "Valentines" },
  { author: "bruno8bit", name: "Sword", sprite: "sword", size: 16, shared: true, tags: ["Retro games"], description: "Steel blade, brown grip." },
  { author: "bruno8bit", name: "Purple potion", sprite: "potion", size: 16, shared: true, tags: ["Retro games", "Fantasy"], description: "" },
  { author: "bruno8bit", name: "Ghost", sprite: "ghost", size: 16, group: "Halloween" },
  { author: "bruno8bit", name: "Empty sketch", sprite: null, size: 20 },
  { author: "carla.draws", name: "Pine tree", sprite: "tree", size: 16, shared: true, tags: ["Nature"], description: "A pine tree for a forest tileset." },
  { author: "carla.draws", name: "Cactus", sprite: "cactus", size: 16, shared: true, tags: ["Nature", "Plants"], description: "Cactus in an orange pot." },
  { author: "carla.draws", name: "Happy sun", sprite: "sun", size: 12, shared: true, tags: [], description: "" },
];

const LIKES = {
  ana_pixels: ["Sword", "Pine tree"],
  bruno8bit: ["Mushroom", "Pine tree", "Cactus"],
  "carla.draws": ["Mushroom", "Sword", "Purple potion", "Little house"],
};

// Tags users added to the shared catalog (the rest are PRESET_TAGS)
const CREATED_TAGS = {
  bruno8bit: ["Fantasy"],
  "carla.draws": ["Plants", "Desert"],
};

// Easy to type, and passes the password rules (upper, lower, number, symbol, 8+)
const WORDS = ["Cactus", "Pixel", "Mango", "Comet", "Tiger", "Maple", "Pepper", "Ocean", "Rocket", "Violet"];
const randomPassword = () =>
  `${WORDS[crypto.randomInt(WORDS.length)]}-${WORDS[crypto.randomInt(WORDS.length)].toLowerCase()}-${crypto.randomInt(10, 100)}!`;

// ---------------------------------------------------------------- run

const TABLES = ["Likes", "Tag", "TagName", "Project", "Grupo", "User", "Image"]; // children first

const recreateTables = async () => {
  for (const table of TABLES) await q(`DROP TABLE IF EXISTS ${table}`);
  const schema = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8").replace(/^--.*$/gm, "");
  for (const statement of schema.split(";").map((s) => s.trim()).filter(Boolean)) await q(statement);
};

const insertImage = async (data) => (await q(`INSERT INTO Image (data,mime) VALUES (?,'image/png')`, [data])).insertId;

const main = async () => {
  const db = process.env.DB_NAME;
  const wipe = (process.argv.find((a) => a.startsWith("--wipe=")) || "").slice(7);
  if (!db || wipe !== db) {
    console.error(`This deletes every table in the database "${db}" and fills it with test data.`);
    console.error(`To go ahead, run: npm run seed -- --wipe=${db}`);
    process.exit(1);
  }

  // Everything goes through the same rules as the API, so the data is data the app could create
  const users = USERS.map((u) => ({ ...u, password: randomPassword() }));
  users.forEach((u) => assertFields({ username: u.username, email: u.email, password: u.password }));
  PROJECTS.forEach((p) => {
    assertFields({ projectName: p.name, canvasSize: p.size, description: p.description });
    if (p.group) assertFields({ groupName: p.group });
    for (const tag of p.tags || []) {
      const known = PRESET_TAGS.concat(...Object.values(CREATED_TAGS));
      if (!known.includes(tag)) throw new Error(`Project "${p.name}" uses "${tag}", which is not in the tag catalog`);
    }
    normalizeTags(p.tags || []);
  });

  console.log(`Recreating the tables in ${db}...`);
  await recreateTables();

  const userIds = {};
  for (const u of users) {
    const photo = await insertImage(avatar(u.color));
    const hash = await bcrypt.hash(u.password, 10);
    userIds[u.username] = (
      await q(`INSERT INTO User (username,email,password,photo) VALUES (?,?,?,?)`, [u.username, u.email, hash, photo])
    ).insertId;
  }

  for (const tag of PRESET_TAGS) await q(`INSERT INTO TagName (name) VALUES (?)`, [tag]);
  for (const [username, tags] of Object.entries(CREATED_TAGS)) {
    for (const tag of tags) {
      assertFields({ newTag: tag });
      await q(`INSERT INTO TagName (name,createdBy) VALUES (?,?)`, [tag, userIds[username]]);
    }
  }

  const groupIds = {};
  const projectIds = {};
  for (const p of PROJECTS) {
    const author = userIds[p.author];
    let group = null;
    if (p.group) {
      const key = `${p.author}/${p.group}`;
      groupIds[key] ??= (await q(`INSERT INTO Grupo (owner,name) VALUES (?,?)`, [author, p.group])).insertId;
      group = groupIds[key];
    }
    const image = p.sprite ? await insertImage(drawing(SPRITES[p.sprite], p.size)) : null;
    projectIds[p.name] = (
      await q(`INSERT INTO Project (name,author,grupo,description,shared,size,image) VALUES (?,?,?,?,?,?,?)`, [
        p.name, author, group, p.description || null, !!p.shared, p.size, image,
      ])
    ).insertId;
    for (const tag of normalizeTags(p.tags || [])) {
      await q(`INSERT INTO Tag (projectId,name) VALUES (?,?)`, [projectIds[p.name], tag]);
    }
  }

  for (const [username, names] of Object.entries(LIKES)) {
    for (const name of names) await q(`INSERT INTO Likes (userId,postId) VALUES (?,?)`, [userIds[username], projectIds[name]]);
  }

  console.log(`\nDone: ${users.length} users, ${Object.keys(groupIds).length} groups, ${PROJECTS.length} projects.`);
  console.log("Log in with the username and password:\n");
  console.table(users.map(({ username, email, password }) => ({ username, email, password })));
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => connection.end());
