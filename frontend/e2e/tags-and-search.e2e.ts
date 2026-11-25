import { expect, Page, Route, test } from "@playwright/test";

// The API is mocked: shared-projects filters this list like the backend does
// (every tag must match, ignoring case; search looks in name and description).
const POSTS = [
  { id: 1, author: 7, name: "Tiny cat", description: "A cat in a box", likes: 0, tags: ["Cats"] },
  { id: 2, author: 7, name: "Arcade", description: "Retro cabinet", likes: 0, tags: ["Retro games", "Cats"] },
  { id: 3, author: 7, name: "Porto", description: "The bridge", likes: 0, tags: ["Porto"] },
];

type Query = { tags: string[]; search: string };
let queries: Query[];

const sharedProjects = (route: Route) => {
  const url = new URL(route.request().url());
  const tags: string[] = JSON.parse(url.searchParams.get("tags") ?? "[]");
  const search = url.searchParams.get("search") ?? "";
  queries.push({ tags, search });
  const lower = (s: string) => s.toLowerCase();
  const body = POSTS.filter(
    (p) =>
      tags.every((t) => p.tags.some((pt) => lower(pt) === lower(t))) &&
      (lower(p.name).includes(lower(search)) || lower(p.description).includes(lower(search)))
  );
  return route.fulfill({ json: body });
};

const mockApi = async (page: Page) => {
  queries = [];
  // Registered first, so the specific routes below take priority
  await page.route("**/api/**", (route) =>
    route.fulfill({ status: 404, json: { error: "Not mocked" } })
  );
  await page.route("**/api/art/shared-projects**", sharedProjects);
  await page.route("**/api/users/name/**", (route) => route.fulfill({ json: { username: "rui" } }));
  await page.route("**/api/likes/number/**", (route) => route.fulfill({ json: { likes: 0 } }));
};

const lastQuery = () => queries[queries.length - 1];
const posts = (page: Page) => page.locator("button span").filter({ hasText: /^(Tiny cat|Arcade|Porto)$/ });

const openCommunity = async (page: Page) => {
  await mockApi(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Enter as guest" }).click();
  await page.getByRole("button", { name: "Community" }).click();
  await expect(posts(page)).toHaveCount(3);
};

const openCustomTags = async (page: Page) => {
  await page.getByRole("button", { name: "Filter by tags" }).click();
  await page.getByRole("button", { name: "Custom" }).click();
};

const addCustomTag = async (page: Page, tag: string) => {
  await page.getByLabel("New tag").fill(tag);
  await page.getByLabel("New tag").press("Enter");
};

const closeModal = (page: Page) => page.mouse.click(5, 5);

test.describe("tags", () => {
  test("a custom tag is cleaned up, selected and used to filter", async ({ page }) => {
    await openCommunity(page);
    await openCustomTags(page);

    await addCustomTag(page, "  retro   GAMES ");

    await expect(page.getByRole("button", { name: "retro GAMES", exact: true })).toBeVisible();
    await expect(page.getByLabel("New tag")).toHaveValue("");
    await expect.poll(() => lastQuery().tags).toEqual(["retro GAMES"]);
    await expect(posts(page)).toHaveText(["Arcade"]);
  });

  test("blank and duplicate custom tags are ignored", async ({ page }) => {
    await openCommunity(page);
    await openCustomTags(page);

    await addCustomTag(page, "   ");
    await addCustomTag(page, "Cats");
    await addCustomTag(page, "CATS");
    // Typing a preset name selects the preset itself
    await addCustomTag(page, "porto");

    await expect.poll(() => lastQuery().tags).toEqual(["Cats", "Porto"]);
    await expect(posts(page)).toHaveCount(0);
    await expect(page.getByText("No shared projects match your search or tags")).toBeVisible();
  });

  test("several tags only show posts that have all of them", async ({ page }) => {
    await openCommunity(page);
    await openCustomTags(page);

    await addCustomTag(page, "Cats");
    await expect(posts(page)).toHaveText(["Tiny cat", "Arcade"]);
    await addCustomTag(page, "Retro games");
    await expect(posts(page)).toHaveText(["Arcade"]);
  });

  test("preset tags are added and removed from their category", async ({ page }) => {
    await openCommunity(page);
    await page.getByRole("button", { name: "Filter by tags" }).click();
    await page.getByRole("button", { name: "Cities" }).click();

    await page.locator("#filter-modal").getByRole("button", { name: "Porto", exact: true }).click();
    await expect.poll(() => lastQuery().tags).toEqual(["Porto"]);
    await expect(posts(page)).toHaveText(["Porto"]);

    await page.locator("#filter-modal").getByRole("button", { name: "Porto", exact: true }).click();
    await expect.poll(() => lastQuery().tags).toEqual([]);

    await page.getByRole("button", { name: "Add all" }).click();
    await expect.poll(() => lastQuery().tags).toEqual(["London", "Porto", "Milan"]);
    await page.getByRole("button", { name: "Remove all" }).click();
    await expect.poll(() => lastQuery().tags).toEqual([]);
  });

  test("a custom tag is removed from the modal and from its chip", async ({ page }) => {
    await openCommunity(page);
    await openCustomTags(page);
    await addCustomTag(page, "Cats");
    await addCustomTag(page, "Pixel");

    // In the modal, clicking a selected custom tag removes it
    await page.getByRole("button", { name: "Pixel", exact: true }).click();
    await expect.poll(() => lastQuery().tags).toEqual(["Cats"]);
    await expect(page.getByRole("button", { name: "Pixel", exact: true })).toBeHidden();

    await closeModal(page);
    await page.getByRole("button", { name: "Remove Cats" }).click();
    await expect.poll(() => lastQuery().tags).toEqual([]);
    // With no tags left, only the filter button remains
    await expect(page.getByRole("list", { name: "Selected tags" })).toBeHidden();
    await expect(posts(page)).toHaveCount(3);
  });

  test("tags with characters like & and # reach the server intact", async ({ page }) => {
    await openCommunity(page);
    await openCustomTags(page);
    await addCustomTag(page, "R&B #1");
    await expect.poll(() => lastQuery().tags).toEqual(["R&B #1"]);
  });
});

test.describe("search", () => {
  test("searches while typing, once, 150 ms after the last keystroke", async ({ page }) => {
    await openCommunity(page);
    const before = queries.length;

    await page.getByLabel("Search posts").pressSequentially("retro", { delay: 40 });
    // Not sent while the person is still typing
    expect(queries.length).toBe(before);

    await expect(posts(page)).toHaveText(["Arcade"]);
    expect(queries.slice(before)).toEqual([{ tags: [], search: "retro" }]);
  });

  test("search looks in the description too and combines with tags", async ({ page }) => {
    await openCommunity(page);
    await page.getByLabel("Search posts").fill("box");
    await expect(posts(page)).toHaveText(["Tiny cat"]);

    await page.getByLabel("Search posts").fill("a");
    await openCustomTags(page);
    await addCustomTag(page, "Retro games");
    await expect.poll(lastQuery).toEqual({ tags: ["Retro games"], search: "a" });
    await expect(posts(page)).toHaveText(["Arcade"]);
  });

  test("the magnifier turns into a cross that clears the search", async ({ page }) => {
    await openCommunity(page);
    const clear = page.getByRole("button", { name: "Clear search" });
    await expect(clear).toBeHidden();

    await page.getByLabel("Search posts").fill("porto");
    await expect(posts(page)).toHaveText(["Porto"]);
    await clear.click();

    await expect(page.getByLabel("Search posts")).toHaveValue("");
    await expect(clear).toBeHidden();
    await expect.poll(() => lastQuery().search).toBe("");
    await expect(posts(page)).toHaveCount(3);
  });

  test("Escape clears the search", async ({ page }) => {
    await openCommunity(page);
    await page.getByLabel("Search posts").fill("porto");
    await expect(posts(page)).toHaveText(["Porto"]);
    await page.getByLabel("Search posts").press("Escape");
    await expect(posts(page)).toHaveCount(3);
  });
});

test("sharing a project sends the selected tags", async ({ page }) => {
  await mockApi(page);
  let shareBody: any;
  let shared = 0;
  await page.route("**/api/art/project-owner/5", (route) => route.fulfill({ json: { author: 7 } }));
  await page.route("**/api/users/id?**", (route) => route.fulfill({ json: { id: 7 } }));
  await page.route("**/api/art/is-shared/5", (route) => route.fulfill({ json: { shared } }));
  await page.route("**/api/art/add-image", (route) => route.fulfill({ json: {} }));
  await page.route("**/api/art/share-project", (route) => {
    shareBody = route.request().postDataJSON();
    shared = 1;
    return route.fulfill({ json: { s: {} } });
  });
  await page.addInitScript(() => localStorage.setItem("token", "test-token"));

  await page.goto("/canvas/5");
  await page.getByRole("button", { name: "Project actions" }).click();
  await page.getByRole("menuitem", { name: "Share to community" }).click();

  await page.getByRole("button", { name: "Anime" }).click();
  await page.getByRole("button", { name: "Pokemon", exact: true }).click();
  await page.getByRole("button", { name: "Naruto", exact: true }).click();
  await page.getByRole("button", { name: "Naruto", exact: true }).click(); // removed again
  await page.getByRole("button", { name: "Custom" }).click();
  await addCustomTag(page, " Retro  games");
  await page.getByRole("button", { name: "Next" }).click();
  await page.locator("textarea").fill("My arcade");
  await page.getByRole("button", { name: "Share", exact: true }).click();

  await expect.poll(() => shareBody).toBeTruthy();
  expect(shareBody.tags).toEqual(["Pokemon", "Retro games"]);
  expect(shareBody.description).toBe("My arcade");
  await page.getByRole("button", { name: "Project actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Already shared" })).toBeDisabled();
});

test("selected tags sit next to the filter button on the right", async ({ page }) => {
  await openCommunity(page);
  const filterButton = page.getByRole("button", { name: "Filter by tags" });
  const rightEdge = async () => {
    const box = (await filterButton.boundingBox())!;
    return box.x + box.width;
  };
  const header = (await page.getByLabel("Search posts").boundingBox())!;
  const before = await rightEdge();
  expect(before).toBeGreaterThan(header.x + header.width);

  await openCustomTags(page);
  await addCustomTag(page, "Cats");
  await closeModal(page);

  const tags = page.getByRole("list", { name: "Selected tags" });
  await expect(tags.getByText("Cats")).toBeVisible();
  // The button stays put and the tags line up to its left
  expect(await rightEdge()).toBe(before);
  const tagsBox = (await tags.boundingBox())!;
  expect(tagsBox.x + tagsBox.width).toBeLessThanOrEqual((await filterButton.boundingBox())!.x);
});
