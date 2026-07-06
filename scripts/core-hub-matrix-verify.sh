#!/usr/bin/env bash
# Platform Core hub matrix 5×4 live smoke (wave YY core-240, routes from wave YQ).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=core-lib.sh
source "${ROOT}/scripts/core-lib.sh"
cd "${ROOT}"

if ! core_lib_core_dev_ready; then
  if core_lib_port_listening 3001; then
    echo "→ :3001 слушает, ждём coreMode health (до 90s)…"
    for _ in $(seq 1 45); do
      core_lib_core_dev_ready && break
      sleep 2
    done
  fi
fi

if ! core_lib_core_dev_ready; then
  if core_lib_port_listening 3001; then
    echo "FAIL: :3001 занят не-core dev → npm run stop:stale-dev && npm run dev:core" >&2
  else
    echo "FAIL: dev:core не отвечает на :3001 → npm run dev:core" >&2
  fi
  exit 1
fi

echo "→ warmup hub /platform"
curl -fsS --max-time 120 "http://127.0.0.1:3001/platform" >/dev/null || true

echo "→ hub matrix live smoke (core-240-wave-yy-hub-live-smoke, 14 active cells)"
npm run test:e2e:core:hub-matrix --prefix _ai-share/synth-1-full
