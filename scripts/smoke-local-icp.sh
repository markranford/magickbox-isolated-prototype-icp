#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

IDENTITY="${1:-magickbox-local-prototype}"
ICP_BIN="${ICP_BIN:-/home/mark/.cargo/bin/icp}"
if [[ ! -x "$ICP_BIN" ]]; then
  ICP_BIN="icp"
fi
ARGS_DIR=".icp/cache/call-args"
mkdir -p "$ARGS_DIR"

cat > "$ARGS_DIR/register.did" <<'ARGS'
("Mark", opt "mark@stratagility.com")
ARGS

cat > "$ARGS_DIR/paid-job.did" <<'ARGS'
("video", "paid_managed", "Create a long cinematic launch video", "sha256-demo-paid-managed", 80)
ARGS

cat > "$ARGS_DIR/free-job.did" <<'ARGS'
("chat", "freellmapi", "Summarize the Magick Box ICP plan", "sha256-demo-freellmapi", 0)
ARGS

echo "== Identity =="
"$ICP_BIN" identity principal --identity "$IDENTITY"

echo "== Register profile =="
"$ICP_BIN" canister call magickbox_core register_profile --args-file "$ARGS_DIR/register.did" -e local --identity "$IDENTITY"

echo "== Profile =="
"$ICP_BIN" canister call magickbox_core get_my_profile '()' -e local --identity "$IDENTITY" --query

echo "== Insufficient paid job =="
"$ICP_BIN" canister call magickbox_core create_generation_job --args-file "$ARGS_DIR/paid-job.did" -e local --identity "$IDENTITY"

echo "== Free fallback job =="
"$ICP_BIN" canister call magickbox_core create_generation_job --args-file "$ARGS_DIR/free-job.did" -e local --identity "$IDENTITY"

echo "== Jobs =="
"$ICP_BIN" canister call magickbox_core list_my_jobs '()' -e local --identity "$IDENTITY" --query

echo "== Audit =="
"$ICP_BIN" canister call magickbox_core list_audit_events '()' -e local --identity "$IDENTITY" --query
