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

## Deployment/Preview Status

- Local Vite preview remains available at `http://127.0.0.1:5173/`.
- Local ICP deployment is now available at `http://frontend.local.localhost:8010/`.
- No production deployment.
- No mainnet ICP deployment.
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
- Media canister: `tz2ag-zx777-77776-aaabq-cai`
- Frontend canister: `t63gs-up777-77776-aaaba-cai`
- Live Caffeine control center: `https://magickbox-icp-e68.caffeine.xyz/`

Newly completed:

- Browser composer now runs a real worker execution path and stores generated output in the dedicated ICP media canister.
- `npm run smoke:icp:ui` proves local browser identity login, prompt submission, worker execution, `magickbox_media` byte storage, `magickbox_core` manifest attachment, and completed UI state.
- Caffeine app was published as a separate isolated control center and verified live. It is not connected to Magick Box production and is not authoritative state.

Latest verification:

- `npm run verify` passed: lint, 25 Vitest tests, build, and 12 Playwright checks.
- `npm run smoke:icp:advanced` passed.
- `npm run smoke:icp:ui` passed.
- Caffeine live smoke passed with title `Magick Box ICP Control Center`.
- `npm run preflight:mainnet` failed safely because the selected mainnet identity has `0 ICP`, `0 cycles`, and no dedicated `MAGICKBOX_MAINNET_IDENTITY`.

Remaining blocker for true mainnet ICP canisters:

- Fund a dedicated isolated identity, set `MAGICKBOX_MAINNET_IDENTITY`, define primary and backup controllers, then run the new-canister mainnet deploy. Do not reuse production Magick Box infrastructure.
