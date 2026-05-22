/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthClient } from "@icp-sdk/auth/client";
import type {
  CreateJobResult,
  CreditOption,
  GenerationJob,
  Profile,
  ProviderOption,
} from "./generated/magickbox_core.did";
import {
  canUseIcpRuntime,
  createAuthClient,
  createCoreActor,
  promptHash,
  resolveIcpRuntime,
  signInWithInternetIdentity,
  type CoreActor,
  type IcpRuntime,
} from "./magickboxClient";
import {
  creditRecoveryOptions,
  icpProviderOptions,
  type CreationMode,
} from "../data/content";

export type UiProviderOption = {
  id: string;
  label: string;
  description: string;
  badge: string;
  creditCost: number;
  source: "canister" | "mock";
};

export type UiCreditOption = {
  id: string;
  label: string;
  description: string;
  route?: string;
  requiresPayment?: boolean;
  onIcp?: boolean;
};

export type CreateGenerationOutcome =
  | { kind: "ok"; job: GenerationJob }
  | {
      kind: "insufficient_credits";
      required: number;
      balance: number;
      options: UiCreditOption[];
    }
  | { kind: "auth_required"; message: string }
  | { kind: "err"; message: string };

type MagickBoxIcpState = {
  actor: CoreActor | null;
  authClient: AuthClient | null;
  profile: Profile | null;
  jobs: GenerationJob[];
  providerOptions: UiProviderOption[];
  creditOptions: UiCreditOption[];
  runtime: IcpRuntime;
  runtimeMode: "icp" | "mock";
  status: "connecting" | "anonymous" | "authenticated" | "mock" | "error";
  statusMessage: string;
  principalText: string | null;
  isAuthenticated: boolean;
  isBusy: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  createGenerationJob: (params: {
    mode: CreationMode;
    providerId: string;
    prompt: string;
    creditCost: number;
  }) => Promise<CreateGenerationOutcome>;
  refreshAccount: () => Promise<void>;
};

const MagickBoxIcpContext = createContext<MagickBoxIcpState | null>(null);

function asNumber(value: bigint) {
  return Number(value);
}

function firstOrNull<T>(items: [] | [T]) {
  return items.length > 0 ? items[0] ?? null : null;
}

function mapProviderOption(option: ProviderOption): UiProviderOption {
  const creditCost = asNumber(option.credit_cost);

  return {
    id: option.id,
    label: option.title,
    description: option.description,
    badge: creditCost === 0 ? "No Magick credits" : `${creditCost} credits`,
    creditCost,
    source: "canister",
  };
}

function mapMockProviderOption(option: (typeof icpProviderOptions)[number]): UiProviderOption {
  return {
    id: option.id,
    label: option.label,
    description: option.description,
    badge: option.badge,
    creditCost: option.creditCost,
    source: "mock",
  };
}

function mapCreditOption(option: CreditOption): UiCreditOption {
  return {
    id: option.id,
    label: option.title,
    description: option.description,
    route: option.route,
    requiresPayment: option.requires_payment,
    onIcp: option.on_icp,
  };
}

function mapMockCreditOption(option: (typeof creditRecoveryOptions)[number]): UiCreditOption {
  return {
    id: option.id,
    label: option.label,
    description: option.description,
  };
}

async function ensureProfile(actor: CoreActor) {
  const existing = await actor.get_my_profile();
  const profile = firstOrNull(existing);

  if (profile) {
    return profile;
  }

  const registered = await actor.register_profile("Magick Box Creator", []);

  if ("err" in registered) {
    throw new Error(registered.err);
  }

  return registered.ok;
}

function normalizeCreateJobResult(result: CreateJobResult): CreateGenerationOutcome {
  if ("ok" in result) {
    return { kind: "ok", job: result.ok };
  }

  if ("insufficient_credits" in result) {
    return {
      kind: "insufficient_credits",
      required: asNumber(result.insufficient_credits.required),
      balance: asNumber(result.insufficient_credits.balance),
      options: result.insufficient_credits.options.map(mapCreditOption),
    };
  }

  return { kind: "err", message: result.err };
}

export function MagickBoxIcpProvider({ children }: { children: ReactNode }) {
  const initialRuntime = useMemo(() => resolveIcpRuntime(), []);
  const [actor, setActor] = useState<CoreActor | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [providerOptions, setProviderOptions] = useState<UiProviderOption[]>(
    icpProviderOptions.map(mapMockProviderOption),
  );
  const [creditOptions, setCreditOptions] = useState<UiCreditOption[]>(
    creditRecoveryOptions.map(mapMockCreditOption),
  );
  const [runtimeMode, setRuntimeMode] = useState<"icp" | "mock">(
    canUseIcpRuntime(initialRuntime) ? "icp" : "mock",
  );
  const [status, setStatus] = useState<MagickBoxIcpState["status"]>(
    canUseIcpRuntime(initialRuntime) ? "connecting" : "mock",
  );
  const [statusMessage, setStatusMessage] = useState(
    canUseIcpRuntime(initialRuntime)
      ? "Connecting to local ICP canisters"
      : "Mock fallback active outside the ICP asset canister",
  );
  const [principalText, setPrincipalText] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const refreshAccount = useCallback(async () => {
    if (!actor) {
      return;
    }

    const [nextProfile, nextJobs] = await Promise.all([
      actor.get_my_profile(),
      actor.list_my_jobs(),
    ]);

    setProfile(firstOrNull(nextProfile));
    setJobs(nextJobs);
  }, [actor]);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      const runtime = resolveIcpRuntime();

      if (!canUseIcpRuntime(runtime)) {
        setRuntimeMode("mock");
        setStatus("mock");
        setStatusMessage("Mock fallback active outside the ICP asset canister");
        return;
      }

      try {
        const anonymousActor = await createCoreActor();
        const [providers, credits] = await Promise.all([
          anonymousActor.get_provider_options(),
          anonymousActor.get_credit_options(),
        ]);
        const nextAuthClient = createAuthClient();

        if (cancelled) {
          return;
        }

        setRuntimeMode("icp");
        setActor(anonymousActor);
        setAuthClient(nextAuthClient);
        setProviderOptions(providers.map(mapProviderOption));
        setCreditOptions(credits.map(mapCreditOption));

        if (nextAuthClient.isAuthenticated()) {
          const identity = await nextAuthClient.getIdentity();
          const authenticatedActor = await createCoreActor(identity);
          const nextProfile = await ensureProfile(authenticatedActor);
          const nextJobs = await authenticatedActor.list_my_jobs();

          if (cancelled) {
            return;
          }

          setActor(authenticatedActor);
          setProfile(nextProfile);
          setJobs(nextJobs);
          setPrincipalText(identity.getPrincipal().toText());
          setStatus("authenticated");
          setStatusMessage("Internet Identity connected to local ICP");
          return;
        }

        setStatus("anonymous");
        setStatusMessage("Local ICP canister detected; sign in to write account state");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setRuntimeMode("mock");
        setStatus("error");
        setStatusMessage(error instanceof Error ? error.message : "ICP connection failed");
      }
    }

    void connect();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async () => {
    const runtime = resolveIcpRuntime();

    if (!canUseIcpRuntime(runtime)) {
      setRuntimeMode("mock");
      setStatus("mock");
      setStatusMessage("Open the local ICP asset canister to use Internet Identity");
      return;
    }

    setIsBusy(true);
    try {
      const nextAuthClient = authClient ?? createAuthClient();
      const identity = await signInWithInternetIdentity(nextAuthClient);
      const authenticatedActor = await createCoreActor(identity);
      const nextProfile = await ensureProfile(authenticatedActor);
      const nextJobs = await authenticatedActor.list_my_jobs();
      const [providers, credits] = await Promise.all([
        authenticatedActor.get_provider_options(),
        authenticatedActor.get_credit_options(),
      ]);

      setRuntimeMode("icp");
      setAuthClient(nextAuthClient);
      setActor(authenticatedActor);
      setProfile(nextProfile);
      setJobs(nextJobs);
      setProviderOptions(providers.map(mapProviderOption));
      setCreditOptions(credits.map(mapCreditOption));
      setPrincipalText(identity.getPrincipal().toText());
      setStatus("authenticated");
      setStatusMessage("Internet Identity connected to local ICP");
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Internet Identity sign-in failed");
    } finally {
      setIsBusy(false);
    }
  }, [authClient]);

  const signOut = useCallback(async () => {
    setIsBusy(true);
    try {
      await authClient?.signOut();
      const anonymousActor = canUseIcpRuntime(resolveIcpRuntime()) ? await createCoreActor() : null;

      setActor(anonymousActor);
      setProfile(null);
      setJobs([]);
      setPrincipalText(null);
      setStatus(anonymousActor ? "anonymous" : "mock");
      setStatusMessage(
        anonymousActor
          ? "Local ICP canister detected; sign in to write account state"
          : "Mock fallback active outside the ICP asset canister",
      );
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Internet Identity sign-out failed");
    } finally {
      setIsBusy(false);
    }
  }, [authClient]);

  const createGenerationJob = useCallback(
    async ({
      mode,
      providerId,
      prompt,
      creditCost,
    }: {
      mode: CreationMode;
      providerId: string;
      prompt: string;
      creditCost: number;
    }): Promise<CreateGenerationOutcome> => {
      if (runtimeMode !== "icp" || !actor) {
        return {
          kind: "auth_required",
          message: "Mock runtime is active; no canister write was attempted",
        };
      }

      if (status !== "authenticated") {
        return {
          kind: "auth_required",
          message: "Sign in with Internet Identity to create an ICP job",
        };
      }

      setIsBusy(true);
      try {
        await ensureProfile(actor);
        const result = await actor.create_generation_job(
          mode,
          providerId,
          prompt.slice(0, 280),
          await promptHash(prompt),
          BigInt(creditCost),
        );
        const outcome = normalizeCreateJobResult(result);
        const [nextProfile, nextJobs] = await Promise.all([
          actor.get_my_profile(),
          actor.list_my_jobs(),
        ]);

        setProfile(firstOrNull(nextProfile));
        setJobs(nextJobs);

        return outcome;
      } catch (error) {
        return {
          kind: "err",
          message: error instanceof Error ? error.message : "Canister job creation failed",
        };
      } finally {
        setIsBusy(false);
      }
    },
    [actor, runtimeMode, status],
  );

  const value = useMemo<MagickBoxIcpState>(
    () => ({
      actor,
      authClient,
      profile,
      jobs,
      providerOptions,
      creditOptions,
      runtime: initialRuntime,
      runtimeMode,
      status,
      statusMessage,
      principalText,
      isAuthenticated: status === "authenticated",
      isBusy,
      signIn,
      signOut,
      createGenerationJob,
      refreshAccount,
    }),
    [
      actor,
      authClient,
      profile,
      jobs,
      providerOptions,
      creditOptions,
      initialRuntime,
      runtimeMode,
      status,
      statusMessage,
      principalText,
      isBusy,
      signIn,
      signOut,
      createGenerationJob,
      refreshAccount,
    ],
  );

  return <MagickBoxIcpContext.Provider value={value}>{children}</MagickBoxIcpContext.Provider>;
}

export function useMagickBoxIcp() {
  const context = useContext(MagickBoxIcpContext);

  if (!context) {
    throw new Error("useMagickBoxIcp must be used inside MagickBoxIcpProvider");
  }

  return context;
}
