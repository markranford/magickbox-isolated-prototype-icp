import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const STORAGE_PROVIDER = "content-addressed-local-media-store";

function extensionForMime(mimeType) {
  if (mimeType === "application/json") {
    return "json";
  }

  if (mimeType === "text/markdown") {
    return "md";
  }

  return "txt";
}

export function storeMediaArtifact({
  rootDir,
  jobId,
  providerId,
  content,
  mimeType = "text/plain",
  metadata = {},
}) {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content), "utf8");
  const hash = createHash("sha256").update(buffer).digest("hex");
  const shardDir = resolve(rootDir, "sha256", hash.slice(0, 2));
  const artifactPath = resolve(shardDir, `${hash}.${extensionForMime(mimeType)}`);
  const uri = `media-store://sha256/${hash}`;
  const indexPath = resolve(rootDir, "index.jsonl");

  mkdirSync(shardDir, { recursive: true });

  if (!existsSync(artifactPath)) {
    writeFileSync(artifactPath, buffer);
  }

  mkdirSync(rootDir, { recursive: true });
  appendFileSync(
    indexPath,
    `${JSON.stringify({
      created_at: new Date().toISOString(),
      storage_provider: STORAGE_PROVIDER,
      uri,
      path: artifactPath,
      content_hash: hash,
      mime_type: mimeType,
      bytes: buffer.byteLength,
      job_id: jobId,
      provider_id: providerId,
      metadata,
    })}\n`,
  );

  return {
    storageProvider: STORAGE_PROVIDER,
    uri,
    path: artifactPath,
    hash,
    mimeType,
    bytes: buffer.byteLength,
  };
}
