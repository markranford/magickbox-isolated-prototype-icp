#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targetUrl =
  process.env.MAGICKBOX_LOCAL_ICP_URL ??
  "http://frontend.local.localhost:8010/home/magick-chat";
const workerExecuteUrl =
  process.env.VITE_MAGICKBOX_BROWSER_WORKER_URL ??
  `http://127.0.0.1:${process.env.MAGICKBOX_WORKER_PORT ?? "8788"}/execute`;
const artifactPath = resolve(root, "docs/artifacts/prototype/local-icp-ui-worker-generation.png");

function workerRootFromExecuteUrl(executeUrl) {
  const url = new URL(executeUrl);
  url.pathname = url.pathname.replace(/\/execute\/?$/, "");
  url.search = "";
  url.hash = "";

  return url.toString().replace(/\/$/, "");
}

async function waitForHealth(url, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) {
        return true;
      }
    } catch {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 1_000));
    }
  }

  throw new Error(`Worker service did not become healthy at ${url}`);
}

async function isHealthy(url) {
  try {
    const response = await fetch(`${url}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

function startWorker() {
  const parsedWorkerUrl = new URL(workerExecuteUrl);
  const child = spawn(process.execPath, ["scripts/local-worker-service.mjs"], {
    cwd: root,
    env: {
      ...process.env,
      MAGICKBOX_WORKER_HOST: parsedWorkerUrl.hostname,
      MAGICKBOX_WORKER_PORT: parsedWorkerUrl.port,
      MAGICKBOX_WORKER_MODEL: process.env.MAGICKBOX_WORKER_MODEL ?? "glm4:9b",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));

  return child;
}

async function main() {
  const workerRoot = workerRootFromExecuteUrl(workerExecuteUrl);
  const worker = (await isHealthy(workerRoot)) ? null : startWorker();
  let browser;

  try {
    await waitForHealth(workerRoot);

    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    await page.addInitScript((url) => {
      localStorage.setItem("magickbox.browserWorkerUrl.v1", url);
    }, workerExecuteUrl);

    await page.goto(targetUrl, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Use local browser identity" }).click();
    await page.getByLabel("AI provider route").selectOption("local_ollama");
    await page.getByLabel("Ask Magick Friend").fill(
      "Generate one concise Magick Box launch line and store it on ICP.",
    );
    await page.getByRole("button", { name: "Submit prompt" }).click();
    await page.getByText(/completed on ICP job/i).waitFor({ timeout: 180_000 });
    await page.getByText(/Latest job #/i).waitFor({ timeout: 20_000 });

    mkdirSync(dirname(artifactPath), { recursive: true });
    await page.screenshot({ path: artifactPath, fullPage: true });

    if (consoleErrors.length > 0) {
      throw new Error(`Browser console errors:\n${consoleErrors.join("\n")}`);
    }

    console.log(
      JSON.stringify(
        {
          status: "ok",
          targetUrl,
          workerUrl: workerExecuteUrl,
          workerStartedBySmoke: worker !== null,
          artifactPath,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser?.close();
    worker?.kill();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
