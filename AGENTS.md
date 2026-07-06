# Syntha — инструкции для людей и AI-агентов

**GitHub (канон):** https://github.com/PetrFedin/syntha  
**Renova** (ремонт, отдельный продукт): https://github.com/PetrFedin/renova — не часть Syntha.

Монорепозиторий Syntha / Fashion OS: бэкенд (Python), фронт и весь Next.js/Playwright **только** в **`_ai-share/synth-1-full`**, субмодуль **`tools/superpowers`** (методология агентов).

## Обязательный контур агента (Cursor)

В чате агента действует правило **`.cursor/rules/gsd-superpowers-mcp-monorepo.mdc`** (`alwaysApply: true`):

1. **GSD** — для крупных и неоднозначных задач: сначала карта/план/фазы через навыки в **`.cursor/skills/`** и **`.cursor/get-shit-done/`**, а не сразу большой дифф. Справка по командам: навык **`gsd-help`**.
2. **Superpowers** — уточнение цели, план, TDD где уместно; локально см. **`tools/superpowers/`** ([obra/superpowers](https://github.com/obra/superpowers)). В IDE: **`/add-plugin superpowers`**.
3. **MCP** — **`scripts/cursor-mcp-sync.py`** обновляет **`.cursor/mcp.json`** и **`~/.cursor/mcp.json`** (stdio + remote: Exa, Figma, Sentry, Linear, Semgrep при наличии CLI). Серверы **git** и **fetch** в конфиге вызываются через **`python3 -m mcp_server_*`** — нужны пакеты **`mcp-server-git`** и **`mcp-server-fetch`** (установка и вариант **`uvx`** — в **`docs/CURSOR_AGENT_TOOLKIT.md`**, раздел *Git / Fetch MCP*). Остальная настройка, agent-browser и OAuth для облачных MCP — там же.
4. **Стек контекста (rules / skills / intel / артефакты)** — правило **`.cursor/rules/agent-context-stack.mdc`** (в т.ч. **§5–6**: уроки без повторов, проактивные улучшения только от канона); краткий навык **`projects-context-stack`**. Intel: **`intel.enabled`** в **`.planning/config.json`**, индекс после **`/gsd-intel refresh`** в **`.planning/intel/`** (см. **`README.md`** там). После смысловых фаз — **`/gsd-extract_learnings`**.
5. **Платформенный стек (PostgreSQL, JWT, каталог, Firebase, платежи, AI)** — правило **`.cursor/rules/project.mdc`** (`alwaysApply: true`): канонические пути и «не изобретать параллельный стек».

## Документы

| Документ | Назначение |
|----------|------------|
| **`docs/CURSOR_AGENT_TOOLKIT.md`** | Установка, MCP, Superpowers, GSD, deep research |
| **`docs/SUBMODULES.md`** | Субмодули и `git submodule update` |
| **`docs/MIGRATION_FULL_CUTOVER.md`** | Канон full, отказ от субмодуля `synth-1/` |
| **`scripts/sql/README.md`** | Ручные SQL-патчи (prod): `inventory_sync_logs`, `attention_dismiss_json` — индекс и связи с кодом |

## Фронтенд

Разработка и CI — **`_ai-share/synth-1-full`** (см. **`_ai-share/synth-1-full/AGENTS.md`**). Из корня монорепо: **`npm run smoke`** — быстрый контрактный чек (`smoke:fast` во full); **`npm run lint`** — ESLint только с ошибками (`lint:errors`); **`npm run synth-1:clean`** — очистка `.next*` и кешей во full.

**Cursor / VS Code (корень воркспейса = `Projects`):** рекомендуемые расширения — **`.vscode/extensions.json`** (после clone: **Install Recommended Extensions**). Настройки ESLint / Prettier / Tailwind привязаны к **`_ai-share/synth-1-full`** — **`.vscode/settings.json`**. Быстрые задачи без поиска по NPM-панели — **`.vscode/tasks.json`** (**Run Task** → `synth-1-full: …`). **Error Lens:** для движка VS Code **1.105.x** в Cursor ставьте VSIX **≤ 3.26.0** (см. Open VSX); **3.27+** требуют **1.107+**.

**Запуск Next локально:** Node **20.x–23.x** (`_ai-share/synth-1-full/.nvmrc`). Dev: **`npm run dev:fast`** / **`npm run dev:fast:clean`**. Pre-PR dev-perf: **`npm run pre-pr:dev-perf`**. **Не параллелить** `dev:fast` и **`test:e2e:*`** — общий `.next`. Верификация: **`npm run verify:dev-perf`** (36 layout gates). Застрял :3123 — **`npm run stop:stale-dev`**. PR: **`bash scripts/create-dev-perf-pr.sh`** (нужен `gh auth login` или compare вручную).

**Platform Core (:3001)** — из **корня** монорепо. Запускайте **по одной строке** (без `#` в той же строке):

```bash
npm run core:bootstrap
npm run dev:core
npm run core:verify
```

Статус: **`npm run core:status`**. Перезапуск core dev: **`npm run core:restart`**. Если `:5433` / `:3001` уже заняты — скрипты это распознают (не ошибка, если сервисы живы). Env: **`_ai-share/synth-1-full/env.core.example`**. Застрял порт — **`npm run stop:stale-dev`**.

**Platform Core — экономия токенов:** **`_platform-core-split/platform-core/CURSOR-START-HERE.md`**, **`DEEP-AUDIT-PROGRESS.md`** (compact, не DEEP-AUDIT целиком), rule **`.cursor/rules/cursor-junior-dev.mdc`**, **`platform-core-scope.mdc`**, **`npm run validate:platform-core-boundary`**, очередь **`npm run planner:next`**. Канон UI: **`/platform`** — не Workshop2. После правки `.cursorignore` — **Reload Window** в Cursor.

**Git на macOS:** если `git` пишет про Xcode license — **`sudo xcodebuild -license`**, затем **`bash scripts/commit-home-dev-optimization.sh`**. Застрял e2e dev / битый `.next`: **`npm run stop:stale-dev`** (убивает :3123) или **`SYNTHA_STOP_MAIN_DEV=1 npm run stop:stale-dev`**.

## Bootstrap после clone

```bash
bash scripts/bootstrap-monorepo-dev.sh
```

Скрипт bootstrap вызывает **`scripts/normalize-gsd-cursor-paths.sh`** и **`scripts/cursor-mcp-sync.py`**. После **`npx get-shit-done-cc@latest --local --cursor`** при появлении абсолютных путей в ссылках запустите normalize снова. Контроль: **`bash scripts/check-gsd-cursor-paths.sh`** (в CI — job **GSD portable paths**).

GSD и субмодуль **`tools/superpowers`** должны быть на месте; MCP — перегенерировать **`python3 scripts/cursor-mcp-sync.py`** и включить серверы в настройках Cursor.

**P0 runtime (backend + PG + Ollama):**

```bash
bash scripts/bootstrap-monorepo-dev.sh   # npm + GSD + MCP
npm run bootstrap:p0                   # Poetry .venv + ml + analytics + core PG + ollama pull
npm run audit:rd-stack               # проверка пробелов
```

Без pull моделей (экономия времени/диска): **`npm run bootstrap:p0:fast`**. Backend: **`poetry run uvicorn app.main:app --reload --port 8000`**.
