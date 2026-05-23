# Magick Box ICP Delivery Gap Check

Date: 2026-05-22T20:27:11+07:00

Latest update: 2026-05-23T16:59:19+07:00

## Delivered On Local ICP

- Frontend build deployed to the isolated local ICP asset canister on port `8010`.
- Static Magick Box public media inventory copied into `public/reference-assets/live-site` for asset-canister deployment.
- Visible Gallery and Explore surfaces use copied local asset paths instead of production media hotlinks.
- `magickbox_core` canister owns local profile, credits, provider options, generation job records, collection records, payment intents, ad credit grants, worker grants, worker runs, media assets, media manifests, and audit events.
- Local ICP payment proof uses per-intent ICRC subaccounts and local ledger balance verification.
- Local worker proof completes Ollama, FreeLLMAPI-compatible, and MagickAI-compatible jobs and stores small worker outputs as ICP media assets.
- ICP media manifests are restricted to `icp-canister-media-store` and `icp-media://` URIs.
- Dedicated `magickbox_media` canister now stores browser-generated worker output bytes through `create_asset`, `put_chunk`, and `commit_asset`.
- The browser app flow now signs in with local browser identity, executes the local worker service, uploads generated output to `magickbox_media`, attaches a manifest to `magickbox_core`, and displays a completed job.
- A separate Caffeine app is live at `https://magickbox-icp-e68.caffeine.xyz/`; version 7 serves certified frontend assets from Caffeine asset canister `i2fwa-kyaaa-aaaam-qizja-cai` and connects to backend/core canister `itg54-4qaaa-aaaam-qiziq-cai` through `/env.json`.
- Live Caffeine v7 backend smoke registered a profile, created/completed a generation job, stored media bytes on ICP, and listed the resulting `icp-media://...` asset.

## Media Asset Copy Status

- Public live routes crawled: 10/10.
- Media URLs discovered: 96.
- Assets copied into the isolated ICP asset source: 95.
- Bytes copied: 120,324,692 bytes / 114.75 MiB.
- One discovered URL returned 404 and was not copied: `https://magickbox.ai/home/favicon.ico`.
- Full machine-readable manifest: `public/reference-assets/live-site/media-manifest.json`.
- Human-readable inventory: `docs/evals/magickbox-live-media-assets.md`.

## Not Yet Delivered On ICP

| Area | Current status | Needed for ICP delivery |
| --- | --- | --- |
| Mainnet ICP canisters | Caffeine mainnet preview has a live certified asset canister and backend canister; direct non-Caffeine mainnet preflight remains blocked by 0 ICP/0 cycles on `magickbox-mainnet-isolated`. | Claim owner on Caffeine with Mark's II, then separately fund the dedicated isolated identity if a direct non-Caffeine deployment is still required. |
| Isolated web preview | Caffeine v7 is live at `https://magickbox-icp-e68.caffeine.xyz/` and loads real backend config from `/env.json`. | Mark must claim the one-time superadmin role with II before funding or broad sharing. |
| Full live account exploration | Public routes inspected; logged-in production account was not used. | User-assisted login in a browser and read-only route capture, without changing production data. |
| Large media storage | Local `magickbox_media` chunk canister stores browser-generated output; Caffeine live backend stores small media bytes in `magickbox_core` and returns `icp-media://...` URIs. Copied public media is static asset-canister content. | Move large generated image/video/music assets into dedicated ICP media/chunk canisters with quotas, lifecycle, certification, cycle monitoring, and validation. |
| AI inference | External/local worker adapters are used; model execution is not on ICP. | Decide whether AI remains worker-based or add an ICP-native inference proof if feasible. |
| FreeLLMAPI live service | Harness exists but optional smoke skips without isolated env vars. | Run isolated FreeLLMAPI and capture `npm run smoke:services:required` evidence. |
| MagickAI live service | Bridge exists; real SDK execution still needs isolated Python dependencies and credentials outside canister state. | Build isolated worker service or command environment and run required smoke. |
| ICP payments production readiness | Local ledger proof exists; Caffeine live backend exposes system wallet/admin status but Mark has not claimed superadmin or funded the system wallet yet. No mainnet spend was made by Codex. | Mark claims superadmin with II, creates/funds the system wallet, then payment flows need production-grade ICRC ledger selection, per-intent accounting, optional ICRC-2 transfer-from, refunds/settlement, and operations runbook. |
| Subscriptions | UI/payment intent proof exists; recurring subscriptions are not implemented. | ICRC-2 or equivalent recurring/subscription authorization design. |
| Ad verifier | Local canister grant proof only. | Trusted verifier principal/service, anti-replay policy, rate limits, and audit review. |
| User projects/conversations | Metadata/job scaffolding exists; full production conversation/project data model is not complete. | Complete canister schemas, privacy/encryption design, migration plan, and upgrade checks. |
| Public gallery behavior | Static copied media is visible; live community feed/remix/like/follow is not implemented. | Canister-backed gallery index, publication state, remix links, moderation, and pagination. |
| Search/analytics/admin | Not deployed on ICP. | Decide what belongs on ICP as aggregate counters/admin state and what remains external. |
| Upgrade persistence proof | Persistent actor used; no explicit upgrade survival test run in this checkpoint. | Local upgrade smoke proving profile, job, payment, media, and audit records survive canister upgrade. |
| Security hardening | Local prototype constraints documented. | Dedicated access-control review, rate limits, quotas, media abuse controls, controller governance, and cycle monitoring. |

## Current Recommendation

The immediate next delivery slice is Mark claiming the one-time superadmin role on `https://magickbox-icp-e68.caffeine.xyz/home/admin` with Internet Identity, then creating and funding the displayed system wallet. After that, harden the Caffeine preview with backup admin/controller policy and move large generated media into dedicated ICP media/chunk canisters. A direct non-Caffeine mainnet deployment remains valuable for final authority, but it is still blocked until the isolated deploy identity has ICP/cycles.
