# Caffeine Recovery Plan - 2026-05-23

## Current Finding

The Caffeine chat could not import the public GitHub URL directly. Research shows that was the wrong path to trust as the primary mechanism: Caffeine's documented GitHub import/export flow is tied to Caffeine project settings and paid-plan import/export, while ZIP upload requires a Caffeine-shaped project and a 20 MB upload ceiling.

Useful references:

- GitHub integration overview: https://help.caffeine.ai/hc/en-us/articles/46899843980692-GitHub-Integration-Overview
- GitHub import/export troubleshooting: https://help.caffeine.ai/hc/en-us/articles/46899815217940-Troubleshooting-GitHub-Export-and-Import
- Code upload/download details: https://help.caffeine.ai/hc/en-us/articles/49135143011860-Downloading-and-Uploading-Your-Project-Code
- How Caffeine works: https://help.caffeine.ai/hc/en-us/articles/46899814439700-How-Caffeine-Works
- Caffeine MCP package: https://www.npmjs.com/package/@dfinity/caffeine-mcp-server

## Root Cause

The previous upload artifact was a normal ICP project bundle, not a Caffeine-shaped project. It also included every copied production-reference media file, making it too large for Caffeine's documented upload cap.

The browser upload path also hit Codex Chrome-extension file chooser timeouts. That does not mean Caffeine upload is impossible; it means this session's automated browser control could not complete the file chooser action.

## Implemented Recovery

The prototype now supports Caffeine's likely single-backend deployment shape:

- Frontend can resolve `PUBLIC_CANISTER_ID:backend` as a fallback for the Magick Box core canister.
- Mainnet/Caffeine agent creation no longer requires a local replica root key.
- Generation no longer hard-fails when a dedicated media canister is absent. It stores generated media in the core canister through `store_media_asset`, attaches the ICP-only manifest, and marks the receipt with `core-inline-media-asset`.

The repo now has a Caffeine upload bundle generator:

```powershell
npm run caffeine:bundle
```

Latest verified bundle:

```text
C:\Users\Mark\Documents\Codex\Codex_MagickBox\magick-box-rewrite-readiness-prototype\tmp\magickbox-on-icp-caffeine-bbf00c7-20260523T051144.zip
```

This bundle is Caffeine-shaped:

- `caffeine.toml`
- `mops.toml`
- `src/backend/caffeine.toml`
- `src/backend/main.mo`
- `src/backend/magickbox_core.did`
- `src/frontend/caffeine.toml`
- `src/frontend/package.json`
- `src/frontend/src/...`
- only the 15 UI-referenced media assets, keeping the ZIP under 20 MB

## Verification

Commands run:

```powershell
npm run test -- src/icp/magickboxClient.test.ts src/icp/localWorkerContracts.test.ts
npm run build
npm run caffeine:bundle
npm --prefix tmp\caffeine-upload-bbf00c7-20260523T051144\magickbox-on-icp-caffeine\src\frontend run build
```

Results:

- Targeted tests passed: 11 tests.
- Main production frontend build passed.
- Caffeine bundle was generated at 16,624,083 bytes, below the 20 MB Caffeine cap.
- Generated Caffeine frontend build passed.

## Next Best Paths

Path A: Caffeine UI upload

Upload the generated ZIP through the Caffeine app's upload feature. If Codex Chrome automation still cannot complete file upload, enable file URL access for the Codex Chrome Extension or upload manually from the open browser session.

Path B: Caffeine MCP/API

The published `@dfinity/caffeine-mcp-server` exposes project create/download/push/deploy tools, but it requires `CAFFEINE_API_KEY`. Its README references `beta.caffeine.ai`, which no longer resolves from this machine; the current Caffeine web runtime points to `https://api.caffeine.ai`. With an API key, test the supported MCP path before using it for privileged flows.

Path C: Direct ICP mainnet

Use the canonical repo and direct `icp deploy -e ic` path once the isolated identity has ICP/cycles and controller policy is approved. This remains the final authority for superadmin, wallet funding, and anything involving real funds.

## Safety Rule

Do not use the current Caffeine deployment for superadmin claim, main wallet creation, payment transfer, or funding until an independent live smoke test proves:

- correct app code and commit provenance;
- demo users cannot see privileged bootstrap actions;
- canister IDs and controllers are known;
- Internet Identity works;
- credits, payments, jobs, and media writes hit the intended isolated canisters.
