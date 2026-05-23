import { expect, test } from "@playwright/test";
import axe from "axe-core";
import { readFile } from "node:fs/promises";

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

test("Launch Beta enters the app shell and creation requires a real ICP runtime", async ({ page }) => {
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
  await expect(page.getByRole("status")).toContainText(
    "Open the local ICP asset canister to create a real ICP job",
  );
});

test("evaluation route exposes route parity and ICP readiness", async ({ page }) => {
  await page.goto("/evaluation");

  await expect(page.getByRole("heading", { name: "Rewrite Readiness Evaluation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "ICP Readiness" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "/", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Certified frontend" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Auth" })).toBeVisible();
  await expect(page.getByText(/local signed browser identity/).first()).toBeVisible();
});

test("sign-in route offers ICP identities without credential fields", async ({ page }) => {
  await page.goto("/auth/sign-in");

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in with Internet Identity" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Use local browser identity" })).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveCount(0);
  await expect(page.getByLabel("Password")).toHaveCount(0);
});

test("creation surface exposes provider choices and credit state", async ({ page }) => {
  await page.goto("/home/magick-chat");

  await page.getByRole("tab", { name: "Video Creation" }).click();
  await expect(page.getByLabel("AI provider route")).toContainText("MagickAI worker");
  await expect(page.getByText("25 credits")).toBeVisible();
});

test("admin route hides privileged owner controls from public sessions", async ({ page }) => {
  await page.goto("/home/admin");

  await expect(page.getByRole("heading", { name: "Superadmin" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "System Wallet" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Internet Identity principal" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Owner controls locked" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Owner access locked" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create funding wallet" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Claim superadmin" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Payment and credit controls" })).toHaveCount(0);
  await expect(page.getByText("Verify balance")).toHaveCount(0);
});

test("built assets include ICP asset canister routing policy", async () => {
  const policy = await readFile("dist/.ic-assets.json5", "utf8");

  expect(policy).toContain('"allow_raw_access": false');
  expect(policy).toContain('"enable_aliasing": true');
  expect(policy).toContain("Content-Security-Policy");
  expect(policy).toContain("http://127.0.0.1:*");
});

declare global {
  interface Window {
    axe: typeof axe;
  }
}
