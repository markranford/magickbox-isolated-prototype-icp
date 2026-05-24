import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const mockActor = {
  get_provider_options: vi.fn(async () => [
    {
      id: "magick_ai_worker",
      title: "MagickAI worker",
      description: "Routes through the Caffeine-hosted mainnet canister.",
      credit_cost: 10n,
      enabled: true,
      zero_credit: false,
    },
  ]),
  get_credit_options: vi.fn(async () => [
    {
      id: "icp_topup",
      title: "ICP top up",
      description: "Create an ICP payment intent.",
      route: "/home/subscriptions",
      requires_payment: true,
      on_icp: true,
    },
  ]),
  get_payment_account: vi.fn(async () => ({
    owner: { toText: () => "itg54-4qaaa-aaaam-qiziq-cai" },
    subaccount_hex: "00".repeat(32),
  })),
  get_superadmin_status: vi.fn(async () => ({
    caller: { toText: () => "2vxsx-fae" },
    is_superadmin: false,
    superadmin_count: 0n,
    bootstrap_available: false,
    system_wallet_owner: [{ toText: () => "itg54-4qaaa-aaaam-qiziq-cai" }],
  })),
};

vi.mock("./icp/magickboxClient", () => ({
  canUseLocalBrowserIdentity: (runtime: { deploymentKind: string }) => runtime.deploymentKind === "local",
  canUseIcpRuntime: () => true,
  clearLocalBrowserIdentityActive: vi.fn(),
  createAuthClient: () => ({
    getIdentity: vi.fn(),
    isAuthenticated: () => false,
    signOut: vi.fn(),
  }),
  createCoreActor: vi.fn(async () => mockActor),
  createMediaActor: vi.fn(),
  getOrCreateLocalBrowserIdentity: vi.fn(),
  hasActiveLocalBrowserIdentity: () => false,
  markLocalBrowserIdentityActive: vi.fn(),
  promptHash: vi.fn(async (prompt: string) => `hash-${prompt.length}`),
  resolveIcpRuntime: () => ({
    canisterId: null,
    mediaCanisterId: null,
    deploymentKind: "caffeine",
    host: "https://magickbox-icp-e68.caffeine.xyz",
    identityProvider: "https://id.ai/authorize",
    reason: "Caffeine-hosted mainnet runtime",
  }),
  signInWithInternetIdentity: vi.fn(),
}));

describe("MagickBoxV3 Caffeine mainnet copy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, "", "/");
  });

  it("does not describe the Caffeine-hosted runtime as a local ICP canister on public live routes", async () => {
    render(<App />);

    await waitFor(() => expect(mockActor.get_superadmin_status).toHaveBeenCalled());

    expect(screen.queryByText("Local ICP canister detected; sign in to write account state")).not.toBeInTheDocument();
  });

  it("does not expose local browser identity on the public auth route", async () => {
    window.history.pushState({}, "", "/auth/sign-in");

    render(<App />);

    await waitFor(() => expect(mockActor.get_superadmin_status).toHaveBeenCalled());

    expect(screen.getByRole("button", { name: "Sign in with Internet Identity" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Use local browser identity" })).not.toBeInTheDocument();
  });

  it("does not expose local browser identity on the public admin route", async () => {
    window.history.pushState({}, "", "/home/admin");

    render(<App />);

    await waitFor(() => expect(mockActor.get_superadmin_status).toHaveBeenCalled());

    expect(screen.getByRole("heading", { name: "Superadmin" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in with Internet Identity" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Use local browser identity" })).not.toBeInTheDocument();
  });
});
