# Magick Box Full ICP Local Deploy Handoff

Date: 2026-05-22

## Location

`C:\Users\Mark\Documents\Codex\Codex_MagickBox\magick-box-rewrite-readiness-prototype`

## Safety Status

- Local ICP deployment only.
- No mainnet deployment.
- No ICP spend.
- No production Magick Box login.
- No Caffeine.ai account action.
- No production DNS, auth, analytics, billing, database, secrets, or deployment setting touched.
- `magick_ai` and `freellmapi` were cloned read-only under `../_readonly_references` with push disabled.

## Local ICP Deployment

Gateway port:

`8010`

Frontend asset canister:

`http://frontend.local.localhost:8010/`

Core canister:

`tm5rl-y7777-77776-aaaca-cai`

Candid UI:

`http://tqzl2-p7777-77776-aaaaa-cai.localhost:8010/?id=tm5rl-y7777-77776-aaaca-cai`

Media canister:

`tz2ag-zx777-77776-aaabq-cai`

Frontend canister:

`t63gs-up777-77776-aaaba-cai`

Local prototype identity:

`magickbox-local-prototype`

Principal:

`hps4u-xw7jo-xvzh7-ban7x-p3dgw-ibqlb-iur7v-svu6o-2iysz-frbnb-mqe`

The local seed is stored only under ignored `.icp/cache/local-secrets/`. Do not use this identity for anything valuable.

## What Is Now On ICP Locally

- Certified frontend asset canister.
- Internet Identity-enabled local network config.
- `magickbox_core` Motoko canister.
- Principal-owned profile records.
- Credit balance.
- ICP/subscription/ad/free/own-key/local-LLM credit recovery options.
- Provider option records for MagickAI worker, FreeLLMAPI, own API key, local Ollama, and paid managed provider.
- Generation job records.
- Collection save endpoint.
- Append-only audit events.
- Generated TypeScript Candid binding for the frontend.
- React adapter that reads `ic_env` from the asset canister.
- React Internet Identity sign-in and sign-out entry points.
- Persistent local signed browser identity for app-browser environments that block Internet Identity popups.
- Local browser identity auto-reconnect after direct route loads.
- Composer path that creates canister generation jobs after Internet Identity or local browser identity auth.
- Browser-visible provider and credit-recovery options loaded from `magickbox_core` when served by the asset canister.
- ICP payment intent records with deterministic per-intent ICRC subaccounts and claimed local ledger block indexes.
- Local ICP ledger subaccount balance verification for claimed top-ups.
- Ad verifier credit grant records with duplicate proof protection.
- User-authorized worker principal records.
- Worker completion records with provider id, result hash, receipt, and output preview.
- ICP media asset records storing small generated worker outputs as canister blobs.
- Media manifest records for ICP media assets anchored by content hash.
- Public live-site media copied into `public/reference-assets/live-site` for the local ICP asset canister build.
- Gallery and Explore surfaces render copied local media paths instead of production media hotlinks.

## Off-ICP Boundaries

- AI inference remains off-canister, with verified local Ollama, FreeLLMAPI-compatible, and MagickAI-compatible worker paths.
- MagickAI can be connected by `MAGICKAI_WORKER_URL` or `MAGICKAI_WORKER_COMMAND`; it is not embedded into the canister.
- FreeLLMAPI can be connected by `FREELLMAPI_BASE_URL`; it is not embedded into the canister.
- Own-provider API keys are not stored on ICP.
- Local Ollama stays user-local.
- Stripe/fiat remains secondary and is not connected.
- Advert verification is represented by canister credit grants in the local prototype; production still needs a trusted verifier principal/service.
- Large generated media should move from the current small-blob proof into dedicated ICP media/chunk canisters.

## Commands

Deploy locally:

```bash
npm run build
wsl -- bash -lc 'cd /mnt/c/Users/Mark/Documents/Codex/Codex_MagickBox/magick-box-rewrite-readiness-prototype && bash scripts/deploy-local-icp.sh'
```

Smoke local canister state:

```bash
wsl -- bash -lc 'cd /mnt/c/Users/Mark/Documents/Codex/Codex_MagickBox/magick-box-rewrite-readiness-prototype && bash scripts/smoke-local-icp.sh'
```

Advanced local payment, worker, ad, and media smoke:

```bash
npm run smoke:icp:advanced
```

Build canister only:

```bash
wsl -- bash -lc 'cd /mnt/c/Users/Mark/Documents/Codex/Codex_MagickBox/magick-box-rewrite-readiness-prototype && icp build magickbox_core'
```

Frontend verification:

```bash
npm run verify
```

Optional live service wiring smoke:

```bash
npm run smoke:services
npm run smoke:services:required
```

## Verification Results

Latest completed checks:

- `npm run verify` passed: lint, 5 Vitest files / 17 tests, Vite build, and 12 Playwright tests.
- `wsl ... icp build magickbox_core` passed.
- `scripts/deploy-local-icp.sh` passed on port `8010`; frontend canister `tz2ag-zx777-77776-aaabq-cai`, core canister `t63gs-up777-77776-aaaba-cai`.
- `scripts/smoke-local-icp.sh` passed.
- `npm run smoke:icp:advanced` passed.
- `npm run smoke:services` passed in optional mode with both live services skipped because no isolated service env vars were configured.
- `npm run audit:media` passed:
  - 10/10 public live routes crawled read-only;
  - 96 media URLs discovered;
  - 95 assets copied into the isolated prototype asset source;
  - 120,324,692 bytes copied;
  - only skipped URL was the live site's 404 `/home/favicon.ico`.
- Local ICP asset media checks passed:
  - `media-manifest.json` returned HTTP 200 from `frontend.local.localhost:8010`;
  - copied PNG returned HTTP 200 with `image/png`;
  - copied GIF returned HTTP 200 with `image/gif`;
  - Playwright confirmed `/` gallery and `/home/explore?category=latest` media images loaded without production hotlinks or console errors;
  - screenshots written to `docs/artifacts/prototype/local-icp-copied-media-gallery.png` and `docs/artifacts/prototype/local-icp-copied-media-explore.png`.
- `python workers\magickai_worker_bridge.py --health` located the read-only MagickAI repo but could not import the SDK because the local Python environment is missing `pymongo`.
- `http://frontend.local.localhost:8010/` returned HTTP 200.
- `http://frontend.local.localhost:8010/home/magick-chat` returned HTTP 200.
- `http://frontend.local.localhost:8010/evaluation` returned HTTP 200.
- Browser smoke against `http://frontend.local.localhost:8010/home/magick-chat` confirmed:
  - app detected `ic_env`;
  - UI switched to `ICP canister` mode;
  - provider options loaded from the core canister;
  - `Use local browser identity` registered a real non-anonymous principal and created canister job `#2`;
  - paid managed provider returned the canister insufficient-credit recovery panel;
  - no console warnings/errors were recorded;
  - screenshot artifacts written to `docs/artifacts/prototype/local-browser-identity-job.png` and `docs/artifacts/prototype/local-browser-identity-insufficient-credits.png`.
- Browser smoke also confirmed:
  - subscriptions page creates a real canister payment intent after local browser identity auth and hard navigation;
  - payment intent `#2` displayed per-intent subaccount `4d42504159000000000000000000000000000000000000000000000000000002`;
  - recovery panel grants 25 ad credits through `grant_ad_credits`;
  - no console warnings/errors were recorded;
  - screenshots written to `docs/artifacts/prototype/local-icp-payment-subaccount-ui.png` and `docs/artifacts/prototype/local-icp-ad-credit-ui.png`.
- Backend smoke proved:
  - profile registration for `mark@stratagility.com`;
  - insufficient-credit result for `paid_managed` requiring 80 credits with 25 balance;
  - FreeLLMAPI fallback job creation at 0 credits;
  - job listing;
  - audit event listing.
- Latest advanced smoke proved:
  - ICP payment intent `#1` for 100 credits and `100_000` e8s;
  - per-intent subaccount `4d42504159000000000000000000000000000000000000000000000000000001`;
  - local ledger transfer of `0.001` ICP to core canister `t63gs-up777-77776-aaaba-cai` with `--to-subaccount`, claimed at block `30`;
  - ad verifier grant of 25 credits;
  - separate worker principal `qpkob-dcevx-4dmkl-ie5nc-2hkun-wqaia-vwwcq-n3gfy-rz3xt-djgfe-cae`;
  - local Ollama model `glm4:9b` completed job `#2` with hash `a485b12be57454f7b2507f8b7a8ddfc8bf4c908ef2a741ddf5c39fe85704cc9b`;
  - FreeLLMAPI-compatible adapter completed job `#3` with hash `fbd2e1938765ba06342850ce65ef0d59717c0054170fffd6e8855547e3e83685`;
  - MagickAI-compatible adapter completed job `#4` with hash `7c0c590c8ba96c9f9299b554ee8c5e580043879de48c08a043b91efe050390ec`;
  - media assets stored directly in `magickbox_core` with `icp-media://...` URIs;
  - media manifests `#1`, `#2`, and `#3` anchored those ICP media URIs through `icp-canister-media-store`.

## Known Gaps

- Windows owns the frontend build and WSL owns ICP deploy. This avoids WSL `npm install` rewriting native optional dependencies in `node_modules`.
- Vite development cannot write canister state without `ic_env`; real canister mode is active from the local ICP asset canister through `ic_env`.
- Internet Identity is wired into the React runtime, but the Codex in-app browser blocks the signer popup. Use `Use local browser identity` in that browser, or open the same URL in a normal browser for II.
- Local ICP/ICRC top-up proof now uses per-intent subaccounts. Production should decide whether to add ICRC-2 approve/transfer-from for wallet-mediated subscription or recurring payment flows.
- MagickAI and FreeLLMAPI adapters are implemented as local worker boundaries; production use still needs real deployed worker services and secrets kept outside canister state.
- The current media asset implementation is intentionally size-limited for the local proof; larger generated image/video/music assets need dedicated ICP media/chunk canisters with quota, lifecycle, certification, and cycle monitoring.
- Copied live-site media is static asset-canister content, not a continuous production gallery sync.
- No isolated mainnet preview canister was created.

## Recommended Next Build Slice

1. Decide whether to supplement per-intent subaccounts with ICRC-2 transfer-from for subscription-style payments.
2. Install MagickAI bridge dependencies in an isolated Python environment, then run `MAGICKAI_WORKER_COMMAND="python workers/magickai_worker_bridge.py" npm run smoke:services:required`.
3. Run FreeLLMAPI in an isolated checkout/service, set `FREELLMAPI_BASE_URL` and `FREELLMAPI_API_KEY`, then capture routed-provider evidence with `npm run smoke:services:required`.
4. Add a dedicated ICP media/chunk canister and migrate large generated media writes from the core proof store into that canister.
5. Surface worker runs, media manifests, and claim/payment status in the app shell.
6. Add collection save from a completed external-worker job.
7. Manually exercise Internet Identity in a browser that permits signer popups.
8. Add an explicit checkpoint before any Caffeine.ai creation, live Magick Box login, or isolated mainnet canister deployment.

## 2026-05-23 Completion Update

### Current Local ICP URLs

- Frontend: `http://frontend.local.localhost:8010/`
- Core canister: `tm5rl-y7777-77776-aaaca-cai`
- Media canister: `tz2ag-zx777-77776-aaabq-cai`
- Frontend canister: `t63gs-up777-77776-aaaba-cai`

### New App Behavior

- The composer now performs a real browser generation path when served by the local ICP asset canister:
  - local browser identity signs the canister calls;
  - `magickbox_core` creates the generation job;
  - local worker service executes the selected provider route;
  - generated bytes are uploaded to `magickbox_media`;
  - an `icp-media://...` manifest is attached to `magickbox_core`;
  - the job is completed and shown in the UI.
- `scripts/local-worker-service.mjs` exposes the local worker bridge.
- `npm run smoke:icp:ui` verifies login, generation, ICP media storage, and completed UI state.
- The asset canister CSP now allows loopback worker endpoints with `http://127.0.0.1:*` and `http://localhost:*`.
- `scripts/deploy-local-icp.sh` now stops stale local PocketIC processes before recreating project-local state.

### Latest Verification

- `npm run verify` passed: lint, 7 Vitest files / 25 tests, build, and 12 Playwright tests.
- `npm run smoke:icp:advanced` passed after redeploy:
  - payment intent `#1`;
  - local ICP transfer block `30`;
  - ad verifier grant;
  - local Ollama, FreeLLMAPI-compatible, and MagickAI-compatible workers;
  - generated outputs stored in `magickbox_media` as committed ICP media assets;
  - manifests anchored in `magickbox_core`.
- `npm run smoke:icp:ui` passed:
  - target `http://frontend.local.localhost:8010/home/magick-chat`;
  - worker `http://127.0.0.1:8788/execute`;
  - screenshot `docs/artifacts/prototype/local-icp-ui-worker-generation.png`.
- Direct mainnet preflight is blocked:
  - `MAGICKBOX_MAINNET_IDENTITY` not set;
  - default identity `mythereum-mainnet-operator`;
  - principal `6tlcm-6gccj-egoio-r6svf-alon2-hstrm-lluvy-uwlsh-dm2w4-z232e-oae`;
  - balance `0 ICP`;
  - cycles `0 cycles`.

### Caffeine Status

- Separate Caffeine control-center app is live at `https://magickbox-icp-e68.caffeine.xyz/`.
- Smoke check passed with page title `Magick Box ICP Control Center` and no browser console errors.
- This Caffeine deployment is not authoritative app state and is not the direct ICP canister app. It is a control plane for configuring external ICP canister boundaries.
- No `www.magickbox.ai` production service, DNS, auth, analytics, billing, database, secret, or live user path was touched.

## 2026-05-23 In-App Browser And Mainnet Readiness Update

### Direct Browser Test

- In-app browser tested `http://frontend.local.localhost:8010/home/magick-chat`.
- Local browser identity connected to ICP with principal `gnsf7-hed6u-bjtzo-wvtee-5fsg3-fi2sv-qsriy-b5igd-qwp7j-3bhab-7ae`.
- Provider route `Local Ollama` submitted a real prompt and completed job `#5` in the ICP-backed UI.
- Browser console error log was empty.
- Evidence screenshots:
  - `docs/artifacts/prototype/iab-icp-generation-test-2026-05-23.png`
  - `docs/artifacts/prototype/iab-icp-generation-test-full-2026-05-23.png`

### Clean Verification

- `npm run verify` passed after the latest smoke/deploy harness changes:
  - lint passed;
  - 7 Vitest files / 25 tests passed;
  - build passed with the existing Vite chunk-size warning;
  - 12 Playwright tests passed.
- `npm run smoke:icp:ui` passed cleanly with `workerStartedBySmoke: false`.
- `npm run smoke:icp:advanced` passed and showed committed assets in `magickbox_media` plus manifests in `magickbox_core`.
- `npm run smoke:services` passed optional mode, with live FreeLLMAPI/MagickAI endpoints skipped until isolated service env vars are supplied.

### Mainnet Deploy Preparation

- Added `npm run deploy:mainnet:icp`.
- The command is guarded and refuses by default unless all of these are set:
  - `MAGICKBOX_MAINNET_IDENTITY`;
  - `MAGICKBOX_MAINNET_PRIMARY_CONTROLLER`;
  - `MAGICKBOX_MAINNET_BACKUP_CONTROLLER`;
  - `MAGICKBOX_MAINNET_DEPLOY_APPROVAL=YES_DEPLOY_ISOLATED_MAGICKBOX_ICP_MAINNET`.
- Dry-run was verified with `MAGICKBOX_MAINNET_DRY_RUN=1`.
- Real mainnet deployment remains blocked until the isolated identity is funded with ICP/cycles.

## 2026-05-23 Superadmin And Funding Dashboard Update

### What Changed

- Added a real `/home/admin` app route.
- Added `Admin` to the app shell navigation.
- Added canister-backed superadmin status, bootstrap, add/remove admin, system wallet status, admin dashboard, and admin audit listing methods.
- Added a system-wallet funding panel where a superadmin creates a dedicated ICP funding wallet/subaccount, then funds and verifies it on-chain.
- Added management areas for users/roles, payment and credit controls, worker/AI routes, media storage, deployment safety, provider secrets, audit/operations, and growth/review.

### Current Local ICP Deployment

- Frontend: `http://frontend.local.localhost:8010/`
- Admin: `http://frontend.local.localhost:8010/home/admin`
- Core canister: `tm5rl-y7777-77776-aaaca-cai`
- Media canister: `t63gs-up777-77776-aaaba-cai`
- Frontend canister: `tz2ag-zx777-77776-aaabq-cai`

### Superadmin Flow

1. Deploy the isolated canisters with the intended controller identity. The core canister seeds that install caller as the first superadmin.
2. Open `http://frontend.local.localhost:8010/home/admin` in a normal browser that permits Internet Identity popups.
3. Sign in with Internet Identity and copy the II principal shown on the admin page.
4. From the seeded superadmin/controller identity, add that II principal with `add_superadmin`.
5. Refresh the admin page and confirm the role changes to `Superadmin`.
6. Click `Create funding wallet`.
7. Fund the displayed system funding wallet owner and subaccount.
8. Refresh the dashboard to verify the wallet balance.

The latest local deploy seeded WSL identity `sprint0-admin` as superadmin. `get_superadmin_status` now reports `bootstrap_available = false`, `superadmin_count = 1`, and `is_superadmin = true` for principal `naoif-lcgk2-yvt4u-7thw4-ah4xc-vptgh-fj4ij-mwctk-zmghe-bbcok-rae`.

### Verification

- `npm run lint` passed.
- `npm run test` passed, 7 files / 31 tests.
- `npm run build` passed with the existing Vite chunk-size warning.
- `npm run e2e` passed, 14 Playwright tests.
- `wsl ... icp build` passed for all canisters.
- `wsl ... icp deploy -e local --yes` passed and redeployed the isolated local ICP stack.
- `get_superadmin_status` after redeploy confirmed public bootstrap is closed and the install caller is superadmin.
- `npm run smoke:icp:advanced` passed with `MAGICKBOX_OWNER_IDENTITY=sprint0-admin`, including per-intent local ICP transfer, payment claim, ad verifier credits, worker authorization, local Ollama, FreeLLMAPI-compatible, MagickAI-compatible adapters, and ICP media canister manifests.
- `npm run smoke:icp:ui` passed and captured `docs/artifacts/prototype/local-icp-ui-worker-generation.png`.
- Admin screenshot evidence: `docs/artifacts/prototype/system-funding-wallet-admin-local-2026-05-23.png`.

### Mainnet Warning

Public superadmin bootstrap is now disabled before mainnet. The remaining mainnet blocker is funding the dedicated isolated deploy identity with ICP/cycles, then deploying only after explicit approval with both primary and backup controllers set.
