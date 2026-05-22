import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("local ICP worker and media storage contracts", () => {
  const workerAdaptersPath = resolve(__dirname, "../../scripts/lib/worker-adapters.mjs");
  const mediaStorePath = resolve(__dirname, "../../scripts/lib/media-store.mjs");
  const advancedSmokePath = resolve(__dirname, "../../scripts/smoke-local-icp-advanced.mjs");

  it("declares real worker adapters for MagickAI, FreeLLMAPI, and local Ollama", () => {
    expect(existsSync(workerAdaptersPath)).toBe(true);

    const adapters = readFileSync(workerAdaptersPath, "utf8");

    expect(adapters).toContain("local_ollama");
    expect(adapters).toContain("freellmapi");
    expect(adapters).toContain("magick_ai_worker");
    expect(adapters).toContain("FREELLMAPI_BASE_URL");
    expect(adapters).toContain("MAGICKAI_WORKER_URL");
    expect(adapters).toContain("MAGICKAI_WORKER_COMMAND");
  });

  it("anchors generated media in a durable content-addressed store", () => {
    expect(existsSync(mediaStorePath)).toBe(true);

    const mediaStore = readFileSync(mediaStorePath, "utf8");
    const advancedSmoke = readFileSync(advancedSmokePath, "utf8");

    expect(mediaStore).toContain("media-store://sha256/");
    expect(mediaStore).toContain("index.jsonl");
    expect(mediaStore).toContain("sha256");
    expect(advancedSmoke).toContain("storeMediaArtifact");
    expect(advancedSmoke).toContain("content-addressed-local-media-store");
  });
});
