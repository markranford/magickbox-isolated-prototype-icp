# Caffeine GitHub Import Prompt

Use this in Caffeine when creating or refreshing the isolated Magick Box on ICP preview from canonical source.

```text
Create or update a separate isolated Caffeine app named `codex_magickboxOnICP_from_github`.

Canonical source:

https://github.com/markranford/magickbox-isolated-prototype-icp

Use the GitHub repository as the source of truth. Do not use stale generated code from any previous Caffeine chat if it conflicts with this repo.

Safety boundary:

- Do not connect to or modify `www.magickbox.ai`.
- Do not touch production DNS, hosting, auth, analytics, billing, databases, secrets, deployment settings, live users, or production Magick Box GitHub repositories.
- This is an isolated preview/development deployment only.
- Caffeine is a preview/workshop surface. The GitHub repo is the blueprint. Direct isolated ICP canisters remain the final authority.

Build/deploy target:

- Preserve the observable Magick Box UX from the repo.
- Keep Internet Identity as the preferred owner login path.
- Keep demo/public users read-only on `/home/admin`.
- Demo users must not see or invoke:
  - `Claim Superadmin`
  - `Create funding wallet`
  - `Verify balance`
  - any real wallet/funding/payment action
- The real owner may claim superadmin only through Internet Identity or an explicitly configured isolated bootstrap flow.
- Do not auto-claim superadmin.
- Do not auto-create a wallet.
- Do not fake payment, credit, media, or AI success.
- Keep all media/storage ICP-first; no AWS/S3.

Required live verification before saying complete:

1. Open the published live URL at `/home/admin` in a fresh session.
2. Confirm the signed-out page shows Internet Identity login.
3. Click `Continue as Demo`.
4. Confirm the live DOM does not contain `Claim Superadmin`.
5. Confirm the live DOM does not contain `Create funding wallet`.
6. Confirm the live DOM does not contain `Verify balance`.
7. Confirm the page shows a read-only demo/admin status message.
8. Report the live URL, source GitHub URL, commit/version used, and whether any real ICP canister IDs were created.

If Caffeine cannot import the repo directly, explain the exact import/export blocker and create a preview app that clearly states it is non-authoritative. Do not present it as safe for superadmin claim or funding until the live verification above passes.
```
