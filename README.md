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
```

Local ICP URLs:

```text
http://frontend.local.localhost:8010/
http://frontend.local.localhost:8010/home/magick-chat
http://tqzl2-p7777-77776-aaaaa-cai.localhost:8010/?id=tz2ag-zx777-77776-aaabq-cai
```

The deploy helper creates/uses a local-only `magickbox-local-prototype` identity. Its seed is written under ignored `.icp/cache/local-secrets/` and must not be used for anything valuable.

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
- Full ICP plan: `docs/superpowers/plans/2026-05-22-magickbox-full-icp-deployment.md`
- Route parity: `docs/evals/route-parity.md`
- Handoff report: `docs/handovers/magickbox-isolated-prototype-handoff.md`
- Full ICP local handoff: `docs/handovers/magickbox-full-icp-local-deploy-handoff.md`
- Reference screenshots: `docs/artifacts/reference/`
- Prototype screenshots: `docs/artifacts/prototype/`

Legacy first-pass docs are still present at `docs/audit.md` and `docs/handoff.md`.

## Safety

The reference repositories were inspected read-only from `../_readonly_references`. This prototype has no production remote and no production configuration.
