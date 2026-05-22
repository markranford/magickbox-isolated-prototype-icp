# Magick Box Rewrite Readiness Handoff

Date: 2026-05-22

## Prototype Location

`C:\Users\Mark\Documents\Codex\Codex_MagickBox\magick-box-rewrite-readiness-prototype`

Local preview:

`http://127.0.0.1:5173/`

The local Vite dev server is running on port `5173`. No external deployment was created.

## Safety Status

- Existing GitHub repos were cloned read-only under `../_readonly_references`.
- Reference clone push URLs were locally set to `DISABLED`.
- No production website, DNS, auth provider, analytics account, billing provider, database, deployment target, secret, branch, PR, or remote config was modified.
- The prototype has no production API calls. All creation, auth, billing, and queue behavior is local mock state.

## Reference Findings

Production public UX:

- Landing route title: `Magick Box`
- Header: MagickBox logo, `Features`, `Gallery`, `Pricing`, `About Us`, `Contact Us`, `Launch Beta`
- Hero: `Create Anything with AI - Faster Than Ever`
- Modes: `Image Creation`, `Video Creation`, `Music Creation`
- Composer: Magick Friend prompt input, attachment, enhancement, tier dropdown, submit
- `Launch Beta` routes to `/home/explore?category=latest`
- App shell labels after launch: `Create`, `Explore`, `Collections`, `Subscriptions`, `Settings`, `Sign in`, `Latest`, `Trending`

Reference architecture:

- Frontend: Next app-router, React 19, MUI/Emotion, NextAuth beta, TanStack Query, Socket.IO, TipTap, GSAP, Three/OGL, custom icons, broad route tree.
- Backend: FastAPI, Mongo/Motor, Redis, Celery, Stripe, AWS S3, AI service adapters, Socket.IO, Helm deployment assets, broad vertical feature slices.

Notable risks found:

- Production console emitted repeated `THREE.Clock` deprecation warnings and a `clientWidth` null read during browser inspection.
- Frontend contains a tracked `.env.production` file, not opened in this audit.
- Backend reference contains tracked deployment/certificate-related files, not opened for secret values.
- Backend CORS allows wildcard origins while credentials are enabled.
- JWT secret falls back to a generated random value when env is missing.
- One backend payment service logs a Stripe API key value.
- README and backend package metadata disagree on Python version expectations.

Full audit: `docs/audit.md`

## Architecture Decisions

- Build a frontend-first prototype because the observable risk is mainly UX, routing, app-shell organization, accessibility, performance, and deployment safety.
- Defer backend rewrite until API contracts and async generation job states are defined.
- Preserve the public Magick Box UX minimum: dark header, hero, light-trail visual, mode buttons, Magick Friend composer, major sections, Launch Beta behavior, and app shell labels.
- Improve the prototype with semantic sections, accessible labels, keyboard focus for scrollable regions, local-only queue status, browser tests, and clear deployment isolation.
- Replace the heavy production gallery with a lighter media rail in the prototype because the current rendered site emitted Three/OGL-related warnings/errors.

## Verification Results

| Check | Result | Evidence |
| --- | --- | --- |
| Lint | Pass | `npm run lint` |
| Unit tests | Pass, 2 tests | `npm run test` |
| Typecheck/build | Pass | `npm run build` |
| Browser smoke | Pass, 4 Playwright tests | `npm run e2e` |
| Desktop screenshot | Captured | `docs/artifacts/prototype/prototype-home-desktop.png` |
| Mobile screenshot | Captured | `docs/artifacts/prototype/prototype-home-mobile.png` |
| Accessibility | Pass | Axe run in Playwright returned no violations |
| Metadata/SEO | Pass | `dist/index.html` contains title, description, OG title, OG description, OG image |
| Console health | Pass in clean Playwright context | Browser messages array was empty during e2e |
| In-app browser sanity | Pass for local page identity, nonblank load, Launch Beta route, Explore visibility | `docs/artifacts/prototype/browser-sanity-explore.png` |

Browser/IAB note: the in-app browser console API retained old production log entries from the reference inspection. Clean Playwright contexts are the source of truth for prototype console health.

## Before/After Comparison

Equivalent or preserved:

- Same primary public route role.
- Same header labels and Launch Beta affordance.
- Same hero content and light-trail visual direction.
- Same creation mode concepts.
- Same Magick Friend composer concept.
- Same app entry target and app navigation labels where observable.

Improved:

- Route parity is documented and testable.
- Launch Beta, Explore, and chat composer flows are covered by browser tests.
- Accessibility checks are automated.
- The gallery avoids the production Three.js warning/error path.
- Purchase and auth actions are visibly non-production.
- No production env file, secret, API, socket, analytics, billing, or deployment target is connected.

Intentional deviations:

- Text uses ASCII hyphens in source for encoding stability.
- Auth, billing, generation, and community data are mocks.
- The backend is not rewritten.
- The prototype is Vite/React Router for evaluation speed; this is not a final production stack decision.

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

## Risks And Blockers

- This is a prototype, not a production migration.
- Reference assets were copied locally for parity; final production work should confirm asset ownership and design-source files.
- Backend behavior is inferred from code structure, not exercised against production or staging.
- Production auth, billing, analytics, socket, and database flows were intentionally not tested.
- The full live site could not be exhaustively crawled without logging in.

## Recommended Next Steps

1. Decide whether the landing and app shell should remain one deployable or split into public marketing plus authenticated app.
2. Define an API contract for generation job lifecycle across chat, image, video, music, and podcast.
3. Run a dedicated secrets/config audit on the existing repos before any rewrite work.
4. Fix the production gallery warning/error path or replace the effect with a lower-risk visual.
5. Build a small authenticated proof slice next: sign-in boundary, model/tier fetch, one generation queue state, and collection save.
