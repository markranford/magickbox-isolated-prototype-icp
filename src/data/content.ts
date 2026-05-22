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
  {
    title: "Neon product render",
    image: "/reference-assets/live-site/copied-production-media/image_generation_tool_images/Albert_20260205_151458.png",
  },
  {
    title: "Music cover concept",
    image: "/reference-assets/live-site/copied-production-media/image_generation_tool_images/MagickBoxx_20260424_143152.png",
  },
  {
    title: "Fashion film still",
    image: "/reference-assets/live-site/copied-production-media/image_generation_tool_images/Musashi_20260416_183410.png",
  },
  {
    title: "Mythic landscape",
    image: "/reference-assets/live-site/copied-production-media/image_generation_tool_images/Santuy_20260401_170536.png",
  },
  {
    title: "Recipe explainer",
    image: "/reference-assets/live-site/copied-production-media/image_generation_tool_images/Tiago_Julio_20260307_144559.png",
  },
  {
    title: "Creator profile shot",
    image: "/reference-assets/live-site/magickbox-site/images/members/4.png",
  },
  {
    title: "Podcast cover",
    image: "/reference-assets/live-site/copied-production-media/magick_chat_gifs/Dam_20260330_054315.gif",
  },
  {
    title: "Social promo",
    image: "/reference-assets/live-site/copied-production-media/magick_chat_gifs/Matteo_20260308_090858.gif",
  },
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
    image: "/reference-assets/live-site/copied-production-media/media/users/6877604c62d04f63947369a6/generated_images/gen_56e73367-10fe-4382-9869-0d7a57576a09.png",
  },
  {
    title: "Launch trailer loop",
    type: "Video",
    author: "Noah",
    stat: "642 saves",
    color: "ember",
    image: "/reference-assets/live-site/copied-production-media/magick_chat_gifs/TiagoJulio_20260307_080214.gif",
  },
  {
    title: "Midnight synth hook",
    type: "Music",
    author: "Ari",
    stat: "4.2K plays",
    color: "violet",
    image: "/reference-assets/live-site/copied-production-media/image_generation_tool_images/Albert_20260402_171030.png",
  },
  {
    title: "AI ritual workspace",
    type: "Collection",
    author: "Lena",
    stat: "218 follows",
    color: "green",
    image: "/reference-assets/live-site/copied-production-media/media/users/68834718e035181af6a92dbe/generated_images/gen_d4782fb6-4dac-4446-8ed3-82ad1d65b19c.png",
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
  "The ICP asset build uses canister-owned profile, credit, provider, job, collection, and audit state.",
  "The landing route preserves observed public copy, sections, and Launch Beta behavior.",
  "The app shell preserves the observed Explore entry point and major navigation labels.",
  "The Vite build includes an ICP asset canister policy for certified serving and SPA fallback.",
  "AI execution, payments, ads, and media storage now have explicit local ICP adapter proofs instead of hidden placeholders.",
];

export const routeParity = [
  { route: "/", reference: "Production landing page", prototype: "Landing with same nav, hero, mode selector, sections, pricing, and contact form" },
  { route: "/home/explore?category=latest", reference: "Launch Beta target", prototype: "Explore app shell with Latest/Trending tabs and creation feed" },
  { route: "/home/magick-chat", reference: "Creator chat surface", prototype: "Magick Friend composer with local chat state" },
  { route: "/home/collections", reference: "Collections route", prototype: "Collection overview state" },
  { route: "/home/subscriptions", reference: "Subscription routes", prototype: "ICP credit path options from the core account model" },
  { route: "/auth/sign-in", reference: "Auth route exists in repo", prototype: "Internet Identity plus local signed browser identity for popup-blocked local testing" },
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
    prototype: "React uses Internet Identity where popups are allowed and a persistent local browser identity for signed local canister calls.",
  },
  {
    area: "Application state",
    recommendation:
      "Move user profiles, project records, conversation metadata, generation jobs, collection state, and audit events into stable canister storage.",
    prototype: "The local `magickbox_core` canister owns profile, credits, provider options, jobs, collections, and audit events.",
  },
  {
    area: "AI inference",
    recommendation:
      "Keep dynamic model inference in external workers/providers first; store job state, hashes, ownership, and result metadata on ICP.",
    prototype: "Creation writes canister job records; an authorized local Ollama worker can complete jobs with receipt and result hash.",
  },
  {
    area: "Payments and media",
    recommendation:
      "Evaluate ICRC-compatible credits for ICP-native payments while keeping Stripe and large media off-chain until product constraints are proven.",
    prototype: "Local ICP payment intent/claim, ad credit grants, and media manifests are implemented in the core canister smoke path.",
  },
];
