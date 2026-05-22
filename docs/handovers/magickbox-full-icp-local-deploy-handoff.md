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

- `npm install` restored Windows native optional dependencies after the WSL build-boundary fix.
- `npm run verify` passed: lint, Vitest, Vite build, and 10 Playwright tests.
- `wsl ... icp build magickbox_core` passed.
- `scripts/deploy-local-icp.sh` passed on port `8010`.
- `scripts/smoke-local-icp.sh` passed.
- `http://frontend.local.localhost:8010/` returned HTTP 200.
- `http://frontend.local.localhost:8010/home/magick-chat` returned HTTP 200.
- Backend smoke proved:
  - profile registration for `mark@stratagility.com`;
  - insufficient-credit result for `paid_managed` requiring 80 credits with 25 balance;
  - FreeLLMAPI fallback job creation at 0 credits;
  - job listing;
  - audit event listing.

## Known Gaps

- Windows owns the frontend build and WSL owns ICP deploy. This avoids WSL `npm install` rewriting native optional dependencies in `node_modules`.
- The frontend is deployed as ICP assets but still uses local/mock state for the visible composer interactions.
- The frontend does not yet call `magickbox_core` through generated bindings.
- Internet Identity is enabled in the local ICP network but not wired into the React sign-in page yet.
- ICP/ICRC payment transfer flow is not implemented yet.
- No worker callback protocol for MagickAI/FreeLLMAPI/local Ollama is implemented yet.
- No media hash/manifest upload flow yet.
- No isolated mainnet preview canister was created.

## Recommended Next Build Slice

1. Generate TypeScript bindings for `magickbox_core`.
2. Add an ICP client adapter that reads the local asset canister `ic_env`.
3. Replace the mock sign-in with Internet Identity.
4. Wire `register_profile`, `get_provider_options`, `create_generation_job`, and insufficient-credit results into the React composer.
5. Add local ICRC/ICP payment intent records, then a real test-ledger top-up proof.
6. Add a worker callback contract for MagickAI and FreeLLMAPI.
7. Add an explicit checkpoint before any Caffeine.ai creation, live Magick Box login, or isolated mainnet canister deployment.
