#!/usr/bin/env node
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { runWorkerAdapter } from "./lib/worker-adapters.mjs";

const port = Number(process.env.MAGICKBOX_WORKER_PORT ?? 8788);
const host = process.env.MAGICKBOX_WORKER_HOST ?? "127.0.0.1";

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Accept,Authorization",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

function normalizeRequest(payload) {
  const providerId = String(payload.providerId ?? "");
  const prompt = String(payload.prompt ?? "");

  if (!providerId) {
    throw new Error("providerId is required");
  }

  if (!prompt.trim()) {
    throw new Error("prompt is required");
  }

  return {
    providerId,
    prompt,
    mode: String(payload.mode ?? "chat"),
    jobId: payload.jobId ? String(payload.jobId) : undefined,
  };
}

export function createLocalWorkerServer() {
  return createServer(async (request, response) => {
    try {
      if (request.method === "OPTIONS") {
        sendJson(response, 204, {});
        return;
      }

      const url = new URL(request.url ?? "/", `http://${host}:${port}`);

      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, {
          status: "ok",
          service: "magickbox-local-worker",
          model:
            process.env.MAGICKBOX_WORKER_MODEL ??
            process.env.FREELLMAPI_MODEL ??
            process.env.MAGICKAI_MODEL ??
            "glm4:9b",
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/execute") {
        const execution = await runWorkerAdapter(normalizeRequest(await readJson(request)));
        sendJson(response, 200, {
          providerId: execution.providerId,
          adapter: execution.adapter,
          model: execution.model,
          output: execution.output,
          mimeType: "text/plain",
          receipt: execution.receipt,
        });
        return;
      }

      sendJson(response, 404, { error: "not_found" });
    } catch (error) {
      sendJson(response, 500, {
        error: error instanceof Error ? error.message : "worker_failed",
      });
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createLocalWorkerServer();
  server.listen(port, host, () => {
    console.log(`Magick Box local worker listening on http://${host}:${port}`);
  });
}
