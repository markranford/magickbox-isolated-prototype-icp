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

- Audit: `docs/audit.md`
- Route parity: `docs/evals/route-parity.md`
- Handoff report: `docs/handoff.md`
- Reference screenshots: `docs/artifacts/reference/`
- Prototype screenshots: `docs/artifacts/prototype/`

## Safety

The reference repositories were inspected read-only from `../_readonly_references`. This prototype has no production remote and no production configuration.
