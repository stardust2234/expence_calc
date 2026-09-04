import { expect, test } from "@playwright/test";

test.describe("responsive and print layouts", () => {
  test("keeps navigation and calculators usable on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.locator(".menu-button")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Big purchase" }),
    ).toBeVisible();
    const columns = await page
      .locator(".grid")
      .evaluate((element) =>
        getComputedStyle(element)
          .gridTemplateColumns.split(" ")
          .filter(Boolean),
      );
    expect(columns).toHaveLength(1);

    await page.getByText("Results", { exact: true }).click();
    await expect(page.locator(".results-page")).toBeVisible();
    const actionsFit = await page
      .locator(".results-actions")
      .evaluate((element) => {
        const buttons = [...element.querySelectorAll("button")];
        return buttons.every(
          (button) =>
            button.getBoundingClientRect().right <=
            element.getBoundingClientRect().right + 1,
        );
      });
    expect(actionsFit).toBe(true);
  });

  test("removes interactive controls from the print view", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Results", { exact: true }).click();
    await page.emulateMedia({ media: "print" });

    await expect(page.locator(".results-actions")).toBeHidden();
    await expect(page.locator("aside")).toBeHidden();
    await expect(page.locator(".results-page")).toBeVisible();
  });

  test("keeps Results accessible below 480px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const resultsTab = page.getByRole("button", { name: "Results" });
    await resultsTab.scrollIntoViewIfNeeded();
    await expect(resultsTab).toBeVisible();
    await resultsTab.click();
    await expect(page.locator(".results-page")).toBeVisible();
  });
});
