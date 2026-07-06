# Ollama eval report

Model: `gpt-oss:20b`
Base: `http://127.0.0.1:11434`
Exit: 0

## Output
```
warning: No `requires-python` value found in the workspace. Defaulting to `>=3.14`.
============================= test session starts ==============================
platform darwin -- Python 3.14.2, pytest-9.0.2, pluggy-1.6.0 -- /Library/Frameworks/Python.framework/Versions/3.14/bin/python3
cachedir: .pytest_cache
rootdir: /Users/petr/Projects
configfile: pyproject.toml
plugins: anyio-4.12.1, asyncio-1.3.0, cov-7.0.0
asyncio: mode=Mode.AUTO, debug=False, asyncio_default_fixture_loop_scope=None, asyncio_default_test_loop_scope=function
collecting ... collected 3 items

tests/eval/test_agent_ollama_eval.py::test_risk_agent_ollama_smoke PASSED [ 33%]
tests/eval/test_agent_ollama_eval.py::test_order_anomaly_ollama_smoke PASSED [ 66%]
tests/eval/test_agent_ollama_eval.py::test_quota_agent_ollama_json_smoke PASSED [100%]

======================== 3 passed in 100.67s (0:01:40) =========================
```
