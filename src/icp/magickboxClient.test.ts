import { describe, expect, it } from "vitest";
import {
  canUseIcpRuntime,
  getIdentityProviderUrl,
  promptHash,
  resolveIcpRuntime,
} from "./magickboxClient";

describe("Magick Box ICP client adapter", () => {
  it("uses the mock fallback when the asset canister ic_env cookie is absent", () => {
    const runtime = resolveIcpRuntime();

    expect(canUseIcpRuntime(runtime)).toBe(false);
    expect(runtime.canisterId).toBeNull();
    expect(runtime.reason).toContain("no ic_env cookie");
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
});
