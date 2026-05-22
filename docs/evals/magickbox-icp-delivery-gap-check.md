# Magick Box ICP Delivery Gap Check

Date: 2026-05-22T20:27:11+07:00

## Delivered On Local ICP

- Frontend build deployed to the isolated local ICP asset canister on port `8010`.
- Static Magick Box public media inventory copied into `public/reference-assets/live-site` for asset-canister deployment.
- Visible Gallery and Explore surfaces use copied local asset paths instead of production media hotlinks.
- `magickbox_core` canister owns local profile, credits, provider options, generation job records, collection records, payment intents, ad credit grants, worker grants, worker runs, media assets, media manifests, and audit events.
- Local ICP payment proof uses per-intent ICRC subaccounts and local ledger balance verification.
- Local worker proof completes Ollama, FreeLLMAPI-compatible, and MagickAI-compatible jobs and stores small worker outputs as ICP media assets.
- ICP media manifests are restricted to `icp-canister-media-store` and `icp-media://` URIs.

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
| Mainnet or isolated preview | Local ICP only; no mainnet deploy and no shared preview. | Explicit approval, new isolated canisters, cycle funding, controller policy, and preview URL. |
| Full live account exploration | Public routes inspected; logged-in production account was not used. | User-assisted login in a browser and read-only route capture, without changing production data. |
| Large media storage | Small worker outputs are stored in `magickbox_core`; copied public media is static asset-canister content. | Dedicated ICP media/chunk canister for large generated image/video/music assets, with chunk upload, quotas, lifecycle, and cycle monitoring. |
| AI inference | External/local worker adapters are used; model execution is not on ICP. | Decide whether AI remains worker-based or add an ICP-native inference proof if feasible. |
| FreeLLMAPI live service | Harness exists but optional smoke skips without isolated env vars. | Run isolated FreeLLMAPI and capture `npm run smoke:services:required` evidence. |
| MagickAI live service | Bridge exists; real SDK execution still needs isolated Python dependencies and credentials outside canister state. | Build isolated worker service or command environment and run required smoke. |
| ICP payments production readiness | Local ledger proof only; no mainnet spend or production credits. | Production-grade ICRC ledger selection, per-intent accounting, optional ICRC-2 transfer-from, refunds/settlement, and operations runbook. |
| Subscriptions | UI/payment intent proof exists; recurring subscriptions are not implemented. | ICRC-2 or equivalent recurring/subscription authorization design. |
| Ad verifier | Local canister grant proof only. | Trusted verifier principal/service, anti-replay policy, rate limits, and audit review. |
| User projects/conversations | Metadata/job scaffolding exists; full production conversation/project data model is not complete. | Complete canister schemas, privacy/encryption design, migration plan, and upgrade checks. |
| Public gallery behavior | Static copied media is visible; live community feed/remix/like/follow is not implemented. | Canister-backed gallery index, publication state, remix links, moderation, and pagination. |
| Search/analytics/admin | Not deployed on ICP. | Decide what belongs on ICP as aggregate counters/admin state and what remains external. |
| Upgrade persistence proof | Persistent actor used; no explicit upgrade survival test run in this checkpoint. | Local upgrade smoke proving profile, job, payment, media, and audit records survive canister upgrade. |
| Security hardening | Local prototype constraints documented. | Dedicated access-control review, rate limits, quotas, media abuse controls, controller governance, and cycle monitoring. |

## Current Recommendation

The next delivery slice should be a dedicated ICP media/chunk canister. That is the missing piece between "static copied public media can be served from ICP assets" and "new user-generated Magick Box media lives on ICP at production scale."
