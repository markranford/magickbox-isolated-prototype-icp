# /goal Magick Box Mostly-On-ICP Deployment Prototype

Last updated: 2026-05-23T16:59:19+07:00

## Mission

Build the next isolated Magick Box prototype as a mostly-on-ICP application. Everything that can reasonably live on ICP should be modeled or implemented on ICP first. Only capabilities that genuinely do not fit ICP yet should remain off-chain behind explicit adapter boundaries.

Continue from:

`C:\Users\Mark\Documents\Codex\Codex_MagickBox\magick-box-rewrite-readiness-prototype`

## Safety Boundary

The existing production and reference assets remain read-only unless explicitly scoped otherwise:

- `https://github.com/General-Magick-Industries/magick-box`
- `https://github.com/General-Magick-Industries/magick_box_fe_web`
- `https://github.com/General-Magick-Industries/magick_ai`
- `https://github.com/tashfeenahmed/freellmapi`
- `https://www.magickbox.ai`

Do not modify, push to, open PRs against, deploy over, configure, migrate, or otherwise disturb those repos or production. Do not touch production DNS, hosting, auth, analytics, billing, databases, secrets, deployment settings, or live users.

Any ICP deployment must be a new isolated local, preview, or mainnet canister target. No production Magick Box canister, domain, controller, billing account, or identity may be reused. As of 2026-05-22T20:46:06+07:00, Mark explicitly approved using his Caffeine.ai account to create a separate live ICP deployment, but only for a new isolated Caffeine/ICP app and never for `www.magickbox.ai` production hosting, DNS, auth, analytics, billing, databases, secrets, deployment settings, or live users.

## Hybrid Development Rule

Use Caffeine.ai as a fast ICP-oriented preview and development accelerator, not as the final source of authority by default.

The working rule is:

- Caffeine is the fast workshop for quick UI/product/canister-shape iterations.
- GitHub or this isolated local repo is the blueprint and source of truth.
- Direct isolated ICP canisters are the final authority for serious owner, admin, wallet, payment, storage, and production-grade behavior.

When Caffeine is used:

- Export/import code through GitHub when available.
- Review the actual source diff before trusting a Caffeine deployment.
- Patch source directly when Caffeine generation produces an unsafe or stale branch.
- Verify the public Caffeine URL serves the expected version before using any privileged flow.
- Treat Caffeine deployments as preview/test surfaces until live smoke tests prove auth gates, canister IDs, controller ownership, storage behavior, and payment behavior.
- Do not claim superadmin, create funding wallets, or transfer funds through Caffeine unless the live deployed DOM and backend behavior are independently verified.

For final mainnet readiness:

- Deploy the reviewed source to new isolated ICP mainnet canisters controlled by a privately held project identity.
- Keep backup controller policy recorded.
- Keep Caffeine out of the final trust boundary unless explicitly chosen and verified as part of the deployment architecture.

## Target Architecture

ICP should own:

- Certified frontend assets.
- Internet Identity app login.
- User profile and account state keyed by principal.
- Credit balance and ICP payment intent records.
- Subscription/top-up offer metadata.
- Generation job records.
- Conversation/project/collection metadata.
- Generated media bytes, thumbnails, manifests, and public gallery asset state.
- Public gallery metadata.
- Append-only audit events.
- Provider routing preferences and user-owned AI adapter choices.

Off-chain/external adapters should handle:

- Dynamic AI inference that cannot currently run practically inside canisters.
- FreeLLMAPI as an optional OpenAI-compatible chat/fallback proxy.
- MagickAI as the rich Magick Friend/media provider SDK reference and possible worker service.
- User-provided API keys or local AI endpoints, without storing secrets in canister state.
- Ollama/local LLM integration through the user's machine or a user-managed endpoint.
- Stripe/fiat payments as secondary payment paths only.
- Ad-watch verification, with canister credit grants only after a trusted verifier event.

## Product Requirements

- Use Internet Identity for the ICP-native account path.
- Assume ICP payments and ICP/ICRC-compatible credit top-ups as the primary paid path.
- Treat Stripe and other currencies as secondary options.
- When the user lacks enough credits for a request, show a credit recovery popup with:
  - subscribe or top up with ICP,
  - watch an advert to earn credits,
  - use FreeLLMAPI where available,
  - connect their own AI subscription/API service,
  - connect/download a local LLM such as Qwen or another Ollama model.
- Keep paid AI, free AI, own-key AI, and local AI visible as explicit provider choices.
- Preserve the observable Magick Box UX from the current prototype.

## Implementation Phases

1. Plan and scaffold the ICP project inside the isolated prototype.
2. Add a core ICP canister for account, credits, provider options, generation jobs, collections, and audit events.
3. Prepare the frontend asset canister configuration.
4. Add a frontend ICP adapter layer that requires `ic_env` for canister writes and refuses to fake generation when no canister runtime is present.
5. Add the credit recovery popup and provider-selection UI.
6. Deploy locally to ICP if tooling allows.
7. Add tests and docs that prove the ICP-owned state model works.
8. Explore authenticated live Magick Box UX with `mark@stratagility.com` only when Mark is present and production actions are read-only.
9. Use Caffeine.ai, now explicitly approved, only to create a separate `codex_magickboxOnICP` app or equivalent isolated live ICP preview/development deployment.
10. Use GitHub/local source as the canonical Caffeine import/export boundary and verify Caffeine's public live URL against the reviewed source.
11. Prepare direct ICP mainnet deployment only after preflight proves the selected identity has ICP/cycles and backup-controller policy is recorded.

## Current Build Choice

First safe build slice:

- Local ICP configuration and canister source.
- Certified frontend asset canister deploy on isolated local gateway `8010`.
- Generated TypeScript Candid binding from `magickbox_core.did`.
- Frontend adapter that reads asset canister `ic_env`.
- React Internet Identity entry points.
- Persistent local signed browser identity for the Codex in-app browser when signer popups are blocked.
- Composer canister job creation path after Internet Identity or local browser identity auth.
- Local browser identity auto-reconnect after direct route loads.
- Core canister records for per-intent ICRC subaccount payment intents, claimed payment blocks, ad credit grants, authorized workers, worker runs, media assets, and media manifests.
- Advanced local smoke that transfers local ICP to a per-intent subaccount, claims credits, grants ad credits, runs local Ollama, FreeLLMAPI-compatible, and MagickAI-compatible workers, stores generated output bytes on ICP, completes the jobs, and anchors media manifests.
- Direct ICP CLI mainnet deploy is blocked until the chosen identity has ICP/cycles and a backup-controller policy.
- No production live login.
- No production payment connection.
- Caffeine.ai account use is approved for a separate isolated app only.
- No API keys stored in canister state.

## Current MagickBoxV3 ICP Builder Preview State

As of 2026-05-23T18:47:13+07:00, the isolated MagickBoxV3 deployment is live through the Caffeine.ai ICP builder at:

`https://magickbox-icp-e68.caffeine.xyz/`

This is a separate MagickBoxV3 ICP preview deployment, not the production Magick Box website.

Known live MagickBoxV3 preview canisters:

- Frontend certified asset canister: `i2fwa-kyaaa-aaaam-qizja-cai`
- Backend/core canister: `itg54-4qaaa-aaaam-qiziq-cai`
- Caffeine `/env.json` backend host: `https://icp-api.io`

Current behavior:

- The live MagickBoxV3 frontend loads backend canister config from `/env.json`.
- Caffeine.ai version 9 is both `Current` and `Live` for the target builder project.
- The public live bundle is `assets/index-C8k7BkGp.js`.
- The live bundle contains the MagickBoxV3 build marker `magickboxv3-ii-authorize-20260523`.
- The live Internet Identity button opens `https://id.ai/authorize`, not the Internet Identity dashboard root.
- The live backend reports `bootstrap_available = true`, `superadmin_count = 0`, and `system_wallet_owner = principal "itg54-4qaaa-aaaam-qiziq-cai"`.
- Mark should claim the first superadmin with his Internet Identity from the live admin route before sharing the URL broadly.
- The one-time claim requires an authenticated non-anonymous principal and an 8-128 character setup phrase.
- Codex must not claim the one-time superadmin role with a local or automation identity.
- Media generated through the app path should be stored on ICP using the `icp-media://...` core canister media path; AWS/S3 is not part of the desired architecture.

Fresh MagickBoxV3 v9 checks recorded:

- `/env.json` returned HTTP 200 with the backend canister ID above.
- No-cache public bundle verification found `https://id.ai/authorize`, found `magickboxv3-ii-authorize-20260523`, and did not find the stale `https://id.ai` root helper.
- Click-level browser smoke on `/home/admin` opened `https://id.ai/authorize`, with no page errors and no console errors.
- Browser smoke covered `/`, `/home/magick-chat`, `/home/admin`, `/home/settings`, `/home/subscriptions`, and `/evaluation` on desktop and mobile.
- Browser smoke found no page errors, no app console errors, no runtime-unavailable copy, and a locked signed-out admin route.
- CLI smoke against the live backend registered a profile, created and completed a generation job, stored media bytes on ICP, and listed the stored media asset.

## Stop Conditions

Stop when the isolated repo has:

- A durable plan.
- Local ICP canister scaffold.
- Frontend-ready ICP adapter surfaces.
- Credit recovery/product flow modeled in the UI.
- Verification results documented.

Pause before any action that could affect production Magick Box repos/site/DNS/auth/analytics/billing/databases/secrets/live users, or before any direct ICP CLI mainnet spend from an unfunded or unclear identity. Caffeine.ai actions may proceed only inside a clearly separate new app/deployment.
