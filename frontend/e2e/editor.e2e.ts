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
  const button = page.getByRole("button", { name: tool, exact: true });
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
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
  await page.getByRole("button", { name: "Project actions" }).click();
  await page.getByRole("menuitem", { name: "Download as PNG" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("project.png");
  const file = await readFile(await download.path());
  // PNG signature: \x89 P N G \r \n \x1a \n
  expect([...file.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
});

test("Export as SVG saves an SVG with one rect per run of painted cells", async ({ page }) => {
  await setColour(page, "#ff0000");
  await clickCell(page, 2, 3);
  await clickCell(page, 3, 3);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Project actions" }).click();
  await page.getByRole("menuitem", { name: "Export as SVG" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe("project.svg");
  const text = await readFile(await download.path(), "utf8");
  // Parse with the browser's XML parser: a malformed file yields a <parsererror> document
  const svg = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, "image/svg+xml");
    const root = doc.documentElement;
    return {
      root: root.nodeName,
      viewBox: root.getAttribute("viewBox"),
      title: root.querySelector("title")?.textContent,
      rects: [...root.querySelectorAll("rect")].map((r) =>
        ["x", "y", "width", "height", "fill"].map((a) => r.getAttribute(a))
      ),
    };
  }, text);

  // The two adjacent red cells are merged into one 2-cell-wide rect (cells are 10 units)
  expect(svg).toEqual({
    root: "svg",
    viewBox: `0 0 ${GRID * 10} ${GRID * 10}`,
    title: "E2E",
    rects: [["20", "30", "20", "10", "#ff0000"]],
  });
});

test("the toolbar sits under the centred canvas", async ({ page }) => {
  const box = (await canvas(page).boundingBox())!;
  const toolbar = (await page.getByRole("toolbar", { name: "Canvas tools" }).boundingBox())!;
  const viewport = page.viewportSize()!;

  expect(toolbar.y).toBeGreaterThan(box.y + box.height);
  expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(4);
});

test("the actions menu closes on Escape", async ({ page }) => {
  await page.getByRole("button", { name: "Project actions" }).click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
});

test("a reference image is set behind the canvas and can be removed", async ({ page }) => {
  await page.getByLabel("Reference image file").setInputFiles({
    name: "ref.png",
    mimeType: "image/png",
    // 1x1 transparent PNG
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    ),
  });
  await expect(page.getByRole("button", { name: "Change reference image" })).toBeVisible();
  await page.getByRole("button", { name: "Remove reference image" }).click();
  await expect(page.getByRole("button", { name: "Add reference image" })).toBeVisible();
});

test("the reference image button sits outside the canvas's top-right corner", async ({ page }) => {
  const box = (await canvas(page).boundingBox())!;
  const button = (await page.getByRole("button", { name: "Add reference image" }).boundingBox())!;

  expect(button.x).toBeGreaterThanOrEqual(box.x + box.width);
  expect(Math.abs(button.y - box.y)).toBeLessThan(4);
});

test("the reference image button explains itself in a tooltip", async ({ page }) => {
  const button = page.getByRole("button", { name: "Add reference image" });
  const tooltip = page.getByRole("tooltip");

  await button.hover();
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toContainText("behind the grid");
  await expect(button).toHaveAttribute("aria-describedby", "app-tooltip");

  await page.keyboard.press("Escape");
  await expect(tooltip).toBeHidden();
  await expect(button).not.toHaveAttribute("aria-describedby", /app-tooltip/);
});

test("the eyedropper tooltip has a lightbulb hint about the reference image", async ({ page }) => {
  await page.getByRole("button", { name: "Eyedropper" }).hover();
  const hint = page.getByRole("tooltip").locator(".tooltip__hint");
  await expect(hint).toBeVisible();
  await expect(hint).toContainText("💡");
  await expect(hint).toContainText("reference image");
});

test("the cursor is a hand while panning, also when holding space", async ({ page }) => {
  const cursor = () => canvas(page).evaluate((c) => getComputedStyle(c).cursor);
  const { x, y } = (await canvas(page).boundingBox())!;
  expect(await cursor()).not.toMatch(/grab/);

  // Space held: open hand, closed hand while dragging
  await page.keyboard.down("Space");
  await expect.poll(cursor).toBe("grab");
  await page.mouse.move(x + 50, y + 50);
  await page.mouse.down();
  await expect.poll(cursor).toBe("grabbing");
  await page.mouse.up();
  await page.keyboard.up("Space");
  await expect.poll(cursor).not.toMatch(/grab/);

  // Move tool selected: same hand without the keyboard
  await page.getByRole("button", { name: "Move canvas" }).click();
  await expect.poll(cursor).toBe("grab");
});

test("the theme follows the system's dark mode", async ({ page }) => {
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(bg).toBe("rgb(255, 255, 255)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(bg).toBe("rgb(15, 26, 26)");
});

test("keyboard shortcuts switch tools, but not while typing", async ({ page }) => {
  await page.keyboard.press("e");
  await expect(page.getByRole("button", { name: "Eraser", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("h");
  await expect(page.getByRole("button", { name: "Move canvas" })).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("b");
  await expect(page.getByRole("button", { name: "Brush", exact: true })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Current colour" }).click();
  await page.getByLabel("hex").press("e");
  await expect(page.getByRole("button", { name: "Brush", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("the shortcuts sidebar sits left of the canvas and remembers being collapsed", async ({ page }) => {
  const tab = page.getByRole("button", { name: "Keyboard shortcuts" });
  const list = page.locator("#shortcuts-list");
  const box = (await canvas(page).boundingBox())!;

  await expect(list).toBeVisible();
  await expect(list).toContainText("Eraser");
  const listBox = (await list.boundingBox())!;
  expect(listBox.x + listBox.width).toBeLessThanOrEqual(box.x);

  await tab.hover();
  await expect(page.getByRole("tooltip")).toContainText("Hide the keyboard shortcuts");

  await tab.click();
  await expect(list).toBeHidden();
  await expect(tab).toHaveAttribute("aria-expanded", "false");
  const tabBox = (await tab.boundingBox())!;
  expect(tabBox.x + tabBox.width).toBeLessThanOrEqual(box.x);

  await page.mouse.move(0, 0);
  await tab.hover();
  await expect(page.getByRole("tooltip")).toContainText("keys for the tools");

  // Still collapsed on the next visit to the editor
  expect(await page.evaluate(() => localStorage.getItem("shortcuts-panel-open"))).toBe("false");
});

test("the shortcuts tab stays in the same place open or closed", async ({ page }) => {
  const tab = page.getByRole("button", { name: "Keyboard shortcuts" });
  const open = (await tab.boundingBox())!;
  await tab.click();
  await expect(tab).toHaveAttribute("aria-expanded", "false");
  expect(await tab.boundingBox()).toEqual(open);
  await tab.click();
  await expect(tab).toHaveAttribute("aria-expanded", "true");
  expect(await tab.boundingBox()).toEqual(open);
});

test("the shortcuts card keeps its border after switching from dark to light", async ({ page }) => {
  const border = () =>
    page.locator("#shortcuts-list").evaluate((el) => {
      const s = getComputedStyle(el);
      return `${s.borderTopWidth} ${s.borderTopStyle} ${s.borderTopColor}`;
    });
  await page.getByRole("button", { name: "Dark theme" }).click();
  await expect.poll(border).toMatch(/^1px solid rgba\(220, 235, 235/);
  await page.getByRole("button", { name: "Light theme" }).click();
  await expect.poll(border).toMatch(/^1px solid rgba\(31, 59, 59/);
});

test("dragging moves the drawing the same way as the pointer", async ({ page }) => {
  await setColour(page, "#ff0000");
  await clickCell(page, 5, 5);
  const box = (await canvas(page).boundingBox())!;
  const centre = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  // Zoom in so there is room to pan
  await page.mouse.move(centre.x, centre.y);
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, -100);

  // Average x of the red pixels on the canvas
  const redX = () =>
    canvas(page).evaluate((c: HTMLCanvasElement) => {
      const { data, width } = c.getContext("2d")!.getImageData(0, 0, c.width, c.height);
      let sum = 0;
      let n = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 255 && data[i + 1] === 0 && data[i + 2] === 0) {
          sum += (i / 4) % width;
          n++;
        }
      }
      return n ? sum / n : NaN;
    });
  const before = await redX();
  expect(before).not.toBeNaN();

  await page.keyboard.down("Space");
  await page.mouse.down();
  for (let dx = 10; dx <= 150; dx += 10) await page.mouse.move(centre.x + dx, centre.y);
  await page.mouse.up();
  await page.keyboard.up("Space");

  await expect.poll(redX).toBeGreaterThan(before);
});

test("scrolling over the canvas doesn't scroll the page", async ({ page }) => {
  // Short viewport so the page itself can scroll
  await page.setViewportSize({ width: 390, height: 600 });
  const canvasTop = async () => (await canvas(page).boundingBox())!.y;
  const before = await canvasTop();

  await canvas(page).hover();
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(200);
  expect(await canvasTop()).toBe(before);

  // Control: the same wheel next to the canvas does scroll, so the check above means something
  await page.mouse.move(5, 300);
  await page.mouse.wheel(0, 300);
  await expect.poll(canvasTop).toBeLessThan(before);
});
