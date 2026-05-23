import { execFileSync } from "node:child_process";
import { copyFile, cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "");
const commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
  cwd: root,
  encoding: "utf8",
}).trim();
const outRoot = join(root, "tmp", `caffeine-upload-${commit}-${timestamp}`);
const projectRoot = join(outRoot, "magickbox-on-icp-caffeine");
const frontendRoot = join(projectRoot, "src", "frontend");
const backendRoot = join(projectRoot, "src", "backend");
const zipPath = join(root, "tmp", `magickbox-on-icp-caffeine-${commit}-${timestamp}.zip`);

const frontendFiles = [
  "index.html",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "vite.config.ts",
  "eslint.config.js",
];
const referenceScanFiles = ["index.html", "src/App.tsx", "src/data/content.ts"];

async function copyIfExists(from, to) {
  if (!existsSync(from)) {
    return;
  }

  await copyFile(from, to);
}

async function copyReferencedPublicAssets() {
  const refs = new Set();

  for (const file of referenceScanFiles) {
    const content = await readFile(join(root, file), "utf8");

    for (const match of content.matchAll(/["'](\/reference-assets\/[^"']+)["']/g)) {
      refs.add(match[1]);
    }
  }

  for (const ref of refs) {
    const relativePath = ref.replace(/^\//, "");
    const from = join(root, "public", relativePath);
    const to = join(frontendRoot, "public", relativePath);

    if (!existsSync(from)) {
      console.warn(`Missing referenced public asset: ${ref}`);
      continue;
    }

    await mkdir(dirname(to), { recursive: true });
    await copyFile(from, to);
  }

  return refs.size;
}

async function main() {
  await rm(outRoot, { recursive: true, force: true });
  await mkdir(frontendRoot, { recursive: true });
  await mkdir(backendRoot, { recursive: true });

  await writeFile(
    join(projectRoot, "caffeine.toml"),
    [
      'manifest_version = "0.1.0"',
      "",
      "[project]",
      'id = "codex-magickbox-on-icp"',
      'name = "codex-magickbox-on-icp"',
      "",
      "[workspace]",
      'include = ["src/**"]',
      "",
      "[canisters.frontend]",
      'depends_on = ["backend"]',
      "",
    ].join("\n"),
  );
  await writeFile(
    join(projectRoot, "project.json"),
    JSON.stringify(
      {
        overview:
          "Isolated Magick Box ICP preview prepared from the canonical Codex prototype repo. It preserves the observable Magick Box UX while moving auth, credits, jobs, payments, audit events, and media manifests toward ICP canisters.",
        features: [
          "Magick Box landing, chat, gallery, pricing, settings, and admin routes",
          "Internet Identity compatible owner login",
          "ICP-first media manifests and copied reference media",
          "Core canister state for credits, jobs, audit events, payment intents, ad credits, and inline media assets",
          "Admin bootstrap and funding dashboard guarded away from demo users",
          "Provider settings for MagickAI, FreeLLMAPI, OpenAI-compatible endpoints, and local Ollama",
        ],
        category: "ai-creator-tool",
        tags: ["icp", "magick-box", "internet-identity", "credits", "media"],
        source: "https://github.com/markranford/magickbox-isolated-prototype-icp",
      },
      null,
      2,
    ),
  );
  await writeFile(
    join(projectRoot, "package.json"),
    JSON.stringify(
      {
        name: "@caffeine/codex-magickbox-on-icp",
        type: "module",
        engines: {
          node: ">=16.0.0",
          pnpm: ">=7.0.0",
          npm: "please use pnpm",
        },
        scripts: {
          build: "pnpm -r --if-present run build",
          typecheck: "pnpm -r --if-present run typecheck",
          check: "pnpm -r --if-present run check",
          fix: "pnpm -r --if-present run fix",
          bindgen:
            "caffeine-bindgen --did-file ./src/backend/dist/backend.did --out-dir ./src/frontend/src --actor-interface-file --force",
        },
        devDependencies: {
          sharp: "^0.34.4",
        },
        dependencies: {
          "@caffeineai/core-infrastructure": "^0.3.0",
        },
      },
      null,
      2,
    ),
  );
  await writeFile(
    join(projectRoot, "pnpm-workspace.yaml"),
    ["packages:", "  - src/**/*", "onlyBuiltDependencies:", "  - esbuild", "  - sharp", ""].join("\n"),
  );
  await writeFile(
    join(projectRoot, "tsconfig.json"),
    JSON.stringify({ files: [], references: [{ path: "./src/frontend" }] }, null, 2),
  );
  await writeFile(
    join(projectRoot, ".gitignore"),
    ["node_modules/", "dist/", ".mops/", ".icp/", "*.log", ""].join("\n"),
  );
  await writeFile(
    join(projectRoot, "mops.toml"),
    [
      "[package]",
      'name = "backend"',
      'version = "0.1.0"',
      "",
      "[build]",
      'outputDir = "src/backend/dist"',
      'args = ["--release"]',
      "",
      "[canisters.backend]",
      'main = "src/backend/main.mo"',
      "",
      "[toolchain]",
      'moc = "1.8.1"',
      'lintoko = "0.10.0"',
      "",
      "[lint]",
      "extends = true",
      "",
      "[dependencies]",
      'core = "2.3.1"',
      "",
    ].join("\n"),
  );
  await copyIfExists(join(root, "mops.lock"), join(projectRoot, "mops.lock"));
  await writeFile(
    join(projectRoot, "spec.md"),
    [
      "# Magick Box On ICP",
      "",
      "This package is a Caffeine-shaped preview shell generated from the isolated Codex ICP prototype.",
      "",
      "Required behavior:",
      "- Preserve the observable Magick Box UX shell: landing, chat workspace, gallery, pricing, settings, and admin routes.",
      "- Use Internet Identity compatible auth.",
      "- Keep application state, credits, jobs, audit events, and media manifests on ICP canisters.",
      "- Use a single Caffeine backend canister if Caffeine exposes only `PUBLIC_CANISTER_ID:backend`; use the dedicated media canister when one is available.",
      "- Never point to or modify www.magickbox.ai production services.",
      "- Treat this as an isolated preview, not the final privileged funding canister.",
      "",
    ].join("\n"),
  );

  await writeFile(
    join(backendRoot, "caffeine.toml"),
    [
      'manifest_version = "0.1.0"',
      "",
      "[project]",
      'name = "backend"',
      'type = "motoko"',
      'main = "main.mo"',
      "",
      "[build]",
      'commands = ["mops build", "pnpm bindgen"]',
      'out = "dist"',
      "",
      "[check]",
      'commands = ["mops check"]',
      "",
      "[check.fix]",
      'commands = ["mops check --fix"]',
      "",
    ].join("\n"),
  );
  await copyFile(join(root, "canisters", "magickbox_core", "main.mo"), join(backendRoot, "main.mo"));
  await copyFile(
    join(root, "canisters", "magickbox_core", "magickbox_core.did"),
    join(backendRoot, "magickbox_core.did"),
  );

  await writeFile(
    join(frontendRoot, "caffeine.toml"),
    [
      'manifest_version = "0.1.0"',
      "",
      "[project]",
      'name = "frontend"',
      'type = "assets"',
      "",
      "[build]",
      'commands = ["pnpm build"]',
      'out = "dist"',
      "",
      "[check]",
      'commands = ["pnpm typecheck"]',
      "",
    ].join("\n"),
  );
  await cp(join(root, "src"), join(frontendRoot, "src"), { recursive: true });
  const referencedAssetCount = await copyReferencedPublicAssets();

  for (const file of frontendFiles) {
    await copyIfExists(join(root, file), join(frontendRoot, file));
  }

  const frontendPackagePath = join(frontendRoot, "package.json");
  const frontendPackage = JSON.parse(await readFile(frontendPackagePath, "utf8"));
  frontendPackage.scripts = {
    ...frontendPackage.scripts,
    typecheck: frontendPackage.scripts?.typecheck ?? "tsc -b",
    check: frontendPackage.scripts?.check ?? "eslint .",
    fix: frontendPackage.scripts?.fix ?? "eslint . --fix",
  };
  await writeFile(frontendPackagePath, `${JSON.stringify(frontendPackage, null, 2)}\n`);

  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Compress-Archive -Path '${projectRoot}\\*' -DestinationPath '${zipPath}' -Force`,
    ],
    { cwd: root, stdio: "inherit" },
  );

  const stats = await stat(zipPath);
  const maxBytes = 20 * 1024 * 1024;
  const result = {
    projectRoot,
    zipPath,
    bytes: stats.size,
    referencedAssetCount,
    belowCaffeineUploadLimit: stats.size <= maxBytes,
  };

  console.log(JSON.stringify(result, null, 2));

  if (stats.size > maxBytes) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
