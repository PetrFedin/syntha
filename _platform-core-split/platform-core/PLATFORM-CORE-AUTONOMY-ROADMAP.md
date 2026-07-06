# Platform Core — дорожная карта автономии

Дата: 2026-06-26  
Связано: [DOC-INDEX](./PLATFORM-CORE-DOC-INDEX.md), [ISOLATION-MAP](./PLATFORM-CORE-ISOLATION-MAP.md), [AUTONOMY-PLAN-2026-06-24.md](./PLATFORM-CORE-AUTONOMY-PLAN-2026-06-24.md)

## Цель автономии

Platform Core = **узкий продукт** внутри Next runtime:

- 4 роли × 5 столпов, golden path G1–G8
- Native UI (`/platform`, core cabinets), без legacy экранов в daily dev
- Данные через **ports/gateways**, не через `lib/production` UI
- Cursor: −70…90% токенов, один vertical slice за итерацию
- Опционально позже: extractable package / отдельный deploy — **не блокер** сейчас

## Два слоя правды

| Слой | Где | Статус |
|------|-----|--------|
| **Planning docs** (2024–06) | `features/platform-core/*` в текстах | Целевая схема именования |
| **Projects runtime** | `lib/platform-core-*` + `components/platform/` | **Рабочий канон** |

Не копировать дерево `features/platform-core` из Codex — там битые/расходящиеся файлы.  
Миграция имён — **фаза M** (ниже), не блокирует текущую разработку.

---

## Фазы

### ✅ A — Изоляция контекста (done)

- `.cursorignore` + negation core cabinets
- `validate-cursorignore-coverage`, `validate-platform-core-boundary`
- `dev:platform-core` (MODE + STRICT)
- ISOLATION-MAP, TOKEN-BUDGET, CURSOR-START-HERE
- Native href coerce, peer strips, middleware redirects
- Showroom: `components/platform/showroom/` — **0** import `components/shop/b2b`

**Критерий:** неделя работы только `:3001/platform` + core cabinets без @legacy в чате.

---

### 🔄 B — Доки ↔ runtime (in progress)

| Задача | Статус |
|--------|--------|
| PLATFORM-CORE-DOC-INDEX.md | ✅ |
| AUTONOMY-ROADMAP.md | ✅ |
| CONNECTIONS / CURSOR-RUN — баннер Projects truth | ✅ |
| AUTONOMY-PLAN — disclaimer в шапке | ⏳ |
| SOURCE-LINKS.md (карта symlink, без чтения папки) | ⏳ |
| Убрать `platform-core-workflow-contracts.ts` из CURSOR-START (файла нет) | ⏳ |

---

### ⏳ C — UI автономия (волны 1–2)

| # | Задача | Критерий done |
|---|--------|----------------|
| C1 | EMPTY27 + 3D panel → native showroom | нет `legacy-b2b-shims.tsx` |
| C2 | Оставшиеся `components/shop/b2b` в platform | boundary ban = 0 violations |
| C3 | Readiness `resolveHref` 100% native при MODE | audit e2e без `/shop/b2b` URL |
| C4 | PG-off graceful (503, не 500 throw) | core:verify без красных API |

---

### ⏳ D — Контракты в коде (workflow module)

Сейчас: ACTION-CONTRACTS + STAGE-GATES только в markdown.

| # | Deliverable | Путь (вариант A — без rename) |
|---|-------------|-------------------------------|
| D1 | `PlatformCoreActionContract` types | `lib/platform-core-workflow-contracts.ts` |
| D2 | Stage gate enum G1–G8 + guards | там же |
| D3 | Planner читает contracts из TS | `lib/platform-core-planner.ts` |
| D4 | Jest: action → required fields | `lib/__tests__/platform-core-workflow-contracts.test.ts` |

Docs остаются SoT для продуктовых формулировок; TS — для planner/audit automation.

---

### ⏳ E — Data автономия (ports hardening)

| # | Задача |
|---|--------|
| E1 | Все gateway routes → только ports (audit grep `lib/server/workshop2` в api/platform-core) |
| E2 | Cart write native (wave 5 ISOLATION-MAP) |
| E3 | Golden e2e path без legacy URL |
| E4 | `core:bootstrap` + PG :5433 в CI smoke |

---

### ⏳ F — Физическая автономия (optional, позже)

Не «скопировать synth-1-full», а:

```text
packages/platform-core/     # domain + adapters (extract)
apps/platform-core-web/     # thin Next shell — или текущий synth-1-full route group
```

Или monorepo workspace `@syntha/platform-core` с re-export из `lib/platform-core-*`.

**Trigger:** когда C+D+E green + product sign-off.

---

### ⏳ M — Align naming `features/platform-core` (optional)

Только если нужно совпадение с legacy docs:

1. **M1:** `src/features/platform-core/index.ts` — re-export barrel из `lib/platform-core-*`
2. **M2:** перенос `readiness-sections`, `gateways`, `ports` под `features/...`
3. **M3:** `lib/platform-core-*` → thin re-export (deprecation)
4. **M4:** обновить DOC-INDEX «факт = features»

**Риск:** большой diff, Codex drift. **Рекомендация:** отложить до F; до тех пор DOC-INDEX = истина.

---

## Еженедельный ритм (автономный режим)

```bash
# Понедельник / старт задачи
npm run core:status
npm run validate:cursorignore-coverage
npm run validate:platform-core-boundary

# Daily dev
npm run stop:stale-dev && npm run dev:platform-core

# Перед PR
npm run audit:platform-core-ui    # если UI
npm run core:verify               # если infra готова
```

**Чат:** role × pillar + якорный файл + «strict, без legacy».

---

## Definition of Done (автономная ячейка)

- [ ] ACTION-CONTRACT + STAGE-GATE задокументированы
- [ ] UI в `components/platform/`, href через `platformCoreUiHref`
- [ ] Нет import `lib/production`, `lib/b2b`, `components/shop/b2b` (кроме временного shim)
- [ ] Readiness section обновлён (`*-audit.ts`)
- [ ] boundary + cursorignore coverage OK
- [ ] Ручной smoke `:3001` на ячейке

---

## Backlog приоритет (Q3 2026)

1. **C1** — showroom shims  
2. **D1–D2** — workflow contracts TS  
3. **E3** — golden e2e  
4. **B** — дочистка doc drift (AUTONOMY-PLAN, CURSOR-RUN)  
5. **M** — только по явному решению  

---

*При завершении фазы — отметить в ISOLATION-MAP §4 и `/gsd-extract_learnings`.*
