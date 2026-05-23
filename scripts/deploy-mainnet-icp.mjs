#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";
const approvalPhrase = "YES_DEPLOY_ISOLATED_MAGICKBOX_ICP_MAINNET";

const identity = process.env.MAGICKBOX_MAINNET_IDENTITY ?? "";
const primaryController = process.env.MAGICKBOX_MAINNET_PRIMARY_CONTROLLER ?? "";
const backupController = process.env.MAGICKBOX_MAINNET_BACKUP_CONTROLLER ?? "";
const approval = process.env.MAGICKBOX_MAINNET_DEPLOY_APPROVAL ?? "";
const dryRun = process.env.MAGICKBOX_MAINNET_DRY_RUN === "1";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    ...options,
  });

  const stdout = result.stdout?.trim() ?? "";
  const stderr = [result.stderr?.trim(), result.error?.message].filter(Boolean).join("\n");
  if (result.status !== 0 || result.error) {
    throw new Error(
      [
        `Command failed: ${[command, ...args].join(" ")}`,
        stdout,
        stderr,
      ].filter(Boolean).join("\n"),
    );
  }

  return { command: [command, ...args].join(" "), stdout, stderr };
}

function runNpm(args) {
  return isWindows ? run("cmd.exe", ["/d", "/s", "/c", "npm", ...args]) : run("npm", args);
}

function runIcp(args) {
  return isWindows ? run("cmd.exe", ["/d", "/s", "/c", "icp", ...args]) : run("icp", args);
}

function assertReadyToDeploy() {
  const missing = [];
  if (!identity) missing.push("MAGICKBOX_MAINNET_IDENTITY");
  if (!primaryController) missing.push("MAGICKBOX_MAINNET_PRIMARY_CONTROLLER");
  if (!backupController) missing.push("MAGICKBOX_MAINNET_BACKUP_CONTROLLER");
  if (!dryRun && approval !== approvalPhrase) {
    missing.push(`MAGICKBOX_MAINNET_DEPLOY_APPROVAL=${approvalPhrase}`);
  }

  if (missing.length > 0) {
    const report = {
      status: "blocked",
      reason: "mainnet_deploy_requires_explicit_isolated_identity_and_approval",
      required: missing,
      dryRunHint:
        "Set MAGICKBOX_MAINNET_DRY_RUN=1 with the identity/controller env vars to print the deploy command without deploying.",
    };
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }
}

function assertNoUnsafeBootstrapCode() {
  const source = readFileSync(resolve(root, "canisters", "magickbox_core", "main.mo"), "utf8");
  const unsafeMarkers = [
    "MAGICKBOX-LOCAL-SUPERADMIN-2026",
    "Invalid superadmin bootstrap code",
  ].filter((marker) => source.includes(marker));

  if (unsafeMarkers.length > 0) {
    console.log(
      JSON.stringify(
        {
          status: "blocked",
          reason: "unsafe_public_superadmin_bootstrap_code_present",
          unsafeMarkers,
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }
}

function main() {
  assertReadyToDeploy();
  assertNoUnsafeBootstrapCode();

  const deployArgs = [
    "deploy",
    "-e",
    "ic",
    "--identity",
    identity,
    "--controller",
    primaryController,
    "--controller",
    backupController,
    "--yes",
  ];

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          status: "dry_run",
          buildCommand: "npm run build",
          preflightCommand: "npm run preflight:mainnet",
          deployCommand: ["icp", ...deployArgs].join(" "),
        },
        null,
        2,
      ),
    );
    return;
  }

  const build = runNpm(["run", "build"]);
  const preflight = runNpm(["run", "preflight:mainnet"]);
  const deploy = runIcp(deployArgs);
  const canisters = runIcp(["canister", "list", "-e", "ic", "--identity", identity]);

  const report = {
    status: "deployed",
    generatedAt: new Date().toISOString(),
    identity,
    primaryController,
    backupController,
    build,
    preflight,
    deploy,
    canisters,
  };

  const reportPath = resolve(root, "docs/artifacts/prototype/mainnet-icp-deploy-report.json");
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ status: "ok", reportPath, canisters: canisters.stdout }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
