#!/usr/bin/env bash
# Live Ollama eval: risk / order_anomaly / quota (prefers qwen3).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
REPORT="${ROOT}/.planning/intel/ollama-eval-report.md"
OLLAMA_BASE="${OLLAMA_BASE_URL:-http://127.0.0.1:11434}"

pick_model() {
  python3 - <<'PY'
import json, os, urllib.request
base = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
prefer = os.environ.get("OLLAMA_EVAL_MODEL", "qwen3")
try:
    with urllib.request.urlopen(f"{base}/api/tags", timeout=3) as r:
        data = json.load(r)
except Exception:
    print("")
    raise SystemExit(0)
names = [m.get("name", "") for m in data.get("models", []) if m.get("name")]

def model_base(name: str) -> str:
    return name.split(":")[0] if ":" in name else name

for cand in (prefer, "qwen3:latest", "qwen3", "llama3.3", "llama3.3:latest", "deepseek-r1", "gpt-oss:20b", "gpt-oss"):
    for n in names:
        if n == cand or model_base(n) == model_base(cand):
            print(n)
            raise SystemExit(0)
if names:
    print(names[0])
PY
}

if ! curl -fsS --max-time 3 "${OLLAMA_BASE}/api/tags" >/dev/null 2>&1; then
  echo "Ollama not reachable at ${OLLAMA_BASE}" >&2
  echo "Start: ollama serve && ollama pull qwen3" >&2
  mkdir -p "$(dirname "$REPORT")"
  cat >"$REPORT" <<EOF
# Ollama eval report

Status: **skipped** — Ollama not running on ${OLLAMA_BASE}

Run: \`ollama serve\` and \`ollama pull qwen3\`, then \`npm run agent:eval:ollama\`
EOF
  exit 0
fi

MODEL="$(OLLAMA_BASE_URL="$OLLAMA_BASE" pick_model)"
if [[ -z "$MODEL" ]]; then
  echo "No Ollama models installed. Run: ollama pull qwen3" >&2
  exit 1
fi

echo "=== Ollama eval model: ${MODEL} ==="
export OLLAMA_EVAL_MODEL="$MODEL"
export OLLAMA_MODEL="$MODEL"
export AI_TIMEOUT="${AI_TIMEOUT:-180}"

set +e
OUT="$(uv run pytest tests/eval/test_agent_ollama_eval.py -v -m integration 2>&1)"
CODE=$?
set -e

echo "$OUT"
mkdir -p "$(dirname "$REPORT")"
{
  echo "# Ollama eval report"
  echo ""
  echo "Model: \`${MODEL}\`"
  echo "Base: \`${OLLAMA_BASE}\`"
  echo "Exit: ${CODE}"
  echo ""
  echo "## Output"
  echo '```'
  echo "$OUT"
  echo '```'
} >"$REPORT"

echo "Report: .planning/intel/ollama-eval-report.md"
exit "$CODE"
