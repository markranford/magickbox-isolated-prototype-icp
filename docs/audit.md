# Magick Box Rewrite Readiness Audit

Date: 2026-05-22

Scope: read-only inspection of:

- `https://github.com/General-Magick-Industries/magick-box`
- `https://github.com/General-Magick-Industries/magick_box_fe_web`
- `https://www.magickbox.ai` redirected to `https://magickbox.ai/`

Safety boundary: both repos were shallow-cloned only under `../_readonly_references`, with push URLs locally set to `DISABLED`. No production credentials, DNS, analytics, billing, auth provider, database, deployment, branch, PR, or remote configuration was touched.

## Current UX Map

Observed production public route:

- `/` title: `Magick Box`
- Header: MagickBox logo, `Features`, `Gallery`, `Pricing`, `About Us`, `Contact Us`, `Launch Beta`
- Hero: `Create Anything with AI - Faster Than Ever`
- Hero subcopy: one platform for images, text, and more
- Creation modes: `Image Creation`, `Video Creation`, `Music Creation`
- Composer: `Ask to Magick Friend...` style input with attachment, prompt enhancement, tier dropdown, and submit
- Sections from live text/source: Features, Gallery, Pricing, About Us, Contact Us
- `Launch Beta` target observed in the browser: `/home/explore?category=latest`
- App shell labels observed after Launch Beta: `Create`, `Explore`, `Collections`, `Subscriptions`, `Settings`, `Sign in`, plus `Latest` and `Trending`

Screenshots and browser artifacts are stored in `docs/artifacts/reference/`.

## Reference Architecture

Frontend reference:

- Next app-router project named `magick_box_fe_web`
- Version `1.9.4`, private package, `yarn@1.22.22`
- Main dependencies include Next `^16.1.1`, React `^19.2.3`, MUI, Emotion, NextAuth v5 beta, TanStack Query, Socket.IO, TipTap, GSAP, Three, OGL, Swiper, Framer Motion, i18next, Zod, and many custom icon components
- Routes include `/`, auth routes, `/home/explore`, `/home/magick-chat`, `/home/collections`, `/home/subscriptions`, `/home/settings`, `/terms`, `/policy`, and media/detail routes
- The new landing page composes `Header`, `Hero`, `Features`, `Gallery`, `Pricing`, `About`, and `Contact`
- Auth uses credentials plus Google OAuth through NextAuth and backend endpoints under `NEXT_PUBLIC_API_URL`
- Socket.IO reads `NEXT_PUBLIC_SOCKET_URL`

Backend reference:

- Python/FastAPI service named `magick_box`, version `1.9.0`
- Dependencies include FastAPI, Motor/MongoDB, Beanie, Redis, Celery, Stripe, OpenAI, LiteLLM-adjacent services, Stability, AWS S3, Socket.IO, and Helm deployment assets
- Main API includes auth, user, packages, payments, chat, image, video, music, podcast, content feed, collections, notifications, admin, search, gamification, upload, user guide, and Magick Friend config routes
- Startup currently requires Mongo connectivity and initializes quest service state before serving

## High-Value Opportunities

Architecture and maintainability:

- Split public marketing, authenticated app shell, API contracts, and generation job lifecycle into explicit boundaries. The current frontend mixes landing, auth, app shell, community, subscriptions, media dialogs, and generation workflows in one large Next app.
- Create a typed route registry and feature ownership map. The app-router tree is broad and hard to evaluate from filenames alone.
- Standardize API contracts and job states for chat, image, video, music, and podcast. The backend has many vertical slices, but the product UX depends on a shared async generation model.
- Add an environment schema. The reference uses many env variables across frontend/backend, and the frontend has a tracked `.env.production` file that was not opened in this audit.
- Keep backend feature slices for now, but isolate infrastructure adapters and long-running generation queues behind clearer interfaces before any rewrite.

UX quality:

- Preserve the strong first impression: dark MagickBox shell, light-trail hero, mode buttons, and Magick Friend composer.
- Make the app entry more legible after `Launch Beta`: the live app lands in Explore with minimal onboarding context.
- Replace or harden the heavy 3D gallery. Production emitted repeated `THREE.Clock` deprecation warnings and a `clientWidth` null read from a resize observer during inspection.
- Make creation state explicit: queued locally, uploading, generating, ready, failed, saved, published. This is more important than adding more visual chrome.
- Improve mobile density. The production mobile landing rendered a very tall page, about 9728px scroll height in the captured pass.

Accessibility:

- Add semantic sections, labels, landmarks, and focus states. Browser extraction found limited semantic section structure in production despite many visible sections.
- Ensure icon-only buttons have accessible names and visible focus.
- Validate color contrast under real screenshots, not only token assumptions.

Performance:

- Remove runtime-heavy visual effects from core page load or lazy-load them behind stable layout boxes.
- Limit client-only rendering where the route can be static or server-rendered.
- Avoid always-on sockets except inside authenticated app routes that need realtime updates.

Deployment safety:

- Keep production `.env`, Helm values, certificates, billing secrets, analytics IDs, and auth provider config out of rewrite prototypes.
- Remove any logged secret material. Backend inspection found a Stripe API key logging line in the mobile payment service.
- Fix backend CORS posture. `allow_origins=["*", ...]` with credentials allowed is a red flag and should become explicit environment-scoped origins.
- Avoid secret fallbacks. JWT signing falling back to a random generated key creates restart-time token invalidation and hides missing configuration.

Testing:

- Add route smoke tests for `/`, `/home/explore`, `/home/magick-chat`, `/home/collections`, `/home/subscriptions`, `/home/settings`, and auth entry.
- Add browser console checks, screenshot checks, and accessibility checks to every proposed frontend rewrite slice.
- Add backend contract tests around the shared async generation lifecycle before touching service internals.

## Stack Recommendation

Recommended direction: modernize with a fresh frontend shell first, not a backend rewrite.

Keep:

- The product concept, public information architecture, major routes, Magick Friend composer pattern, and FastAPI as the backend base until contracts prove otherwise.

Modernize:

- Frontend architecture into smaller route-owned modules, shared design tokens, typed mock/API contracts, route smoke tests, and a strict separation between landing, auth, app shell, and generation workflow.
- Backend configuration, secrets handling, CORS, logging, OpenAPI contracts, and async job lifecycle.

Replace selectively:

- Replace the heavy landing gallery implementation if it continues producing runtime warnings/errors.
- Replace ad hoc UI composition with a lean design-system layer that can be implemented in Next or Vite.

Prototype choice:

- This evaluation prototype uses React + Vite + React Router because it is isolated, fast to audit, easy to screenshot, and has no production integration. That does not require production to abandon Next; it proves the smaller app-shell and evaluation direction before committing to a migration.
