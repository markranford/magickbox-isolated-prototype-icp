import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const candid = readFileSync(
  resolve(__dirname, "../../canisters/magickbox_core/magickbox_core.did"),
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
});
