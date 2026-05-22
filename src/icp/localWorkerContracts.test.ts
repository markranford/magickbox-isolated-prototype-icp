import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("local ICP worker and media storage contracts", () => {
  const workerAdaptersPath = resolve(__dirname, "../../scripts/lib/worker-adapters.mjs");
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

  it("stores generated media in the ICP canister before anchoring manifests", () => {
    const advancedSmoke = readFileSync(advancedSmokePath, "utf8");

    expect(advancedSmoke).toContain("store_media_asset");
    expect(advancedSmoke).toContain("icp-canister-media-store");
    expect(advancedSmoke).toContain("icp-media://");
    expect(advancedSmoke).not.toContain("storage/media");
    expect(advancedSmoke).not.toContain("media-store://sha256/");
  });
});
