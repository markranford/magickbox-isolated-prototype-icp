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

"$ICP_BIN" network stop >/dev/null 2>&1 || true

GATEWAY_PORT="$(awk '/gateway:/{seen=1} seen && /port:/{print $2; exit}' icp.yaml)"
if [[ -n "$GATEWAY_PORT" ]]; then
  PIDS="$(ss -ltnp 2>/dev/null | grep ":${GATEWAY_PORT} " | sed -n 's/.*pid=\([0-9]\+\).*/\1/p' | sort -u || true)"
  if [[ -n "$PIDS" ]]; then
    echo "Stopping stale local ICP process on port ${GATEWAY_PORT}: ${PIDS}"
    kill $PIDS 2>/dev/null || true
    sleep 1
  fi
fi

POCKET_IC_PIDS="$(pgrep -f '/icp-cli/pkg/network-launcher/.*/pocket-ic' || true)"
if [[ -n "$POCKET_IC_PIDS" ]]; then
  echo "Stopping stale local PocketIC processes: ${POCKET_IC_PIDS}"
  kill $POCKET_IC_PIDS 2>/dev/null || true
  sleep 1
  POCKET_IC_PIDS="$(pgrep -f '/icp-cli/pkg/network-launcher/.*/pocket-ic' || true)"
  if [[ -n "$POCKET_IC_PIDS" ]]; then
    kill -9 $POCKET_IC_PIDS 2>/dev/null || true
    sleep 1
  fi
fi

for attempt in 1 2 3 4 5; do
  rm -rf .icp/cache/networks/local && break
  echo "Local ICP cache cleanup attempt ${attempt} failed; retrying..." >&2
  sleep 1
done

if [[ -e .icp/cache/networks/local ]]; then
  echo "Unable to clean this project's local ICP cache. Stop local processes on port ${GATEWAY_PORT:-unknown} and retry." >&2
  exit 1
fi

"$ICP_BIN" network start -d
"$ICP_BIN" deploy --identity "$IDENTITY"

PRINCIPAL="$("$ICP_BIN" identity principal --identity "$IDENTITY")"
"$ICP_BIN" canister settings update magickbox_core --add-controller "$PRINCIPAL" -e local --identity "$IDENTITY" -f >/dev/null || true
"$ICP_BIN" canister settings update magickbox_media --add-controller "$PRINCIPAL" -e local --identity "$IDENTITY" -f >/dev/null || true
"$ICP_BIN" canister settings update frontend --add-controller "$PRINCIPAL" -e local --identity "$IDENTITY" -f >/dev/null || true

"$ICP_BIN" canister list -e local
"$ICP_BIN" canister status magickbox_core -e local | sed -n '1,18p'
"$ICP_BIN" canister status magickbox_media -e local | sed -n '1,18p'
"$ICP_BIN" canister status frontend -e local | sed -n '1,18p'
