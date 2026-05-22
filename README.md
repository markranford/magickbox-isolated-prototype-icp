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

## Verify

```bash
npm run lint
npm run test
npm run build
npm run e2e
```

## Docs

- Goal: `docs/goals/magickbox-isolated-prototype-icp.goal.md`
- Progress log: `docs/progress/magickbox-prototype-progress.md`
- Opportunity audit: `docs/audits/magickbox-opportunity-review.md`
- ICP architecture review: `docs/audits/magickbox-icp-architecture-review.md`
- Route parity: `docs/evals/route-parity.md`
- Handoff report: `docs/handovers/magickbox-isolated-prototype-handoff.md`
- Reference screenshots: `docs/artifacts/reference/`
- Prototype screenshots: `docs/artifacts/prototype/`

Legacy first-pass docs are still present at `docs/audit.md` and `docs/handoff.md`.

## Safety

The reference repositories were inspected read-only from `../_readonly_references`. This prototype has no production remote and no production configuration.
