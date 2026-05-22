#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ICP_BIN="${ICP_BIN:-/home/mark/.cargo/bin/icp}"
if [[ ! -x "$ICP_BIN" ]]; then
  ICP_BIN="icp"
fi

IDENTITY="${1:-magickbox-local-prototype}"
SEED_DIR=".icp/cache/local-secrets"
mkdir -p "$SEED_DIR"

if [[ ! -f dist/index.html ]]; then
  echo "Missing dist/index.html. Run npm run build from Windows before deploying assets to ICP." >&2
  exit 1
fi

if ! "$ICP_BIN" identity list | grep -q "  ${IDENTITY} "; then
  "$ICP_BIN" identity new "$IDENTITY" --storage plaintext --output-seed "$SEED_DIR/${IDENTITY}.seed" >/dev/null
fi

GATEWAY_PORT="$(awk '/gateway:/{seen=1} seen && /port:/{print $2; exit}' icp.yaml)"
if [[ -n "$GATEWAY_PORT" ]]; then
  PIDS="$(ss -ltnp 2>/dev/null | grep ":${GATEWAY_PORT} " | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | sort -u || true)"
  if [[ -n "$PIDS" ]]; then
    echo "Stopping stale local ICP process on port ${GATEWAY_PORT}: ${PIDS}"
    kill $PIDS 2>/dev/null || true
    sleep 1
  fi
fi

rm -rf .icp/cache/networks/local

"$ICP_BIN" network start -d
"$ICP_BIN" deploy --identity "$IDENTITY"

PRINCIPAL="$("$ICP_BIN" identity principal --identity "$IDENTITY")"
"$ICP_BIN" canister settings update magickbox_core --add-controller "$PRINCIPAL" -e local --identity "$IDENTITY" -f >/dev/null || true
"$ICP_BIN" canister settings update frontend --add-controller "$PRINCIPAL" -e local --identity "$IDENTITY" -f >/dev/null || true

"$ICP_BIN" canister list -e local
"$ICP_BIN" canister status magickbox_core -e local | sed -n '1,18p'
"$ICP_BIN" canister status frontend -e local | sed -n '1,18p'
