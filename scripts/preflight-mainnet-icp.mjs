#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const identity = process.env.MAGICKBOX_MAINNET_IDENTITY ?? null;
const primaryController = process.env.MAGICKBOX_MAINNET_PRIMARY_CONTROLLER ?? null;
const backupController = process.env.MAGICKBOX_MAINNET_BACKUP_CONTROLLER ?? null;
const isWindows = process.platform === "win32";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });

  return {
    command: [command, ...args].join(" "),
    ok: result.status === 0 && !result.error,
    status: result.status,
    stdout: result.stdout?.trim() ?? "",
    stderr: [result.stderr?.trim(), result.error?.message].filter(Boolean).join("\n"),
  };
}

function runIcp(args, { withIdentity = true } = {}) {
  const identityArgs = identity ? ["--identity", identity] : [];
  const fullArgs = withIdentity ? [...args, ...identityArgs] : args;

  return isWindows ? run("cmd.exe", ["/d", "/s", "/c", "icp", ...fullArgs]) : run("icp", fullArgs);
}

function parseNumericBalance(text) {
  const match = /Balance:\s*([0-9][0-9_.]*)\s*([A-Z]+)/i.exec(text);

  if (!match) {
    return null;
  }

  return {
    amount: Number(match[1].replaceAll("_", "")),
    unit: match[2].toUpperCase(),
  };
}

function readFiles(dir, extensions) {
  if (!existsSync(dir)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readFiles(fullPath, extensions));
    } else if (entry.isFile() && extensions.some((extension) => fullPath.endsWith(extension))) {
      files.push(fullPath);
    }
  }

  return files;
}

function scanForProductionTouchpoints() {
  const files = [
    ...readFiles(resolve(root, "src"), [".ts", ".tsx", ".css"]),
    ...readFiles(resolve(root, "scripts"), [".mjs", ".js", ".sh"]),
    ...readFiles(resolve(root, "canisters"), [".mo", ".did"]),
  ];
  const patterns = [
    "www.magickbox.ai",
    "magickbox.ai/api",
    "MAGICKBOX_PRODUCTION",
    "AWS_ACCESS_KEY",
    "STRIPE_SECRET",
    "VERCEL_TOKEN",
  ];

  const ownScript = resolve(root, "scripts", "preflight-mainnet-icp.mjs");
  const hits = [];
  const allowedSafetyOnlyLines = [
    "Never point to or modify www.magickbox.ai production services.",
  ];

  for (const file of files) {
    if (file === ownScript) {
      continue;
    }
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    for (const pattern of patterns) {
      for (const [index, line] of lines.entries()) {
        if (!line.includes(pattern)) {
          continue;
        }

        if (allowedSafetyOnlyLines.some((allowed) => line.includes(allowed))) {
          continue;
        }

        hits.push({
          file: file.replace(root, "."),
          line: index + 1,
          pattern,
        });
      }
    }
  }

  return hits;
}

function scanForUnsafeBootstrapCode() {
  const file = resolve(root, "canisters", "magickbox_core", "main.mo");
  const source = existsSync(file) ? readFileSync(file, "utf8") : "";
  const markers = [
    "MAGICKBOX-LOCAL-SUPERADMIN-2026",
    "Invalid superadmin bootstrap code",
  ];

  return markers
    .filter((marker) => source.includes(marker))
    .map((marker) => ({
      file: file.replace(root, "."),
      marker,
    }));
}

const checks = {
  identity: runIcp(["identity", "principal"]),
  accountId: runIcp(["identity", "account-id"]),
  icrcAccount: runIcp(["identity", "account-id", "--format", "icrc1"]),
  defaultIdentity: runIcp(["identity", "default"], { withIdentity: false }),
  network: runIcp(["network", "ping", "ic"], { withIdentity: false }),
  environments: runIcp(["environment", "list"], { withIdentity: false }),
  tokenBalance: runIcp(["token", "balance", "-n", "ic"]),
  cyclesBalance: runIcp(["cycles", "balance", "-n", "ic"]),
  buildOutput: {
    ok: existsSync(resolve(root, "dist", "index.html")),
    path: "dist/index.html",
  },
  mediaManifest: {
    ok: existsSync(resolve(root, "public", "reference-assets", "live-site", "media-manifest.json")),
    path: "public/reference-assets/live-site/media-manifest.json",
  },
  mainnetMapping: {
    ok:
      existsSync(resolve(root, ".icp", "data", "mappings", "ic.ids.json")) ||
      existsSync(resolve(root, ".icp", "cache", "mappings", "ic.ids.json")),
    paths: [
      ".icp/data/mappings/ic.ids.json",
      ".icp/cache/mappings/ic.ids.json",
    ],
  },
  productionTouchpoints: scanForProductionTouchpoints(),
  unsafeBootstrapCode: scanForUnsafeBootstrapCode(),
};

const token = parseNumericBalance(checks.tokenBalance.stdout);
const cycles = parseNumericBalance(checks.cyclesBalance.stdout);
const blockers = [];
const warnings = [];

if (!identity) {
  blockers.push("MAGICKBOX_MAINNET_IDENTITY is not set to a dedicated isolated Magick Box identity.");
}
if (!primaryController) {
  blockers.push("MAGICKBOX_MAINNET_PRIMARY_CONTROLLER is not set.");
}
if (!backupController) {
  blockers.push("MAGICKBOX_MAINNET_BACKUP_CONTROLLER is not set.");
}
if (primaryController && backupController && primaryController === backupController) {
  blockers.push("Primary and backup controllers must be different principals.");
}
if (primaryController && checks.identity.ok && primaryController !== checks.identity.stdout) {
  warnings.push("Primary controller does not match the selected deploy identity principal.");
}
if (!checks.network.ok) {
  blockers.push("Cannot reach the IC mainnet endpoint.");
}
if (!token || token.amount <= 0) {
  warnings.push("Selected identity has 0 ICP on mainnet; fund ICP before minting more cycles.");
}
if (!cycles || cycles.amount <= 0) {
  blockers.push("Selected identity has 0 cycles on mainnet; mint or receive cycles before deploy.");
}
if (!checks.buildOutput.ok) {
  blockers.push("Missing dist/index.html; run npm run build before deploying assets.");
}
if (checks.productionTouchpoints.length > 0) {
  blockers.push("Potential production touchpoints were found in app/source scripts.");
}
if (checks.unsafeBootstrapCode.length > 0) {
  blockers.push("Unsafe public superadmin bootstrap code is still present in the core canister.");
}

const report = {
  generatedAt: new Date().toISOString(),
  workspace: root,
  requestedIdentity: identity,
  primaryController,
  backupController,
  defaultIdentity: checks.defaultIdentity.stdout,
  principal: checks.identity.stdout,
  ledgerAccountId: checks.accountId.stdout,
  icrcAccount: checks.icrcAccount.stdout,
  tokenBalance: checks.tokenBalance.stdout,
  cyclesBalance: checks.cyclesBalance.stdout,
  mainnetEndpointHealthy: checks.network.ok,
  buildOutputPresent: checks.buildOutput.ok,
  copiedLiveMediaManifestPresent: checks.mediaManifest.ok,
  existingMainnetCanisterMappingPresent: checks.mainnetMapping.ok,
  productionTouchpoints: checks.productionTouchpoints,
  unsafeBootstrapCode: checks.unsafeBootstrapCode,
  warnings,
  blockers,
  nextFundingCommands: identity
    ? [
        `icp cycles mint --cycles 10t -n ic --identity ${identity}`,
        "npm run preflight:mainnet",
      ]
    : [],
  deployCommandWhenFunded:
    identity && primaryController && backupController
      ? `icp deploy -e ic --identity ${identity} --controller ${primaryController} --controller ${backupController} --yes`
      : "icp deploy -e ic --identity <funded-isolated-identity> --controller <primary-principal> --controller <backup-principal> --yes",
};

console.log(JSON.stringify(report, null, 2));

if (blockers.length > 0) {
  process.exitCode = 1;
}
