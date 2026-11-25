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
  catalog = { tags: [...CATALOG], createdByMe: 0, maxPerUser: 10 };
  await page.route("**/api/tags**", (route) => {
    if (route.request().method() === "POST") {
      const name = route.request().postDataJSON().name.trim().replace(/\s+/g, " ");
      catalog = { ...catalog, tags: [...catalog.tags, name].sort(), createdByMe: catalog.createdByMe + 1 };
      return route.fulfill({ json: { name } });
    }
    return route.fulfill({ json: catalog });
  });
};

// The shared tag catalog served by GET /api/tags
const CATALOG = ["Cats", "Pokemon", "Porto", "R&B #1", "Retro games"];
let catalog: { tags: string[]; createdByMe: number; maxPerUser: number };

const lastQuery = () => queries[queries.length - 1];
const posts = (page: Page) => page.locator("button span").filter({ hasText: /^(Tiny cat|Arcade|Porto)$/ });

const openCommunity = async (page: Page) => {
  await mockApi(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Enter as guest" }).click();
  await page.getByRole("button", { name: "Community" }).click();
  await expect(posts(page)).toHaveCount(3);
};

const tagsButton = (page: Page) => page.getByRole("button", { name: /^Tags/ });

const pickTags = async (page: Page, ...names: string[]) => {
  if ((await tagsButton(page).getAttribute("aria-expanded")) !== "true") await tagsButton(page).click();
  for (const name of names) await page.getByRole("option", { name, exact: true }).click();
};

test.describe("tags", () => {
  test("the dropdown lists only existing tags and stays open while picking", async ({ page }) => {
    await openCommunity(page);
    await tagsButton(page).click();

    const list = page.getByRole("listbox", { name: "Tags" });
    await expect(list.getByRole("option")).toHaveText(CATALOG);
    // filtering can't create tags
    await expect(page.getByLabel("New tag")).toHaveCount(0);

    await pickTags(page, "Cats");
    await expect(list).toBeVisible();
    await expect(page.getByRole("option", { name: "Cats" })).toHaveAttribute("aria-selected", "true");
    await expect.poll(() => lastQuery().tags).toEqual(["Cats"]);
    await expect(posts(page)).toHaveText(["Tiny cat", "Arcade"]);

    await pickTags(page, "Retro games");
    await expect(posts(page)).toHaveText(["Arcade"]);
    await expect(tagsButton(page)).toHaveAccessibleName("Tags, 2 selected");
  });

  test("unchecking a tag or removing its chip updates the filter", async ({ page }) => {
    await openCommunity(page);
    await pickTags(page, "Cats", "Pokemon", "Pokemon");
    await expect.poll(() => lastQuery().tags).toEqual(["Cats"]);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toBeHidden();
    await page.getByRole("button", { name: "Remove Cats" }).click();
    await expect.poll(() => lastQuery().tags).toEqual([]);
    await expect(page.getByRole("list", { name: "Selected tags" })).toBeHidden();
    await expect(posts(page)).toHaveCount(3);
  });

  test("the keyboard opens the list and Space checks the focused tag", async ({ page }) => {
    await openCommunity(page);
    await tagsButton(page).focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option", { name: "Cats" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press(" ");
    await expect.poll(() => lastQuery().tags).toEqual(["Pokemon"]);
    await page.keyboard.press("Escape");
    await expect(tagsButton(page)).toBeFocused();
  });

  test("tags with characters like & and # reach the server intact", async ({ page }) => {
    await openCommunity(page);
    await pickTags(page, "R&B #1");
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
    await pickTags(page, "Retro games");
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

  await tagsButton(page).click();
  await page.getByRole("option", { name: "Pokemon" }).click();
  // a new tag is created for everyone and checked at once
  await page.getByLabel("New tag").fill("  Retro   arcade ");
  await page.getByRole("button", { name: "Create tag" }).click();
  await expect(page.getByRole("option", { name: "Retro arcade" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("You can create 9 more.")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator("textarea").fill("My arcade");
  await page.getByRole("button", { name: "Share", exact: true }).click();

  await expect.poll(() => shareBody).toBeTruthy();
  expect(shareBody.tags).toEqual(["Pokemon", "Retro arcade"]);
  expect(shareBody.description).toBe("My arcade");
  await page.getByRole("button", { name: "Project actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Already shared" })).toBeDisabled();
});

test("selected tags sit next to the tags button on the right", async ({ page }) => {
  await openCommunity(page);
  const filterButton = tagsButton(page);
  const rightEdge = async () => {
    const box = (await filterButton.boundingBox())!;
    return box.x + box.width;
  };
  const header = (await page.getByLabel("Search posts").boundingBox())!;
  const before = await rightEdge();
  expect(before).toBeGreaterThan(header.x + header.width);

  await pickTags(page, "Cats");
  await page.keyboard.press("Escape");

  const tags = page.getByRole("list", { name: "Selected tags" });
  await expect(tags.getByText("Cats")).toBeVisible();
  // The button stays put and the tags line up to its left
  expect(await rightEdge()).toBe(before);
  const tagsBox = (await tags.boundingBox())!;
  expect(tagsBox.x + tagsBox.width).toBeLessThanOrEqual((await filterButton.boundingBox())!.x);
});

test("a user who created 10 tags can't create more", async ({ page }) => {
  await mockApi(page);
  catalog.createdByMe = 10;
  await page.route("**/api/art/project-owner/5", (route) => route.fulfill({ json: { author: 7 } }));
  await page.route("**/api/users/id?**", (route) => route.fulfill({ json: { id: 7 } }));
  await page.route("**/api/art/is-shared/5", (route) => route.fulfill({ json: { shared: 0 } }));
  await page.route("**/api/art/add-image", (route) => route.fulfill({ json: {} }));
  await page.addInitScript(() => localStorage.setItem("token", "test-token"));

  await page.goto("/canvas/5");
  await page.getByRole("button", { name: "Project actions" }).click();
  await page.getByRole("menuitem", { name: "Share to community" }).click();
  await tagsButton(page).click();

  await expect(page.getByRole("button", { name: "Create tag" })).toBeDisabled();
  await expect(page.getByLabel("New tag")).toBeDisabled();
  await expect(page.getByText("You've created 10 tags, the most allowed.")).toBeVisible();
  // existing tags can still be picked
  await page.getByRole("option", { name: "Cats" }).click();
  await expect(page.getByRole("option", { name: "Cats" })).toHaveAttribute("aria-selected", "true");
});
