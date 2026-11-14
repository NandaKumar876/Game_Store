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
