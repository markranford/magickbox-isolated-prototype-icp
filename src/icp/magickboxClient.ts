import { AuthClient } from "@icp-sdk/auth/client";
import {
  Actor,
  HttpAgent,
  type ActorSubclass,
  type Identity,
} from "@icp-sdk/core/agent";
import { safeGetCanisterEnv } from "@icp-sdk/core/agent/canister-env";
import {
  idlFactory,
  type _SERVICE,
} from "./generated/magickbox_core.did";

type MagickBoxCanisterEnv = {
  readonly "PUBLIC_CANISTER_ID:magickbox_core"?: string;
};

export type CoreActor = ActorSubclass<_SERVICE>;

export type IcpRuntime = {
  canisterId: string | null;
  host: string;
  identityProvider: string;
  rootKey?: Uint8Array;
  reason: string;
};

const eightHoursInNanoseconds = BigInt(8) * BigInt(3_600_000_000_000);

function currentOrigin() {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:8010";
  }

  return window.location.origin;
}

function localIdentityProvider() {
  if (typeof window === "undefined") {
    return "http://id.ai.localhost:8010";
  }

  const port = window.location.port || "8000";
  return `http://id.ai.localhost:${port}`;
}

export function getIdentityProviderUrl() {
  if (typeof window === "undefined") {
    return "https://id.ai";
  }

  const host = window.location.hostname;
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost");

  return isLocal ? localIdentityProvider() : "https://id.ai";
}

export function resolveIcpRuntime(): IcpRuntime {
  const env = safeGetCanisterEnv<MagickBoxCanisterEnv>();
  const viteCanisterId = import.meta.env.VITE_MAGICKBOX_CORE_CANISTER_ID;
  const viteHost = import.meta.env.VITE_ICP_HOST;
  const canisterId = env?.["PUBLIC_CANISTER_ID:magickbox_core"] ?? viteCanisterId ?? null;
  const host = env ? currentOrigin() : viteHost ?? currentOrigin();
  const reason = env
    ? "ic_env detected from the ICP asset canister"
    : "no ic_env cookie found; using local mock fallback unless Vite ICP env is supplied";

  return {
    canisterId,
    host,
    identityProvider: getIdentityProviderUrl(),
    rootKey: env?.IC_ROOT_KEY,
    reason,
  };
}

export function canUseIcpRuntime(runtime: IcpRuntime) {
  return Boolean(runtime.canisterId && runtime.rootKey);
}

export async function createCoreActor(identity?: Identity): Promise<CoreActor> {
  const runtime = resolveIcpRuntime();

  if (!runtime.canisterId || !runtime.rootKey) {
    throw new Error(runtime.reason);
  }

  const agent = await HttpAgent.create({
    host: runtime.host,
    identity,
    rootKey: runtime.rootKey,
  });

  return Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: runtime.canisterId,
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
