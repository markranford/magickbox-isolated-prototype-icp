# Caffeine Recovery Prompt: codex_magickboxOnICP_live

Create a new separate Caffeine app named `codex_magickboxOnICP_live`.

This is an isolated Magick Box on ICP prototype. It must not modify, connect to, deploy over, or depend on `www.magickbox.ai`, Magick Box production DNS, hosting, auth, analytics, billing, databases, secrets, deployment settings, live users, or the GitHub repos `General-Magick-Industries/magick-box`, `General-Magick-Industries/magick_box_fe_web`, or `General-Magick-Industries/magick_ai`.

Build a deployable working app first. Do not get stuck on custom Motoko hash-map or custom compiler-sensitive code. If Caffeine cannot deploy Motoko canisters directly, use Caffeine-supported persistent backend models for the live app and clearly label the ICP canister boundary in the app/spec. Keep the design and API contract ready to swap into real ICP canisters.

Required app behavior:

- Preserve the observable Magick Box experience: dark MagickBox landing/app shell, hero, Magick Friend prompt composer, Image/Video/Music modes, gallery, pricing/credits, about/contact, chat/job history, and mobile responsive layout.
- Internet Identity is the preferred auth path. If real II cannot be completed inside Caffeine, show a clear "connect II" flow and store only isolated demo user state.
- AI execution must not pretend success. Provide live provider settings for FreeLLMAPI/OpenAI-compatible endpoint, MagickAI worker endpoint, user custom provider endpoint, and local Ollama connection instructions. If no provider is configured, show provider-required and credit-recovery states.
- Credits must be event-bound. Include ICP/ICRC payment-intent UI with per-intent subaccount as primary and ICRC-2 transfer-from as secondary where supported. Only grant credits after a recorded verifiable event. If Caffeine cannot do actual ledger calls, show the exact ledger/canister call contract and keep pending intents unpaid until marked verified by an admin/test verifier.
- Media storage must be ICP-first and no AWS/S3. Implement a dedicated media-store model with chunk metadata, manifests, owner checks, `icp-media://` URIs, and asset records. If Caffeine cannot deploy a media canister, keep the live app storage model equivalent and document the canister interface required.
- Include ad-verifier credit flow as a separate verification event type.
- Include visible ICP status, active provider, credit balance, media storage state, and payment intent state.
- Include a system/status page that lists what is live in Caffeine now, what is ready for ICP canister deployment, and what external services still require keys or endpoints.

Deployment requirements:

- Make the app deployable in Caffeine now.
- Do not use AWS/S3 or any production Magick Box services.
- Do not fake AI/media/payment completion. Use pending/config-required/verified states honestly.
- After deployment, show the preview/live URL, app ID, and any Caffeine backend/storage identifiers.
