#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = resolve(root, "public/reference-assets/live-site");
const manifestPath = resolve(outputRoot, "media-manifest.json");
const summaryPath = resolve(root, "docs/evals/magickbox-live-media-assets.md");
const origin = "https://magickbox.ai";
const routes = [
  "/",
  "/#features",
  "/#gallery",
  "/#pricing",
  "/#about",
  "/#contact",
  "/home/explore?category=latest",
  "/home/magick-chat",
  "/home/subscriptions",
  "/signin",
];
const mediaPattern = /\.(png|jpe?g|webp|gif|svg|avif|ico|mp4|webm|mov|mp3|wav|m4a)(\?|#|$)/i;

function toAbsoluteUrl(value, baseUrl) {
  try {
    return new URL(value, baseUrl).href;
  } catch {
    return null;
  }
}

function addMediaUrl(urls, value, baseUrl) {
  if (!value) {
    return;
  }

  const absolute = toAbsoluteUrl(value, baseUrl);
  if (absolute && (mediaPattern.test(absolute) || absolute.includes("/_next/image"))) {
    urls.add(absolute);
  }
}

function safeSegment(value) {
  const safe = decodeURIComponent(value)
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return safe || "asset";
}

function localHostFolder(hostname) {
  if (hostname === "magickbox.ai") {
    return "magickbox-site";
  }

  if (hostname.includes("prod-gmi-magick-box")) {
    return "copied-production-media";
  }

  return safeSegment(hostname);
}

function localPathFor(sourceUrl, contentType) {
  const parsed = new URL(sourceUrl);
  const segments = parsed.pathname.split("/").filter(Boolean).map(safeSegment);
  let last = segments.pop() ?? "asset";
  const extension = extname(last);

  if (!extension) {
    const fallback =
      contentType?.includes("svg") ? ".svg" :
      contentType?.includes("png") ? ".png" :
      contentType?.includes("jpeg") ? ".jpg" :
      contentType?.includes("gif") ? ".gif" :
      contentType?.includes("webp") ? ".webp" :
      contentType?.includes("icon") ? ".ico" :
      ".bin";
    last = `${last}${fallback}`;
  }

  if (parsed.search) {
    const suffix = createHash("sha256").update(parsed.search).digest("hex").slice(0, 8);
    const ext = extname(last);
    last = `${last.slice(0, -ext.length)}-${suffix}${ext}`;
  }

  return resolve(outputRoot, localHostFolder(parsed.hostname), ...segments, last);
}

async function crawlMediaUrls() {
  const urls = new Set();
  const routeReports = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  page.on("requestfinished", (request) => addMediaUrl(urls, request.url(), page.url()));

  for (const route of routes) {
    const target = new URL(route, origin).href;
    try {
      await page.goto(target, { waitUntil: "networkidle", timeout: 30_000 });
      await page.evaluate(async () => {
        for (let y = 0; y <= document.body.scrollHeight; y += Math.max(600, window.innerHeight - 100)) {
          window.scrollTo(0, y);
          await new Promise((resolveScroll) => setTimeout(resolveScroll, 250));
        }
        window.scrollTo(0, 0);
        await new Promise((resolveScroll) => setTimeout(resolveScroll, 250));
      });

      const pageUrls = await page.evaluate(() => {
        const out = [];
        const push = (value) => {
          if (value) out.push(value);
        };

        document.querySelectorAll("img").forEach((img) => {
          push(img.currentSrc);
          push(img.src);
          push(img.getAttribute("src"));
          push(img.getAttribute("srcset"));
        });
        document.querySelectorAll("source").forEach((source) => {
          push(source.src);
          push(source.getAttribute("src"));
          push(source.getAttribute("srcset"));
        });
        document.querySelectorAll("video,audio").forEach((element) => {
          push(element.currentSrc);
          push(element.getAttribute("src"));
          push(element.getAttribute("poster"));
        });
        document
          .querySelectorAll('link[rel~="icon"], link[rel~="apple-touch-icon"], link[rel="manifest"]')
          .forEach((link) => push(link.href));
        document
          .querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')
          .forEach((meta) => push(meta.content));
        for (const element of document.querySelectorAll("*")) {
          const backgroundImage = getComputedStyle(element).backgroundImage;
          if (backgroundImage && backgroundImage !== "none") {
            for (const match of backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
              push(match[1]);
            }
          }
        }

        return out;
      });

      for (const value of pageUrls) {
        for (const part of String(value).split(",")) {
          addMediaUrl(urls, part.trim().split(/\s+/)[0], target);
        }
      }

      routeReports.push({ route: target, status: "ok", title: await page.title() });
    } catch (error) {
      routeReports.push({
        route: target,
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await browser.close();
  return { urls: [...urls].sort(), routeReports };
}

async function downloadAsset(sourceUrl) {
  const response = await fetch(sourceUrl, { redirect: "follow" });
  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const entry = {
    sourceUrl,
    status: response.status,
    contentType,
    bytes: 0,
    sha256: null,
    publicPath: null,
    localPath: null,
  };

  if (!response.ok || !contentType.startsWith("image/") && !contentType.startsWith("video/") && !contentType.startsWith("audio/")) {
    return entry;
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const localPath = localPathFor(sourceUrl, contentType);
  mkdirSync(dirname(localPath), { recursive: true });
  writeFileSync(localPath, bytes);

  entry.bytes = bytes.length;
  entry.sha256 = createHash("sha256").update(bytes).digest("hex");
  entry.localPath = relative(root, localPath).replaceAll("\\", "/");
  entry.publicPath = `/${relative(resolve(root, "public"), localPath).replaceAll("\\", "/")}`;
  return entry;
}

function writeSummary(manifest) {
  const skipped = manifest.assets.filter((asset) => !asset.publicPath);
  const byHost = new Map();

  for (const asset of manifest.assets.filter((item) => item.publicPath)) {
    const host = new URL(asset.sourceUrl).hostname;
    byHost.set(host, (byHost.get(host) ?? 0) + 1);
  }

  const hostRows = [...byHost.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([host, count]) => `| ${host} | ${count} |`)
    .join("\n");

  const skippedRows = skipped.length
    ? skipped.map((asset) => `| ${asset.status} | ${asset.sourceUrl} | ${asset.contentType} |`).join("\n")
    : "| none | none | none |";

  const sampleRows = manifest.assets
    .filter((asset) => asset.publicPath)
    .slice(0, 20)
    .map((asset) => `| ${asset.publicPath} | ${asset.bytes} | ${asset.sha256?.slice(0, 12)} |`)
    .join("\n");

  const content = `# Magick Box Live Media Asset Inventory

Date: ${manifest.generatedAt}

## Summary

- Public routes crawled: ${manifest.routes.filter((route) => route.status === "ok").length}/${manifest.routes.length}
- Media URLs discovered: ${manifest.discoveredCount}
- Media assets copied into the isolated prototype: ${manifest.copiedCount}
- Bytes copied into ICP asset source: ${manifest.totalBytes} (${(manifest.totalBytes / 1024 / 1024).toFixed(2)} MiB)
- Copy destination: \`public/reference-assets/live-site\`
- Machine-readable manifest: \`public/reference-assets/live-site/media-manifest.json\`

These are public media assets discovered from the live Magick Box site by read-only crawling. The isolated prototype serves the copied files from its own ICP asset canister build; the application code should not hotlink production media storage.

## Copied By Source Host

| Source host | Copied assets |
| --- | ---: |
${hostRows}

## Skipped Or Unavailable

| Status | Source URL | Content type |
| --- | --- | --- |
${skippedRows}

## Sample Copied Assets

| ICP/public path | Bytes | SHA-256 prefix |
| --- | ---: | --- |
${sampleRows}
`;

  mkdirSync(dirname(summaryPath), { recursive: true });
  writeFileSync(summaryPath, content);
}

async function main() {
  mkdirSync(outputRoot, { recursive: true });
  const { urls, routeReports } = await crawlMediaUrls();
  const assets = [];

  for (const url of urls) {
    assets.push(await downloadAsset(url));
  }

  const copiedAssets = assets.filter((asset) => asset.publicPath);
  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceOrigin: origin,
    routes: routeReports,
    discoveredCount: urls.length,
    copiedCount: copiedAssets.length,
    totalBytes: copiedAssets.reduce((total, asset) => total + asset.bytes, 0),
    assets,
  };

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  writeSummary(manifest);
  console.log(JSON.stringify({
    generatedAt: manifest.generatedAt,
    discoveredCount: manifest.discoveredCount,
    copiedCount: manifest.copiedCount,
    totalBytes: manifest.totalBytes,
    manifestPath: relative(root, manifestPath).replaceAll("\\", "/"),
    summaryPath: relative(root, summaryPath).replaceAll("\\", "/"),
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
