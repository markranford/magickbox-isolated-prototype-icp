# Magick Box Media Storage Decision

## Decision

Use **ICP canister media storage** for the prototype. Generated worker output is stored on ICP first, and **ICP manifests** record ownership, job binding, integrity hashes, MIME type, byte count, and audit evidence.

No external object-storage backend is part of the current prototype direction.

## Why This Path

- The product goal is an almost fully on-chain Magick Box, so storage should prove the ICP path now.
- A small local proof can store worker outputs directly in the core canister and exercise real Candid blob reads/writes.
- The canister can enforce that only the owner or an authorized worker may attach media to a job.
- Media URIs can use an ICP-owned scheme, `icp-media://`, so manifests do not depend on external bucket naming.
- Large media scale should be solved with dedicated ICP media/chunk canisters, not by moving user assets to external object storage.

## Current Prototype Contract

The `magickbox_core` canister stores `MediaAsset` records with:

- `id`
- `owner`
- `job_id`
- `stored_by`
- `uri`
- `content_hash`
- `mime_type`
- `bytes`
- `content`
- `created_at`

The advanced local smoke calls:

- `store_media_asset(job_id, content_hash, mime_type, content)`
- `attach_media_manifest(job_id, "icp-canister-media-store", uri, content_hash, mime_type, bytes)`
- `list_my_media_assets()`
- `list_my_media_manifests()`

## Scale Path

The current core-canister blob store is intentionally limited to small artifacts. A production-grade ICP storage path should add:

- Dedicated media canister or media-canister pool.
- Chunked upload and download APIs.
- Per-asset manifests in the app canister.
- Hash verification for every chunk and complete asset.
- Optional certified serving for public assets.
- Lifecycle controls for drafts, published assets, deletion requests, and retention.
- Cycle monitoring, quota policy, and abuse controls.

This keeps all user/project/conversation/asset state on ICP while allowing the storage layer to evolve beyond the small proof.

## External Boundary

AI inference may still run through local workers, MagickAI, FreeLLMAPI, or user-managed model endpoints. Those workers should return bytes or result text to the ICP media path. They should not become the system of record for user assets.
