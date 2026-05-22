# Magick Box Media Storage Decision

## Decision

For the mostly ICP prototype path, use **S3-compatible object storage** for large generated media and store **ICP manifests** as the durable ownership, integrity, and publication record.

The local content-addressed media store remains the no-secrets development fallback. Production-grade storage should use an isolated bucket or equivalent S3-compatible namespace, such as Cloudflare R2, MinIO, Storj, AWS S3, or another provider approved for the deployment.

## Why This Path

- Generated image, video, music, and document outputs can be too large and lifecycle-heavy for an early canister-only media store.
- MagickAI's own storage docs already model large files with S3-style storage.
- ICP can still own the important product facts: owner principal, job id, content hash, storage URI, MIME type, byte count, publication status, and audit events.
- S3-compatible storage can be tested locally with MinIO and replaced later without changing the canister manifest contract.

## ICP Manifest Contract

The canister should keep:

- `owner`
- `job_id`
- `attached_by`
- `storage_provider`
- `uri`
- `content_hash`
- `mime_type`
- `bytes`
- `created_at`

The object store should keep the binary payload and provider-specific metadata. The object hash remains the integrity link between the off-chain bytes and the on-chain record.

## Fully ICP Alternative

A fully ICP version can later add asset-canister or custom canister chunk storage for selected public media. That requires a separate proof for upload cost, chunk indexing, certification, cache behavior, lifecycle deletion, and cycle monitoring.

## Current Implementation

- Default backend: `content-addressed-local-media-store`.
- Durable backend option: `s3-compatible-object-store`.
- Enable S3-compatible storage with:
  - `MAGICKBOX_MEDIA_BACKEND=s3`
  - `MAGICKBOX_S3_BUCKET`
  - `MAGICKBOX_S3_REGION`
  - `MAGICKBOX_S3_ENDPOINT` for R2/MinIO/Storj or other S3-compatible stores
  - `MAGICKBOX_S3_ACCESS_KEY_ID`
  - `MAGICKBOX_S3_SECRET_ACCESS_KEY`
  - optional `MAGICKBOX_S3_FORCE_PATH_STYLE=true`
  - optional `MAGICKBOX_S3_PUBLIC_BASE_URL`
