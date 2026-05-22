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

`t63gs-up777-77776-aaaba-cai`

Candid UI:

`http://tqzl2-p7777-77776-aaaaa-cai.localhost:8010/?id=t63gs-up777-77776-aaaba-cai`

Frontend canister:

`tz2ag-zx777-77776-aaabq-cai`

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
- Composer path that creates canister generation jobs after Internet Identity or local browser identity auth.
- Browser-visible provider and credit-recovery options loaded from `magickbox_core` when served by the asset canister.

## Off-ICP Boundaries

- AI inference remains adapter-boundary only.
- MagickAI is a worker/reference option, not embedded into the canister.
- FreeLLMAPI is a user-managed OpenAI-compatible proxy option, not embedded into the canister.
- Own-provider API keys are not stored on ICP.
- Local Ollama stays user-local.
- Stripe/fiat remains secondary and is not connected.
- Advert verification is modeled as a future trusted verifier flow.
- Large media remains off-chain with future ICP hashes/manifests.

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

Build canister only:

```bash
wsl -- bash -lc 'cd /mnt/c/Users/Mark/Documents/Codex/Codex_MagickBox/magick-box-rewrite-readiness-prototype && icp build magickbox_core'
```

Frontend verification:

```bash
npm run verify
```

## Verification Results

Latest completed checks:

- `npm run verify` passed: lint, 2 Vitest files / 7 tests, Vite build, and 12 Playwright tests.
- `wsl ... icp build magickbox_core` passed.
- `scripts/deploy-local-icp.sh` passed on port `8010`.
- `scripts/smoke-local-icp.sh` passed.
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
- Backend smoke proved:
  - profile registration for `mark@stratagility.com`;
  - insufficient-credit result for `paid_managed` requiring 80 credits with 25 balance;
  - FreeLLMAPI fallback job creation at 0 credits;
  - job listing;
  - audit event listing.

## Known Gaps

- Windows owns the frontend build and WSL owns ICP deploy. This avoids WSL `npm install` rewriting native optional dependencies in `node_modules`.
- Vite development cannot write canister state without `ic_env`; real canister mode is active from the local ICP asset canister through `ic_env`.
- Internet Identity is wired into the React runtime, but the Codex in-app browser blocks the signer popup. Use `Use local browser identity` in that browser, or open the same URL in a normal browser for II.
- ICP/ICRC payment transfer flow is not implemented yet.
- No worker callback protocol for MagickAI/FreeLLMAPI/local Ollama is implemented yet.
- No media hash/manifest upload flow yet.
- No isolated mainnet preview canister was created.

## Recommended Next Build Slice

1. Add local ICRC/ICP payment intent records, then a real test-ledger top-up proof.
2. Add a worker callback contract for MagickAI and FreeLLMAPI.
3. Add a local Ollama/own-provider adapter handshake that stores endpoint metadata without storing raw secrets on ICP.
4. Add media manifest/hash records and collection save from a completed external-worker job.
5. Manually exercise Internet Identity in a browser that permits signer popups.
6. Add an explicit checkpoint before any Caffeine.ai creation, live Magick Box login, or isolated mainnet canister deployment.
