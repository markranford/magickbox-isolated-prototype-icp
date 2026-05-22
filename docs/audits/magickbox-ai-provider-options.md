# Magick Box AI Provider Options

Date: 2026-05-22

## Recommendation

ICP should own identity, account state, credits, generation job metadata, collections, provider preferences, media assets/manifests, and audit events. AI inference should run through explicit adapters because dynamic model execution, provider keys, streaming, and local hardware access do not yet belong directly in standard canister state. Large media should still stay on ICP, using dedicated media/chunk canisters rather than the app-state canister.

The product should present these options as first-class choices instead of hiding them behind one opaque model selector.

## Provider Options

| Option | Best for | ICP-owned state | Off-chain dependency | Prototype status |
| --- | --- | --- | --- | --- |
| MagickAI worker | Rich Magick Friend parity across chat, image, video, and music | job record, prompt hash, provider choice, media asset/manifest, credit debit, audit event | Python SDK and AI provider keys | read-only reference |
| FreeLLMAPI | Free/low-cost OpenAI-compatible chat fallback | provider preference, usage summary, credit bypass/discount rule, audit event | user-managed proxy and provider keys | read-only reference |
| Own API key | Users with OpenAI, Gemini, OpenRouter, Groq, or other subscriptions | provider preference and non-secret key reference | user key vault or browser/local storage; never raw key in canister state | UI option |
| Local Ollama | Users who do not want paid inference | selected local model name, endpoint preference, opt-in audit event | local machine endpoint such as `http://127.0.0.1:11434` | UI option |
| Paid managed provider | Premium Magick Box experience | credit debit, job state, provider trace, result manifest | Magick-operated worker/provider stack | UI option |

## Findings From `magick_ai`

`magick_ai` is a rich Python SDK/reference for Magick Friend-style orchestration:

- Universal agent API for chat, image, video, and music.
- Magick Friend request schemas include action, attachments, model hints, session/user/config IDs, routing decisions, stream chunks, and media result chunks.
- Dependencies include LiteLLM, Google GenAI, OpenAI, Replicate, Mongo/Motor, S3/Boto3, MagickMind, and media/document helpers.

ICP fit:

- Use the schemas and routing concepts as the worker contract.
- Keep SDK execution off-chain at first.
- Store job IDs, prompt hashes, media assets/manifests, model/provider choices, credit debits, and audit events on ICP.
- Do not store MagickAI provider secrets in canister state.

## Findings From `freellmapi`

`freellmapi` is an OpenAI-compatible chat proxy:

- `POST /v1/chat/completions` and `GET /v1/models`.
- Provider fallback across free-tier providers.
- Encrypted key storage in SQLite.
- Per-key rate tracking, health checks, sticky sessions, dashboard, and analytics.
- Limitations: chat-only, no image/audio/video generation, single-user by design, no per-user billing/multi-tenant auth.

ICP fit:

- Useful as a user-selected chat fallback or a self-hosted/free option.
- Canister should store only an endpoint preference or non-secret reference.
- The proxy itself should remain off-chain or user-local.
- Good target for the insufficient-credit recovery flow: "Use FreeLLMAPI instead."
- Live isolated service checks are available through `npm run smoke:services` when `FREELLMAPI_BASE_URL` and `FREELLMAPI_API_KEY` are configured.

## Local LLM Option

Current machine inventory includes local Ollama models such as `gemma4:31b`, `qwen3.6`, `qwen3:14b`, `glm4:9b`, and others.

ICP fit:

- Canister stores a selected local-provider option and model label.
- Browser or worker calls the local endpoint.
- The endpoint URL should be user-controlled and not assumed reachable from a canister.
- For the first UI, label this as "Connect local Ollama" with setup copy and no production network call.

## Credit Recovery Flow

When credits are insufficient, offer:

- Top up with ICP.
- Subscribe with ICP.
- Watch an advert to earn credits.
- Use FreeLLMAPI.
- Connect own AI subscription/API.
- Connect/download local LLM via Ollama.

Canister behavior:

- Return a typed insufficient-credit response with the credit recovery options.
- Do not debit credits if the job is not accepted.
- Append an audit event for insufficient-credit attempts without storing the full private prompt.
- Later, accept credit grants only from trusted ad/payment verifiers.

## Privacy Boundary

Private prompts and uploaded assets should not be stored raw on ICP by default. The first canister stores:

- `prompt_preview`
- `prompt_hash`
- provider ID
- job status
- ICP media URI/reference
- result hash
- audit metadata

Future work can add opt-in encrypted prompt storage or vetKD-backed encryption after a privacy design pass.

## Current Integration Harness

- `scripts/smoke-worker-services.mjs` checks real isolated FreeLLMAPI and MagickAI connections without touching production.
- `workers/magickai_worker_bridge.py` calls the real MagickAI SDK from `MAGICKAI_REPO_PATH` through `MagickAI.from_env()` and `universal_process(...)`.
- `scripts/smoke-local-icp-advanced.mjs` stores generated worker output bytes in `magickbox_core` through `store_media_asset` before anchoring manifests.
- `docs/audits/magickbox-media-storage-decision.md` records the ICP-only media storage choice and the dedicated ICP media/chunk canister scale path.
