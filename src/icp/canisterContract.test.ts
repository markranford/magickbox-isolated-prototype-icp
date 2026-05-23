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
const mediaCandid = readFileSync(
  resolve(__dirname, "../../canisters/magickbox_media/magickbox_media.did"),
  "utf8",
);
const mediaCanisterSource = readFileSync(
  resolve(__dirname, "../../canisters/magickbox_media/main.mo"),
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
      "store_media_asset",
      "attach_media_manifest",
      "list_my_media_manifests",
      "list_my_media_assets",
      "get_media_asset",
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
      "type MediaAsset",
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

  it("keeps core manifests ICP-only and accepts dedicated media-canister URIs", () => {
    expect(candid).toContain("type MediaManifest");
    expect(candid).toContain("attach_media_manifest :");
    expect(canisterSource).toContain("icp-canister-media-store");
    expect(canisterSource).toContain("icp-media://");
  });

  it("provides a dedicated chunked ICP media canister for generated assets", () => {
    for (const method of [
      "create_asset",
      "put_chunk",
      "commit_asset",
      "get_manifest",
      "get_chunk",
      "list_my_assets",
    ]) {
      expect(mediaCandid).toContain(`${method} :`);
    }

    expect(mediaCandid).toContain("content : blob");
    expect(mediaCandid).toContain("chunk_count : nat");
    expect(mediaCanisterSource).toContain("MAX_CHUNK_BYTES : Nat = 1_000_000");
    expect(mediaCanisterSource).toContain("MAX_ASSET_BYTES : Nat = 500_000_000");
    expect(mediaCanisterSource).toContain("Only the media asset owner can modify this asset");
    expect(mediaCanisterSource).toContain("icp-media://");
  });

  it("exposes superadmin role and system wallet management methods", () => {
    for (const typeName of [
      "type SuperAdminStatus",
      "type SystemWallet",
      "type SystemFundingWallet",
      "type AdminDashboard",
      "type AdminAction",
    ]) {
      expect(candid).toContain(typeName);
    }

    for (const method of [
      "get_superadmin_status",
      "bootstrap_superadmin",
      "add_superadmin",
      "remove_superadmin",
      "create_system_funding_wallet",
      "get_system_wallet_status",
      "get_admin_dashboard",
      "list_admin_audit_events",
    ]) {
      expect(candid).toContain(`${method} :`);
    }

    expect(canisterSource).toContain("require_superadmin");
    expect(canisterSource).toContain("icrc1_balance_of");
    expect(canisterSource).toContain("system_wallet_status");
  });

  it("creates a dedicated superadmin system funding wallet before funding", () => {
    expect(candid).toContain("funding_wallet : opt SystemFundingWallet");
    expect(candid).toContain("requires_wallet_creation : bool");
    expect(candid).toContain("subaccount_hex : text");
    expect(canisterSource).toContain("var system_funding_wallets");
    expect(canisterSource).toContain("func subaccount_for_system_funding_wallet");
    expect(canisterSource).toContain("create_system_funding_wallet");
    expect(canisterSource).toContain("system_funding_wallet_created");
    expect(canisterSource).toContain("Only superadmins can create the system funding wallet");
    expect(canisterSource).toContain("MBFUND");
  });
});
