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
  AdCreditGrant,
  CreditOption,
  GenerationJob,
  PaymentAccount,
  PaymentIntent,
  Profile,
  ProviderOption,
} from "./generated/magickbox_core.did";
import {
  canUseIcpRuntime,
  clearLocalBrowserIdentityActive,
  createAuthClient,
  createCoreActor,
  getOrCreateLocalBrowserIdentity,
  hasActiveLocalBrowserIdentity,
  markLocalBrowserIdentityActive,
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
  source: "canister" | "static_catalog";
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

export type PaymentIntentOutcome =
  | { kind: "ok"; intent: PaymentIntent }
  | { kind: "auth_required"; message: string }
  | { kind: "err"; message: string };

export type AdCreditOutcome =
  | { kind: "ok"; grant: AdCreditGrant }
  | { kind: "auth_required"; message: string }
  | { kind: "err"; message: string };

type MagickBoxIcpState = {
  actor: CoreActor | null;
  authClient: AuthClient | null;
  profile: Profile | null;
  paymentAccount: PaymentAccount | null;
  jobs: GenerationJob[];
  providerOptions: UiProviderOption[];
  creditOptions: UiCreditOption[];
  runtime: IcpRuntime;
  runtimeMode: "icp" | "unavailable";
  status: "connecting" | "anonymous" | "authenticated" | "unavailable" | "error";
  statusMessage: string;
  principalText: string | null;
  authMethod: "internet_identity" | "local_browser" | null;
  isAuthenticated: boolean;
  isBusy: boolean;
  signIn: () => Promise<void>;
  signInWithLocalIdentity: () => Promise<void>;
  signOut: () => Promise<void>;
  createGenerationJob: (params: {
    mode: CreationMode;
    providerId: string;
    prompt: string;
    creditCost: number;
  }) => Promise<CreateGenerationOutcome>;
  createIcpPaymentIntent: (params: {
    credits: number;
    amountE8s: number;
  }) => Promise<PaymentIntentOutcome>;
  grantAdCredits: (params: {
    verifier: string;
    proofId: string;
    credits: number;
  }) => Promise<AdCreditOutcome>;
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

function mapStaticProviderOption(option: (typeof icpProviderOptions)[number]): UiProviderOption {
  return {
    id: option.id,
    label: option.label,
    description: option.description,
    badge: option.badge,
    creditCost: option.creditCost,
    source: "static_catalog",
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

function mapStaticCreditOption(option: (typeof creditRecoveryOptions)[number]): UiCreditOption {
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
  const [paymentAccount, setPaymentAccount] = useState<PaymentAccount | null>(null);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [providerOptions, setProviderOptions] = useState<UiProviderOption[]>(
    icpProviderOptions.map(mapStaticProviderOption),
  );
  const [creditOptions, setCreditOptions] = useState<UiCreditOption[]>(
    creditRecoveryOptions.map(mapStaticCreditOption),
  );
  const [runtimeMode, setRuntimeMode] = useState<"icp" | "unavailable">(
    canUseIcpRuntime(initialRuntime) ? "icp" : "unavailable",
  );
  const [status, setStatus] = useState<MagickBoxIcpState["status"]>(
    canUseIcpRuntime(initialRuntime) ? "connecting" : "unavailable",
  );
  const [statusMessage, setStatusMessage] = useState(
    canUseIcpRuntime(initialRuntime)
      ? "Connecting to local ICP canisters"
      : "ICP runtime unavailable here. Open the local ICP asset canister to create real jobs.",
  );
  const [principalText, setPrincipalText] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<"internet_identity" | "local_browser" | null>(null);
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
        setRuntimeMode("unavailable");
        setStatus("unavailable");
        setStatusMessage("ICP runtime unavailable here. Open the local ICP asset canister to create real jobs.");
        return;
      }

      try {
        const anonymousActor = await createCoreActor();
        const [providers, credits, account] = await Promise.all([
          anonymousActor.get_provider_options(),
          anonymousActor.get_credit_options(),
          anonymousActor.get_payment_account(),
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
        setPaymentAccount(account);

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
          setAuthMethod("internet_identity");
          setStatus("authenticated");
          setStatusMessage("Internet Identity connected to local ICP");
          return;
        }

        if (hasActiveLocalBrowserIdentity()) {
          const identity = getOrCreateLocalBrowserIdentity();
          const localActor = await createCoreActor(identity);
          const nextProfile = await ensureProfile(localActor);
          const nextJobs = await localActor.list_my_jobs();

          if (cancelled) {
            return;
          }

          setActor(localActor);
          setProfile(nextProfile);
          setJobs(nextJobs);
          setPrincipalText(identity.getPrincipal().toText());
          setAuthMethod("local_browser");
          setStatus("authenticated");
          setStatusMessage("Local browser identity connected to ICP");
          return;
        }

        setStatus("anonymous");
        setStatusMessage("Local ICP canister detected; sign in to write account state");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setRuntimeMode("unavailable");
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
      setRuntimeMode("unavailable");
      setStatus("unavailable");
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
      const [providers, credits, account] = await Promise.all([
        authenticatedActor.get_provider_options(),
        authenticatedActor.get_credit_options(),
        authenticatedActor.get_payment_account(),
      ]);

      setRuntimeMode("icp");
      setAuthClient(nextAuthClient);
      setActor(authenticatedActor);
      setProfile(nextProfile);
      setJobs(nextJobs);
      setProviderOptions(providers.map(mapProviderOption));
      setCreditOptions(credits.map(mapCreditOption));
      setPaymentAccount(account);
      setPrincipalText(identity.getPrincipal().toText());
      setAuthMethod("internet_identity");
      clearLocalBrowserIdentityActive();
      setStatus("authenticated");
      setStatusMessage("Internet Identity connected to local ICP");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internet Identity sign-in failed";
      setStatus(message.includes("Signer window could not be opened") ? "anonymous" : "error");
      setStatusMessage(
        message.includes("Signer window could not be opened")
          ? "Signer popup was blocked here. Use local browser identity or open this URL in an external browser for Internet Identity."
          : message,
      );
    } finally {
      setIsBusy(false);
    }
  }, [authClient]);

  const signInWithLocalIdentity = useCallback(async () => {
    const runtime = resolveIcpRuntime();

    if (!canUseIcpRuntime(runtime)) {
      setRuntimeMode("unavailable");
      setStatus("unavailable");
      setStatusMessage("Open the local ICP asset canister to create a signed local browser identity");
      return;
    }

    setIsBusy(true);
    try {
      const identity = getOrCreateLocalBrowserIdentity();
      markLocalBrowserIdentityActive();
      const localActor = await createCoreActor(identity);
      const nextProfile = await ensureProfile(localActor);
      const nextJobs = await localActor.list_my_jobs();
      const [providers, credits, account] = await Promise.all([
        localActor.get_provider_options(),
        localActor.get_credit_options(),
        localActor.get_payment_account(),
      ]);

      setRuntimeMode("icp");
      setActor(localActor);
      setProfile(nextProfile);
      setJobs(nextJobs);
      setProviderOptions(providers.map(mapProviderOption));
      setCreditOptions(credits.map(mapCreditOption));
      setPaymentAccount(account);
      setPrincipalText(identity.getPrincipal().toText());
      setAuthMethod("local_browser");
      setStatus("authenticated");
      setStatusMessage("Local browser identity connected to ICP");
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Local browser identity failed");
    } finally {
      setIsBusy(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsBusy(true);
    try {
      await authClient?.signOut();
      clearLocalBrowserIdentityActive();
      const anonymousActor = canUseIcpRuntime(resolveIcpRuntime()) ? await createCoreActor() : null;

      setActor(anonymousActor);
      setProfile(null);
      setJobs([]);
      setPaymentAccount(null);
      setPrincipalText(null);
      setAuthMethod(null);
      setStatus(anonymousActor ? "anonymous" : "unavailable");
      setStatusMessage(
        anonymousActor
          ? "Local ICP canister detected; sign in to write account state"
          : "ICP runtime unavailable here. Open the local ICP asset canister to create real jobs.",
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
          message: "Open the local ICP asset canister to create a real ICP job",
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

  const createIcpPaymentIntent = useCallback(
    async ({
      credits,
      amountE8s,
    }: {
      credits: number;
      amountE8s: number;
    }): Promise<PaymentIntentOutcome> => {
      if (runtimeMode !== "icp" || !actor) {
        return {
          kind: "auth_required",
          message: "Open the local ICP asset canister to create a real payment intent",
        };
      }

      if (status !== "authenticated") {
        return {
          kind: "auth_required",
          message: "Sign in with Internet Identity or local browser identity to create a payment intent",
        };
      }

      setIsBusy(true);
      try {
        await ensureProfile(actor);
        const result = await actor.create_icp_payment_intent(BigInt(credits), BigInt(amountE8s));

        if ("err" in result) {
          return { kind: "err", message: result.err };
        }

        const account = await actor.get_payment_account();
        setPaymentAccount(account);
        return { kind: "ok", intent: result.ok };
      } catch (error) {
        return {
          kind: "err",
          message: error instanceof Error ? error.message : "ICP payment intent failed",
        };
      } finally {
        setIsBusy(false);
      }
    },
    [actor, runtimeMode, status],
  );

  const grantAdCredits = useCallback(
    async ({
      verifier,
      proofId,
      credits,
    }: {
      verifier: string;
      proofId: string;
      credits: number;
    }): Promise<AdCreditOutcome> => {
      if (runtimeMode !== "icp" || !actor) {
        return {
          kind: "auth_required",
          message: "Open the local ICP asset canister to claim ad verifier credits",
        };
      }

      if (status !== "authenticated") {
        return {
          kind: "auth_required",
          message: "Sign in with Internet Identity or local browser identity to claim ad credits",
        };
      }

      setIsBusy(true);
      try {
        await ensureProfile(actor);
        const result = await actor.grant_ad_credits(verifier, proofId, BigInt(credits));

        if ("err" in result) {
          return { kind: "err", message: result.err };
        }

        const [nextProfile, nextJobs] = await Promise.all([
          actor.get_my_profile(),
          actor.list_my_jobs(),
        ]);
        setProfile(firstOrNull(nextProfile));
        setJobs(nextJobs);

        return { kind: "ok", grant: result.ok };
      } catch (error) {
        return {
          kind: "err",
          message: error instanceof Error ? error.message : "Ad credit claim failed",
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
      paymentAccount,
      jobs,
      providerOptions,
      creditOptions,
      runtime: initialRuntime,
      runtimeMode,
      status,
      statusMessage,
      principalText,
      authMethod,
      isAuthenticated: status === "authenticated",
      isBusy,
      signIn,
      signInWithLocalIdentity,
      signOut,
      createGenerationJob,
      createIcpPaymentIntent,
      grantAdCredits,
      refreshAccount,
    }),
    [
      actor,
      authClient,
      profile,
      paymentAccount,
      jobs,
      providerOptions,
      creditOptions,
      initialRuntime,
      runtimeMode,
      status,
      statusMessage,
      principalText,
      authMethod,
      isBusy,
      signIn,
      signInWithLocalIdentity,
      signOut,
      createGenerationJob,
      createIcpPaymentIntent,
      grantAdCredits,
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
