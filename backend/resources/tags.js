// Tags come from the client, so they are checked and cleaned here before they
// reach the database: trimmed, single spaces, at most 50 characters (Tag.name),
// no blanks and no duplicates that differ only in case.
const MAX_TAG_LENGTH = 50;
const MAX_TAGS = 20;

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) throw new Error("Tags must be a list");
  const seen = new Set();
  const result = [];
  for (const raw of tags) {
    if (typeof raw !== "string") throw new Error("Each tag must be text");
    const tag = raw.trim().replace(/\s+/g, " ").slice(0, MAX_TAG_LENGTH).trim();
    const key = tag.toLowerCase();
    if (tag && !seen.has(key)) {
      seen.add(key);
      result.push(tag);
    }
  }
  if (result.length > MAX_TAGS) throw new Error(`A project can have at most ${MAX_TAGS} tags`);
  return result;
};

// The ?tags= query of /shared-projects: a JSON list, or nothing for no filter.
const parseTagsQuery = (query) => {
  if (query === undefined || query === "") return [];
  let parsed;
  try {
    parsed = JSON.parse(query);
  } catch {
    throw new Error("tags must be a JSON list");
  }
  return normalizeTags(parsed);
};

// The ?search= query: trimmed, single spaces, at most 100 characters.
const MAX_SEARCH_LENGTH = 100;
const parseSearchQuery = (query) =>
  typeof query === "string" ? query.trim().replace(/\s+/g, " ").slice(0, MAX_SEARCH_LENGTH) : "";

// Makes % and _ in user text match literally inside a LIKE pattern
const escapeLike = (text) => text.replace(/[\\%_]/g, (c) => `\\${c}`);

module.exports = {
  normalizeTags,
  parseTagsQuery,
  parseSearchQuery,
  escapeLike,
  MAX_TAG_LENGTH,
  MAX_TAGS,
};
