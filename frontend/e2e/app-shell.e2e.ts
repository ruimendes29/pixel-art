import { expect, Page, test } from "@playwright/test";

// Navbar, forms and theme: things every page shares. The API is never reached.
test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", (route) => route.fulfill({ status: 503, json: {} }));
});

const navHeight = async (page: Page) => (await page.getByRole("navigation").boundingBox())!.height;
const shownTheme = (page: Page) => page.evaluate(() => document.documentElement.dataset.theme);

test("the navbar keeps its height after entering as a guest", async ({ page }) => {
  await page.goto("/");
  const before = await navHeight(page);
  await page.getByRole("button", { name: "Enter as guest" }).click();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Projects" }).first()).toBeVisible();
  expect(await navHeight(page)).toBe(before);
});

test("login inputs don't stretch across a big screen", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/home/login");
  const input = (await page.getByLabel("Username").boundingBox())!;
  expect(input.width).toBeLessThanOrEqual(28 * 16 + 1);
  expect(input.width).toBeGreaterThan(300);
});

test("the theme follows the system until the user picks one, and the pick is remembered", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  expect(await shownTheme(page)).toBe("dark");
  await expect(page.getByRole("button", { name: "System theme" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Light theme" }).click();
  expect(await shownTheme(page)).toBe("light");
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("light");

  // Still light after a reload, although the system is dark
  await page.reload();
  expect(await shownTheme(page)).toBe("light");
  await expect(page.getByRole("button", { name: "Light theme" })).toHaveAttribute("aria-pressed", "true");

  // Back to System: the saved choice is removed and the OS wins again
  await page.getByRole("button", { name: "System theme" }).click();
  expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
  expect(await shownTheme(page)).toBe("dark");
});

test("a saved theme is applied before the app renders (no flash)", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.emulateMedia({ colorScheme: "light" });
  let themeAtFirstPaint: string | undefined;
  await page.exposeFunction("reportTheme", (t: string) => (themeAtFirstPaint = t));
  await page.addInitScript(() =>
    document.addEventListener("DOMContentLoaded", () =>
      (window as any).reportTheme(document.documentElement.dataset.theme)
    )
  );
  await page.goto("/");
  await expect.poll(() => themeAtFirstPaint).toBe("dark");
});
