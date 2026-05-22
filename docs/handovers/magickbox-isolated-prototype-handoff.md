# Magick Box Isolated Prototype Handoff

Date: 2026-05-22

## Prototype Location

`C:\Users\Mark\Documents\Codex\Codex_MagickBox\magick-box-rewrite-readiness-prototype`

Local preview:

`http://127.0.0.1:5173/`

The local Vite dev server was previously started on port `5173`. No external deployment was created.

## Safety Status

- Existing GitHub repos were cloned read-only under `../_readonly_references`.
- Reference clone push URLs were locally set to `DISABLED`.
- The prototype repo has no configured remotes.
- No production website, DNS, auth provider, analytics account, billing provider, database, deployment target, secret, branch, PR, or remote config was modified.
- The prototype has no production API calls. All creation, auth, billing, queue, and community behavior is local mock state.
- No ICP mainnet or preview deployment was created in this pass.

## Durable Packet

- Goal: `docs/goals/magickbox-isolated-prototype-icp.goal.md`
- Progress log: `docs/progress/magickbox-prototype-progress.md`
- Opportunity review: `docs/audits/magickbox-opportunity-review.md`
- ICP architecture review: `docs/audits/magickbox-icp-architecture-review.md`
- Route parity: `docs/evals/route-parity.md`
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
- Recommend a mostly ICP hybrid proof first: certified asset canister frontend, Internet Identity, canister-held product metadata and audit events, external AI workers/providers, off-chain large media, and isolated payment experiments.
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
- No production env file, secret, API, socket, analytics, billing, or deployment target is connected.
- `/evaluation` includes route parity and ICP readiness.

Intentional deviations:

- Auth, billing, generation, community data, and worker behavior are mocks.
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
| Unit tests | Pass, 1 file / 2 tests | `npm run test` |
| Typecheck/build | Pass | `npm run build` |
| Browser smoke | Pass, 6 Playwright tests | `npm run e2e` |
| Desktop screenshot | Captured | `docs/artifacts/prototype/prototype-home-desktop.png` |
| Mobile screenshot | Captured | `docs/artifacts/prototype/prototype-home-mobile.png` |
| Accessibility | Pass | Axe run in Playwright returned no violations |
| Metadata/SEO | Pass | Build includes title, description, OG title, OG description, OG image |
| Console health | Pass in clean Playwright context | Browser warning/error array was empty during e2e |
| ICP asset policy | Pass | e2e verified `dist/.ic-assets.json5` contains raw-access, SPA aliasing, and CSP policy |

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

## Deployment/Preview Status

- Local preview only.
- No production deployment.
- No ICP deployment.
- If deploying later, use only a new isolated ICP preview canister and a new isolated deploy identity/mapping. Do not use `magickbox.ai`, existing canisters, existing DNS, existing auth settings, existing analytics, existing billing, or production secrets.

## Risks And Blockers

- The full live site was not exhaustively crawled behind login.
- Backend behavior is inferred from code structure, not exercised against production or staging.
- Production auth, billing, analytics, socket, and database flows were intentionally not tested.
- Reference assets were copied locally for parity; final production work should confirm asset ownership and design-source files.
- The ICP backend proof is not implemented yet; this pass prepares the frontend and architecture packet.
- Fully on-chain AI inference, media storage, and fiat billing remain high-risk and need separate proofs.

## Recommended Next Steps

1. Run fresh verification after this ICP hardening pass.
2. Open the local prototype and `/evaluation` route in a browser to inspect the new ICP readiness panel.
3. Build the smallest ICP proof slice in a new isolated preview: asset canister, Internet Identity, minimal backend canister, generation job record, local/mock worker callback, collection save, append-only audit events.
4. Define the shared generation job contract before backend migration.
5. Run a separately authorized secrets/config audit on the existing repos before any production rewrite planning.
