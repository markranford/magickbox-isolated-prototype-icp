import type { CreationMode } from "../data/content";

export type BrowserWorkerRequest = {
  providerId: string;
  mode: CreationMode | "chat";
  jobId: string;
  prompt: string;
};

export type BrowserWorkerExecution = {
  providerId: string;
  adapter: string;
  model: string;
  output: string;
  mimeType: string;
  receipt: Record<string, unknown>;
};

type RawWorkerExecution = {
  providerId?: unknown;
  adapter?: unknown;
  model?: unknown;
  output?: unknown;
  mimeType?: unknown;
  receipt?: unknown;
};

const defaultWorkerUrl = "http://127.0.0.1:8788/execute";

function configuredWorkerUrl() {
  const fromVite = import.meta.env.VITE_MAGICKBOX_BROWSER_WORKER_URL;
  const fromStorage =
    typeof localStorage === "undefined"
      ? null
      : localStorage.getItem("magickbox.browserWorkerUrl.v1");

  return (fromStorage || fromVite || defaultWorkerUrl).trim();
}

export function getBrowserWorkerUrl() {
  const url = configuredWorkerUrl();
  return url.length > 0 ? url : defaultWorkerUrl;
}

export function getBrowserWorkerHealthUrl() {
  const workerUrl = new URL(getBrowserWorkerUrl());
  workerUrl.pathname = workerUrl.pathname.replace(/\/execute\/?$/, "/health");
  workerUrl.search = "";
  workerUrl.hash = "";

  return workerUrl.toString();
}

export function buildBrowserWorkerRequest({
  providerId,
  mode,
  jobId,
  prompt,
}: {
  providerId: string;
  mode: CreationMode | "chat";
  jobId: bigint | number | string;
  prompt: string;
}): BrowserWorkerRequest {
  return {
    providerId,
    mode,
    jobId: String(jobId),
    prompt,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeBrowserWorkerExecution(
  payload: RawWorkerExecution,
): BrowserWorkerExecution {
  const output = String(payload.output ?? "").trim();

  if (!output) {
    throw new Error("Worker returned empty output");
  }

  return {
    providerId: String(payload.providerId ?? "unknown_worker"),
    adapter: String(payload.adapter ?? "unknown_adapter"),
    model: String(payload.model ?? "unknown_model"),
    output,
    mimeType: String(payload.mimeType ?? "text/plain"),
    receipt: asRecord(payload.receipt),
  };
}

export async function assertBrowserWorkerAvailable() {
  const response = await fetch(getBrowserWorkerHealthUrl(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Worker service health check failed with ${response.status}`);
  }
}

export async function executeBrowserWorker(request: BrowserWorkerRequest) {
  const response = await fetch(getBrowserWorkerUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Worker service failed with ${response.status}`);
  }

  const payload = text ? JSON.parse(text) : {};
  return normalizeBrowserWorkerExecution(payload);
}
