# MagickBoxV3 System Wallet Spend Gate

Last updated: 2026-05-24

This runbook documents the mandatory gate before any spend from the isolated MagickBoxV3 system funding wallet. It is a guardrail only. It does not authorize a deploy, cycle mint, top-up, transfer, treasury action, or production change.

## Scope

- Live isolated MagickBoxV3 URL: `https://magickbox-icp-e68.caffeine.xyz/`
- Production `magickbox.ai`: out of scope.
- Reference repos: out of scope.
- Funds movement: blocked until every spend gate below is satisfied.

## Current Wallet Record

- Owner canister: `itg54-4qaaa-aaaam-qiziq-cai`
- System wallet subaccount: `4d4246554e440000000000000000000000000000000000000000000000000001`
- ICP account ID: `8fdbd57fcdc67228e0a3dc3b95476b2a7a1fabfd8d4612f309a622265bf87d87`
- Mark's Internet Identity principal: `zo4kw-ezr7z-aslvs-tbhja-ejagl-rtzjk-7zuc7-j5asy-wkbx5-qh3gu-iqe`
- Ledger-confirmed balance: `1 ICP` as of 2026-05-24.

## Spend Is Blocked By Default

Do not spend ICP, mint cycles, top up canisters, transfer funds, create treasury operations, or run deployment commands from this wallet unless all gates in the next section are complete and recorded.

The funded wallet is an ICRC account owned by the MagickBoxV3 backend canister, not a normal CLI identity account. The current implementation can create the funding wallet and read its ICP ledger balance, but it does not expose an outbound ICP transfer, CMC cycle-mint, or canister top-up path. Treat the wallet as inbound-only until a canister-governed spend design or separate controller-funded operations path is approved.

## Required Gates Before Any Spend

1. Backup admin/controller exists.
   - Add and verify at least one Mark-controlled backup admin or controller path before funds are used for operations.

2. Canister controller status is verified.
   - Confirm the live owner/backend canister controller state for `itg54-4qaaa-aaaam-qiziq-cai`.
   - Record the command, timestamp, and result in the progress log or a handoff note.

3. Explicit user approval is captured.
   - Mark must approve the exact spend in the current thread or another durable written channel.
   - Approval must name the amount, destination, intent, and maximum allowed fee.

4. Dry-run plan is written first.
   - Document the proposed command sequence, identities, network, source account, destination account/canister, amount, expected ledger fee, rollback/stop points, and verification commands.
   - The dry-run plan must be reviewed before any live command runs.

5. Ledger fee check is current.
   - Check the ICP ledger fee immediately before the spend.
   - Record the fee and ensure it is inside the approved maximum.

6. Cycles target check is current.
   - For cycle minting or top-up, record the target canister ID, current cycles balance/status, intended post-top-up state, and why the target needs cycles now.
   - Abort if the target canister or controller state differs from the dry-run plan.

## Minimum Spend Record

If a future spend is approved and executed, append a checkpoint with:

- Date/time and operator.
- Approval reference.
- Source wallet account ID and owner/subaccount tuple.
- Destination account, canister, or cycles target.
- Amount and ledger fee.
- Commands run and exact results.
- Post-spend balance/status verification.
- Any follow-up risk or remaining gate.

## Current Status

As of 2026-05-24, the wallet is funded inbound-only with `1 ICP`. No spend is authorized by this runbook.
