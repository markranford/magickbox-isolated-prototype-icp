import { createHash } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { storeMediaArtifact } from "./media-store.mjs";

function boolEnv(value) {
  return String(value ?? "").toLowerCase() === "true";
}

function requiredEnv(env, name) {
  const value = env[name];

  if (!value) {
    throw new Error(`${name} is required for MAGICKBOX_MEDIA_BACKEND=s3`);
  }

  return value;
}

function extensionForMime(mimeType) {
  if (mimeType === "application/json") {
    return "json";
  }

  if (mimeType === "text/markdown") {
    return "md";
  }

  return "txt";
}

function mediaBuffer(content) {
  return Buffer.isBuffer(content) ? content : Buffer.from(String(content), "utf8");
}

export function resolveMediaBackend(env = process.env) {
  const backend = String(env.MAGICKBOX_MEDIA_BACKEND ?? "local-cas").toLowerCase();

  if (["s3", "s3-compatible", "s3-compatible-object-store"].includes(backend)) {
    return "s3-compatible-object-store";
  }

  return "content-addressed-local-media-store";
}

export async function storeS3CompatibleArtifact({
  env = process.env,
  jobId,
  providerId,
  content,
  mimeType = "text/plain",
  metadata = {},
}) {
  const buffer = mediaBuffer(content);
  const hash = createHash("sha256").update(buffer).digest("hex");
  const bucket = requiredEnv(env, "MAGICKBOX_S3_BUCKET");
  const region = env.MAGICKBOX_S3_REGION ?? "auto";
  const prefix = (env.MAGICKBOX_MEDIA_PREFIX ?? "magickbox").replace(/^\/+|\/+$/g, "");
  const key = `${prefix}/sha256/${hash.slice(0, 2)}/${hash}.${extensionForMime(mimeType)}`;
  const endpoint = env.MAGICKBOX_S3_ENDPOINT;
  const accessKeyId = requiredEnv(env, "MAGICKBOX_S3_ACCESS_KEY_ID");
  const secretAccessKey = requiredEnv(env, "MAGICKBOX_S3_SECRET_ACCESS_KEY");
  const client = new S3Client({
    region,
    endpoint,
    forcePathStyle: boolEnv(env.MAGICKBOX_S3_FORCE_PATH_STYLE),
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      Metadata: {
        content_hash: hash,
        provider_id: String(providerId),
        job_id: String(jobId),
        ...Object.fromEntries(
          Object.entries(metadata).map(([name, value]) => [name, String(value)]),
        ),
      },
    }),
  );

  const publicBase = env.MAGICKBOX_S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  const uri = publicBase ? `${publicBase}/${key}` : `s3://${bucket}/${key}`;

  return {
    storageProvider: "s3-compatible-object-store",
    uri,
    path: key,
    hash,
    mimeType,
    bytes: buffer.byteLength,
  };
}

export async function storeMediaFromEnv({
  rootDir,
  jobId,
  providerId,
  content,
  mimeType = "text/plain",
  metadata = {},
  env = process.env,
}) {
  const backend = resolveMediaBackend(env);

  if (backend === "s3-compatible-object-store") {
    return storeS3CompatibleArtifact({
      env,
      jobId,
      providerId,
      content,
      mimeType,
      metadata,
    });
  }

  return storeMediaArtifact({
    rootDir,
    jobId,
    providerId,
    content,
    mimeType,
    metadata,
  });
}

export { storeMediaArtifact };
