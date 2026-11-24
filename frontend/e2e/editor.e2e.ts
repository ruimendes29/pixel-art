import { readFile } from "node:fs/promises";
import { expect, Page, test } from "@playwright/test";

const GRID = 10; // cells per side of the project created in beforeEach
const RED = [255, 0, 0, 255];
const BLACK = [0, 0, 0, 255];
const EMPTY = [0, 0, 0, 0];

let apiCalls: string[];

// Guest flow: Home -> Enter as guest -> Projects -> New Project -> /canvas/null.
// Guests never call the API, and any request that tries is answered with 503
// and recorded, so the tests also prove the editor works without a backend.
test.beforeEach(async ({ page }) => {
  apiCalls = [];
  await page.route("**/api/**", (route) => {
    apiCalls.push(route.request().url());
    return route.fulfill({ status: 503, json: { error: "No API in E2E tests" } });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Enter as guest" }).click();
  await page.getByRole("button", { name: "Projects" }).click();
  await page.getByRole("button", { name: "New Project" }).click();
  await page.getByLabel("Project name").fill("E2E");
  await page.getByLabel("Canvas size").fill(String(GRID));
  await page.getByRole("button", { name: "Create Project" }).click();
  await expect(page).toHaveURL(/\/canvas\/null$/);
  await expect(canvas(page)).toBeVisible();
});

test.afterEach(() => {
  expect(apiCalls).toEqual([]);
});

const canvas = (page: Page) => page.getByLabel("Drawing canvas");

// Centre of a cell, in CSS pixels relative to the canvas element (1px border).
const cellPosition = async (page: Page, col: number, row: number) => {
  const width = await canvas(page).evaluate((c: HTMLCanvasElement) => c.width);
  const cell = width / GRID;
  return { x: 1 + cell * (col + 0.5), y: 1 + cell * (row + 0.5) };
};

// RGBA of the canvas pixel at the centre of a cell.
const pixelAt = (page: Page, col: number, row: number) =>
  canvas(page).evaluate(
    (c: HTMLCanvasElement, [col, row, grid]) => {
      const cell = c.width / grid;
      const { data } = c
        .getContext("2d")!
        .getImageData(Math.floor(cell * (col + 0.5)), Math.floor(cell * (row + 0.5)), 1, 1);
      return Array.from(data);
    },
    [col, row, GRID]
  );

const clickCell = async (page: Page, col: number, row: number) =>
  canvas(page).click({ position: await cellPosition(page, col, row) });

const selectTool = async (page: Page, tool: string) => {
  await page.getByRole("button", { name: "Drawing tools" }).click();
  await page.getByRole("button", { name: tool, exact: true }).click();
};

const setColour = async (page: Page, hex: string) => {
  await page.getByRole("button", { name: "Current colour" }).click();
  await page.getByLabel("hex").fill(hex);
  await page.getByRole("button", { name: "Current colour" }).click();
};

test("painting a cell fills its pixels with the current colour", async ({ page }) => {
  await setColour(page, "#ff0000");
  expect(await pixelAt(page, 2, 3)).toEqual(EMPTY);

  await clickCell(page, 2, 3);

  await expect.poll(() => pixelAt(page, 2, 3)).toEqual(RED);
  expect(await pixelAt(page, 3, 3)).toEqual(EMPTY);
});

test("the eraser clears a painted cell", async ({ page }) => {
  await clickCell(page, 4, 4);
  await expect.poll(() => pixelAt(page, 4, 4)).toEqual(BLACK);

  await selectTool(page, "Eraser");
  await clickCell(page, 4, 4);

  await expect.poll(() => pixelAt(page, 4, 4)).toEqual(EMPTY);
});

test("the eyedropper picks the colour of a painted cell", async ({ page }) => {
  const swatch = page.getByRole("button", { name: "Current colour" });
  await setColour(page, "#ff0000");
  await clickCell(page, 1, 1);
  await setColour(page, "#0000ff");
  await expect(swatch).toHaveCSS("background-color", "rgb(0, 0, 255)");

  await selectTool(page, "Eyedropper");
  await clickCell(page, 1, 1);

  await expect(swatch).toHaveCSS("background-color", "rgb(255, 0, 0)");
});

test("Download as PNG saves a PNG file", async ({ page }) => {
  await clickCell(page, 0, 0);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download as PNG" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("project.png");
  const file = await readFile(await download.path());
  // PNG signature: \x89 P N G \r \n \x1a \n
  expect([...file.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
});
