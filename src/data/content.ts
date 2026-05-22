import {
  Bot,
  Box,
  Clapperboard,
  Compass,
  GalleryVerticalEnd,
  Image as ImageIcon,
  Library,
  Music,
  Settings,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CreationMode = "image" | "video" | "music";

export const demoCreditBalance = 25;

export type Feature = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  models: string[];
  tone: "blue" | "ember" | "gold" | "violet" | "green" | "rose" | "cyan";
};

export const modes: Array<{
  id: CreationMode;
  label: string;
  icon: LucideIcon;
  prompt: string;
}> = [
  {
    id: "image",
    label: "Image Creation",
    icon: ImageIcon,
    prompt: "A cinematic product photo of a crystal AI studio",
  },
  {
    id: "video",
    label: "Video Creation",
    icon: Clapperboard,
    prompt: "A 9:16 launch trailer with light trails and creator tools",
  },
  {
    id: "music",
    label: "Music Creation",
    icon: Music,
    prompt: "Bright electronic theme for a creator workspace",
  },
];

export const features: Feature[] = [
  {
    id: "chat",
    icon: Bot,
    title: "Chat with Magick Friend",
    description: "Reasoning, live answers, and web search in one creative chat.",
    bullets: [
      "Step-by-step AI reasoning",
      "Live web search support",
      "Context-aware sessions",
      "Prompt enhancement built in",
    ],
    models: ["GPT 5.4 Pro", "Gemini 3.1 Pro", "Claude 4.7"],
    tone: "blue",
  },
  {
    id: "video",
    icon: Clapperboard,
    title: "Generate Video",
    description: "Create short-form videos with clear model and queue state.",
    bullets: [
      "Ideas to videos, fast",
      "No editing skills needed",
      "Multiple advanced models",
      "Download-ready outputs",
    ],
    models: ["Google Veo 3.1", "Sora 2 Pro", "Kling AI V3"],
    tone: "ember",
  },
  {
    id: "images",
    icon: ImageIcon,
    title: "Generate Images",
    description: "Turn prompts into polished images with visible presets.",
    bullets: [
      "Fast image generation",
      "Preset ratios and styles",
      "Model transparency",
      "Save to collections",
    ],
    models: ["GPT Image 1.5", "Gemini 3 Pro Image", "Grok Imagine 2"],
    tone: "gold",
  },
  {
    id: "music",
    icon: Music,
    title: "Generate Music",
    description: "Create audio from simple briefs with lyrics and genre controls.",
    bullets: [
      "With or without lyrics",
      "High-quality audio",
      "Multiple genres",
      "Production-ready files",
    ],
    models: ["Suno 4", "Suno 4.5"],
    tone: "violet",
  },
  {
    id: "explore",
    icon: Compass,
    title: "Explore",
    description: "A live feed of AI creations for discovery and remixing.",
    bullets: [
      "Browse images, videos, and music",
      "Fresh picks updated daily",
      "Publish selected creations",
      "Like, remix, and follow creators",
    ],
    models: ["Images", "Videos", "Music"],
    tone: "green",
  },
  {
    id: "quests",
    icon: Zap,
    title: "Gamification Hub",
    description: "Daily quests, streaks, levels, and Magick Key rewards.",
    bullets: [
      "Daily creative quests",
      "XP, levels, and streaks",
      "Reward claims",
      "Badge progress",
    ],
    models: ["Private", "Public"],
    tone: "cyan",
  },
  {
    id: "collections",
    icon: Library,
    title: "Collections",
    description: "Curate AI creations and control what becomes public.",
    bullets: [
      "Save media to collections",
      "Custom names and covers",
      "Mixed media boards",
      "Privacy controls",
    ],
    models: ["Private", "Public"],
    tone: "rose",
  },
  {
    id: "personas",
    icon: Users,
    title: "Chat with AI Personas",
    description: "Work with distinct AI perspectives without losing context.",
    bullets: [
      "Multiple personas",
      "Context-aware conversation",
      "Engaging interactions",
      "Customizable experience",
    ],
    models: ["Mentor", "Producer", "Researcher"],
    tone: "blue",
  },
];

export const plans = [
  {
    name: "Essential",
    price: "$4",
    keys: "3M Magick Keys",
    tag: "Top-up",
    features: ["Magick Friend", "Deep Thinking", "Web Search", "Image Generation"],
  },
  {
    name: "Pro",
    price: "$8",
    keys: "6.5M Magick Keys",
    tag: "Best price",
    features: ["Advanced Image", "Video Generation", "Music Generation", "Claude Sonnet"],
  },
  {
    name: "Ultimate",
    price: "$16",
    keys: "15M Magick Keys",
    tag: "Highest value",
    features: ["Priority queues", "More model access", "Creator publishing", "Team-ready limits"],
  },
];

export const galleryItems = [
  "Neon product render",
  "Music cover concept",
  "Fashion film still",
  "Mythic landscape",
  "Recipe explainer",
  "Creator profile shot",
  "Podcast cover",
  "Social promo",
];

export const icpProviderOptions = [
  {
    id: "magick_ai_worker",
    label: "MagickAI worker",
    description: "Rich Magick Friend media generation through a worker boundary, with job state anchored on ICP.",
    badge: "ICP job record",
    creditCost: 20,
  },
  {
    id: "freellmapi",
    label: "FreeLLMAPI",
    description: "OpenAI-compatible free-provider fallback for chat-style requests.",
    badge: "No Magick credits",
    creditCost: 0,
  },
  {
    id: "own_api_key",
    label: "Own AI subscription",
    description: "Use a provider subscription you already pay for, without storing raw keys on ICP.",
    badge: "User-owned",
    creditCost: 0,
  },
  {
    id: "local_ollama",
    label: "Local Ollama",
    description: "Connect a local model such as Qwen, Gemma, GLM, or another Ollama model.",
    badge: "Local AI",
    creditCost: 0,
  },
  {
    id: "paid_managed",
    label: "Paid managed provider",
    description: "Premium Magick Box provider route using ICP-owned credits and external generation workers.",
    badge: "80 credits",
    creditCost: 80,
  },
];

export const creditRecoveryOptions = [
  {
    id: "icp_topup",
    label: "Top up with ICP",
    description: "Buy Magick credits with ICP or an ICRC-compatible payment flow.",
  },
  {
    id: "icp_subscription",
    label: "Subscribe with ICP",
    description: "Start an ICP-native plan for recurring creation credits.",
  },
  {
    id: "watch_ad",
    label: "Watch an advert",
    description: "Earn credits after a trusted ad verifier grants a canister credit event.",
  },
  {
    id: "freellmapi",
    label: "Use FreeLLMAPI",
    description: "Switch this request to a free OpenAI-compatible fallback route.",
  },
  {
    id: "own_api_key",
    label: "Connect own AI subscription",
    description: "Use your own provider account without storing raw keys on ICP.",
  },
  {
    id: "local_ollama",
    label: "Connect local Ollama",
    description: "Run eligible requests through a local LLM such as Qwen or Gemma.",
  },
];

export const exploreItems = [
  {
    title: "Crystal arcade city",
    type: "Image",
    author: "Maya",
    stat: "1.8K remixes",
    color: "blue",
  },
  {
    title: "Launch trailer loop",
    type: "Video",
    author: "Noah",
    stat: "642 saves",
    color: "ember",
  },
  {
    title: "Midnight synth hook",
    type: "Music",
    author: "Ari",
    stat: "4.2K plays",
    color: "violet",
  },
  {
    title: "AI ritual workspace",
    type: "Collection",
    author: "Lena",
    stat: "218 follows",
    color: "green",
  },
];

export const appNav = [
  { label: "Create", to: "/home/magick-chat", icon: Sparkles },
  { label: "Explore", to: "/home/explore?category=latest", icon: Compass },
  { label: "Collections", to: "/home/collections", icon: GalleryVerticalEnd },
  { label: "Subscriptions", to: "/home/subscriptions", icon: Box },
  { label: "Settings", to: "/home/settings", icon: Settings },
];

export const architectureDecisions = [
  "No production API, Auth.js, analytics, DNS, database, or deployment target is connected.",
  "The prototype uses local mock state to validate UX parity and interaction quality.",
  "The landing route preserves observed public copy, sections, and Launch Beta behavior.",
  "The app shell preserves the observed Explore entry point and major navigation labels.",
  "The Vite build includes an ICP asset canister policy for certified serving and SPA fallback.",
  "Backend rewrite is deferred until API contracts, queue semantics, and production data ownership are documented.",
];

export const routeParity = [
  { route: "/", reference: "Production landing page", prototype: "Landing with same nav, hero, mode selector, sections, pricing, and contact form" },
  { route: "/home/explore?category=latest", reference: "Launch Beta target", prototype: "Explore app shell with Latest/Trending tabs and creation feed" },
  { route: "/home/magick-chat", reference: "Creator chat surface", prototype: "Magick Friend composer with local chat state" },
  { route: "/home/collections", reference: "Collections route", prototype: "Collection overview state" },
  { route: "/home/subscriptions", reference: "Subscription routes", prototype: "Plan comparison and purchase-safe mock CTAs" },
  { route: "/auth/sign-in", reference: "Auth route exists in repo", prototype: "Non-production sign-in mock with no credential submission" },
];

export const icpReadiness = [
  {
    area: "Certified frontend",
    recommendation: "Deploy the built Vite assets to a new ICP asset canister for an isolated preview.",
    prototype: "Includes .ic-assets.json5 with raw access disabled, cache headers, CSP, and SPA aliasing.",
  },
  {
    area: "Auth",
    recommendation: "Use Internet Identity for the ICP proof slice, with app-specific principals and no password storage.",
    prototype: "Sign-in remains mocked locally until a separate canister preview exists.",
  },
  {
    area: "Application state",
    recommendation:
      "Move user profiles, project records, conversation metadata, generation jobs, collection state, and audit events into stable canister storage.",
    prototype: "Models these states in local UI only so no production data is touched.",
  },
  {
    area: "AI inference",
    recommendation:
      "Keep dynamic model inference in external workers/providers first; store job state, hashes, ownership, and result metadata on ICP.",
    prototype: "Creation submits queue locally and documents the future canister contract boundary.",
  },
  {
    area: "Payments and media",
    recommendation:
      "Evaluate ICRC-compatible credits for ICP-native payments while keeping Stripe and large media off-chain until product constraints are proven.",
    prototype: "All subscription actions are disabled and media is static sample UI.",
  },
];
