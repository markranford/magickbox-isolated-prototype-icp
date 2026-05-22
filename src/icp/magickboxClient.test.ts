import { describe, expect, it } from "vitest";
import {
  canUseIcpRuntime,
  clearLocalBrowserIdentityActive,
  getIdentityProviderUrl,
  getOrCreateLocalBrowserIdentity,
  hasActiveLocalBrowserIdentity,
  markLocalBrowserIdentityActive,
  promptHash,
  resolveIcpRuntime,
} from "./magickboxClient";

describe("Magick Box ICP client adapter", () => {
  it("requires the asset canister runtime when the ic_env cookie is absent", () => {
    const runtime = resolveIcpRuntime();

    expect(canUseIcpRuntime(runtime)).toBe(false);
    expect(runtime.canisterId).toBeNull();
    expect(runtime.reason).toContain("canister writes require the ICP asset canister");
  });

  it("targets local Internet Identity from localhost-style origins", () => {
    expect(getIdentityProviderUrl()).toContain("id.ai.localhost");
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
