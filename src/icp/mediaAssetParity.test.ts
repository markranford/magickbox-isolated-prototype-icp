import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type MediaManifestAsset = {
  sourceUrl: string;
  status: number;
  contentType: string;
  bytes: number;
  sha256: string | null;
  publicPath: string | null;
  localPath: string | null;
};

type MediaManifest = {
  discoveredCount: number;
  copiedCount: number;
  totalBytes: number;
  assets: MediaManifestAsset[];
};

describe("live Magick Box media asset parity", () => {
  const root = resolve(__dirname, "../..");
  const manifestPath = resolve(root, "public/reference-assets/live-site/media-manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as MediaManifest;

  it("copies every reachable public live-site media asset into ICP asset source", () => {
    const copied = manifest.assets.filter((asset) => asset.publicPath);
    const skipped = manifest.assets.filter((asset) => !asset.publicPath);

    expect(manifest.discoveredCount).toBe(96);
    expect(manifest.copiedCount).toBe(95);
    expect(copied.length).toBe(95);
    expect(manifest.totalBytes).toBeGreaterThan(120_000_000);
    expect(skipped).toEqual([
      expect.objectContaining({
        status: 404,
        sourceUrl: "https://magickbox.ai/home/favicon.ico",
      }),
    ]);

    for (const asset of copied) {
      expect(asset.publicPath?.startsWith("/reference-assets/live-site/")).toBe(true);
      expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(asset.bytes).toBeGreaterThan(0);
      expect(existsSync(resolve(root, `public${asset.publicPath}`))).toBe(true);
    }
  });

  it("uses copied local media paths in the visible gallery instead of production hotlinks", () => {
    const contentSource = readFileSync(resolve(root, "src/data/content.ts"), "utf8");

    expect(contentSource).toContain("/reference-assets/live-site/copied-production-media/");
    expect(contentSource).toContain("/reference-assets/live-site/magickbox-site/");
    expect(contentSource).not.toContain("https://magickbox.ai");
    expect(contentSource).not.toContain("amazonaws.com");
    expect(contentSource).not.toContain("prod-gmi-magick-box");
  });
});
