# Magick Box Full ICP Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a safe, isolated Magick Box prototype whose frontend, identity, credits, job metadata, collections, and audit trail are ICP-first, while AI execution remains behind provider adapters.

**Architecture:** Use a certified ICP asset canister for the Vite frontend and a core Motoko canister for principal-owned product state. Keep AI inference off-chain behind explicit adapters for MagickAI, FreeLLMAPI, own API keys, local Ollama, and paid providers; store only metadata, hashes, and routing choices on ICP.

**Tech Stack:** React/Vite/TypeScript, Playwright/Vitest, icp-cli, Motoko persistent actor, Internet Identity target flow, ICRC/ICP payment planning, Ollama/local LLM provider option, FreeLLMAPI/MagickAI references.

---

## File Structure

- Create `icp.yaml`: project-local ICP networks, environments, asset canister, and core backend canister.
- Create `mops.toml`: Motoko toolchain and `mo:core` dependency.
- Create `canisters/magickbox_core/main.mo`: stable product state canister.
- Create `canisters/magickbox_core/magickbox_core.did`: committed Candid interface for frontend binding generation.
- Create `docs/audits/magickbox-ai-provider-options.md`: MagickAI, FreeLLMAPI, own-key, local LLM, paid-provider comparison.
- Modify `src/data/content.ts`: add provider options, credit recovery options, ICP account state examples.
- Modify `src/App.tsx`: show ICP-first credit recovery modal/panel and provider choices in creation flow.
- Modify `src/App.css`: responsive UI for credit recovery and provider controls.
- Modify `tests/prototype.spec.ts`: e2e tests for insufficient-credit popup and ICP route readiness.
- Modify `docs/progress/magickbox-prototype-progress.md`: checkpoint updates after each major step.
- Modify `docs/handovers/magickbox-isolated-prototype-handoff.md`: update next-phase status.

## Task 1: Reference And Tooling Check

**Files:**
- Modify: `docs/progress/magickbox-prototype-progress.md`
- Create: `docs/audits/magickbox-ai-provider-options.md`

- [ ] **Step 1: Inspect read-only references**

Run:

```powershell
git -C ..\_readonly_references\magick_ai remote -v
git -C ..\_readonly_references\freellmapi remote -v
rg --files ..\_readonly_references\magick_ai | Select-Object -First 80
rg --files ..\_readonly_references\freellmapi | Select-Object -First 80
```

Expected: both push URLs are `DISABLED`, and files are readable.

- [ ] **Step 2: Verify ICP/local AI tooling**

Run:

```powershell
icp --version
ic-wasm --version
mops --version
rustc --version
ollama list
```

Expected: tools print versions; Ollama lists local model candidates.

- [ ] **Step 3: Write provider-options audit**

Create `docs/audits/magickbox-ai-provider-options.md` with:

```markdown
# Magick Box AI Provider Options

## Recommendation

ICP should own account, credits, job metadata, collections, and audit state. AI inference should run through explicit adapters.

## Provider Options

| Option | Best for | ICP-owned state | Off-chain dependency | Prototype status |
| --- | --- | --- | --- | --- |
| MagickAI worker | Rich chat/image/video/music parity | job record, prompt hash, result manifest, audit event | Python SDK, provider keys, media storage | reference only |
| FreeLLMAPI | Free/low-cost OpenAI-compatible chat fallback | provider preference, usage summary, audit event | user-managed proxy and provider keys | reference only |
| Own API key | Users with existing subscriptions | provider preference, encrypted-reference metadata only | provider API and user key handling outside canister | UI option only |
| Local Ollama | Users who do not want paid inference | endpoint preference, selected local model name | local machine endpoint | UI option only |
| Paid managed provider | Premium Magick Box experience | credit debit, job record, provider trace | Magick-operated worker/provider | UI option only |

## Credit Recovery Flow

When credits are insufficient, offer: ICP top-up, subscription, ad-watch reward, FreeLLMAPI, own-key provider, or local LLM.
```

- [ ] **Step 4: Commit**

Run:

```powershell
git add docs/audits/magickbox-ai-provider-options.md docs/progress/magickbox-prototype-progress.md
git commit -m "docs: add ICP AI provider options"
```

## Task 2: ICP Canister Scaffold

**Files:**
- Create: `icp.yaml`
- Create: `mops.toml`
- Create: `canisters/magickbox_core/main.mo`
- Create: `canisters/magickbox_core/magickbox_core.did`
- Modify: `docs/progress/magickbox-prototype-progress.md`

- [ ] **Step 1: Create ICP config**

Create `icp.yaml`:

```yaml
networks:
  - name: local
    mode: managed
    ii: true

environments:
  - name: local
    network: local
    canisters:
      - magickbox_core
      - frontend

canisters:
  - name: magickbox_core
    recipe:
      type: "@dfinity/motoko@v4.1.0"
      configuration:
        main: canisters/magickbox_core/main.mo
        candid: canisters/magickbox_core/magickbox_core.did
  - name: frontend
    recipe:
      type: "@dfinity/asset-canister@v2.1.0"
      configuration:
        dir: dist
        build:
          - npm install
          - npm run build
```

- [ ] **Step 2: Create Motoko package config**

Create `mops.toml`:

```toml
[package]
name = "magickbox_full_icp_prototype"
version = "0.1.0"
description = "Isolated Magick Box mostly-on-ICP prototype"
repository = ""
keywords = ["magickbox", "icp", "internet-identity"]
license = "UNLICENSED"

[dependencies]
core = "2.3.1"

[toolchain]
moc = "1.3.0"
```

- [ ] **Step 3: Create canister interface**

Create `canisters/magickbox_core/magickbox_core.did`:

```did
type ResultText = variant { ok : text; err : text };
type CreditOption = record {
  id : text;
  label : text;
  description : text;
  route : text;
  requires_payment : bool;
  on_icp : bool;
};
type ProviderOption = record {
  id : text;
  label : text;
  description : text;
  on_icp_owned_state : bool;
  requires_external_worker : bool;
  credit_cost : nat;
};
type Profile = record {
  owner : principal;
  display_name : text;
  email : opt text;
  credits : nat;
  created_at : int;
  updated_at : int;
};
type GenerationJob = record {
  id : nat;
  owner : principal;
  mode : text;
  provider_id : text;
  prompt_preview : text;
  prompt_hash : text;
  status : text;
  credit_cost : nat;
  result_url : opt text;
  result_hash : opt text;
  created_at : int;
  updated_at : int;
};
type AuditEvent = record {
  id : nat;
  actor : principal;
  action : text;
  subject : text;
  metadata : text;
  created_at : int;
};
type CreateJobResult = variant {
  ok : GenerationJob;
  insufficient_credits : record {
    required : nat;
    balance : nat;
    options : vec CreditOption;
  };
  err : text;
};
service : {
  register_profile : (text, opt text) -> (variant { ok : Profile; err : text });
  get_my_profile : () -> (opt Profile) query;
  get_credit_options : () -> (vec CreditOption) query;
  get_provider_options : () -> (vec ProviderOption) query;
  create_generation_job : (text, text, text, text, nat) -> (CreateJobResult);
  complete_mock_job : (nat, text, text) -> (variant { ok : GenerationJob; err : text });
  list_my_jobs : () -> (vec GenerationJob) query;
  list_audit_events : () -> (vec AuditEvent) query;
  get_cycle_note : () -> (text) query;
}
```

- [ ] **Step 4: Implement Motoko canister**

Create `canisters/magickbox_core/main.mo` with a persistent actor that:

- rejects anonymous callers for state-changing calls,
- stores profiles by principal,
- seeds demo credits on profile registration,
- returns fixed credit/provider options,
- debits credits for paid generation jobs,
- returns structured insufficient-credit options,
- stores generation jobs and audit events,
- lets only the job owner complete a mock job.

- [ ] **Step 5: Build canister locally**

Run:

```powershell
mops install
icp build magickbox_core
```

Expected: Motoko backend builds and Candid interface is accepted.

- [ ] **Step 6: Commit**

Run:

```powershell
git add icp.yaml mops.toml canisters docs/progress/magickbox-prototype-progress.md
git commit -m "feat: scaffold Magick Box ICP core canister"
```

## Task 3: ICP-Aware Frontend Flow

**Files:**
- Modify: `src/data/content.ts`
- Modify: `src/App.tsx`
- Modify: `src/App.css`
- Modify: `tests/prototype.spec.ts`
- Modify: `docs/progress/magickbox-prototype-progress.md`

- [ ] **Step 1: Add frontend data**

Add provider and credit recovery options to `src/data/content.ts` using the same IDs as the Candid interface.

- [ ] **Step 2: Add insufficient-credit UI**

Modify `Composer` so expensive paid providers with insufficient mock credits show a modal/panel offering ICP top-up, subscription, ad-watch, FreeLLMAPI, own API key, and local Ollama.

- [ ] **Step 3: Add e2e coverage**

Add Playwright coverage:

```ts
test("insufficient credits offers ICP and non-paid AI recovery paths", async ({ page }) => {
  await page.goto("/home/magick-chat");
  await page.getByRole("tab", { name: "Video Creation" }).click();
  await page.getByLabel("Ask Magick Friend").fill("Create a long cinematic launch video");
  await page.getByRole("button", { name: "Submit prompt" }).click();
  await expect(page.getByRole("heading", { name: "Choose how to continue" })).toBeVisible();
  await expect(page.getByText("Top up with ICP")).toBeVisible();
  await expect(page.getByText("Use FreeLLMAPI")).toBeVisible();
  await expect(page.getByText("Connect local Ollama")).toBeVisible();
});
```

- [ ] **Step 4: Verify**

Run:

```powershell
npm run verify
```

Expected: lint, unit tests, build, and e2e pass.

- [ ] **Step 5: Commit**

Run:

```powershell
git add src tests docs/progress/magickbox-prototype-progress.md
git commit -m "feat: add ICP credit recovery flow"
```

## Task 4: Local ICP Deploy

**Files:**
- Modify: `docs/handovers/magickbox-isolated-prototype-handoff.md`
- Modify: `docs/progress/magickbox-prototype-progress.md`

- [ ] **Step 1: Start local network**

Run:

```powershell
icp network start -d
```

Expected: project-local local network starts with Internet Identity enabled.

- [ ] **Step 2: Deploy locally**

Run:

```powershell
icp deploy
```

Expected: `magickbox_core` and `frontend` deploy to the local environment.

- [ ] **Step 3: Record canister URLs**

Run:

```powershell
icp environment show
icp canister id frontend
icp canister id magickbox_core
```

Expected: local frontend and backend canister IDs are printed.

- [ ] **Step 4: Browser smoke the asset canister**

Open the local asset canister URL printed by `icp` and verify:

- landing route loads,
- `/home/explore?category=latest` refresh works,
- `/evaluation` loads,
- no console errors.

- [ ] **Step 5: Commit**

Run:

```powershell
git add .icp docs/handovers/magickbox-isolated-prototype-handoff.md docs/progress/magickbox-prototype-progress.md
git commit -m "docs: record local ICP deployment"
```

## Self-Review

- Spec coverage: ICP-first state, II, ICP payments as primary, Stripe secondary, MagickAI, FreeLLMAPI, own-key, local LLM, credit recovery popup, and deployment safety are covered.
- Placeholder scan: this plan intentionally leaves AI worker implementation as an adapter boundary for later, but no implementation step depends on an undefined function.
- Type consistency: provider and credit option IDs are shared across Candid, frontend data, and tests.
