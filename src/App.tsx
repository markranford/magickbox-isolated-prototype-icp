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
  LockKeyhole,
  LogIn,
  Menu,
  Paperclip,
  Send,
  Sparkles,
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

type CreditRecoveryState = {
  providerLabel: string;
  required: number;
  balance: number;
  prompt: string;
  options: UiCreditOption[];
};

function Logo() {
  return (
    <Link className="logo" to="/" aria-label="Magick Box home">
      <img src="/reference-assets/logo-icon.svg" alt="" width="32" height="32" />
      <img src="/reference-assets/logo-body-dark.svg" alt="MagickBox" height="20" />
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

      setSubmitted(`${selected.label} queued on ICP job #${Number(result.job.id)}: ${value}`);
      setPrompt("");
      return;
    }

    setSubmitted("Open the local ICP asset canister to create a real ICP job");
  };

  const chooseRecovery = (option: UiCreditOption) => {
    if (!recovery) {
      return;
    }
    if (["freellmapi", "own_api_key", "local_ollama"].includes(option.id)) {
      setProviderId(option.id);
      setSubmitted(`${option.label} selected. Submit again to create a zero-credit ICP job.`);
    } else {
      setSubmitted(`${option.label} requires the ICP payment/ad verifier canister in the next slice.`);
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
              <button key={option.id} type="button" onClick={() => chooseRecovery(option)}>
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
            <figure className={`gallery-tile tile-${index % 4}`} key={item}>
              <div className="media-swatch" />
              <figcaption>{item}</figcaption>
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
        <Link className="signin-link" to="/auth/sign-in" onClick={() => setMobileOpen(false)}>
          <LogIn size={18} aria-hidden="true" />
          Sign in
        </Link>
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
              <div className="explore-media" />
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
                onClick={() => {
                  setNotice(
                    option.requiresPayment
                      ? `${option.label} needs the ICP/ICRC payment canister deployment next.`
                      : `${option.label} is available through the provider selector in Create.`,
                  );
                }}
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
            <h1 id="eval-title">Rewrite Readiness Evaluation</h1>
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home/explore" element={<ExplorePage />} />
          <Route path="/home/magick-chat" element={<ChatPage />} />
          <Route path="/home/magick-chat/c" element={<ChatPage />} />
          <Route path="/home/magick-chat/c/:id" element={<ChatPage />} />
          <Route path="/home/collections" element={<CollectionsPage />} />
          <Route path="/home/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/home/settings" element={<SettingsPage />} />
          <Route path="/auth/sign-in" element={<SignInPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </MagickBoxIcpProvider>
  );
}

export default App;
