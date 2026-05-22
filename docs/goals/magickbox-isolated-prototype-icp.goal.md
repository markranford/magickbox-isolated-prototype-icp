# /goal Magick Box Isolated Prototype With ICP-First Review

Last updated: 2026-05-22T15:31:37+07:00

## Mission

Create a completely isolated Magick Box prototype and evaluation packet that demonstrates how a new Magick Box could preserve at least the currently observable user experience while improving architecture, maintainability, UX quality, performance, accessibility, testing, deployment safety, and ICP readiness.

This goal continues the already-created isolated prototype at:

`C:\Users\Mark\Documents\Codex\Codex_MagickBox\magick-box-rewrite-readiness-prototype`

Do not restart or discard completed useful work unless it becomes unsafe or clearly conflicts with this goal.

## Absolute Safety Boundary

The following are read-only references only:

- `https://github.com/General-Magick-Industries/magick-box`
- `https://github.com/General-Magick-Industries/magick_box_fe_web`
- `https://www.magickbox.ai`

Never modify, push to, open PRs against, deploy over, configure, migrate, or otherwise disturb either existing repository or the production website. Do not touch production DNS, hosting, auth provider, analytics, billing, databases, secrets, deployment settings, or live users.

The prototype must remain local or deploy only to an explicitly separate preview target, such as a new isolated ICP canister or local development server. No shared production deployment target or production credential may be used.

## Reference Use

Use the existing repositories and live production app only to understand:

- Current routes and observable UX.
- App shell and auth entry points.
- Public content, metadata, and styling system.
- Dependencies, architecture, build/test setup, and obvious weaknesses.
- Production runtime issues observable without login or invasive testing.

Do not copy secrets or production configuration. Do not inspect tracked files that are likely to contain secrets unless a later safety review explicitly scopes and authorizes that work.

## ICP-First Strategic Requirement

Evaluate a new Magick Box version that can exist either entirely on ICP or mostly on ICP. Treat ICP as the preferred target architecture, not an afterthought.

The review must document:

- Whether the frontend can be deployed as certified ICP assets.
- Whether backend/application logic should live in ICP canisters.
- What data/state belongs on ICP versus off-chain or external services.
- Auth options, including Internet Identity and other ICP-compatible auth paths.
- Storage options for user, project, conversation, asset, and audit state.
- Limits and tradeoffs around dynamic AI inference, payments, analytics, media storage, and external API calls.
- What a fully ICP version would require.
- What a mostly ICP hybrid version would require.
- Which path is best for the prototype and why.

## Deliverables

- `docs/goals/magickbox-isolated-prototype-icp.goal.md`
- `docs/progress/magickbox-prototype-progress.md`
- `docs/audits/magickbox-opportunity-review.md`
- `docs/audits/magickbox-icp-architecture-review.md`
- A runnable isolated prototype.
- `docs/handovers/magickbox-isolated-prototype-handoff.md`

Existing docs and artifacts may remain as historical support, but the final handoff should point to the durable paths above.

## Prototype Requirements

The prototype should:

- Preserve the observable Magick Box experience at minimum: public landing route, header labels, hero, creation modes, Magick Friend composer, Launch Beta route behavior, app shell labels, Explore view, collection/subscription/settings/sign-in affordances.
- Improve clear observed issues where evidence supports improvement: semantic structure, accessibility, mobile layout, runtime console health, route testability, deployment isolation, and avoiding heavy visual effects that caused production warnings/errors.
- Use local/mock behavior for auth, billing, generation, queues, and community data unless an isolated ICP preview is explicitly created.
- Avoid production API, socket, auth, billing, analytics, database, and deployment configuration.

## Evaluation Requirements

Maintain checks that prove the prototype is better or at least equivalent:

- Route and UX parity notes.
- Desktop and mobile screenshots.
- Lint, unit tests, typecheck/build.
- Browser smoke tests.
- Accessibility checks where feasible.
- Metadata/SEO checks.
- Console-error checks.
- Before/after comparison against the live site.
- ICP architecture readiness assessment.

## Recommended Architecture Thesis To Test

The current best prototype path is a mostly ICP hybrid proof:

- Frontend as a certified ICP asset canister.
- Small backend canister slice for identity-bound user/project/conversation metadata, generation job records, collections, and audit events.
- Internet Identity for the ICP-native auth proof, with room for wallet or OAuth-adjacent options later if product requirements demand them.
- External AI inference providers or isolated off-chain workers for dynamic model execution at first, with canister-held job state and result attestations where practical.
- Large generated media in dedicated object/media storage initially, with hashes, ownership records, metadata, and publication state anchored on ICP.
- Payments first modeled via ICP/ICRC-compatible ledgers or Stripe retained off-chain depending on go-to-market constraints; do not connect production billing in this prototype.

This tests the most valuable ICP-native product claims without forcing a premature full backend rewrite.

## Stop Conditions

Stop only when:

- The isolated prototype repo exists and remains safe.
- The durable goal and progress log are written.
- The opportunity and ICP architecture audits are written.
- The prototype can run locally or in a separate preview environment.
- Feasible checks have passed, or exact blockers are documented.
- The handoff report records findings, decisions, commands, verification results, artifacts, risks, and next steps.

Pause before any action that could affect the existing GitHub repos, production website, DNS, hosting, auth provider, analytics, billing, databases, secrets, deployment settings, or live users.
