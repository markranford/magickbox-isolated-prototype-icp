# Caffeine Prompt: codex_magickboxOnICP

Create a new separate Caffeine app named `codex_magickboxOnICP`.

Important safety boundary:

- Do not modify or connect to `www.magickbox.ai`.
- Do not touch Magick Box production DNS, hosting, auth, analytics, billing, databases, secrets, deployment settings, or live users.
- Do not push to or modify the existing GitHub repos `General-Magick-Industries/magick-box`, `General-Magick-Industries/magick_box_fe_web`, or `General-Magick-Industries/magick_ai`.
- This must be a new isolated live ICP/Caffeine deployment.

Build a working mostly-on-ICP Magick Box app prototype based on the isolated local source at:

`C:\Users\Mark\Documents\Codex\Codex_MagickBox\magick-box-rewrite-readiness-prototype`

Current verified local prototype behavior to preserve:

- Landing UX matching Magick Box: hero, Magick Friend prompt box, image/video/music modes, gallery, pricing, about, contact, explore, subscriptions, and chat routes.
- Public live-site media copied into local app assets under `public/reference-assets/live-site`; do not hotlink production media.
- ICP asset-canister frontend with SPA fallback and certified assets.
- Internet Identity account path, with local-browser identity only as a local fallback.
- Core canister state for profile, credits, provider options, credit recovery options, generation jobs, collections, payment intents, ad credit grants, worker grants, worker runs, media manifests, and audit events.
- Dedicated ICP media canister for generated media: `create_asset`, `put_chunk`, `commit_asset`, `get_manifest`, `get_chunk`, `list_my_assets`, with `icp-media://...` URIs, 1 MB chunk limit, and no AWS/S3.
- ICP/ICRC credit top-up intent flow using per-intent subaccounts as the primary payment path.
- Credit recovery popup: top up/subscribe with ICP, watch advert for credits, use FreeLLMAPI, connect own AI provider, or use local Ollama.
- AI execution should stay behind explicit adapters: MagickAI-compatible worker, FreeLLMAPI/OpenAI-compatible endpoint, user-provided provider, and local Ollama. Do not store API keys in canister state.

Implementation target:

- Deploy as a new live ICP/Caffeine app.
- Everything that can live on ICP should live on ICP.
- Use Caffeine's ICP deployment path if available.
- If Caffeine cannot deploy Motoko canisters directly, create the closest live Caffeine-hosted app that mirrors the verified UX and clearly documents the missing canister deployment step.
- Return the live app URL, preview URL, and any canister IDs Caffeine creates.

Quality gates:

- App loads on desktop and mobile.
- No production Magick Box API calls or hotlinked production media.
- No AWS/S3 dependency.
- Show ICP status, credit balance, provider route, and media canister/storage status.
- Prompt submission creates a real app-side job record or the closest Caffeine-supported equivalent; do not present nonfunctional fake success.
