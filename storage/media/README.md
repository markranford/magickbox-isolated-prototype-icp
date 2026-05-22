# Local Media Store

The advanced local ICP smoke writes generated worker outputs here as content-addressed artifacts.

- `sha256/` stores generated payloads by content hash and is ignored by Git.
- `index.jsonl` records local storage manifests and is ignored by Git.
- The core canister stores only the durable manifest metadata: provider, URI, hash, MIME type, byte count, owner, job id, and attaching principal.
