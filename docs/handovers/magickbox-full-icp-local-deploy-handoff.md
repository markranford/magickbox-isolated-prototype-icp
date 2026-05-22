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

`tz2ag-zx777-77776-aaabq-cai`

Candid UI:

`http://tqzl2-p7777-77776-aaaaa-cai.localhost:8010/?id=tz2ag-zx777-77776-aaabq-cai`

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
- `scripts/deploy-local-icp.sh` passed on port `8010`.
- `scripts/smoke-local-icp.sh` passed.
- `npm run smoke:icp:advanced` passed.
- `npm run smoke:services` passed in optional mode with both live services skipped because no isolated service env vars were configured.
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
  - local ledger transfer of `0.001` ICP to core canister `tz2ag-zx777-77776-aaabq-cai` with `--to-subaccount`, claimed at block `30`;
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
