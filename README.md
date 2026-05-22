# Magick Box Rewrite Readiness Prototype

This is a completely isolated local prototype for evaluating a safer Magick Box rewrite direction.

It does not connect to production Magick Box services, auth providers, analytics, billing, DNS, databases, deployment targets, or secrets.

## Run

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Local URL:

```text
http://127.0.0.1:5173/
```

## Local ICP Deploy

Run ICP commands through WSL from this repository:

```bash
npm run build
wsl -- bash -lc 'cd /mnt/c/Users/Mark/Documents/Codex/Codex_MagickBox/magick-box-rewrite-readiness-prototype && bash scripts/deploy-local-icp.sh'
wsl -- bash -lc 'cd /mnt/c/Users/Mark/Documents/Codex/Codex_MagickBox/magick-box-rewrite-readiness-prototype && bash scripts/smoke-local-icp.sh'
npm run smoke:icp:advanced
npm run smoke:services
npm run audit:media
```

Local ICP URLs:

```text
http://frontend.local.localhost:8010/
http://frontend.local.localhost:8010/home/magick-chat
http://tqzl2-p7777-77776-aaaaa-cai.localhost:8010/?id=t63gs-up777-77776-aaaba-cai
```

The deploy helper creates/uses a local-only `magickbox-local-prototype` identity. Its seed is written under ignored `.icp/cache/local-secrets/` and must not be used for anything valuable.

The advanced smoke uses the local ICP ledger plus local AI adapters. It creates an ICP payment intent, transfers `0.001` local ICP to that intent's ICRC subaccount, claims credits, grants ad-verifier credits, authorizes a separate worker principal, executes local Ollama, FreeLLMAPI-compatible, and MagickAI-compatible workers, stores generated worker output bytes in the ICP canister with `store_media_asset`, completes the jobs on ICP, and anchors ICP media manifests.

`npm run smoke:services` is safe by default: it reports skipped live services unless isolated `FREELLMAPI_*` or `MAGICKAI_*` env vars are configured. Use `npm run smoke:services:required` after starting those services when you want missing live wiring to fail the run.

Optional integration env names are listed in `.env.integrations.example`. Keep production credentials out of this prototype.

Generated media storage for this prototype is ICP-only. Small worker outputs are stored directly in `magickbox_core` as `MediaAsset` blobs and referenced by `icp-media://...` URIs; larger production media should move to dedicated ICP media/chunk canisters rather than external object storage.

Public media discovered from the live Magick Box site is copied into `public/reference-assets/live-site` for the isolated asset-canister build. The manifest is `public/reference-assets/live-site/media-manifest.json`; the visible Gallery and Explore surfaces use those copied local paths rather than production hotlinks.

## Verify

```bash
npm run lint
npm run test
npm run build
npm run e2e
```

## Docs

- Goal: `docs/goals/magickbox-isolated-prototype-icp.goal.md`
- Full ICP goal: `docs/goals/magickbox-full-icp-deployment.goal.md`
- Progress log: `docs/progress/magickbox-prototype-progress.md`
- Opportunity audit: `docs/audits/magickbox-opportunity-review.md`
- ICP architecture review: `docs/audits/magickbox-icp-architecture-review.md`
- AI provider options: `docs/audits/magickbox-ai-provider-options.md`
- Media storage decision: `docs/audits/magickbox-media-storage-decision.md`
- Full ICP plan: `docs/superpowers/plans/2026-05-22-magickbox-full-icp-deployment.md`
- Route parity: `docs/evals/route-parity.md`
- Live media asset inventory: `docs/evals/magickbox-live-media-assets.md`
- ICP delivery gaps: `docs/evals/magickbox-icp-delivery-gap-check.md`
- Handoff report: `docs/handovers/magickbox-isolated-prototype-handoff.md`
- Full ICP local handoff: `docs/handovers/magickbox-full-icp-local-deploy-handoff.md`
- Reference screenshots: `docs/artifacts/reference/`
- Prototype screenshots: `docs/artifacts/prototype/`

Legacy first-pass docs are still present at `docs/audit.md` and `docs/handoff.md`.

## Safety

The reference repositories were inspected read-only from `../_readonly_references`. This prototype has no production remote and no production configuration.
