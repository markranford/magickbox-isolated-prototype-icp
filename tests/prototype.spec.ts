import { expect, test } from "@playwright/test";
import axe from "axe-core";

test("landing route preserves observable UX and has no runtime errors", async ({ page }, testInfo) => {
  const browserMessages: string[] = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      browserMessages.push(`${message.type()}: ${message.text()}`);
    }
  });

  await page.goto("/");
  await expect(page).toHaveTitle(/Magick Box Rewrite Readiness Prototype/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Create Anything with AI - Faster Than Ever",
  );
  await expect(page.getByRole("link", { name: "Launch Beta" })).toBeVisible();
  await page.screenshot({
    path: testInfo.project.name.includes("mobile")
      ? "docs/artifacts/prototype/prototype-home-mobile.png"
      : "docs/artifacts/prototype/prototype-home-desktop.png",
    fullPage: false,
  });

  await page.addScriptTag({ content: axe.source });
  const axeResults = await page.evaluate(async () => {
    const result = await window.axe.run(document, {
      rules: {
        "color-contrast": { enabled: true },
      },
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
    }));
  });

  expect(axeResults).toEqual([]);
  expect(browserMessages).toEqual([]);
});

test("Launch Beta enters the app shell and chat controls respond locally", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Launch Beta" }).click();
  await expect(page).toHaveURL(/\/home\/explore\?category=latest/);
  await expect(page.getByRole("heading", { name: "Explore" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Latest" })).toHaveAttribute("aria-selected", "true");

  const mobileMenu = page.getByRole("button", { name: "Open navigation" });
  if (await mobileMenu.isVisible()) {
    await mobileMenu.click();
  }
  await page.getByRole("link", { name: "Create" }).click();
  await expect(page.getByRole("heading", { name: "What are we creating today?" })).toBeVisible();
  await page.getByRole("tab", { name: "Music Creation" }).click();
  await page.getByLabel("Ask Magick Friend").fill("Make a product theme");
  await page.getByRole("button", { name: "Submit prompt" }).click();
  await expect(page.getByRole("status")).toContainText("Music Creation queued locally");
});

declare global {
  interface Window {
    axe: typeof axe;
  }
}
