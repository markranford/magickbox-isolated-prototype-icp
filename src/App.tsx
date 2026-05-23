import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Check,
  ChevronDown,
  Activity,
  CreditCard,
  Database,
  Gauge,
  LockKeyhole,
  LogIn,
  Menu,
  Paperclip,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
  WandSparkles,
  X,
} from "lucide-react";
import {
  appNav,
  architectureDecisions,
  demoCreditBalance,
  exploreItems,
  features,
  galleryItems,
  icpReadiness,
  modes,
  plans,
  routeParity,
  type CreationMode,
} from "./data/content";
import {
  MagickBoxIcpProvider,
  useMagickBoxIcp,
  type UiCreditOption,
} from "./icp/MagickBoxIcpContext";
import "./App.css";

const magickBoxV3BuildMarker = "magickboxv3-ii-authorize-20260523";

type CreditRecoveryState = {
  providerLabel: string;
  required: number;
  balance: number;
  prompt: string;
  options: UiCreditOption[];
};

function formatIcp(amountE8s: number) {
  return (amountE8s / 100_000_000).toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

function paymentPackageFor(optionId: string) {
  return optionId === "icp_subscription"
    ? { credits: 500, amountE8s: 500_000 }
    : { credits: 100, amountE8s: 100_000 };
}

type PaymentNoticeIntent = {
  id: bigint;
  payment_principal: { toText: () => string };
  payment_subaccount_hex: string;
};

function paymentIntentNotice(
  intent: PaymentNoticeIntent,
  credits: number,
  amountE8s: number,
  accountPrincipal?: string,
) {
  const principal = accountPrincipal ?? intent.payment_principal.toText();

  return `Payment intent #${Number(intent.id)} created for ${credits} credits. Transfer ${formatIcp(
    amountE8s,
  )} ICP to ${principal} with subaccount ${intent.payment_subaccount_hex}, then claim the intent from the local ICP payment smoke script.`;
}

function Logo() {
  return (
    <Link className="logo" to="/" aria-label="MagickBoxV3 home">
      <img src="/reference-assets/logo-icon.svg" alt="" width="32" height="32" />
      <img src="/reference-assets/logo-body-dark.svg" alt="MagickBoxV3" height="20" />
    </Link>
  );
}

function LandingHeader() {
  return (
    <header className="landing-header">
      <Logo />
      <nav className="landing-nav" aria-label="Landing sections">
        <a href="#features">Features</a>
        <a href="#gallery">Gallery</a>
        <a href="#pricing">Pricing</a>
        <a href="#about-us">About Us</a>
        <a href="#contact-us">Contact Us</a>
      </nav>
      <Link className="primary-button compact" to="/home/explore?category=latest">
        Launch Beta
      </Link>
    </header>
  );
}

function IcpStatusStrip({ compact = false }: { compact?: boolean }) {
  const icp = useMagickBoxIcp();
  const credits = icp.profile ? Number(icp.profile.credits) : demoCreditBalance;
  const recentJob = icp.jobs[0];
  const runtimeLabel = icp.runtimeMode === "icp" ? "ICP canister" : "ICP unavailable";

  return (
    <div className={compact ? "icp-status-strip compact" : "icp-status-strip"}>
      <div>
        <span>{runtimeLabel}</span>
        <strong>{icp.statusMessage}</strong>
        {icp.principalText ? <small>{icp.principalText}</small> : null}
        {icp.runtime.mediaCanisterId ? (
          <small>Media canister {icp.runtime.mediaCanisterId}</small>
        ) : null}
      </div>
      <div className="icp-status-actions">
        <span>{credits} credits</span>
        {recentJob ? <span>Latest job #{Number(recentJob.id)}</span> : null}
        {icp.runtimeMode === "icp" && icp.isAuthenticated ? (
          <button type="button" onClick={icp.signOut} disabled={icp.isBusy}>
            Sign out
          </button>
        ) : null}
        {icp.runtimeMode === "icp" && !icp.isAuthenticated ? (
          <>
            <button type="button" onClick={icp.signIn} disabled={icp.isBusy}>
              Sign in with Internet Identity
            </button>
            <button type="button" onClick={icp.signInWithLocalIdentity} disabled={icp.isBusy}>
              Use local browser identity
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function Composer({
  mode,
  onModeChange,
  compact = false,
}: {
  mode: CreationMode;
  onModeChange: (mode: CreationMode) => void;
  compact?: boolean;
}) {
  const icp = useMagickBoxIcp();
  const selected = modes.find((item) => item.id === mode) ?? modes[0];
  const [providerId, setProviderId] = useState("magick_ai_worker");
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<CreditRecoveryState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adProofCounter, setAdProofCounter] = useState(0);
  const providerOptions = icp.providerOptions;
  const provider =
    providerOptions.find((item) => item.id === providerId) ?? providerOptions[0];

  const submit = async () => {
    const value = prompt.trim() || selected.prompt;
    setSubmitted(null);

    if (icp.runtimeMode === "icp") {
      setIsSubmitting(true);
      const result = await icp.createGenerationJob({
        mode,
        providerId: provider.id,
        prompt: value,
        creditCost: provider.creditCost,
      });
      setIsSubmitting(false);

      if (result.kind === "auth_required") {
        setSubmitted(result.message);
        return;
      }

      if (result.kind === "insufficient_credits") {
        setRecovery({
          providerLabel: provider.label,
          required: result.required,
          balance: result.balance,
          prompt: value,
          options: result.options,
        });
        return;
      }

      if (result.kind === "err") {
        setSubmitted(result.message);
        return;
      }

      setSubmitted(
        `${selected.label} completed on ICP job #${Number(result.job.id)}: ${
          result.outputPreview ?? value
        }`,
      );
      setPrompt("");
      return;
    }

    setSubmitted("Open the local ICP asset canister to create a real ICP job");
  };

  const chooseRecovery = async (option: UiCreditOption) => {
    if (!recovery) {
      return;
    }
    if (["freellmapi", "own_api_key", "local_ollama"].includes(option.id)) {
      setProviderId(option.id);
      setSubmitted(`${option.label} selected. Submit again to create a zero-credit ICP job.`);
    } else if (option.id === "icp_topup" || option.id === "icp_subscription") {
      const paymentPackage = paymentPackageFor(option.id);
      const result = await icp.createIcpPaymentIntent(paymentPackage);

      if (result.kind === "ok") {
        setSubmitted(
          paymentIntentNotice(
            result.intent,
            paymentPackage.credits,
            paymentPackage.amountE8s,
            icp.paymentAccount?.owner.toText(),
          ),
        );
      } else {
        setSubmitted(result.message);
      }
    } else if (option.id === "watch_ad") {
      const nextProofCounter = adProofCounter + 1;
      setAdProofCounter(nextProofCounter);
      const proofId = `local-ad-proof-${nextProofCounter}-${recovery.required}`;
      const result = await icp.grantAdCredits({
        verifier: "local-ad-verifier",
        proofId,
        credits: 25,
      });

      if (result.kind === "ok") {
        setSubmitted(`Ad verifier grant #${Number(result.grant.id)} added 25 credits on ICP.`);
      } else {
        setSubmitted(result.message);
      }
    } else {
      setSubmitted(`${option.label} stays external; choose its provider route and submit a zero-credit ICP job.`);
    }
    setRecovery(null);
  };

  return (
    <div className={compact ? "composer composer-compact" : "composer"}>
      <div className="mode-tabs" role="tablist" aria-label="Creation mode">
        {modes.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              className={mode === item.id ? "mode-tab is-active" : "mode-tab"}
              onClick={() => onModeChange(item.id)}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="prompt-box">
        <label className="sr-only" htmlFor={compact ? "chat-prompt" : "hero-prompt"}>
          Ask Magick Friend
        </label>
        <textarea
          id={compact ? "chat-prompt" : "hero-prompt"}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask Magick Friend..."
          rows={compact ? 3 : 2}
        />
        <div className="prompt-toolbar">
          <div className="tool-group" aria-label="Prompt tools">
            <button type="button" className="icon-button" aria-label="Attach a file">
              <Paperclip size={18} aria-hidden="true" />
            </button>
            <button type="button" className="icon-button" aria-label="Enhance prompt">
              <WandSparkles size={18} aria-hidden="true" />
            </button>
          </div>
          <button type="button" className="model-button" aria-label="Selected model tier">
            Essential <ChevronDown size={16} aria-hidden="true" />
          </button>
          <label className="provider-select">
            <span className="sr-only">AI provider route</span>
            <select
              aria-label="AI provider route"
              value={providerId}
              onChange={(event) => setProviderId(event.target.value)}
            >
              {providerOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="send-button"
            aria-label="Submit prompt"
            onClick={submit}
            disabled={isSubmitting || icp.isBusy}
          >
            <Send size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="provider-summary">
          <span>{provider.badge}</span>
          <p>{provider.description}</p>
        </div>
      </div>
      <IcpStatusStrip compact={compact} />
      {recovery ? (
        <section
          className="credit-recovery"
          role="dialog"
          aria-modal="false"
          aria-labelledby={compact ? "chat-credit-title" : "hero-credit-title"}
        >
          <div className="credit-recovery-header">
            <div>
              <h2 id={compact ? "chat-credit-title" : "hero-credit-title"}>Choose how to continue</h2>
              <p>
                {recovery.providerLabel} needs {recovery.required} credits. Your ICP demo wallet has{" "}
                {recovery.balance}.
              </p>
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label="Close credit recovery options"
              onClick={() => setRecovery(null)}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="credit-recovery-grid">
            {recovery.options.map((option) => (
              <button key={option.id} type="button" onClick={() => void chooseRecovery(option)}>
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
      {submitted ? (
        <p className="local-status" role="status">
          {submitted}
        </p>
      ) : null}
    </div>
  );
}

function LandingPage() {
  const [mode, setMode] = useState<CreationMode>("image");

  return (
    <main className="landing-page">
      <LandingHeader />
      <section className="hero-section" aria-labelledby="hero-title">
        <img className="hero-bg" src="/reference-assets/hero-bg.jpg" alt="" />
        <div className="hero-fade" />
        <div className="hero-content">
          <h1 id="hero-title">Create Anything with AI - Faster Than Ever</h1>
          <p>One platform for images, text, and more. Turn ideas into results in seconds.</p>
          <Composer mode={mode} onModeChange={setMode} />
        </div>
      </section>

      <section className="section section-tight" id="features" aria-labelledby="features-title">
        <div className="section-heading">
          <h2 id="features-title">Create with AI - Faster Than Ever</h2>
          <p>Turn ideas into images, text, video, music, and collections with clearer controls.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article className={`feature-card tone-${feature.tone}`} key={feature.id}>
                <div className="feature-icon">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <ul>
                  {feature.bullets.map((item) => (
                    <li key={item}>
                      <Check size={15} aria-hidden="true" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="model-row">
                  {feature.models.map((model) => (
                    <span key={model}>{model}</span>
                  ))}
                  <span>And more</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="gallery-section" id="gallery" aria-labelledby="gallery-title">
        <div className="section-heading">
          <h2 id="gallery-title">Gallery</h2>
          <p>A calmer, faster replacement for the heavy 3D dome: still visual, easier to scan, safer to render.</p>
        </div>
        <div className="gallery-rail" aria-label="Example creation gallery" tabIndex={0}>
          {galleryItems.map((item, index) => (
            <figure className={`gallery-tile tile-${index % 4}`} key={item.title}>
              <img className="media-swatch" src={item.image} alt="" loading="lazy" />
              <figcaption>{item.title}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section" id="pricing" aria-labelledby="pricing-title">
        <div className="section-heading">
          <h2 id="pricing-title">Get More AI Power</h2>
          <p>Credit packages route through the ICP-first account model before any payment provider is attached.</p>
        </div>
        <div className="plan-grid">
          {plans.map((plan) => (
            <article className="plan-card" key={plan.name}>
              <span>{plan.tag}</span>
              <h3>{plan.name} Plan</h3>
              <strong>{plan.price}</strong>
              <p>{plan.keys}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} aria-hidden="true" /> {feature}
                  </li>
                ))}
              </ul>
              <Link to="/home/subscriptions">View credit paths</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section about-section" id="about-us" aria-labelledby="about-title">
        <div>
          <h2 id="about-title">Built by Humans. Powered by AI.</h2>
          <p>
            The prototype keeps the public story but makes the product promise more concrete:
            faster creation, clearer queues, stronger accessibility, and safer deployment boundaries.
          </p>
        </div>
        <ul className="decision-list">
          {architectureDecisions.map((decision) => (
            <li key={decision}>{decision}</li>
          ))}
        </ul>
      </section>

      <section className="section contact-section" id="contact-us" aria-labelledby="contact-title">
        <div className="section-heading">
          <h2 id="contact-title">Contact Us</h2>
          <p>This local form proves layout and validation only. It does not submit anywhere.</p>
        </div>
        <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Name
            <input type="text" placeholder="John Doe" autoComplete="name" />
          </label>
          <label>
            Email
            <input type="email" placeholder="john.doe@gmail.com" autoComplete="email" />
          </label>
          <label>
            Message
            <textarea placeholder="Anything you want to say ..." rows={4} />
          </label>
          <button type="submit">Submit</button>
        </form>
      </section>
    </main>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const icp = useMagickBoxIcp();

  return (
    <div className="app-shell">
      <button className="mobile-menu" type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
        <Menu size={21} aria-hidden="true" />
      </button>
      <aside className={mobileOpen ? "sidebar is-open" : "sidebar"}>
        <div className="sidebar-top">
          <Logo />
          <button className="icon-button mobile-close" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Product navigation">
          {appNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => (isActive ? "app-nav-link is-active" : "app-nav-link")}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        {icp.isAuthenticated ? (
          <button
            className="signin-link sidebar-action"
            type="button"
            onClick={() => {
              setMobileOpen(false);
              void icp.signOut();
            }}
          >
            <LogIn size={18} aria-hidden="true" />
            Sign out
          </button>
        ) : (
          <Link className="signin-link" to="/auth/sign-in" onClick={() => setMobileOpen(false)}>
            <LogIn size={18} aria-hidden="true" />
            Sign in
          </Link>
        )}
      </aside>
      <div className="app-content">{children}</div>
    </div>
  );
}

function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") ?? "latest";

  return (
    <AppShell>
      <section className="workspace-panel" aria-labelledby="explore-title">
        <div className="workspace-header">
          <div>
            <h1 id="explore-title">Explore</h1>
            <p>Discover, save, and remix community creations without leaving the app shell.</p>
          </div>
          <div className="segmented-control" role="tablist" aria-label="Explore category">
            {["latest", "trending"].map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className={category === item ? "is-active" : ""}
                onClick={() => setParams({ category: item })}
              >
                {item === "latest" ? "Latest" : "Trending"}
              </button>
            ))}
          </div>
        </div>
        <div className="explore-grid">
          {exploreItems.map((item) => (
            <article className={`explore-card tone-${item.color}`} key={item.title}>
              <img className="explore-media" src={item.image} alt="" loading="lazy" />
              <div>
                <span>{item.type}</span>
                <h2>{item.title}</h2>
                <p>
                  by {item.author} - {item.stat}
                </p>
              </div>
              <button type="button">Remix</button>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function ChatPage() {
  const [mode, setMode] = useState<CreationMode>("image");
  const suggestions = useMemo(
    () => [
      "Create a poster from my reference image",
      "Turn this product note into a launch video",
      "Write lyrics for a 30 second brand theme",
    ],
    [],
  );

  return (
    <AppShell>
      <section className="chat-surface" aria-labelledby="chat-title">
        <div className="chat-welcome">
          <Sparkles size={30} aria-hidden="true" />
          <h1 id="chat-title">What are we creating today?</h1>
          <p>Same Magick Friend entry point with ICP-backed account, credit, provider, and job state.</p>
        </div>
        <div className="suggestion-list">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button">
              {suggestion}
            </button>
          ))}
        </div>
        <Composer mode={mode} onModeChange={setMode} compact />
      </section>
    </AppShell>
  );
}

function CollectionsPage() {
  return (
    <AppShell>
      <section className="workspace-panel" aria-labelledby="collections-title">
        <div className="workspace-header">
          <div>
            <h1 id="collections-title">Collections</h1>
            <p>ICP-backed state for private and public creation boards.</p>
          </div>
          <button type="button" className="primary-button">New collection</button>
        </div>
        <div className="empty-state">
          <LockKeyhole size={30} aria-hidden="true" />
          <h2>Personal boards stay private until published</h2>
          <p>Privacy and publishing state are explicit before anything is shared.</p>
        </div>
      </section>
    </AppShell>
  );
}

function SubscriptionsPage() {
  const icp = useMagickBoxIcp();
  const [notice, setNotice] = useState("ICP credit paths are loaded from the core canister when served by ICP assets.");
  const [adProofCounter, setAdProofCounter] = useState(0);

  const selectPath = async (option: UiCreditOption) => {
    if (option.id === "icp_topup" || option.id === "icp_subscription") {
      const paymentPackage = paymentPackageFor(option.id);
      const result = await icp.createIcpPaymentIntent(paymentPackage);

      if (result.kind === "ok") {
        setNotice(
          paymentIntentNotice(
            result.intent,
            paymentPackage.credits,
            paymentPackage.amountE8s,
            icp.paymentAccount?.owner.toText(),
          ),
        );
      } else {
        setNotice(result.message);
      }
      return;
    }

    if (option.id === "watch_ad") {
      const nextProofCounter = adProofCounter + 1;
      setAdProofCounter(nextProofCounter);
      const result = await icp.grantAdCredits({
        verifier: "local-ad-verifier",
        proofId: `subscription-ad-proof-${nextProofCounter}`,
        credits: 25,
      });
      setNotice(
        result.kind === "ok"
          ? `Ad verifier grant #${Number(result.grant.id)} added 25 credits on ICP.`
          : result.message,
      );
      return;
    }

    setNotice(`${option.label} is available through the provider selector in Create.`);
  };

  return (
    <AppShell>
      <section className="workspace-panel" aria-labelledby="subscriptions-title">
        <div className="workspace-header">
          <div>
            <h1 id="subscriptions-title">Subscriptions</h1>
            <p>{notice}</p>
          </div>
        </div>
        <div className="plan-grid in-app">
          {icp.creditOptions.map((option) => (
            <article className="plan-card" key={option.id}>
              <span>{option.onIcp ? "ICP-native" : "External adapter"}</span>
              <h2>{option.label}</h2>
              <p>{option.description}</p>
              <button
                type="button"
                onClick={() => void selectPath(option)}
              >
                Select path
              </button>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

const fallbackAdminActions = [
  {
    id: "fund_main_wallet",
    title: "Create system funding wallet",
    description: "Create a dedicated ICP subaccount from the superadmin dashboard, then fund and verify it.",
    status: "needs ICP canister",
  },
  {
    id: "manage_credits",
    title: "Payment and credit controls",
    description: "Review intents, claims, subscriptions, ad grants, and user credit liability.",
    status: "superadmin",
  },
  {
    id: "manage_workers",
    title: "Worker and AI routes",
    description: "Control MagickAI, FreeLLMAPI, own-provider, local LLM, and paid worker boundaries.",
    status: "superadmin",
  },
  {
    id: "media_storage",
    title: "ICP media storage",
    description: "Inspect media manifests, chunked assets, owners, hashes, quotas, and lifecycle state.",
    status: "superadmin",
  },
  {
    id: "safety",
    title: "Deployment safety",
    description: "Track controllers, cycles, mainnet readiness, backups, and production isolation.",
    status: "superadmin",
  },
  {
    id: "audit",
    title: "Audit and operations",
    description: "Review admin audit events, user support signals, moderation queues, and health checks.",
    status: "superadmin",
  },
];

const lockedAdminActions = [
  {
    id: "identity_required",
    title: "Owner access locked",
    description: "Sign in with the authorized Internet Identity principal before owner-only management is available.",
    status: "read-only",
  },
  {
    id: "authority_boundary",
    title: "ICP authority protected",
    description: "Wallet, payment, worker, media, and audit controls stay hidden until the canister verifies superadmin status.",
    status: "read-only",
  },
];

const adminRoadmapControls = [
  ["Users and roles", "Invite admins, suspend accounts, inspect user credits, and handle support recovery."],
  ["Payments", "Claim ICP payments, reconcile ICRC transfers, configure subscriptions, and export payment evidence."],
  ["AI providers", "Enable workers, set cost policies, monitor queue failures, and route local or external inference."],
  ["Media and storage", "Manage quotas, delete policies, public visibility, asset verification, and lifecycle rules."],
  ["Safety", "Review audit events, canister controllers, cycle thresholds, upgrade readiness, and incident locks."],
  ["Growth", "Track ad verifier partners, referral credits, creator publishing, featured gallery, and content review."],
];

function AdminPage() {
  const icp = useMagickBoxIcp();
  const [setupCode, setSetupCode] = useState("");
  const [notice, setNotice] = useState("Bind your Internet Identity principal before mainnet funding.");
  const dashboard = icp.adminDashboard;
  const status = icp.superAdminStatus;
  const fundingWallet = dashboard?.wallet.funding_wallet[0] ?? null;
  const systemAccount = fundingWallet?.account ?? dashboard?.wallet.account ?? icp.paymentAccount;
  const principal = icp.principalText ?? status?.caller.toText() ?? "Sign in with Internet Identity";
  const isSuperadmin = Boolean(status?.is_superadmin);
  const bootstrapAvailable = Boolean(status?.bootstrap_available);
  const actions = isSuperadmin ? dashboard?.actions ?? fallbackAdminActions : lockedAdminActions;
  const stats = [
    { label: "Profiles", value: dashboard ? Number(dashboard.profile_count) : 0 },
    { label: "Jobs", value: dashboard ? Number(dashboard.job_count) : 0 },
    { label: "Pending payments", value: dashboard ? Number(dashboard.pending_payment_count) : 0 },
    { label: "Claimed payments", value: dashboard ? Number(dashboard.claimed_payment_count) : 0 },
    { label: "Media manifests", value: dashboard ? Number(dashboard.media_manifest_count) : 0 },
    { label: "Worker runs", value: dashboard ? Number(dashboard.worker_run_count) : 0 },
    { label: "Ad grants", value: dashboard ? Number(dashboard.ad_credit_grant_count) : 0 },
    { label: "User credits", value: dashboard ? Number(dashboard.total_user_credits) : 0 },
  ];

  const claimSuperadmin = async () => {
    const result = await icp.bootstrapSuperadmin(setupCode);
    setNotice(result.message);
    if (result.kind === "ok") {
      setSetupCode("");
    }
  };

  const refresh = async () => {
    await Promise.all([icp.refreshAccount(), icp.refreshAdmin()]);
    setNotice("Management dashboard refreshed from ICP.");
  };

  const createFundingWallet = async () => {
    const result = await icp.createSystemFundingWallet();
    setNotice(result.message);
  };

  return (
    <AppShell>
      <section className="workspace-panel admin-dashboard" aria-labelledby="admin-title">
        <div className="workspace-header">
          <div>
            <h1 id="admin-title">Superadmin</h1>
            <p>{notice}</p>
          </div>
          <div className="admin-header-actions">
            {icp.isAuthenticated ? (
              <button type="button" onClick={refresh} disabled={icp.isBusy}>
                Refresh
              </button>
            ) : (
              <>
                <button type="button" onClick={icp.signIn} disabled={icp.isBusy}>
                  Sign in with Internet Identity
                </button>
                <button type="button" onClick={icp.signInWithLocalIdentity} disabled={icp.isBusy}>
                  Use local browser identity
                </button>
              </>
            )}
          </div>
        </div>

        <div className="admin-grid">
          <section className="admin-panel" aria-labelledby="admin-identity-title">
            <div className="admin-panel-title">
              <ShieldCheck size={20} aria-hidden="true" />
              <h2 id="admin-identity-title">Internet Identity principal</h2>
            </div>
            <p className="principal-line">{principal}</p>
            <dl className="admin-detail-list">
              <div>
                <dt>Role</dt>
                <dd>{isSuperadmin ? "Superadmin" : "Not bound yet"}</dd>
              </div>
              <div>
                <dt>Bootstrap</dt>
                <dd>{bootstrapAvailable ? "Available" : "Closed"}</dd>
              </div>
              <div>
                <dt>Admins</dt>
                <dd>{status ? Number(status.superadmin_count) : 0}</dd>
              </div>
            </dl>
            {!isSuperadmin && icp.isAuthenticated && bootstrapAvailable ? (
              <div className="admin-claim">
                <label>
                  Bootstrap code
                  <input
                    type="password"
                    value={setupCode}
                    onChange={(event) => setSetupCode(event.target.value)}
                    placeholder="Enter setup code"
                  />
                </label>
                <button type="button" onClick={claimSuperadmin} disabled={icp.isBusy}>
                  Claim superadmin
                </button>
              </div>
            ) : null}
          </section>

          <section className="admin-panel" aria-labelledby="system-wallet-title">
            <div className="admin-panel-title">
              <Wallet size={20} aria-hidden="true" />
              <h2 id="system-wallet-title">System Wallet</h2>
            </div>
            <dl className="admin-detail-list">
              <div>
                <dt>Owner</dt>
                <dd>
                  {isSuperadmin
                    ? fundingWallet
                      ? systemAccount?.owner.toText()
                      : "Available after owner setup"
                    : "Hidden until owner sign-in"}
                </dd>
              </div>
              <div>
                <dt>Subaccount</dt>
                <dd>{isSuperadmin ? fundingWallet?.subaccount_hex ?? "Not created yet" : "Hidden"}</dd>
              </div>
              <div>
                <dt>Balance</dt>
                <dd>
                  {isSuperadmin
                    ? fundingWallet
                      ? `${formatIcp(Number(fundingWallet.balance_e8s))} ICP`
                      : "Create the owner wallet, then refresh"
                    : "Hidden"}
                </dd>
              </div>
            </dl>
            <div className="funding-process">
              {isSuperadmin ? (
                <>
                  <h3>Create system funding wallet</h3>
                  <button
                    type="button"
                    onClick={createFundingWallet}
                    disabled={icp.isBusy || Boolean(fundingWallet)}
                  >
                    {fundingWallet ? "Funding wallet created" : "Create funding wallet"}
                  </button>
                  <ol>
                    <li>Create the dedicated system funding wallet.</li>
                    <li>Transfer ICP to the owner and subaccount displayed above.</li>
                    <li>Refresh this dashboard to verify the ledger balance.</li>
                    <li>Use the funded controller identity to convert ICP to cycles and top up canisters.</li>
                    <li>Keep user credit purchases on per-intent subaccounts.</li>
                  </ol>
                  <p className="admin-note">
                    {dashboard?.wallet.funding_instructions ??
                      "The funding target appears only after a superadmin creates it on ICP."}
                  </p>
                </>
              ) : (
                <>
                  <h3>Owner controls locked</h3>
                  <p className="admin-note">
                    Sign in with the authorized owner principal to reveal wallet details,
                    ledger checks, provider controls, and funding operations.
                  </p>
                </>
              )}
            </div>
          </section>
        </div>

        {isSuperadmin ? (
          <section className="admin-section" aria-labelledby="admin-stats-title">
            <div className="admin-section-title">
              <Activity size={20} aria-hidden="true" />
              <h2 id="admin-stats-title">Management Snapshot</h2>
            </div>
            <div className="admin-stat-grid">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="admin-section" aria-labelledby="admin-functions-title">
          <div className="admin-section-title">
            <Gauge size={20} aria-hidden="true" />
            <h2 id="admin-functions-title">Management Functions</h2>
          </div>
          <div className="admin-action-grid">
            {actions.map((action) => (
              <article key={action.id}>
                <span>{action.status}</span>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </article>
            ))}
          </div>
        </section>

        {isSuperadmin ? (
          <section className="admin-section" aria-labelledby="admin-control-title">
            <div className="admin-section-title">
              <CreditCard size={20} aria-hidden="true" />
              <h2 id="admin-control-title">Controls To Add Next</h2>
            </div>
            <div className="admin-action-grid">
              {adminRoadmapControls.map(([title, description]) => (
                <article key={title}>
                  <span>roadmap</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="admin-section" aria-labelledby="admin-storage-title">
          <div className="admin-section-title">
            <Database size={20} aria-hidden="true" />
            <h2 id="admin-storage-title">ICP Authority Boundary</h2>
          </div>
          <p className="admin-note">
            Superadmin role, profile state, credits, payment intents, worker receipts, audit events,
            and media manifests belong on ICP. Provider secrets and heavy inference stay outside
            canister state behind explicit worker boundaries.
          </p>
        </section>
      </section>
    </AppShell>
  );
}

function SettingsPage() {
  return (
    <AppShell>
      <section className="workspace-panel" aria-labelledby="settings-title">
        <div className="workspace-header">
          <div>
            <h1 id="settings-title">Settings</h1>
            <p>Demonstrates a dense, scannable operational surface without production account reads.</p>
          </div>
        </div>
        <dl className="settings-list">
          <div>
            <dt>Theme</dt>
            <dd>System-aware dark mode with accessible focus states</dd>
          </div>
          <div>
            <dt>Model routing</dt>
            <dd>Visible tier and mode controls backed by provider options from `magickbox_core` on ICP</dd>
          </div>
          <div>
            <dt>Deployment safety</dt>
            <dd>No production secrets, analytics, auth, billing, or database configuration</dd>
          </div>
        </dl>
      </section>
    </AppShell>
  );
}

function SignInPage() {
  const navigate = useNavigate();
  const icp = useMagickBoxIcp();

  const continueAfter = async (action: () => Promise<void>) => {
    await action();
    navigate("/home/explore?category=latest");
  };

  return (
    <main className="auth-page">
      <Logo />
      <section className="auth-card" aria-labelledby="signin-title">
        <h1 id="signin-title">Sign in</h1>
        <p>{icp.statusMessage}</p>
        <div className="auth-actions">
          <button type="button" onClick={() => continueAfter(icp.signIn)} disabled={icp.isBusy}>
            Sign in with Internet Identity
          </button>
          <button type="button" onClick={() => continueAfter(icp.signInWithLocalIdentity)} disabled={icp.isBusy}>
            Use local browser identity
          </button>
        </div>
      </section>
    </main>
  );
}

function EvaluationPage() {
  return (
    <main className="eval-page">
      <Logo />
      <section className="workspace-panel" aria-labelledby="eval-title">
        <div className="workspace-header">
          <div>
            <h1 id="eval-title">MagickBoxV3 Evaluation</h1>
            <p>Route parity and architecture decisions are embedded in the prototype for reviewer traceability.</p>
          </div>
          <Link className="primary-button" to="/">Back to prototype</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Reference</th>
              <th>Prototype</th>
            </tr>
          </thead>
          <tbody>
            {routeParity.map((row) => (
              <tr key={row.route}>
                <td>{row.route}</td>
                <td>{row.reference}</td>
                <td>{row.prototype}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="eval-subsection">
          <h2>ICP Readiness</h2>
          <div className="icp-grid">
            {icpReadiness.map((item) => (
              <article className="icp-card" key={item.area}>
                <h3>{item.area}</h3>
                <p>{item.recommendation}</p>
                <span>{item.prototype}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <MagickBoxIcpProvider>
      <div data-app="MagickBoxV3" data-build={magickBoxV3BuildMarker}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home/explore" element={<ExplorePage />} />
            <Route path="/home/magick-chat" element={<ChatPage />} />
            <Route path="/home/magick-chat/c" element={<ChatPage />} />
            <Route path="/home/magick-chat/c/:id" element={<ChatPage />} />
            <Route path="/home/collections" element={<CollectionsPage />} />
            <Route path="/home/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/home/admin" element={<AdminPage />} />
            <Route path="/home/settings" element={<SettingsPage />} />
            <Route path="/auth/sign-in" element={<SignInPage />} />
            <Route path="/evaluation" element={<EvaluationPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </MagickBoxIcpProvider>
  );
}

export default App;
