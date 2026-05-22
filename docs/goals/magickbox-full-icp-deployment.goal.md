# /goal Magick Box Mostly-On-ICP Deployment Prototype

Last updated: 2026-05-22T18:33:47+07:00

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

Any ICP deployment must be a new isolated local or preview canister target. No production canister, domain, controller, billing account, or identity may be reused without a separate explicit approval checkpoint.

## Target Architecture

ICP should own:

- Certified frontend assets.
- Internet Identity app login.
- User profile and account state keyed by principal.
- Credit balance and ICP payment intent records.
- Subscription/top-up offer metadata.
- Generation job records.
- Conversation/project/collection metadata.
- Public gallery metadata.
- Append-only audit events.
- Provider routing preferences and user-owned AI adapter choices.

Off-chain/external adapters should handle:

- Dynamic AI inference that cannot currently run practically inside canisters.
- FreeLLMAPI as an optional OpenAI-compatible chat/fallback proxy.
- MagickAI as the rich Magick Friend/media provider SDK reference and possible worker service.
- User-provided API keys or local AI endpoints, without storing secrets in canister state.
- Ollama/local LLM integration through the user's machine or a user-managed endpoint.
- Large media files, with content hashes/manifests anchored on ICP.
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
8. Only later, after explicit confirmation, explore authenticated live Magick Box UX with `mark@stratagility.com`.
9. Only later, after explicit confirmation, use Caffeine.ai to create a separate `codex_magickboxOnICP` app if helpful.

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
- Core canister records for ICP payment intents, claimed payment blocks, ad credit grants, authorized workers, worker runs, and media manifests.
- Advanced local smoke that transfers local ICP to the core canister account, claims credits, grants ad credits, runs a local Ollama worker, completes the job, and anchors a media manifest.
- No mainnet deploy.
- No production live login.
- No production payment connection.
- No Caffeine.ai external app creation yet.
- No API keys stored in canister state.

## Stop Conditions

Stop when the isolated repo has:

- A durable plan.
- Local ICP canister scaffold.
- Frontend-ready ICP adapter surfaces.
- Credit recovery/product flow modeled in the UI.
- Verification results documented.

Pause before any mainnet deploy, ICP spend, production login, Caffeine.ai account action, production repo action, or production service configuration.
