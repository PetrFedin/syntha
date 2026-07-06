#!/usr/bin/env bash
# Platform Core: smoke + e2e (dev:core должен слушать :3001).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=core-lib.sh
source "${ROOT}/scripts/core-lib.sh"
cd "${ROOT}"

if ! core_lib_pg_ready; then
  echo "FAIL: PostgreSQL :5433 недоступен." >&2
  echo "  1. Запустите OrbStack/Docker Desktop" >&2
  echo "  2. npm run db:core:up   (или npm run core:bootstrap)" >&2
  exit 1
fi

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
  echo "  Быстрый старт: npm run core:prep" >&2
  exit 1
fi

echo "→ warmup (cold compile messages/hub/legacy tails до Playwright)"
curl -fsS --max-time 120 "http://127.0.0.1:3001/platform" >/dev/null || true
curl -fsS --max-time 180 "http://127.0.0.1:3001/brand/core?pillar=development&collection=SS27" >/dev/null || true
for pillar in development sample_collection collection_order order_production comms; do
  curl -fsS --max-time 180 "http://127.0.0.1:3001/brand/core?pillar=${pillar}&collection=SS27" >/dev/null || true
done
curl -fsS --max-time 180 "http://127.0.0.1:3001/brand/pre-orders?collection=SS27" >/dev/null || true
curl -fsS --max-time 180 "http://127.0.0.1:3001/shop/b2b/tracking?collection=SS27" >/dev/null || true
curl -fsS --max-time 180 "http://127.0.0.1:3001/shop/core?pillar=sample_collection&collection=SS27" >/dev/null || true
curl -fsS --max-time 180 "http://127.0.0.1:3001/shop/b2b/matrix?collection=SS27&buyer=shop1" >/dev/null || true
curl -fsS --max-time 180 "http://127.0.0.1:3001/factory/production/core?pillar=development" >/dev/null || true
curl -fsS --max-time 180 "http://127.0.0.1:3001/factory/production/calendar?order=B2B-DEMO-SHOP1-SS27" >/dev/null || true
curl -fsS --max-time 180 "http://127.0.0.1:3001/factory/calendar?role=supplier&order=B2B-DEMO-SHOP1-SS27&orderId=B2B-DEMO-SHOP1-SS27" >/dev/null || true
curl -fsS --max-time 120 "http://127.0.0.1:3001/factory/production/messages" >/dev/null || true
curl -fsS --max-time 180 "http://127.0.0.1:3001/brand/messages?order=B2B-DEMO-SHOP1-SS27" >/dev/null || true
curl -fsS --max-time 180 "http://127.0.0.1:3001/factory/production/messages?order=B2B-DEMO-SHOP1-SS27" >/dev/null || true
curl -fsS --max-time 180 "http://127.0.0.1:3001/factory/supplier/messages?order=B2B-DEMO-SHOP1-SS27" >/dev/null || true
for legacy in ez-order ai-smart-order order-by-collection pre-order order-templates social-feed; do
  curl -fsS --max-time 120 "http://127.0.0.1:3001/shop/b2b/${legacy}?collection=SS27" >/dev/null || true
done

echo "→ health gate после прогрева (до 90s)"
for _ in $(seq 1 45); do
  if core_lib_http_ok "http://127.0.0.1:3001/api/workshop2/platform-core/health" '"coreMode":true'; then
    break
  fi
  sleep 2
done
core_lib_http_ok "http://127.0.0.1:3001/api/workshop2/platform-core/health" '"coreMode":true' || {
  echo "FAIL: dev:core не отвечает после warmup → npm run core:restart" >&2
  exit 1
}
sleep 2

echo "→ typecheck platform-core hot paths (w2 + order-subset)"
npm run typecheck:platform-core --prefix _ai-share/synth-1-full

echo "→ platform-core boundary"
npm run validate:platform-core-boundary

echo "→ e2e (Playwright, reuse dev:core на :3001 — без второго webServer)"
npm run test:e2e:core:external --prefix _ai-share/synth-1-full
echo "→ smoke (HTTP 200 + API, нужен dev:core на :3001)"
npm run smoke:core
