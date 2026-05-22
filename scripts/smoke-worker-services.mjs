#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { runWorkerAdapter } from "./lib/worker-adapters.mjs";

const requireLive = process.argv.includes("--require-live");
const OPENAI_CHAT_COMPLETIONS_PATH = "/v1/chat/completions";

function fail(message) {
  throw new Error(message);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    fail(`${url} failed ${response.status}: ${text}`);
  }

  return { response, body };
}

function serviceRootFromV1(baseUrl) {
  return baseUrl.replace(/\/v1\/?$/, "").replace(/\/$/, "");
}

async function smokeFreeLlmApi() {
  const baseUrl = process.env.FREELLMAPI_BASE_URL;
  const apiKey = process.env.FREELLMAPI_API_KEY;

  if (!baseUrl || !apiKey) {
    return {
      service: "freellmapi",
      status: requireLive ? "missing_required_env" : "skipped",
      required: ["FREELLMAPI_BASE_URL", "FREELLMAPI_API_KEY"],
    };
  }

  const root = serviceRootFromV1(baseUrl);
  await fetchJson(`${root}/api/ping`);
  await fetchJson(`${baseUrl.replace(/\/$/, "")}/models`);
  const { response, body } = await fetchJson(`${root}${OPENAI_CHAT_COMPLETIONS_PATH}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.FREELLMAPI_MODEL ?? "auto",
      messages: [
        {
          role: "user",
          content: "Reply with one short sentence confirming FreeLLMAPI live service execution.",
        },
      ],
      max_tokens: 80,
      temperature: 0.2,
      stream: false,
    }),
  });

  return {
    service: "freellmapi",
    status: "ok",
    baseUrl,
    routedVia: response.headers.get("x-routed-via"),
    fallbackAttempts: response.headers.get("x-fallback-attempts"),
    output:
      body?.choices?.[0]?.message?.content ??
      body?.choices?.[0]?.text ??
      null,
  };
}

async function smokeMagickAi() {
  if (!process.env.MAGICKAI_WORKER_URL && !process.env.MAGICKAI_WORKER_COMMAND) {
    return {
      service: "magick_ai",
      status: requireLive ? "missing_required_env" : "skipped",
      required: ["MAGICKAI_WORKER_URL or MAGICKAI_WORKER_COMMAND"],
    };
  }

  const execution = await runWorkerAdapter({
    providerId: "magick_ai_worker",
    mode: "chat",
    jobId: "service-smoke",
    prompt: "Reply with one short sentence confirming MagickAI live worker execution.",
  });

  return {
    service: "magick_ai",
    status: "ok",
    adapter: execution.adapter,
    model: execution.model,
    output: execution.output,
  };
}

function checkMagickAiBridgeHealth() {
  const command = process.env.MAGICKAI_WORKER_COMMAND;

  if (!command || !command.includes("magickai_worker_bridge.py")) {
    return null;
  }

  const result = spawnSync(`${command} --health`, {
    shell: true,
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  });

  return {
    service: "magick_ai_bridge",
    status: result.status === 0 ? "ok" : "error",
    output: result.stdout.trim(),
    error: result.stderr.trim(),
  };
}

async function main() {
  const results = [await smokeFreeLlmApi(), await smokeMagickAi()];
  const bridgeHealth = checkMagickAiBridgeHealth();

  if (bridgeHealth) {
    results.push(bridgeHealth);
  }

  const skippedOrMissing = results.filter((result) =>
    ["skipped", "missing_required_env", "error"].includes(result.status),
  );

  console.log(JSON.stringify({ requireLive, results }, null, 2));

  if (requireLive && skippedOrMissing.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
