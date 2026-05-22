import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("external worker services and durable media backend contracts", () => {
  const serviceSmokePath = resolve(__dirname, "../../scripts/smoke-worker-services.mjs");
  const mediaBackendsPath = resolve(__dirname, "../../scripts/lib/media-backends.mjs");
  const magickAiBridgePath = resolve(__dirname, "../../workers/magickai_worker_bridge.py");
  const mediaDecisionPath = resolve(__dirname, "../../docs/audits/magickbox-media-storage-decision.md");

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

  it("chooses S3-compatible object storage as the durable media backend while keeping local CAS fallback", () => {
    expect(existsSync(mediaBackendsPath)).toBe(true);
    expect(existsSync(mediaDecisionPath)).toBe(true);

    const mediaBackends = readFileSync(mediaBackendsPath, "utf8");
    const decision = readFileSync(mediaDecisionPath, "utf8");

    expect(mediaBackends).toContain("s3-compatible-object-store");
    expect(mediaBackends).toContain("MAGICKBOX_S3_BUCKET");
    expect(mediaBackends).toContain("PutObjectCommand");
    expect(mediaBackends).toContain("content-addressed-local-media-store");
    expect(decision).toContain("S3-compatible object storage");
    expect(decision).toContain("ICP manifests");
  });
});
