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
  creditRecoveryOptions,
  demoCreditBalance,
  exploreItems,
  features,
  galleryItems,
  icpReadiness,
  icpProviderOptions,
  modes,
  plans,
  routeParity,
  type CreationMode,
} from "./data/content";
import "./App.css";

type CreditRecoveryState = {
  providerLabel: string;
  required: number;
  balance: number;
  prompt: string;
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

function Composer({
  mode,
  onModeChange,
  compact = false,
}: {
  mode: CreationMode;
  onModeChange: (mode: CreationMode) => void;
  compact?: boolean;
}) {
  const selected = modes.find((item) => item.id === mode) ?? modes[0];
  const [providerId, setProviderId] = useState("magick_ai_worker");
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<CreditRecoveryState | null>(null);
  const provider =
    icpProviderOptions.find((item) => item.id === providerId) ?? icpProviderOptions[0];

  const submit = () => {
    const value = prompt.trim() || selected.prompt;
    if (provider.creditCost > demoCreditBalance) {
      setRecovery({
        providerLabel: provider.label,
        required: provider.creditCost,
        balance: demoCreditBalance,
        prompt: value,
      });
      return;
    }
    setSubmitted(`${selected.label} queued locally: ${value}`);
    setPrompt("");
  };

  const chooseRecovery = (label: string) => {
    if (!recovery) {
      return;
    }
    setSubmitted(`${label} selected locally for: ${recovery.prompt}`);
    setRecovery(null);
    setPrompt("");
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
              {icpProviderOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="send-button" aria-label="Submit prompt" onClick={submit}>
            <Send size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="provider-summary">
          <span>{provider.badge}</span>
          <p>{provider.description}</p>
        </div>
      </div>
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
            {creditRecoveryOptions.map((option) => (
              <button key={option.id} type="button" onClick={() => chooseRecovery(option.label)}>
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
          <p>No subscription required in the prototype. Purchase actions are disabled and clearly marked.</p>
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
              <button type="button" disabled>
                Subscribe
              </button>
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
          <p>Same Magick Friend entry point, clearer state, keyboard-friendly controls, and local-only prototype behavior.</p>
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
            <p>Prototype state for private and public creation boards.</p>
          </div>
          <button type="button" className="primary-button">New collection</button>
        </div>
        <div className="empty-state">
          <LockKeyhole size={30} aria-hidden="true" />
          <h2>Personal boards stay private until published</h2>
          <p>Reference parity keeps the route, while the rewrite proposal makes privacy and publishing state explicit.</p>
        </div>
      </section>
    </AppShell>
  );
}

function SubscriptionsPage() {
  return (
    <AppShell>
      <section className="workspace-panel" aria-labelledby="subscriptions-title">
        <div className="workspace-header">
          <div>
            <h1 id="subscriptions-title">Subscriptions</h1>
            <p>Purchase-safe mock plan comparison. No billing provider is connected.</p>
          </div>
        </div>
        <div className="plan-grid in-app">
          {plans.map((plan) => (
            <article className="plan-card" key={plan.name}>
              <span>{plan.tag}</span>
              <h2>{plan.name}</h2>
              <strong>{plan.price}</strong>
              <p>{plan.keys}</p>
              <button type="button" disabled>Disabled in prototype</button>
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
            <dd>Visible tier and mode controls, mocked locally</dd>
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

  return (
    <main className="auth-page">
      <Logo />
      <section className="auth-card" aria-labelledby="signin-title">
        <h1 id="signin-title">Sign in</h1>
        <p>This is a non-production mock. It validates layout only and never sends credentials.</p>
        <label>
          Email
          <input type="email" placeholder="john.doe@gmail.com" autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Please enter your password" autoComplete="current-password" />
        </label>
        <button type="button" onClick={() => navigate("/home/explore?category=latest")}>
          Continue locally
        </button>
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
  );
}

export default App;
