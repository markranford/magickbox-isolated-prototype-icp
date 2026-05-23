# Magick Box Isolated Prototype Handoff

Date: 2026-05-22

## Prototype Location

`C:\Users\Mark\Documents\Codex\Codex_MagickBox\magick-box-rewrite-readiness-prototype`

Local preview:

`http://127.0.0.1:5173/`

The local Vite dev server was previously started on port `5173`. No external deployment was created.

Main packet git checkpoint:

`09e393e docs: add ICP prototype goal and audit packet`

## Safety Status

- Existing GitHub repos were cloned read-only under `../_readonly_references`.
- Reference clone push URLs were locally set to `DISABLED`.
- The prototype repo has no configured remotes.
- No production website, DNS, auth provider, analytics account, billing provider, database, deployment target, secret, branch, PR, or remote config was modified.
- The prototype has no production API calls. Current creation, auth, credits, ICP payment proof, ad credits, worker completion, media manifests, queue, and community behavior is isolated local ICP or local-browser/local-worker state.
- No ICP mainnet or preview deployment was created in this pass.

## Durable Packet

- Goal: `docs/goals/magickbox-isolated-prototype-icp.goal.md`
- Progress log: `docs/progress/magickbox-prototype-progress.md`
- Opportunity review: `docs/audits/magickbox-opportunity-review.md`
- ICP architecture review: `docs/audits/magickbox-icp-architecture-review.md`
- Route parity: `docs/evals/route-parity.md`
- Live media asset inventory: `docs/evals/magickbox-live-media-assets.md`
- ICP delivery gap check: `docs/evals/magickbox-icp-delivery-gap-check.md`
- Evaluation checklist: `docs/evals/checklist.md`
- Historical first-pass audit: `docs/audit.md`
- Historical first-pass handoff: `docs/handoff.md`

## Reference Findings

Production public UX:

- Landing route title: `Magick Box`.
- Header: logo, `Features`, `Gallery`, `Pricing`, `About Us`, `Contact Us`, `Launch Beta`.
- Hero: `Create Anything with AI - Faster Than Ever`.
- Modes: `Image Creation`, `Video Creation`, `Music Creation`.
- Composer: Magick Friend prompt input, attachment, enhancement, tier dropdown, submit.
- `Launch Beta` routes to `/home/explore?category=latest`.
- App shell labels after launch: `Create`, `Explore`, `Collections`, `Subscriptions`, `Settings`, `Sign in`, `Latest`, `Trending`.

Reference architecture:

- Frontend: Next app-router, React 19, MUI/Emotion, Auth.js/NextAuth beta, TanStack Query, Socket.IO, TipTap, GSAP, Three/OGL, custom icons, broad route tree.
- Backend: FastAPI, Mongo/Motor, Redis, Celery, Stripe, AWS S3, AI service adapters, Socket.IO, Helm deployment assets, broad vertical feature slices.

Notable risks found:

- Production console emitted repeated `THREE.Clock` deprecation warnings and a `clientWidth` null read during browser inspection.
- Frontend contains a tracked `.env.production` file, not opened in this audit.
- Backend reference contains tracked deployment/certificate-related files, not opened for secret values.
- Backend CORS allows wildcard origins while credentials are enabled.
- JWT secret falls back to a generated random value when env is missing.
- One backend payment service logs a Stripe API key value.
- README and backend package metadata disagree on Python version expectations.

## Architecture Decisions

- Keep the existing isolated prototype and harden it instead of restarting.
- Build frontend-first because observable risk is mostly UX, routing, app-shell organization, accessibility, performance, and deployment safety.
- Treat ICP as the preferred target architecture.
- Recommend a mostly ICP hybrid proof first: certified asset canister frontend, Internet Identity, canister-held product metadata, ICP media storage, audit events, external AI workers/providers, and isolated payment experiments.
- Defer a full backend rewrite until API contracts, generation job state, data placement, auth, media storage, credits, and migration constraints are proven.
- Include `public/.ic-assets.json5` so Vite builds carry ICP asset canister SPA routing and security policy into `dist/`.

## Prototype Coverage

Equivalent or preserved:

- Public landing route with same primary role.
- Header labels and `Launch Beta` affordance.
- Hero content and light-trail visual direction.
- Creation mode concepts.
- Magick Friend composer concept.
- App entry target and app navigation labels where observable.

Improved:

- Route parity is documented and testable.
- Launch Beta, Explore, chat composer, and ICP asset policy are covered by browser checks.
- Accessibility checks are automated.
- The gallery avoids the production Three/OGL warning/error path.
- Purchase and auth actions are visibly non-production.
- Public live-site media has been copied into the isolated asset source and visible gallery/explore media uses copied local paths.
- No production env file, secret, API, socket, analytics, billing, or deployment target is connected.
- `/evaluation` includes route parity and ICP readiness.

Intentional deviations:

- Production auth, fiat billing, production community data, and production media storage are not connected. Local ICP auth, credit accounting, per-intent subaccount payment claims, ad-credit grants, local Ollama, FreeLLMAPI-compatible and MagickAI-compatible worker completion, ICP media asset storage, and media manifest anchoring are implemented in the isolated prototype.
- The backend is not rewritten.
- The prototype is Vite/React Router for evaluation speed; this is not a final production stack decision.
- No production or shared preview deployment was created.

## Run Commands

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

## Verification Commands

```bash
npm run lint
npm run test
npm run build
npm run e2e
```

Full chained command:

```bash
npm run verify
```

## Verification Results

Latest full verification after the ICP packet hardening passed:

| Check | Result | Evidence |
| --- | --- | --- |
| Lint | Pass | `npm run lint` |
| Unit tests | Pass, 6 files / 19 tests | `npm run test` |
| Typecheck/build | Pass | `npm run build` |
| Browser smoke | Pass, 8 Playwright tests | `npm run e2e` |
| Desktop screenshot | Captured | `docs/artifacts/prototype/prototype-home-desktop.png` |
| Mobile screenshot | Captured | `docs/artifacts/prototype/prototype-home-mobile.png` |
| Accessibility | Pass | Axe run in Playwright returned no violations |
| Metadata/SEO | Pass | Build includes title, description, OG title, OG description, OG image |
| Console health | Pass in clean Playwright context | Browser warning/error array was empty during e2e |
| Live media asset copy | Pass | `npm run audit:media` copied 95/96 discovered public media URLs; skipped URL was a live 404 |
| Gallery/explore media paths | Pass | visible media uses `/reference-assets/live-site/...` local paths and local ICP browser check found no broken production hotlinks |
| ICP evaluation route | Pass | e2e verified `/evaluation` exposes route parity and ICP readiness |
| ICP asset policy | Pass | e2e verified `dist/.ic-assets.json5` contains raw-access, SPA aliasing, and CSP policy |
| Local ICP payment binding | Pass | advanced smoke transferred `0.001` local ICP to a per-intent ICRC subaccount |
| Worker adapters | Pass | advanced smoke completed local Ollama, FreeLLMAPI-compatible, and MagickAI-compatible worker jobs |
| Media storage manifests | Pass | advanced smoke anchored `icp-media://...` manifests through `icp-canister-media-store` |
| Live service harness | Pass in optional mode | `npm run smoke:services` skipped unconfigured live services safely |
| ICP media backend | Pass for code path and decision | generated worker output bytes are stored in the ICP canister; larger media should move to dedicated ICP media/chunk canisters |

The new e2e suite includes a check that `dist/.ic-assets.json5` carries:

- `allow_raw_access: false`
- `enable_aliasing: true`
- `Content-Security-Policy`

## Screenshot Artifacts

Reference:

- `docs/artifacts/reference/production-home-viewport.png`
- `docs/artifacts/reference/production-home-desktop-full.png`
- `docs/artifacts/reference/production-home-mobile.png`
- `docs/artifacts/reference/production-auth-entry.png`
- `docs/artifacts/reference/production-console-warnings.json`

Prototype:

- `docs/artifacts/prototype/prototype-home-desktop.png`
- `docs/artifacts/prototype/prototype-home-mobile.png`
- `docs/artifacts/prototype/browser-sanity-explore.png`
- `docs/artifacts/prototype/local-icp-payment-subaccount-ui.png`
- `docs/artifacts/prototype/local-icp-copied-media-gallery.png`
- `docs/artifacts/prototype/local-icp-copied-media-explore.png`
- `docs/artifacts/prototype/caffeine-draft-v3-admin-desktop-2026-05-23.png`
- `docs/artifacts/prototype/caffeine-draft-v3-admin-mobile-2026-05-23.png`
- `docs/artifacts/prototype/caffeine-live-v3-admin-desktop-2026-05-23.png`
- `docs/artifacts/prototype/caffeine-live-v3-admin-mobile-2026-05-23.png`

## Deployment/Preview Status

- Local Vite preview remains available at `http://127.0.0.1:5173/`.
- Local ICP deployment is now available at `http://frontend.local.localhost:8010/`.
- Isolated Caffeine live preview is deployed at `https://magickbox-icp-e68.caffeine.xyz/`.
- No Magick Box production deployment. `www.magickbox.ai`, production DNS, production auth, production billing, production analytics, production databases, secrets, and live users were not touched.
- No direct mainnet ICP canister deployment yet.
- No ICP spend.
- If deploying later, use only a new isolated ICP preview canister and a new isolated deploy identity/mapping. Do not use `magickbox.ai`, existing canisters, existing DNS, existing auth settings, existing analytics, existing billing, or production secrets.

Full ICP local handoff: `docs/handovers/magickbox-full-icp-local-deploy-handoff.md`

## Risks And Blockers

- The full live site was not exhaustively crawled behind login.
- Backend behavior is inferred from code structure, not exercised against production or staging.
- Production auth, billing, analytics, socket, and database flows were intentionally not tested.
- Reference assets were copied locally for parity; final production work should confirm asset ownership and design-source files.
- The local ICP backend proof is implemented for profile, credits, jobs, payments, worker completion, media manifests, collections, and audit state, but it is not a production backend.
- MagickAI bridge health located the read-only MagickAI repo, but the local Python environment is missing `pymongo`; install bridge dependencies in an isolated environment before running the real SDK smoke.
- The current ICP media asset store is intentionally size-limited for the local proof; production media scale needs dedicated ICP media/chunk canisters.
- Fully on-chain AI inference and fiat billing remain high-risk and need separate proofs.
- Copied public live-site media is static in this prototype; a live ICP community media feed still needs canister-backed indexing and a dedicated ICP media/chunk canister.

## Recommended Next Steps

1. Decide whether subscription payments need ICRC-2 transfer-from in addition to per-intent subaccounts.
2. Run FreeLLMAPI and MagickAI through `npm run smoke:services:required` after configuring isolated service env vars.
3. Add a dedicated ICP media/chunk canister for larger generated assets and rerun `npm run smoke:icp:advanced`.
4. Promote the proven local ICP slice to a new isolated preview only after an explicit checkpoint: asset canister, Internet Identity, core backend canister, local/test payment proof, worker callback, ICP media storage, media manifests, collection save, append-only audit events.
5. Run a separately authorized secrets/config audit on the existing repos before any production rewrite planning.

## 2026-05-23 ICP Generation Completion Update

- Local ICP frontend: `http://frontend.local.localhost:8010/`
- Core canister: `tm5rl-y7777-77776-aaaca-cai`
- Media canister: `t63gs-up777-77776-aaaba-cai`
- Frontend canister: `tz2ag-zx777-77776-aaabq-cai`
- Live Caffeine control center: `https://magickbox-icp-e68.caffeine.xyz/`

Newly completed:

- Browser composer now runs a real worker execution path and stores generated output in the dedicated ICP media canister.
- `npm run smoke:icp:ui` proves local browser identity login, prompt submission, worker execution, `magickbox_media` byte storage, `magickbox_core` manifest attachment, and completed UI state.
- Caffeine app was published as a separate isolated control center and verified live. It is not connected to Magick Box production and is not authoritative state.
- 2026-05-23T13:37+07:00 update: Caffeine version 3 was imported from isolated repo commit `3e6154c`, then published to `https://magickbox-icp-e68.caffeine.xyz/`.
- Public `/home/admin` on Caffeine version 3 now renders a locked owner state and hides `Create funding wallet`, `Claim superadmin`, `Payment and credit controls`, and `Verify balance` on desktop and mobile.

Latest verification:

- Current local verification passed: `npm run lint`, `npm run test` with 7 files / 31 tests, `npm run build`, `wsl ... icp build`, and `npm run e2e` with 14 Playwright checks.
- `wsl ... icp deploy -e local --yes` passed after switching core superadmin setup to install-caller seeding.
- `get_superadmin_status` reports public bootstrap closed, one seeded superadmin, and superadmin access for WSL identity `sprint0-admin`.
- `npm run smoke:icp:advanced` passed with `MAGICKBOX_OWNER_IDENTITY=sprint0-admin`.
- `npm run smoke:icp:ui` passed.
- Caffeine draft v3 smoke passed for `/`, `/home/magick-chat`, and `/home/admin`; draft console showed only Caffeine's own `draft-editor:error disallowed origin` message.
- Caffeine live v3 smoke passed for `/`, `/home/magick-chat`, and `/home/admin`; no console warnings or errors.
- `npm run preflight:mainnet` with the dedicated isolated identity and backup controller passed code/safety checks, then failed safely because the selected mainnet identity has `0 ICP` and `0 cycles`.
- `MAGICKBOX_MAINNET_DRY_RUN=1 npm run deploy:mainnet:icp` passed and printed the exact isolated deploy command without deploying.

Remaining blocker for true mainnet ICP canisters:

- Fund the dedicated isolated identity `magickbox-mainnet-isolated`, mint/receive cycles, then run the guarded new-canister mainnet deploy only after explicit approval. Do not reuse production Magick Box infrastructure.

## 2026-05-23 MagickBoxV3 ICP Builder Preview v9 Update

Live isolated MagickBoxV3 URL:

`https://magickbox-icp-e68.caffeine.xyz/`

This is now more than a static control center. Caffeine.ai builder version 9 serves the reviewed MagickBoxV3 frontend with a runtime `/env.json` and connects to a real isolated backend canister on ICP mainnet.

Live canisters:

- Frontend certified asset canister: `i2fwa-kyaaa-aaaam-qizja-cai`
- Backend/core canister: `itg54-4qaaa-aaaam-qiziq-cai`
- Backend host: `https://icp-api.io`

Source of truth:

- Canonical isolated repo: `https://github.com/markranford/magickbox-isolated-prototype-icp`
- Caffeine bridge repo: `https://github.com/markranford/codex-magickbox-icp-caffeine-20260523`
- Latest bridge commit imported and published: `def344a`
- Product/app name: `MagickBoxV3`
- Caffeine.ai role: ICP AI builder and deployment tool only, not the product name.
- Live public bundle: `assets/index-C8k7BkGp.js`

Current superadmin status:

- `bootstrap_available = true`
- `superadmin_count = 0`
- `system_wallet_owner = principal "itg54-4qaaa-aaaam-qiziq-cai"`

Mark's next owner step:

1. Open `https://magickbox-icp-e68.caffeine.xyz/home/admin`.
2. Sign in with Internet Identity.
3. Enter an 8-128 character setup phrase.
4. Claim superadmin.
5. Create the system funding wallet from the admin dashboard.
6. Fund the displayed system wallet address only after confirming the live URL and canister IDs above.

Important: Codex did not claim the one-time superadmin role. The first authenticated owner claim is intentionally left for Mark's II principal. Claim it before sharing the URL broadly.

Fresh v9 evidence:

- `/env.json` returned HTTP 200 with backend canister `itg54-4qaaa-aaaam-qiziq-cai`.
- Certified asset response headers identify frontend canister `i2fwa-kyaaa-aaaam-qizja-cai`.
- Public no-cache bundle verification found `https://id.ai/authorize`, found `magickboxv3-ii-authorize-20260523`, and did not find the stale `https://id.ai` root helper.
- Click-level browser smoke against `/home/admin` opened `https://id.ai/authorize`; the page title was `MagickBoxV3 ICP Prototype` and no page/console errors were recorded.
- Live route smoke covered `/`, `/home/magick-chat`, `/home/admin`, `/home/settings`, `/home/subscriptions`, and `/evaluation` on desktop and mobile.
- Browser smoke found no page errors, no app console errors, no runtime-unavailable state, and a locked signed-out admin route.
- Live backend Candid smoke registered a profile, created and completed a generation job, stored media bytes on ICP, and listed the resulting `icp-media://...` asset.

Artifacts:

- `docs/artifacts/prototype/magickboxv3-live-v9-smoke-2026-05-23T18-47-13-943Z.json`
- `docs/artifacts/prototype/magickboxv3-live-v9-desktop-home-admin-2026-05-23T18-47-13-943Z.png`
- `docs/artifacts/prototype/magickboxv3-live-v9-mobile-home-admin-2026-05-23T18-47-13-943Z.png`
- `docs/artifacts/prototype/caffeine-live-v7-smoke-2026-05-23T09-55-57-703Z.json`
- `docs/artifacts/prototype/caffeine-live-v7-desktop-home-admin-2026-05-23T09-55-57-703Z.png`
- `docs/artifacts/prototype/caffeine-live-v7-mobile-home-admin-2026-05-23T09-55-57-703Z.png`
- Additional v7 desktop/mobile route screenshots live beside those files and remain useful for earlier route evidence.

Remaining hardening:

- Mark must claim the owner role with II and confirm the dashboard's system wallet flow.
- Add a second Mark-controlled backup admin or controller policy before material funds are kept in the preview.
- Keep direct non-Caffeine mainnet deployment blocked until `magickbox-mainnet-isolated` has ICP/cycles and explicit deploy approval.
- Move large media from the core canister proof path into dedicated ICP media/chunk canisters before real public scale.
- Wire real isolated MagickAI/FreeLLMAPI worker endpoints only after their service URLs, auth boundaries, and cost controls are agreed.

## 2026-05-23 MagickBoxV3 Funding Wallet Update

Live isolated MagickBoxV3 URL:

`https://magickbox-icp-e68.caffeine.xyz/`

Current live builder version:

- Version 11 imported from bridge commit `7dd6509`.
- Public JavaScript bundle: `assets/index-C5vZLlX6.js`.
- Public stylesheet: `assets/index-CuNQml61.css`.

Current owner/funding state:

- Mark claimed superadmin with Internet Identity principal `zo4kw-ezr7z-aslvs-tbhja-ejagl-rtzjk-7zuc7-j5asy-wkbx5-qh3gu-iqe`.
- The one-time bootstrap path is now closed.
- System funding wallet owner: `itg54-4qaaa-aaaam-qiziq-cai`.
- System funding wallet subaccount: `4d4246554e440000000000000000000000000000000000000000000000000001`.
- Derived ICP account ID: `8fdbd57fcdc67228e0a3dc3b95476b2a7a1fabfd8d4612f309a622265bf87d87`.
- Balance confirmed on ICP ledger: `100_000_000` e8s (`1 ICP`) as of 2026-05-23T22:27:08+07:00.

What changed:

- The superadmin wallet panel now displays a copyable ICP account ID, owner principal, subaccount, and ICRC account tuple.
- The panel includes `Open NNS` and `Verify balance` actions.
- The funding target layout was polished so the account identifier has the full available row width.

Verification:

- Local canonical `npm run test -- src/App.test.tsx src/icp/magickboxClient.test.ts` passed.
- Local canonical `npm run build` passed with the existing Vite chunk-size warning.
- Local canonical `npm run lint` passed.
- Bridge repo tests/build passed before both v10 and v11 imports.
- Public no-cache verification for v11 found `ICP account ID`, `Funding wallet ready`, `MagickBoxV3`, `https://id.ai/authorize`, and the polished funding-target CSS in the live assets.
- Authenticated Chrome verification on v10 found the superadmin funding wallet state and account identifier. The final v11 live asset check proves the layout polish is deployed.
- Public backend status now reports `bootstrap_available = false` and `superadmin_count = 1`.
- ICP ledger `icrc1_balance_of` for the system wallet owner/subaccount returned `100_000_000`, confirming the wallet received `1 ICP`.

Next funding step:

Mark should sign in again if the page shows the locked state, confirm the superadmin panel, then click `Verify balance`. Codex did not transfer ICP or spend any ICP.
