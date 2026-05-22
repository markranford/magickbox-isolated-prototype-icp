#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ownerIdentity = process.env.MAGICKBOX_OWNER_IDENTITY ?? "magickbox-local-prototype";
const workerIdentity = process.env.MAGICKBOX_WORKER_IDENTITY ?? "magickbox-local-worker";
const icpBin = process.env.ICP_BIN ?? "/home/mark/.cargo/bin/icp";
const callArgsDir = resolve(root, ".icp/cache/call-args");
const secretsDir = resolve(root, ".icp/cache/local-secrets");
const artifactsDir = resolve(root, "docs/artifacts/prototype");

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

function parseNat(label, output) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`${escaped}\\s*=\\s*([0-9_]+)`).exec(output);

  if (!match) {
    throw new Error(`Could not parse ${label} from:\n${output}`);
  }

  return match[1].replaceAll("_", "");
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

async function callOllama(prompt) {
  const model = process.env.MAGICKBOX_WORKER_MODEL ?? "glm4:9b";
  const endpoint = process.env.MAGICKBOX_OLLAMA_URL ?? "http://127.0.0.1:11434/api/generate";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
        num_predict: 80,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama worker failed ${response.status}: ${await response.text()}`);
  }

  const payload = await response.json();
  const output = String(payload.response ?? "").trim();

  if (!output) {
    throw new Error("Ollama worker returned an empty response");
  }

  return { model, output };
}

function readCanisterIds() {
  const mappingPath = resolve(root, ".icp/cache/mappings/local.ids.json");

  if (!existsSync(mappingPath)) {
    throw new Error("Missing .icp/cache/mappings/local.ids.json. Run scripts/deploy-local-icp.sh first.");
  }

  return JSON.parse(readFileSync(mappingPath, "utf8"));
}

async function main() {
  mkdirSync(artifactsDir, { recursive: true });
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

  console.log("== Transfer local ICP to core canister account ==");
  const blockOutput = icp(
    `token transfer 0.001 ${shellQuote(coreCanisterId)} -e local --identity ${shellQuote(
      ownerIdentity,
    )} --quiet`,
  );
  const blockIndex = blockOutput.match(/[0-9_]+/)?.[0]?.replaceAll("_", "");
  if (!blockIndex) {
    throw new Error(`Could not parse transfer block index from: ${blockOutput}`);
  }
  console.log(`block_index=${blockIndex}`);

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

  console.log("== Create worker job ==");
  const workerPrompt = "Write one concise sentence confirming Magick Box local ICP worker execution.";
  const jobOutput = icp(
    `canister call magickbox_core create_generation_job --args-file ${shellQuote(
      writeArgs(
        "worker-job.did",
        `("chat", "local_ollama", ${candidText(workerPrompt)}, "sha256-local-ollama-worker", 0 : nat)`,
      ),
    )} -e local --identity ${shellQuote(ownerIdentity)}`,
  );
  console.log(jobOutput);
  const jobId = parseNat("id", jobOutput);

  console.log("== Authorize worker principal ==");
  console.log(
    icp(
      `canister call magickbox_core authorize_worker --args-file ${shellQuote(
        writeArgs(
          "authorize-worker.did",
          `(principal ${candidText(workerPrincipal)}, "Local Ollama Worker")`,
        ),
      )} -e local --identity ${shellQuote(ownerIdentity)}`,
    ),
  );

  console.log("== Execute local Ollama worker ==");
  const { model, output } = await callOllama(workerPrompt);
  const resultHash = createHash("sha256").update(output).digest("hex");
  const resultUrl = `local-artifact://magickbox/worker/job-${jobId}.txt`;
  const artifactPath = resolve(artifactsDir, `local-ollama-worker-job-${jobId}.txt`);
  const receipt = JSON.stringify({
    provider: "ollama",
    model,
    artifact: resultUrl,
    hash: resultHash,
  });
  writeFileSync(
    artifactPath,
    [`model=${model}`, `job_id=${jobId}`, `hash=${resultHash}`, "", output, ""].join("\n"),
  );
  console.log(`model=${model}`);
  console.log(`artifact=${artifactPath}`);

  console.log("== Complete worker job on ICP ==");
  console.log(
    icp(
      `canister call magickbox_core complete_worker_job --args-file ${shellQuote(
        writeArgs(
          "worker-complete.did",
          `(${jobId} : nat, ${candidText(resultUrl)}, ${candidText(resultHash)}, ${candidText(
            receipt,
          )}, ${candidText(output.slice(0, 500))})`,
        ),
      )} -e local --identity ${shellQuote(workerIdentity)}`,
    ),
  );

  console.log("== Attach media manifest ==");
  console.log(
    icp(
      `canister call magickbox_core attach_media_manifest --args-file ${shellQuote(
        writeArgs(
          "media-manifest.did",
          `(${jobId} : nat, "local-worker-artifact", ${candidText(resultUrl)}, ${candidText(
            resultHash,
          )}, "text/plain", ${Buffer.byteLength(output, "utf8")} : nat)`,
        ),
      )} -e local --identity ${shellQuote(workerIdentity)}`,
    ),
  );

  console.log("== Evidence lists ==");
  for (const method of [
    "list_my_payment_intents",
    "list_my_ad_credit_grants",
    "list_my_worker_grants",
    "list_my_worker_runs",
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
