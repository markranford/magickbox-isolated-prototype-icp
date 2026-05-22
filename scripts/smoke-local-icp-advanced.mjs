#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runWorkerAdapter } from "./lib/worker-adapters.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ownerIdentity = process.env.MAGICKBOX_OWNER_IDENTITY ?? "magickbox-local-prototype";
const workerIdentity = process.env.MAGICKBOX_WORKER_IDENTITY ?? "magickbox-local-worker";
const icpBin = process.env.ICP_BIN ?? "/home/mark/.cargo/bin/icp";
const callArgsDir = resolve(root, ".icp/cache/call-args");
const secretsDir = resolve(root, ".icp/cache/local-secrets");
const ICP_MEDIA_URI_SCHEME = "icp-media://";
const ICP_MEDIA_STORAGE_PROVIDER = "icp-canister-media-store";

const workerScenarios = [
  {
    providerId: "local_ollama",
    label: "Local Ollama Worker",
    prompt: "Write one concise sentence confirming Magick Box local ICP worker execution.",
    requestedCost: 0,
  },
  {
    providerId: "freellmapi",
    label: "FreeLLMAPI Worker",
    prompt: "Write one concise sentence confirming Magick Box FreeLLMAPI adapter execution.",
    requestedCost: 0,
  },
  {
    providerId: "magick_ai_worker",
    label: "MagickAI Worker",
    prompt: "Write one concise sentence confirming Magick Box MagickAI-compatible worker execution.",
    requestedCost: 20,
  },
];

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function toWslPath(windowsPath) {
  const normalized = windowsPath.replaceAll("\\", "/");
  const match = /^([A-Za-z]):\/(.*)$/.exec(normalized);

  if (!match) {
    return normalized;
  }

  return `/mnt/${match[1].toLowerCase()}/${match[2]}`;
}

function runWsl(command) {
  const result = spawnSync(
    "wsl.exe",
    ["-e", "bash", "-lc", `cd ${shellQuote(toWslPath(root))} && ${command}`],
    {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  if (result.status !== 0) {
    throw new Error(`${command}\n${result.stdout}\n${result.stderr}`.trim());
  }

  return result.stdout.trim();
}

function icp(command) {
  return runWsl(
    `ICP_BIN=${shellQuote(icpBin)}; if [[ ! -x "$ICP_BIN" ]]; then ICP_BIN=icp; fi; "$ICP_BIN" ${command}`,
  );
}

function writeArgs(name, content) {
  mkdirSync(callArgsDir, { recursive: true });
  const filePath = resolve(callArgsDir, name);
  writeFileSync(filePath, content);
  return toWslPath(filePath);
}

function candidText(value) {
  return `"${String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll("\"", "\\\"")
    .replaceAll("\n", "\\n")}"`;
}

function candidBlob(value) {
  const bytes = Buffer.from(String(value), "utf8");

  return `blob "${Array.from(bytes, (byte) => `\\${byte.toString(16).padStart(2, "0")}`).join("")}"`;
}

function parseNat(label, output) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`${escaped}\\s*=\\s*([0-9_]+)`).exec(output);

  if (!match) {
    throw new Error(`Could not parse ${label} from:\n${output}`);
  }

  return match[1].replaceAll("_", "");
}

function parseText(label, output) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`${escaped}\\s*=\\s*"([^"]+)"`).exec(output);

  if (!match) {
    throw new Error(`Could not parse ${label} from:\n${output}`);
  }

  return match[1];
}

function ensureIdentity(identity) {
  mkdirSync(secretsDir, { recursive: true });
  const list = icp("identity list");

  if (list.includes(` ${identity} `) || list.includes(`* ${identity} `)) {
    return;
  }

  icp(
    `identity new ${shellQuote(identity)} --storage plaintext --output-seed ${shellQuote(
      `${toWslPath(secretsDir)}/${identity}.seed`,
    )}`,
  );
}

function readCanisterIds() {
  const mappingPath = resolve(root, ".icp/cache/mappings/local.ids.json");

  if (!existsSync(mappingPath)) {
    throw new Error("Missing .icp/cache/mappings/local.ids.json. Run scripts/deploy-local-icp.sh first.");
  }

  return JSON.parse(readFileSync(mappingPath, "utf8"));
}

function createPromptHash(providerId, prompt) {
  return createHash("sha256").update(`${providerId}:${prompt}`).digest("hex");
}

async function createAndCompleteWorkerJob({ providerId, label, prompt, requestedCost }) {
  console.log(`== Create ${providerId} worker job ==`);
  const jobOutput = icp(
    `canister call magickbox_core create_generation_job --args-file ${shellQuote(
      writeArgs(
        `${providerId}-worker-job.did`,
        `("chat", ${candidText(providerId)}, ${candidText(prompt)}, ${candidText(
          createPromptHash(providerId, prompt),
        )}, ${requestedCost} : nat)`,
      ),
    )} -e local --identity ${shellQuote(ownerIdentity)}`,
  );
  console.log(jobOutput);
  const jobId = parseNat("id", jobOutput);

  console.log(`== Execute ${providerId} adapter ==`);
  const execution = await runWorkerAdapter({
    providerId,
    prompt,
    mode: "chat",
    jobId,
  });

  const resultHash = createHash("sha256").update(execution.output).digest("hex");
  const resultBytes = Buffer.byteLength(execution.output, "utf8");
  console.log(`== Store ${providerId} media asset on ICP ==`);
  const mediaAssetOutput = icp(
    `canister call magickbox_core store_media_asset --args-file ${shellQuote(
      writeArgs(
        `${providerId}-media-asset.did`,
        `(${jobId} : nat, ${candidText(resultHash)}, "text/plain", ${candidBlob(execution.output)})`,
      ),
    )} -e local --identity ${shellQuote(workerIdentity)}`,
  );
  console.log(mediaAssetOutput);
  const assetUri = parseText("uri", mediaAssetOutput);

  if (!assetUri.startsWith(ICP_MEDIA_URI_SCHEME)) {
    throw new Error(`Expected ICP media URI, got ${assetUri}`);
  }

  const receipt = JSON.stringify({
    provider: providerId,
    adapter: execution.adapter,
    model: execution.model,
    label,
    artifact: assetUri,
    hash: resultHash,
    storage_provider: ICP_MEDIA_STORAGE_PROVIDER,
    receipt: execution.receipt,
  });

  console.log(`adapter=${execution.adapter}`);
  console.log(`model=${execution.model}`);
  console.log(`storage_provider=${ICP_MEDIA_STORAGE_PROVIDER}`);
  console.log(`artifact=${assetUri}`);

  console.log(`== Complete ${providerId} worker job on ICP ==`);
  console.log(
    icp(
      `canister call magickbox_core complete_worker_job --args-file ${shellQuote(
        writeArgs(
          `${providerId}-worker-complete.did`,
          `(${jobId} : nat, ${candidText(assetUri)}, ${candidText(resultHash)}, ${candidText(
            receipt,
          )}, ${candidText(execution.output.slice(0, 500))})`,
        ),
      )} -e local --identity ${shellQuote(workerIdentity)}`,
    ),
  );

  console.log(`== Attach ${providerId} media manifest ==`);
  console.log(
    icp(
      `canister call magickbox_core attach_media_manifest --args-file ${shellQuote(
        writeArgs(
          `${providerId}-media-manifest.did`,
          `(${jobId} : nat, ${candidText(ICP_MEDIA_STORAGE_PROVIDER)}, ${candidText(
            assetUri,
          )}, ${candidText(resultHash)}, "text/plain", ${resultBytes} : nat)`,
        ),
      )} -e local --identity ${shellQuote(workerIdentity)}`,
    ),
  );
}

async function main() {
  ensureIdentity(ownerIdentity);
  ensureIdentity(workerIdentity);

  const canisters = readCanisterIds();
  const coreCanisterId = canisters.magickbox_core;
  const workerPrincipal = icp(`identity principal --identity ${shellQuote(workerIdentity)}`);

  console.log("== Register owner profile ==");
  console.log(
    icp(
      `canister call magickbox_core register_profile --args-file ${shellQuote(
        writeArgs("advanced-register.did", '("Mark", opt "mark@stratagility.com")'),
      )} -e local --identity ${shellQuote(ownerIdentity)}`,
    ),
  );

  console.log("== Payment account ==");
  console.log(
    icp(
      `canister call magickbox_core get_payment_account --args-file ${shellQuote(
        writeArgs("empty.did", "()"),
      )} -e local --identity ${shellQuote(ownerIdentity)} --query`,
    ),
  );

  console.log("== Create ICP payment intent ==");
  const paymentIntentOutput = icp(
    `canister call magickbox_core create_icp_payment_intent --args-file ${shellQuote(
      writeArgs("payment-intent.did", "(100 : nat, 100_000 : nat)"),
    )} -e local --identity ${shellQuote(ownerIdentity)}`,
  );
  console.log(paymentIntentOutput);
  const paymentIntentId = parseNat("id", paymentIntentOutput);
  const paymentSubaccountHex = parseText("payment_subaccount_hex", paymentIntentOutput);

  console.log("== Payment account for intent ==");
  console.log(
    icp(
      `canister call magickbox_core get_payment_account_for_intent --args-file ${shellQuote(
        writeArgs("payment-account-for-intent.did", `(${paymentIntentId} : nat)`),
      )} -e local --identity ${shellQuote(ownerIdentity)} --query`,
    ),
  );

  console.log("== Transfer local ICP to per-intent subaccount ==");
  const blockOutput = icp(
    `token transfer 0.001 ${shellQuote(coreCanisterId)} --to-subaccount ${shellQuote(
      paymentSubaccountHex,
    )} -e local --identity ${shellQuote(ownerIdentity)} --quiet`,
  );
  const blockIndex = blockOutput.match(/[0-9_]+/)?.[0]?.replaceAll("_", "");
  if (!blockIndex) {
    throw new Error(`Could not parse transfer block index from: ${blockOutput}`);
  }
  console.log(`block_index=${blockIndex}`);
  console.log(`payment_subaccount=${paymentSubaccountHex}`);

  console.log("== Claim ICP payment intent ==");
  console.log(
    icp(
      `canister call magickbox_core claim_icp_payment --args-file ${shellQuote(
        writeArgs("payment-claim.did", `(${paymentIntentId} : nat, ${blockIndex} : nat)`),
      )} -e local --identity ${shellQuote(ownerIdentity)}`,
    ),
  );

  console.log("== Grant ad verifier credits ==");
  const adProofId = `local-ad-proof-${Date.now()}`;
  console.log(
    icp(
      `canister call magickbox_core grant_ad_credits --args-file ${shellQuote(
        writeArgs(
          "ad-grant.did",
          `("local-ad-verifier", ${candidText(adProofId)}, 25 : nat)`,
        ),
      )} -e local --identity ${shellQuote(ownerIdentity)}`,
    ),
  );

  console.log("== Authorize worker principal ==");
  console.log(
    icp(
      `canister call magickbox_core authorize_worker --args-file ${shellQuote(
        writeArgs(
          "authorize-worker.did",
          `(principal ${candidText(workerPrincipal)}, "Local Adapter Worker")`,
        ),
      )} -e local --identity ${shellQuote(ownerIdentity)}`,
    ),
  );

  for (const scenario of workerScenarios) {
    await createAndCompleteWorkerJob(scenario);
  }

  console.log("== Evidence lists ==");
  for (const method of [
    "list_my_payment_intents",
    "list_my_ad_credit_grants",
    "list_my_worker_grants",
    "list_my_worker_runs",
    "list_my_media_assets",
    "list_my_media_manifests",
  ]) {
    console.log(`-- ${method}`);
    console.log(
      icp(
        `canister call magickbox_core ${method} --args-file ${shellQuote(
          writeArgs("empty.did", "()"),
        )} -e local --identity ${shellQuote(ownerIdentity)} --query`,
      ),
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
