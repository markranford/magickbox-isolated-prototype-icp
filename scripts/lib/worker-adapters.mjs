import { spawnSync } from "node:child_process";

function withTimeout(ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

async function postJson(url, body, headers = {}) {
  const timeout = withTimeout(Number(process.env.MAGICKBOX_WORKER_TIMEOUT_MS ?? 120_000));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
      signal: timeout.signal,
    });

    if (!response.ok) {
      throw new Error(`${url} failed ${response.status}: ${await response.text()}`);
    }

    return response.json();
  } finally {
    timeout.clear();
  }
}

function extractOpenAiMessage(payload) {
  const firstChoice = payload?.choices?.[0];
  const text =
    firstChoice?.message?.content ??
    firstChoice?.text ??
    payload?.response ??
    payload?.output ??
    "";

  return String(text).trim();
}

async function runLocalOllama({ prompt }) {
  const model = process.env.MAGICKBOX_WORKER_MODEL ?? "glm4:9b";
  const endpoint = process.env.MAGICKBOX_OLLAMA_URL ?? "http://127.0.0.1:11434/api/generate";
  const payload = await postJson(endpoint, {
    model,
    prompt,
    stream: false,
    options: {
      temperature: 0.2,
      num_predict: 80,
    },
  });
  const output = String(payload.response ?? "").trim();

  if (!output) {
    throw new Error("local_ollama worker returned an empty response");
  }

  return {
    providerId: "local_ollama",
    adapter: "local_ollama",
    model,
    output,
    receipt: {
      endpoint_kind: "ollama_generate",
      model,
    },
  };
}

async function runFreeLlmApi({ prompt }) {
  const baseUrl = process.env.FREELLMAPI_BASE_URL ?? "http://127.0.0.1:11434/v1";
  const apiKey = process.env.FREELLMAPI_API_KEY ?? "ollama-local";
  const model =
    process.env.FREELLMAPI_MODEL ??
    process.env.MAGICKBOX_WORKER_MODEL ??
    "glm4:9b";
  const payload = await postJson(
    `${baseUrl.replace(/\/$/, "")}/chat/completions`,
    {
      model,
      messages: [
        {
          role: "system",
          content: "You are a concise Magick Box worker returning evaluation-safe output.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 80,
      stream: false,
    },
    {
      Authorization: `Bearer ${apiKey}`,
    },
  );
  const output = extractOpenAiMessage(payload);

  if (!output) {
    throw new Error("freellmapi worker returned an empty response");
  }

  return {
    providerId: "freellmapi",
    adapter: "freellmapi_openai_compatible",
    model,
    output,
    receipt: {
      endpoint_kind: "openai_chat_completions",
      base_url: baseUrl,
      model,
      routed_via: payload?.routed_via ?? payload?.provider ?? null,
    },
  };
}

function buildMagickAiRequest({ prompt, mode, jobId }) {
  return {
    type: mode,
    model: process.env.MAGICKAI_MODEL ?? process.env.MAGICKBOX_WORKER_MODEL ?? "glm4:9b",
    prompt,
    parameters: {
      temperature: 0.2,
      max_tokens: 80,
    },
    user_id: process.env.MAGICKAI_USER_ID ?? "local-icp-owner",
    session_id: `magickbox-icp-job-${jobId ?? "pending"}`,
  };
}

async function runMagickAiWorker({ prompt, mode, jobId }) {
  const request = buildMagickAiRequest({ prompt, mode, jobId });
  const workerUrl = process.env.MAGICKAI_WORKER_URL;
  const workerCommand = process.env.MAGICKAI_WORKER_COMMAND;

  if (workerUrl) {
    const payload = await postJson(workerUrl, request);
    const output = String(payload?.output ?? payload?.result ?? payload?.response ?? "").trim();

    if (!output) {
      throw new Error("magick_ai_worker URL returned an empty response");
    }

    return {
      providerId: "magick_ai_worker",
      adapter: "magick_ai_http_worker",
      model: request.model,
      output,
      receipt: {
        endpoint_kind: "magick_ai_http_worker",
        model: request.model,
        job_id: jobId,
      },
    };
  }

  if (workerCommand) {
    const result = spawnSync(workerCommand, {
      input: JSON.stringify(request),
      encoding: "utf8",
      shell: true,
      maxBuffer: 5 * 1024 * 1024,
    });

    if (result.status !== 0) {
      throw new Error(`magick_ai_worker command failed: ${result.stderr || result.stdout}`);
    }

    const payload = JSON.parse(result.stdout);
    const output = String(payload?.output ?? payload?.result ?? payload?.response ?? "").trim();

    if (!output) {
      throw new Error("magick_ai_worker command returned an empty response");
    }

    return {
      providerId: "magick_ai_worker",
      adapter: "magick_ai_command_worker",
      model: request.model,
      output,
      receipt: {
        endpoint_kind: "magick_ai_command_worker",
        model: request.model,
        job_id: jobId,
      },
    };
  }

  const local = await runLocalOllama({
    prompt: [
      "Respond as a MagickAI UniversalAgent-compatible worker.",
      `UniversalAgent request: ${JSON.stringify(request)}`,
    ].join("\n"),
  });

  return {
    providerId: "magick_ai_worker",
    adapter: "magick_ai_compatible_local_ollama",
    model: local.model,
    output: local.output,
    receipt: {
      endpoint_kind: "magick_ai_compatible_local_ollama",
      model: local.model,
      job_id: jobId,
      universal_process_request: request,
    },
  };
}

export async function runWorkerAdapter({ providerId, prompt, mode = "chat", jobId }) {
  if (providerId === "local_ollama") {
    return runLocalOllama({ prompt, mode, jobId });
  }

  if (providerId === "freellmapi") {
    return runFreeLlmApi({ prompt, mode, jobId });
  }

  if (providerId === "magick_ai_worker") {
    return runMagickAiWorker({ prompt, mode, jobId });
  }

  throw new Error(`Unsupported worker adapter: ${providerId}`);
}
