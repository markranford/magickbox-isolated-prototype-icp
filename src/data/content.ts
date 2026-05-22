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
