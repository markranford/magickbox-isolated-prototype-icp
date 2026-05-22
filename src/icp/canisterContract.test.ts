import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const candid = readFileSync(
  resolve(__dirname, "../../canisters/magickbox_core/magickbox_core.did"),
  "utf8",
);
const canisterSource = readFileSync(
  resolve(__dirname, "../../canisters/magickbox_core/main.mo"),
  "utf8",
);

describe("magickbox_core Candid contract", () => {
  it("exposes real worker, payment, ad-credit, and media manifest methods", () => {
    const requiredMethods = [
      "authorize_worker",
      "complete_worker_job",
      "list_my_worker_grants",
      "create_icp_payment_intent",
      "claim_icp_payment",
      "list_my_payment_intents",
      "grant_ad_credits",
      "list_my_ad_credit_grants",
      "attach_media_manifest",
      "list_my_media_manifests",
      "get_payment_account",
    ];

    for (const method of requiredMethods) {
      expect(candid).toContain(`${method} :`);
    }
  });

  it("declares durable records for local ICP evaluation evidence", () => {
    const requiredTypes = [
      "type WorkerGrant",
      "type WorkerRun",
      "type PaymentIntent",
      "type AdCreditGrant",
      "type MediaManifest",
    ];

    for (const typeName of requiredTypes) {
      expect(candid).toContain(typeName);
    }
  });

  it("binds each ICP payment intent to its own ledger subaccount", () => {
    expect(candid).toContain("payment_subaccount : opt blob");
    expect(candid).toContain("payment_subaccount_hex : text");
    expect(candid).toContain("get_payment_account_for_intent :");
    expect(canisterSource).toContain("func subaccount_for_payment_intent");
    expect(canisterSource).toContain("func account_for_payment_intent");
    expect(canisterSource).toContain("subaccount = account.subaccount");
    expect(canisterSource).not.toContain("claimed_payment_e8s + intent.amount_e8s");
  });
});
