import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const env = process.env;
const outDir = resolve("public");
const outPath = resolve(outDir, "env.json");

function firstEnv(...names) {
  for (const name of names) {
    const value = env[name];
    if (value && value !== "undefined") {
      return value;
    }
  }

  return "undefined";
}

const config = {
  backend_host: firstEnv("BACKEND_HOST", "ICP_HOST", "CANISTER_BACKEND_HOST"),
  backend_canister_id: firstEnv(
    "CANISTER_ID_BACKEND",
    "BACKEND_CANISTER_ID",
    "PUBLIC_CANISTER_ID_BACKEND",
    "PUBLIC_CANISTER_ID:backend",
  ),
  project_id: firstEnv("CAFFEINE_PROJECT_ID", "PROJECT_ID"),
  ii_derivation_origin: firstEnv("II_DERIVATION_ORIGIN", "II_URL"),
  storage_gateway_url: firstEnv("STORAGE_GATEWAY_URL"),
};

await mkdir(outDir, { recursive: true });
await writeFile(outPath, `${JSON.stringify(config, null, 2)}\n`);

console.log(`Wrote Caffeine runtime env to ${outPath}`);
