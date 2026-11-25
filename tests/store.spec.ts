import { test, expect } from "@playwright/test";
test("browse, save, persist cart, and preview checkout", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Reality is overrated." }),
  ).toBeVisible();
  await expect(page.locator(".game-card")).toHaveCount(8);
  await page.getByRole("button", { name: "Racing", exact: true }).click();
  await expect(page.locator(".game-card")).toHaveCount(1);
  await expect(page.locator(".game-title")).toHaveText("Forza Horizon 5");
  await page.getByRole("button", { name: "All games", exact: true }).click();
  await page.getByRole("textbox", { name: "Search games" }).fill("cyberpunk");
  await expect(page.locator(".game-card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Add to wishlist: Cyberpunk 2077",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Add Cyberpunk 2077 to cart", exact: true })
    .click();
  await page.reload();
  await page
    .getByRole("button", { name: "Cart", exact: false })
    .filter({ has: page.locator("b") })
    .click();
  await expect(page.locator("dialog")).toBeVisible();
  await expect(page.locator(".cart-row")).toHaveCount(1);
  await expect(page.locator(".receipt-total")).toContainText("$29.99");
  await page
    .getByRole("button", { name: "Preview checkout", exact: true })
    .click();
  await expect(
    page.getByText("Payments and game delivery", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back to your cart" }).click();
  await page
    .getByRole("button", { name: "Remove Cyberpunk 2077", exact: true })
    .click();
  await expect(
    page.getByText("Your next favorite is out there."),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Open wishlist" }).click();
  await expect(page.locator(".cart-row")).toHaveCount(1);
});
test("responsive layout, images, sorting and empty search", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".game-card")).toHaveCount(8);
  await page.locator("#catalog").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".game-art img")
        .evaluateAll((imgs) =>
          imgs.every(
            (img) =>
              (img as HTMLImageElement).complete &&
              (img as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByLabel("Sort games").selectOption("low");
  await expect(page.locator(".game-title").first()).toHaveText(
    "Stardew Valley",
  );
  await page.getByRole("textbox", { name: "Search games" }).fill("not-a-game");
  await expect(
    page.getByRole("heading", { name: "No worlds found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator(".game-card")).toHaveCount(8);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("storefront.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("server catalog filters and checkout rejects invalid carts and ignores client prices", async ({
  request,
}) => {
  const catalog = await request.get(
    "/api/store?genre=RPG&sort=low&maxPrice=35",
  );
  expect(catalog.ok()).toBe(true);
  expect(catalog.headers()["cache-control"]).toBe("no-store");
  expect(
    (await catalog.json()).games.map((game: { title: string }) => game.title),
  ).toEqual(["Cyberpunk 2077"]);
  const search = await request.get("/api/store?q=%20FORZA%20");
  expect((await search.json()).games).toHaveLength(1);
  expect((await request.get("/api/store?maxPrice=invalid")).status()).toBe(400);
  for (const ids of [[], [1091500, 1091500], [999], ["1091500"]]) {
    expect(
      (
        await request.post("/api/store", { data: { ids, demo: true } })
      ).status(),
    ).toBe(400);
  }
  expect(
    (await request.post("/api/store", { data: { ids: [1091500] } })).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/store", {
        data: "invalid",
        headers: { "Content-Type": "application/json" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/store", { data: { padding: "x".repeat(5000) } })
    ).status(),
  ).toBe(413);
  const order = await request.post("/api/store", {
    data: { ids: [1091500, 1145360], demo: true, totalCents: 1, price: 0 },
  });
  expect(order.ok()).toBe(true);
  const receipt = await order.json();
  expect(receipt.totalCents).toBe(4248);
  expect(receipt.items).toHaveLength(2);
  expect(receipt.demo).toBe(true);
  expect(receipt.id).toMatch(/^[0-9a-f-]{36}$/);
});

test("complete a server-validated demo order and persist the library", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".catalog-status")).toHaveText("8 of 8 adventures");
  await page
    .getByRole("button", { name: "Add Hades to cart", exact: true })
    .click();
  await page.getByRole("button", { name: "Cart", exact: true }).click();
  await page
    .getByRole("button", { name: "Preview checkout", exact: true })
    .click();
  await page.getByRole("button", { name: "Complete demo order" }).click();
  await expect(
    page.getByRole("heading", { name: "Your next world is waiting." }),
  ).toBeVisible();
  await expect(page.locator(".receipt-total")).toContainText("$12.49");
  await expect(page.locator(".order-reference")).toContainText("Demo receipt:");
  await page
    .getByRole("button", { name: "Open demo library", exact: true })
    .last()
    .click();
  await expect(page.locator("dialog .cart-row")).toHaveCount(1);
  await expect(page.locator("dialog .cart-row")).toContainText("Hades");
  await page.keyboard.press("Escape");
  await page.reload();
  await page
    .getByRole("button", { name: "Open demo library", exact: true })
    .click();
  await expect(page.locator("dialog .cart-row")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Cart", exact: true }).click();
  await expect(page.locator("dialog .cart-row")).toHaveCount(0);
});

test("checkout errors preserve the cart and allow retry", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Add Hades to cart", exact: true })
    .click();
  await page.getByRole("button", { name: "Cart", exact: true }).click();
  await page
    .getByRole("button", { name: "Preview checkout", exact: true })
    .click();
  await page.route("**/api/store", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Temporarily unavailable. Please try again.",
        }),
      });
    } else await route.continue();
  });
  await page.getByRole("button", { name: "Complete demo order" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Temporarily unavailable",
  );
  await expect(page.locator(".receipt-total")).toContainText("$12.49");
  await page.unroute("**/api/store");
  await page.getByRole("button", { name: "Complete demo order" }).click();
  await expect(
    page.getByRole("heading", { name: "Your next world is waiting." }),
  ).toBeVisible();
});

test("catalog fallback can recover and filters combine", async ({ page }) => {
  await page.route("**/api/store", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".catalog-status")).toContainText(
    "Offline preview",
  );
  await expect(page.locator(".game-card")).toHaveCount(8);
  await page.unroute("**/api/store");
  await page.getByRole("button", { name: "Retry catalog" }).click();
  await expect(page.locator(".catalog-status")).toHaveText("8 of 8 adventures");
  await page.getByLabel("Your budget").selectOption("15");
  await expect(page.locator(".game-card")).toHaveCount(2);
  await page.getByRole("button", { name: "RPG", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No worlds found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator(".game-card")).toHaveCount(8);
  await page.getByLabel("Sort games").selectOption("discount");
  await expect(page.locator(".game-title").first()).toHaveText(
    "Red Dead Redemption 2",
  );
});

test("spotlight is controllable and respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("main")).toHaveAttribute("data-motion", "off");
  await page.locator("#spotlight").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Next featured game" }).click();
  await expect(page.locator("#spotlight h2")).toHaveText("Elden Ring.");
  await page
    .getByRole("button", { name: "Discover Elden Ring", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Elden Ring", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Previous featured game" }).click();
  await expect(page.locator("#spotlight h2")).toHaveText("Cyberpunk 2077.");
  expect(
    await page
      .locator(".spotlight-backdrop")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("motion can be paused and corrupt browser storage is safe", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("orbit-cart", "broken-json");
    localStorage.setItem("orbit-library", '[null,999,"bad"]');
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-motion", "off");
  expect(
    await page
      .locator(".starfield")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  await page.getByRole("button", { name: "Cart", exact: true }).click();
  await expect(
    page.getByText("Your next favorite is out there."),
  ).toBeVisible();
});
