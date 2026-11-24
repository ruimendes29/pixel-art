import { expect, Page, test } from "@playwright/test";

const POSTS = [
  { id: 1, author: 7, name: "Tiny cat", description: "A cat", likes: 3 },
  { id: 2, author: 7, name: "Porto", description: "The bridge", likes: 0 },
];

// A blank page means React unmounted the tree after an uncaught error, so
// every test also fails on any page error.
const openCommunity = async (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await page.getByRole("button", { name: "Enter as guest" }).click();
  await page.getByRole("button", { name: "Community" }).click();
  await expect(page).toHaveURL(/\/community$/);
  await expect(page.getByRole("button", { name: "No tag selected" })).toBeVisible();
  return errors;
};

test("community page renders when the API is down", async ({ page }) => {
  await page.route("**/api/**", (route) =>
    route.fulfill({ status: 503, json: { error: "No API in E2E tests" } })
  );

  const errors = await openCommunity(page);
  await expect(page.getByText("Could not load the community posts")).toBeVisible();
  expect(errors).toEqual([]);
});

test("community page lists shared posts", async ({ page }) => {
  await page.route("**/api/art/shared-projects**", (route) =>
    route.fulfill({ json: POSTS })
  );
  await page.route("**/api/users/name/**", (route) =>
    route.fulfill({ json: { username: "rui" } })
  );
  await page.route("**/api/likes/number/**", (route) =>
    route.fulfill({ json: { likes: 3 } })
  );
  // Images 404, so posts fall back to the placeholder
  await page.route(/\/api\/(art\/project-image|users\/photo)\//, (route) =>
    route.fulfill({ status: 404, json: { error: "Not found" } })
  );

  const errors = await openCommunity(page);
  await expect(page.getByText("Tiny cat")).toBeVisible();
  await expect(page.getByText("Porto")).toBeVisible();
  expect(errors).toEqual([]);
});
