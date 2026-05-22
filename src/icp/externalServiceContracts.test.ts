import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("external worker services and durable media backend contracts", () => {
  const serviceSmokePath = resolve(__dirname, "../../scripts/smoke-worker-services.mjs");
  const magickAiBridgePath = resolve(__dirname, "../../workers/magickai_worker_bridge.py");
  const mediaDecisionPath = resolve(__dirname, "../../docs/audits/magickbox-media-storage-decision.md");
  const packageJsonPath = resolve(__dirname, "../../package.json");
  const advancedSmokePath = resolve(__dirname, "../../scripts/smoke-local-icp-advanced.mjs");

  it("provides a live-service smoke for isolated FreeLLMAPI and MagickAI connections", () => {
    expect(existsSync(serviceSmokePath)).toBe(true);

    const smoke = readFileSync(serviceSmokePath, "utf8");

    expect(smoke).toContain("FREELLMAPI_BASE_URL");
    expect(smoke).toContain("/api/ping");
    expect(smoke).toContain("/v1/chat/completions");
    expect(smoke).toContain("MAGICKAI_WORKER_URL");
    expect(smoke).toContain("MAGICKAI_WORKER_COMMAND");
    expect(smoke).toContain("--require-live");
  });

  it("provides a real MagickAI SDK command bridge without writing to the reference repo", () => {
    expect(existsSync(magickAiBridgePath)).toBe(true);

    const bridge = readFileSync(magickAiBridgePath, "utf8");

    expect(bridge).toContain("MAGICKAI_REPO_PATH");
    expect(bridge).toContain("MagickAI.from_env");
    expect(bridge).toContain("universal_process");
    expect(bridge).toContain("json.load(sys.stdin)");
  });

  it("chooses ICP canister media storage and excludes AWS/S3 backends", () => {
    expect(existsSync(mediaDecisionPath)).toBe(true);

    const decision = readFileSync(mediaDecisionPath, "utf8");
    const packageJson = readFileSync(packageJsonPath, "utf8");
    const advancedSmoke = readFileSync(advancedSmokePath, "utf8");

    expect(advancedSmoke).toContain("store_media_asset");
    expect(advancedSmoke).toContain("icp-canister-media-store");
    expect(decision).toContain("ICP canister media storage");
    expect(decision).toContain("ICP manifests");
    expect(packageJson).not.toContain("@aws-sdk/client-s3");
    expect(advancedSmoke).not.toContain("MAGICKBOX_S3");
    expect(advancedSmoke).not.toContain("PutObjectCommand");
    expect(decision).not.toContain("AWS");
    expect(decision).not.toContain("S3-compatible");
  });
});
