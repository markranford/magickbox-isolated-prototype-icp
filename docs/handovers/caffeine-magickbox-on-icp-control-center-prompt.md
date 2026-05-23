# Caffeine Prompt: codex_magickboxOnICP_control_center

Create a new separate Caffeine app named `codex_magickboxOnICP_control_center`.

Build a deployable Caffeine-native control center for the isolated Magick Box on ICP prototype. Do not generate or compile Motoko files in Caffeine. Do not create `.mo` files. Do not attempt a Caffeine-side ICP canister compile. This app should be live in Caffeine now and point at/configure external ICP canister boundaries rather than pretending to be the canister implementation.

Absolute safety boundary:

- Do not modify, connect to, deploy over, or depend on `www.magickbox.ai`.
- Do not touch Magick Box production DNS, hosting, auth, analytics, billing, databases, secrets, deployment settings, live users, or the GitHub repos `General-Magick-Industries/magick-box`, `General-Magick-Industries/magick_box_fe_web`, or `General-Magick-Industries/magick_ai`.
- Do not use AWS/S3 or any off-chain durable media store.

Required live app:

- Dark MagickBox app shell with hero, Magick Friend composer, Image/Video/Music modes, gallery, pricing/credits, provider settings, payment intents, media manifests, job history, and system/status views.
- Preserve the observable Magick Box UX, but clearly label this as an isolated ICP control center.
- Store no authoritative user media, conversations, credits, or payments in Caffeine. Authoritative durable state belongs on ICP canisters.
- If Caffeine needs minimal app state for UI, label it non-authoritative local/control-plane state.
- Let the user enter ICP canister IDs/URLs for `core`, `media`, `ledger`, `ad verifier`, and `AI worker`.
- Let the user paste/import `icp-media://` manifest JSON and display chunks/manifests/owner/status.
- Let the user create pending payment-intent records that show per-intent subaccount and ICRC-2 transfer-from payloads. Do not mark credits paid unless the user records a verified event.
- Let the user configure FreeLLMAPI/OpenAI-compatible, MagickAI worker, custom endpoint, and local Ollama provider endpoints. If none is configured, show provider-required state. Do not fake generation.
- Add a system/status page that distinguishes: live in this Caffeine app, external ICP canister required, user/provider required, and unavailable.
- Add a handoff/checklist page for the real ICP canister deployment and how this control center maps to it.

Proceed without additional PM questions unless absolutely required. Make it deployable in Caffeine now. After preview/live is ready, show the app ID and URL.
