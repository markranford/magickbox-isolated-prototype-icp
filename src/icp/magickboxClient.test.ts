import { describe, expect, it } from "vitest";
import {
  buildHttpAgentOptions,
  canUseLocalBrowserIdentity,
  canUseIcpRuntime,
  clearLocalBrowserIdentityActive,
  createMediaActor,
  getIdentityProviderUrl,
  getOrCreateLocalBrowserIdentity,
  hasActiveLocalBrowserIdentity,
  isCaffeineHostedOrigin,
  markLocalBrowserIdentityActive,
  promptHash,
  resolveCanisterIds,
  resolveIcpRuntime,
} from "./magickboxClient";

describe("Magick Box ICP client adapter", () => {
  it("requires the asset canister runtime when the ic_env cookie is absent", () => {
    const runtime = resolveIcpRuntime();

    expect(canUseIcpRuntime(runtime)).toBe(false);
    expect(runtime.canisterId).toBeNull();
    expect(runtime.reason).toContain("canister writes require the ICP asset canister");
  });

  it("requires a media canister id before creating the ICP media actor", async () => {
    await expect(createMediaActor()).rejects.toThrow("media canister");
  });

  it("accepts Caffeine's single backend canister env as a core canister fallback", () => {
    const ids = resolveCanisterIds({
      "PUBLIC_CANISTER_ID:backend": "aaaaa-aa",
    });

    expect(ids.canisterId).toBe("aaaaa-aa");
    expect(ids.mediaCanisterId).toBeNull();
  });

  it("treats isolated Caffeine domains as eligible for Caffeine backend config", () => {
    const runtime = {
      canisterId: null,
      mediaCanisterId: null,
      deploymentKind: "caffeine" as const,
      host: "https://magickbox-icp-e68.caffeine.xyz",
      identityProvider: "https://id.ai/authorize",
      reason: "Caffeine hosted runtime",
    };

    expect(isCaffeineHostedOrigin(runtime.host)).toBe(true);
    expect(canUseIcpRuntime(runtime)).toBe(true);
    expect(canUseLocalBrowserIdentity(runtime)).toBe(false);
    expect(isCaffeineHostedOrigin("https://www.magickbox.ai")).toBe(false);
  });

  it("only allows local browser identity on local ICP runtimes", () => {
    expect(
      canUseLocalBrowserIdentity({
        canisterId: "aaaaa-aa",
        mediaCanisterId: null,
        deploymentKind: "local",
        host: "http://127.0.0.1:8010",
        identityProvider: "http://id.ai.localhost:8010/authorize",
        reason: "local asset canister runtime",
      }),
    ).toBe(true);

    expect(
      canUseLocalBrowserIdentity({
        canisterId: "aaaaa-aa",
        mediaCanisterId: null,
        deploymentKind: "mainnet",
        host: "https://icp0.io",
        identityProvider: "https://id.ai/authorize",
        reason: "mainnet canister runtime",
      }),
    ).toBe(false);
  });

  it("does not require a local root key for mainnet agent options", () => {
    const options = buildHttpAgentOptions({
      canisterId: "aaaaa-aa",
      mediaCanisterId: null,
      deploymentKind: "mainnet",
      host: "https://icp0.io",
      identityProvider: "https://id.ai/authorize",
      reason: "mainnet canister runtime",
    });

    expect(options).toMatchObject({ host: "https://icp0.io" });
    expect("rootKey" in options).toBe(false);
  });

  it("targets local Internet Identity authorize endpoint from localhost-style origins", () => {
    expect(getIdentityProviderUrl()).toContain("id.ai.localhost");
    expect(getIdentityProviderUrl()).toContain("/authorize");
  });

  it("hashes prompts before sending them to canister state", async () => {
    const first = await promptHash("Create a cinematic Magick Box launch trailer");
    const second = await promptHash("Create a cinematic Magick Box launch trailer");

    expect(first).toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(8);
  });

  it("persists a real local browser identity for popup-blocked environments", () => {
    const first = getOrCreateLocalBrowserIdentity();
    const second = getOrCreateLocalBrowserIdentity();

    expect(first.getPrincipal().toText()).toBe(second.getPrincipal().toText());
    expect(first.getPrincipal().isAnonymous()).toBe(false);
  });

  it("stores whether the local browser identity should reconnect after reloads", () => {
    clearLocalBrowserIdentityActive();
    expect(hasActiveLocalBrowserIdentity()).toBe(false);

    markLocalBrowserIdentityActive();
    expect(hasActiveLocalBrowserIdentity()).toBe(true);

    clearLocalBrowserIdentityActive();
    expect(hasActiveLocalBrowserIdentity()).toBe(false);
  });
});
