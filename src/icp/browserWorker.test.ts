import { describe, expect, it } from "vitest";
import {
  buildBrowserWorkerRequest,
  getBrowserWorkerUrl,
  normalizeBrowserWorkerExecution,
} from "./browserWorker";

describe("browser worker execution client", () => {
  it("defaults to the isolated local worker service endpoint", () => {
    expect(getBrowserWorkerUrl()).toBe("http://127.0.0.1:8788/execute");
  });

  it("builds a worker request without embedding secrets or production endpoints", () => {
    const request = buildBrowserWorkerRequest({
      providerId: "local_ollama",
      mode: "chat",
      jobId: 42n,
      prompt: "Generate a launch image prompt",
    });

    expect(request).toEqual({
      providerId: "local_ollama",
      mode: "chat",
      jobId: "42",
      prompt: "Generate a launch image prompt",
    });
    expect(JSON.stringify(request)).not.toContain("magickbox.ai");
    expect(JSON.stringify(request)).not.toContain("aws");
    expect(JSON.stringify(request)).not.toContain("stripe");
  });

  it("normalizes a valid worker response into ICP-storable output", () => {
    const execution = normalizeBrowserWorkerExecution({
      providerId: "local_ollama",
      adapter: "local_ollama",
      model: "glm4:9b",
      output: "Generated content",
      receipt: { endpoint_kind: "ollama_generate" },
    });

    expect(execution.output).toBe("Generated content");
    expect(execution.mimeType).toBe("text/plain");
    expect(execution.receipt.endpoint_kind).toBe("ollama_generate");
  });

  it("rejects empty worker output", () => {
    expect(() =>
      normalizeBrowserWorkerExecution({
        providerId: "local_ollama",
        adapter: "local_ollama",
        model: "glm4:9b",
        output: "   ",
        receipt: {},
      }),
    ).toThrow("empty output");
  });
});
