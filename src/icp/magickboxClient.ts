import { AuthClient } from "@icp-sdk/auth/client";
import {
  Actor,
  HttpAgent,
  type ActorSubclass,
  type Identity,
} from "@icp-sdk/core/agent";
import { safeGetCanisterEnv } from "@icp-sdk/core/agent/canister-env";
import { Ed25519KeyIdentity } from "@icp-sdk/core/identity";
import {
  idlFactory,
  type _SERVICE,
} from "./generated/magickbox_core.did";
import {
  idlFactory as mediaIdlFactory,
  type _SERVICE as MediaService,
} from "./generated/magickbox_media.did";

type MagickBoxCanisterEnv = {
  readonly "PUBLIC_CANISTER_ID:magickbox_core"?: string;
  readonly "PUBLIC_CANISTER_ID:magickbox_media"?: string;
  readonly "PUBLIC_CANISTER_ID:backend"?: string;
};

export type CoreActor = ActorSubclass<_SERVICE>;
export type MediaActor = ActorSubclass<MediaService>;

export type IcpRuntime = {
  canisterId: string | null;
  mediaCanisterId: string | null;
  deploymentKind: "local" | "caffeine" | "mainnet";
  host: string;
  identityProvider: string;
  rootKey?: Uint8Array;
  reason: string;
};

type ViteCanisterEnv = {
  readonly VITE_MAGICKBOX_CORE_CANISTER_ID?: string;
  readonly VITE_MAGICKBOX_MEDIA_CANISTER_ID?: string;
  readonly VITE_CAFFEINE_BACKEND_CANISTER_ID?: string;
};

type CaffeineEnvJson = {
  readonly backend_canister_id?: string;
  readonly backend_host?: string;
};

type CaffeineBackendRuntime = {
  canisterId: string;
  host: string;
};

const eightHoursInNanoseconds = BigInt(8) * BigInt(3_600_000_000_000);
const localIdentityStorageKey = "magickbox.localBrowserIdentity.v1";
const localIdentityActiveStorageKey = "magickbox.localBrowserIdentity.active.v1";

function currentOrigin() {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:8010";
  }

  return window.location.origin;
}

export function isCaffeineHostedOrigin(origin = currentOrigin()) {
  try {
    const { hostname } = new URL(origin);

    return hostname === "caffeine.xyz" || hostname.endsWith(".caffeine.xyz");
  } catch {
    return false;
  }
}

export function isLocalIcpOrigin(origin = currentOrigin()) {
  try {
    const { hostname } = new URL(origin);

    return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost");
  } catch {
    return false;
  }
}

export function classifyIcpDeployment(host: string, rootKey?: Uint8Array): IcpRuntime["deploymentKind"] {
  if (isCaffeineHostedOrigin(host)) {
    return "caffeine";
  }

  if (rootKey || isLocalIcpOrigin(host)) {
    return "local";
  }

  return "mainnet";
}

function localIdentityProvider() {
  if (typeof window === "undefined") {
    return "http://id.ai.localhost:8010/authorize";
  }

  const port = window.location.port || "8000";
  return `http://id.ai.localhost:${port}/authorize`;
}

export function getIdentityProviderUrl() {
  return isLocalIcpOrigin() ? localIdentityProvider() : "https://id.ai/authorize";
}

export function resolveCanisterIds(
  env?: MagickBoxCanisterEnv | null,
  viteEnv: ViteCanisterEnv = import.meta.env as ViteCanisterEnv,
) {
  return {
    canisterId:
      env?.["PUBLIC_CANISTER_ID:magickbox_core"] ??
      env?.["PUBLIC_CANISTER_ID:backend"] ??
      viteEnv.VITE_MAGICKBOX_CORE_CANISTER_ID ??
      viteEnv.VITE_CAFFEINE_BACKEND_CANISTER_ID ??
      null,
    mediaCanisterId:
      env?.["PUBLIC_CANISTER_ID:magickbox_media"] ??
      viteEnv.VITE_MAGICKBOX_MEDIA_CANISTER_ID ??
      null,
  };
}

export function resolveIcpRuntime(): IcpRuntime {
  const env = safeGetCanisterEnv<MagickBoxCanisterEnv>();
  const viteHost = import.meta.env.VITE_ICP_HOST;
  const { canisterId, mediaCanisterId } = resolveCanisterIds(env);
  const host = env ? currentOrigin() : viteHost ?? currentOrigin();
  const reason = env
    ? "ic_env detected from the ICP asset canister"
    : isCaffeineHostedOrigin(host)
      ? "Caffeine-hosted ICP frontend detected; backend canister config will be loaded from Caffeine env.json"
      : "no ic_env cookie found; canister writes require the ICP asset canister unless Vite ICP env is supplied";

  return {
    canisterId,
    mediaCanisterId,
    deploymentKind: classifyIcpDeployment(host, env?.IC_ROOT_KEY),
    host,
    identityProvider: getIdentityProviderUrl(),
    rootKey: env?.IC_ROOT_KEY,
    reason,
  };
}

export function canUseIcpRuntime(runtime: IcpRuntime) {
  return Boolean(runtime.canisterId) || isCaffeineHostedOrigin(runtime.host);
}

export function canUseLocalBrowserIdentity(runtime: IcpRuntime) {
  return canUseIcpRuntime(runtime) && runtime.deploymentKind === "local";
}

export function buildHttpAgentOptions(runtime: IcpRuntime, identity?: Identity) {
  return {
    host: runtime.host,
    identity,
    ...(runtime.rootKey ? { rootKey: runtime.rootKey } : {}),
  };
}

export async function createCoreActor(identity?: Identity): Promise<CoreActor> {
  const runtime = resolveIcpRuntime();

  if (!runtime.canisterId && isCaffeineHostedOrigin(runtime.host)) {
    return createCaffeineCoreActor(identity);
  }

  if (!runtime.canisterId) {
    throw new Error(runtime.reason);
  }

  const agent = await HttpAgent.create(buildHttpAgentOptions(runtime, identity));

  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: runtime.canisterId,
  });
}

async function createCaffeineCoreActor(identity?: Identity): Promise<CoreActor> {
  const caffeineRuntime = await loadCaffeineBackendRuntime();
  const agent = await HttpAgent.create({
    host: caffeineRuntime.host,
    identity,
  });

  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: caffeineRuntime.canisterId,
  });
}

async function loadCaffeineBackendRuntime(): Promise<CaffeineBackendRuntime> {
  const response = await fetch("/env.json", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Caffeine backend config request failed with ${response.status}`);
  }

  const config = (await response.json()) as CaffeineEnvJson;
  const canisterId = normalizeCaffeineEnvValue(config.backend_canister_id);

  if (!canisterId) {
    throw new Error("Caffeine backend canister id is unavailable from env.json");
  }

  return {
    canisterId,
    host: normalizeCaffeineEnvValue(config.backend_host) ?? "https://icp-api.io",
  };
}

function normalizeCaffeineEnvValue(value?: string) {
  if (!value || value === "undefined") {
    return undefined;
  }

  return value;
}

export async function createMediaActor(identity?: Identity): Promise<MediaActor> {
  const runtime = resolveIcpRuntime();

  if (!runtime.mediaCanisterId) {
    throw new Error("ICP media canister id is unavailable from the asset canister runtime");
  }

  const agent = await HttpAgent.create(buildHttpAgentOptions(runtime, identity));

  return Actor.createActor<MediaService>(mediaIdlFactory, {
    agent,
    canisterId: runtime.mediaCanisterId,
  });
}

export function createAuthClient() {
  return new AuthClient({
    identityProvider: getIdentityProviderUrl(),
    idleOptions: {
      disableDefaultIdleCallback: true,
    },
  });
}

export function getOrCreateLocalBrowserIdentity() {
  const stored = globalThis.localStorage?.getItem(localIdentityStorageKey);

  if (stored) {
    return Ed25519KeyIdentity.fromJSON(stored);
  }

  const identity = Ed25519KeyIdentity.generate();
  globalThis.localStorage?.setItem(localIdentityStorageKey, JSON.stringify(identity.toJSON()));

  return identity;
}

export function markLocalBrowserIdentityActive() {
  globalThis.localStorage?.setItem(localIdentityActiveStorageKey, "true");
}

export function clearLocalBrowserIdentityActive() {
  globalThis.localStorage?.removeItem(localIdentityActiveStorageKey);
}

export function hasActiveLocalBrowserIdentity() {
  return globalThis.localStorage?.getItem(localIdentityActiveStorageKey) === "true";
}

export async function signInWithInternetIdentity(authClient: AuthClient) {
  return authClient.signIn({
    maxTimeToLive: eightHoursInNanoseconds,
  });
}

export async function promptHash(prompt: string) {
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(prompt),
    );

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  let hash = 0;
  for (let index = 0; index < prompt.length; index += 1) {
    hash = (hash * 31 + prompt.charCodeAt(index)) >>> 0;
  }

  return `local-${hash.toString(16).padStart(8, "0")}`;
}
