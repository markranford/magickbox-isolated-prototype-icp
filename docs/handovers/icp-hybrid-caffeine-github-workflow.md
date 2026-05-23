# ICP Hybrid Caffeine/GitHub Workflow

Last updated: 2026-05-23T11:27:47+07:00

## Position

For Magick Box and future ICP work, use Caffeine.ai as a fast preview/development accelerator, but keep reviewed source and isolated ICP canisters as the trusted path.

Short version:

- Caffeine is the workshop.
- GitHub/local source is the blueprint.
- Direct ICP canisters are the final building.

## Why This Exists

Caffeine can generate, host, import, and export useful ICP-oriented app code quickly. That is valuable for product iteration, UI exploration, admin dashboards, and early canister-shape testing.

But Caffeine preview status is not enough by itself for privileged flows. In the Magick Box test, Caffeine reported a fixed live version while the public route still rendered `Claim Superadmin` to demo users. That means every Caffeine deployment needs source and live-DOM verification before it is trusted with owner/admin/wallet actions.

## Standard Workflow

1. Create or update the isolated local/GitHub repo first.
2. Use Caffeine to generate or iterate quickly in a separate app.
3. Export Caffeine code to GitHub or import canonical GitHub code into Caffeine when possible.
4. Review diffs in GitHub/local source.
5. Patch unsafe or stale code directly in source.
6. Publish the Caffeine preview only as a test surface.
7. Verify the public Caffeine URL against the expected source behavior.
8. Promote only verified behavior back into the canonical repo.
9. Deploy final/serious versions directly to isolated ICP canisters.

## Caffeine Is Approved For

- Fast UI experiments.
- Product-flow prototypes.
- Admin dashboard layout and copy iteration.
- Caffeine-hosted preview URLs for stakeholders.
- Import/export loops through GitHub.
- Early canister API shape exploration.
- Non-authoritative demo state.

## Caffeine Is Not Trusted For Until Verified

- Superadmin claim.
- System funding wallet creation.
- ICP/ICRC fund transfers.
- Credit grants from payment or ad events.
- Production-grade media storage authority.
- Controller ownership.
- Mainnet canister provenance.
- Claims that a public URL serves a specific version.

## Required Caffeine Live Checks

Before using a Caffeine deployment for any privileged action, verify:

- The public URL is separate from production Magick Box.
- The app came from the expected GitHub/local source revision.
- Signed-out route shows the correct auth gate.
- Demo/public users cannot see or invoke privileged controls.
- Internet Identity flow remains available for the real owner.
- Canister IDs are real, expected, and isolated.
- Controllers are expected project principals.
- Funding wallets/subaccounts are deterministic and displayed only after owner login.
- Payment, storage, and audit behaviors match the reviewed code.
- Browser console does not show blocking runtime errors.

## Final ICP Deployment Rule

For serious mainnet readiness, deploy the reviewed code to new isolated ICP canisters controlled by a privately held project identity with recorded backup controller policy.

Caffeine may remain useful as a preview channel, but the final trust boundary should be the reviewed source plus directly controlled ICP canisters unless Mark explicitly chooses otherwise after verification.
