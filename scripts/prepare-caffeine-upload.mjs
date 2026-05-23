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
const projectRoot = join(outRoot, "magickboxv3-icp-builder-import");
const frontendRoot = join(projectRoot, "src", "frontend");
const backendRoot = join(projectRoot, "src", "backend");
const zipPath = join(root, "tmp", `magickboxv3-icp-builder-import-${commit}-${timestamp}.zip`);

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
      'id = "magickboxv3"',
      'name = "MagickBoxV3"',
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
          "MagickBoxV3 isolated ICP preview prepared from the canonical Codex prototype repo. It preserves the observable Magick Box UX while moving auth, credits, jobs, payments, audit events, and media manifests toward ICP canisters.",
        features: [
          "MagickBoxV3 landing, chat, gallery, pricing, settings, and admin routes",
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
        name: "@magickbox/magickboxv3-icp-builder-import",
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
        dependencies: {},
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
    ["node_modules/", "dist/", ".mops/", ".icp/", "*.log", "src/frontend/public/env.json", ""].join("\n"),
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
      "# MagickBoxV3 On ICP",
      "",
      "This package is a MagickBoxV3 preview shell generated from the isolated Codex ICP prototype for import through the ICP AI builder.",
      "",
      "Required behavior:",
      "- Preserve the observable MagickBoxV3 UX shell: landing, chat workspace, gallery, pricing, settings, and admin routes.",
      "- Use Internet Identity compatible auth.",
      "- Keep application state, credits, jobs, audit events, and media manifests on ICP canisters.",
      "- Use a single builder-provided backend canister if only `PUBLIC_CANISTER_ID:backend` is exposed; use the dedicated media canister when one is available.",
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
  await mkdir(join(frontendRoot, "scripts"), { recursive: true });
  await copyFile(
    join(root, "scripts", "write-caffeine-env.mjs"),
    join(frontendRoot, "scripts", "write-caffeine-env.mjs"),
  );
  await cp(join(root, "canisters"), join(frontendRoot, "canisters"), { recursive: true });
  const referencedAssetCount = await copyReferencedPublicAssets();

  for (const file of frontendFiles) {
    await copyIfExists(join(root, file), join(frontendRoot, file));
  }

  const frontendPackagePath = join(frontendRoot, "package.json");
  const frontendPackage = JSON.parse(await readFile(frontendPackagePath, "utf8"));
  frontendPackage.scripts = {
    ...frontendPackage.scripts,
    prebuild: frontendPackage.scripts?.prebuild ?? "node scripts/write-caffeine-env.mjs",
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
