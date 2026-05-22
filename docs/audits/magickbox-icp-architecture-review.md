# Magick Box ICP Architecture Review

Date: 2026-05-22

## Recommendation

Use a mostly ICP hybrid prototype first.

The recommended next proof is:

- Frontend deployed as certified ICP assets to a new isolated asset canister.
- Internet Identity sign-in for an app-specific principal.
- One small backend canister for user profile, project metadata, generation job records, collection membership, and append-only audit events.
- External AI inference workers/providers for actual image, video, music, and chat generation.
- Generated media stored on ICP. The current proof stores small outputs in the core canister; production scale should move media bytes into dedicated ICP media/chunk canisters with manifests anchored in the app canister.
- Payments modeled separately: ICRC-compatible credits for ICP-native flow, and Stripe retained off-chain only if fiat/card payment remains required.

This path proves the ICP-native value without making the prototype depend on the hardest parts of fully on-chain AI generation, media storage, fiat payments, and analytics.

## Can The Frontend Be Certified ICP Assets?

Yes.

The current prototype is a static Vite/React build and can be served from an ICP asset canister. The prototype now includes:

- `public/.ic-assets.json5`
- SPA aliasing with `enable_aliasing: true`
- `allow_raw_access: false`
- Cache headers
- CSP and security headers
- A Playwright check that verifies `dist/.ic-assets.json5` exists after build

For a preview deployment, create a new isolated ICP project/canister mapping and deploy only the built `dist/` contents. Do not use existing production domains, controllers, deployment pipelines, or canister IDs.

## Should Backend/Application Logic Live In Canisters?

Partly, yes.

Good canister candidates:

- User profile keyed by principal.
- Project metadata.
- Conversation metadata and message manifests where privacy rules permit.
- Generation job records: mode, model tier, prompt hash, status, timestamps, worker/result references, failure reason.
- Collection membership, privacy/publication state, likes/remix links, and creator ownership.
- Credit ledger integration or internal credit accounting if tied to ICRC/ICP payments.
- Append-only audit events for request creation, worker callbacks, result publication, credit movement, and moderation actions.
- Public gallery indexes and moderation decisions.

Keep external at first:

- Dynamic AI inference and streaming model responses.
- Fiat payment rails, invoices, refunds, tax/compliance, and card billing.
- High-volume analytics dashboards.
- Email, support, abuse workflows, and admin tooling that depend on existing SaaS systems.

## Data Placement

| Data/state | ICP placement | Off-chain/external placement | Notes |
| --- | --- | --- | --- |
| Frontend assets | Asset canister | None required | Best immediate ICP fit. |
| User identity | Principal from Internet Identity or wallet | Optional OAuth bridge if business needs it | Prefer II for the proof slice. |
| User profile | Canister stable storage | Optional CRM/customer support mirror | Keep personally sensitive fields minimal. |
| Projects | Canister stable storage | Search/index mirror if needed | Project ownership should bind to principal. |
| Conversation metadata | Canister stable storage | Full message bodies off-chain if private/sensitive | Avoid storing private prompts on-chain until privacy model is explicit. |
| Generation jobs | Canister stable storage | Worker queue/execution system | Canister state should be source of truth for status and ownership. |
| Generated media | Media assets and manifests on ICP | AI workers may produce bytes before canister upload | Current proof stores small blobs in `magickbox_core`; scale with dedicated ICP media/chunk canisters. |
| Public gallery | Canister index plus selected asset metadata/media | Optional read mirrors only | Published items can be more ICP-native than private drafts. |
| Credits/payments | ICRC ledger or canister accounting | Stripe for card/fiat | Keep production billing disconnected from prototype. |
| Analytics | Aggregated counters only | Privacy-focused analytics/service logs | Avoid high-volume behavioral streams on-chain. |
| Audit trail | Append-only canister events | Export/mirror for ops | Strong ICP fit. |

## Auth Options

Internet Identity:

- Best fit for an ICP proof.
- Gives each app an app-specific principal.
- Avoids password storage and credential submission.
- Local development can use a local II setup or mainnet II where supported by local tooling.

Wallet/ICRC signer:

- Useful if payments, token-gated plans, or wallet identity become core.
- Better for payment flows than general account onboarding.

Existing OAuth/Auth.js:

- Keep only if the product requires Google/social login parity.
- In an ICP hybrid, OAuth can map to a canister profile, but custody and account-linking risks need explicit design.

Prototype choice:

- Use Internet Identity only for the isolated proof path.
- Current local implementation: React detects the ICP asset canister `ic_env`, exposes Internet Identity sign-in/sign-out, and can write profile/job state to `magickbox_core` after auth.
- The Codex in-app browser can use a persistent local signed browser identity when II signer popups are blocked; that identity now reconnects after direct route loads.
- No production OAuth provider is connected.

## Storage Options

Canister stable memory:

- Use for durable metadata, job records, collections, account state, and audit events.
- Design schemas for upgrade compatibility.
- Use stable structures or persistent actors instead of heap-only state.

Asset canister:

- Use for the frontend.
- Consider for small public/static assets and selected published media only.
- Large generated video/music/image catalogs should use dedicated ICP media/chunk canisters rather than the app-state canister directly.

Dedicated ICP media/chunk canisters:

- Use for large generated files, thumbnails, waveform/video derivatives, and transient uploads.
- Keep ownership, status, content hashes, and publication decisions in the app canister.
- Store bytes in ICP-controlled chunks with quota, cycle, retention, and deletion policy.

Search/index storage:

- Keep off-chain at first if full-text search, ranking, recommendation, and moderation queues need high throughput.
- Store canonical ownership/publication state on ICP and derive search indexes from it.

## Tradeoffs

Dynamic AI inference:

- Fully on-chain image/video/music generation is not a good first target.
- Canister HTTPS outcalls require deterministic response transforms, response-size limits, cycle budgeting, and idempotent handling.
- Many AI APIs are streaming, nondeterministic, expensive, and may return payloads too large for direct canister calls.
- Use off-chain workers/providers first, with canister records for request, status, worker callback, result hash, and ownership.

Payments:

- ICP/ICRC payments can make Magick Keys or credits transparent and programmable.
- Fiat/card billing, refunds, fraud, tax, subscriptions, and customer support may require Stripe or another off-chain system.
- Prototype payments should use a local/test ledger proof before any mainnet spend or production billing is connected.

Current local payment proof:

- `magickbox_core` creates ICP payment intent records.
- Each intent now carries a deterministic 32-byte ICRC subaccount and `payment_subaccount_hex`.
- `get_payment_account_for_intent` returns the specific ledger account for the caller's payment intent.
- `scripts/smoke-local-icp-advanced.mjs` transfers `0.001` local ICP through the local ledger to the intent subaccount with `--to-subaccount`.
- `claim_icp_payment` verifies that intent subaccount balance, de-duplicates claimed block indexes, and credits the caller.
- This is strong enough for isolated local proof. A production version can keep per-intent subaccounts or add ICRC-2 approve/transfer-from for wallet-mediated recurring/subscription flows.

Analytics:

- On-chain analytics are best for aggregate product counters and auditability.
- Behavioral analytics, funnels, and performance logs are likely better off-chain with strong privacy limits.

Media storage:

- Asset canisters can serve certified web assets, but product media should use a purpose-built ICP media/chunk canister path.
- The prototype now proves small generated outputs can be stored directly on ICP before manifests are attached.
- Production needs separate upload limits, chunking, certification, quotas, deletion/retention, and cycle monitoring.

External API calls:

- HTTPS outcalls can work for small deterministic reads or carefully idempotent writes.
- AI provider calls should generally go through an off-chain worker layer first.
- Any worker callback must be authenticated, idempotent, and bound to a generation job ID.

Privacy:

- Canister data is not the same as private database data. Treat private prompts, drafts, uploaded media, and account details carefully.
- Store hashes, encrypted payload references, and minimal metadata until a privacy/encryption model is approved.

## Fully ICP Version Requirements

A fully ICP Magick Box would need:

- Certified asset canister frontend.
- Internet Identity or wallet-based auth.
- Canister backend for users, projects, conversations, collections, generation jobs, public gallery, credits, moderation, and audit events.
- ICRC/ICP-native payment or credit system.
- On-chain or canister-managed storage for media, or a certified media architecture with chunking, indexing, and lifecycle policy.
- A deterministic AI inference strategy, or ICP-native compute/model execution that meets latency, cost, and quality needs.
- On-chain-safe analytics and admin workflows.
- Upgrade and migration plans for all stable schemas.
- Cycle monitoring, access control, controller governance, backup/export strategy, and incident response.

This is strategically interesting but too large for the immediate rewrite-readiness prototype.

## Mostly ICP Hybrid Version Requirements

A mostly ICP hybrid Magick Box would need:

- Certified asset canister frontend.
- Internet Identity proof for app principal.
- Backend canister for durable product state and auditability.
- External AI worker fleet/provider integration.
- ICP media storage with canister-held hashes/manifests.
- Optional Stripe or ICRC payment adapter depending on market strategy.
- Off-chain analytics/search/admin systems fed by canister events.
- Clear API contract between frontend, canister, worker, and media service.
- Separate preview/staging/prod canisters and explicit deploy identities.

This is the best prototype path because it proves ICP-native ownership, trust, identity, deployment safety, and storage while avoiding premature dependence on fully on-chain AI inference economics.

## Current ICP Proof Slice

The current isolated prototype now includes the narrow vertical slice foundations:

1. Local isolated ICP asset canister serves the current frontend.
2. Local Internet Identity is enabled for the network and wired into the React runtime.
3. A `magickbox_core` canister stores profile, credits, provider options, credit recovery options, generation jobs, collections, and audit events.
4. The frontend reads the asset canister `ic_env`, builds an authenticated actor, registers a profile, and creates generation jobs after auth.
5. Canister smoke tests prove insufficient-credit recovery and FreeLLMAPI zero-credit job creation.
6. Advanced local smoke proves a per-intent subaccount ICP transfer, payment claim, ad credit grant, worker authorization, local Ollama execution, FreeLLMAPI-compatible execution, MagickAI-compatible execution, worker completion callbacks, and media manifest anchoring.
7. Browser smoke confirms the asset-served frontend detects ICP mode, restores local browser identity, creates payment intents with visible subaccounts, grants ad credits, and records no console errors.
8. Generated media output bytes are stored in `magickbox_core` through `store_media_asset` and anchored with `icp-canister-media-store` manifests by URI, hash, MIME type, byte count, owner, job id, and worker principal.

Next proof steps:

1. Manually complete the local Internet Identity passkey flow and capture the authenticated composer state.
2. Decide whether production payments should stay with per-intent subaccounts, add ICRC-2 transfer-from, or support both.
3. Connect `MAGICKAI_WORKER_URL` or `MAGICKAI_WORKER_COMMAND` to a real MagickAI service with provider credentials kept outside canister state; the prototype now includes `workers/magickai_worker_bridge.py` for the command path.
4. Point `FREELLMAPI_BASE_URL` and `FREELLMAPI_API_KEY` at a running FreeLLMAPI instance and capture routed-provider evidence with `npm run smoke:services:required`.
5. Move large generated media from the small core-canister proof into dedicated ICP media/chunk canisters, with optional certification for public assets.
6. Surface completed worker runs, media manifests, and collection save from the authenticated frontend.
7. Add upgrade/stable-state checks for profile, job, payment, worker, ad, media, and audit records.

Success criteria:

- No production API, DNS, auth, billing, analytics, database, or deployment target touched.
- Refreshing `/home/explore` and `/home/magick-chat` works on the asset canister.
- Authenticated principal owns profile, job, and collection records.
- Stable state survives canister upgrade in local or isolated preview testing.
- Browser checks remain green and console-clean.

## Sources Checked

- Internet Computer asset security: https://internetcomputer.org/docs/building-apps/frontends/asset-security
- Internet Computer uploading and serving assets: https://internetcomputer.org/docs/building-apps/frontends/uploading-serving-assets
- Internet Identity integration: https://internetcomputer.org/docs/building-apps/authentication/integrate-internet-identity
- Application architecture: https://docs.internetcomputer.org/getting-started/app-architecture/
- Canister storage and resource limits: https://internetcomputer.org/docs/building-apps/canister-management/storage
- HTTPS outcalls: https://internetcomputer.org/docs/building-apps/network-features/using-http/https-outcalls
- ICRC ledger setup: https://internetcomputer.org/docs/defi/token-ledgers/setup/icrc1_ledger_setup

Local ICP guidance used:

- `asset-canister`
- `internet-identity`
- `multi-canister`
- `stable-memory`
- `https-outcalls`
