# Platform Core — карта изоляции и экономии токенов

Дата: 2026-06-26  
**Один документ:** что оставить · что отсечь · как не жрать токены.  
Полная denylist — `Projects/.cursorignore`. Краткий token cheat sheet — `PLATFORM-CORE-TOKEN-BUDGET.md`.

---

## 1. Три кольца (главное различие)

| Кольцо | Смысл | Для вас в браузере | Для Cursor |
|--------|--------|-------------------|------------|
| **A — Продукт** | Native UI, hub, кабинеты | ✅ единственное, что открываете | ✅ allowlist |
| **B — Данные** | Storage + API за ports | невидимо (нет legacy экранов) | ports/gateways только точечно |
| **C — Legacy** | Full-app, Workshop2 UI, B2B long-tail | ❌ strict режет URL | ❌ denylist, не @-mention |

```
A: /platform → /brand/core · /shop/core · factory core · order/article detail
B: /api/platform-core/* · /api/workshop2/* (bridge) · lib/platform-core-ports/*
C: /shop/b2b/matrix · /brand/production/workshop2 · components/brand/production/*
```

**Не путать:** удалить `lib/server/workshop2-*` или `lib/production/` — **сломает B**, не «изоляция».  
**Не путать:** папки `features/platform-core/` **нет** — канон кода ниже.

---

## 2. Что ОСТАВЛЯЕМ (allowlist)

### A — Продукт (UI + routes)

| Зона | Пути (от корня `Projects`) |
|------|------------------------------|
| Hub | `_ai-share/synth-1-full/src/app/platform/` |
| UI | `_ai-share/synth-1-full/src/components/platform/` (+ `peers/`, `showroom/` native widgets) |
| Brand | `src/app/brand/core/`, `messages/`, `b2b-orders/` (detail) |
| Shop | `src/app/shop/core/`, `messages/`, `b2b/orders/` |
| Factory | `src/app/factory/production/core|messages|dossier/`, `supplier/core|messages/` |

Навигация: **роль → столп → раздел → табы** (`?pillar=…`, без `?collection=SS27` в URL).  
Coerce: `lib/platform-core-ui-href.ts` → `platformCoreUiHref()` перед каждым `<Link>`.

### B — Данные (domain + API, без legacy UI)

| Зона | Пути |
|------|------|
| Domain | `src/lib/platform-core-*.ts`, `readiness-sections/`, `gateways/` |
| Ports | `src/lib/platform-core-ports/*` (~12+ файлов: dossier, b2b-orders, cart bridge, comms, …) |
| Server | `src/lib/server/platform-core-*.ts` |
| API | `src/app/api/platform-core/**`, `api/dev/platform-core/**` |
| Bridge | `src/app/api/workshop2/platform-core/**` — **не UI**, только данные |

Импорт из `lib/production/`, `lib/b2b/`, **`components/shop/b2b/`** в **`components/platform/**` запрещён** — только ports + native showroom (boundary check, без исключений).

### Доки и правила

| Зона | Пути |
|------|------|
| Planning | `_platform-core-split/platform-core/*.md` (**не** DEEP-AUDIT целиком) |
| Rules | `.cursor/rules/platform-core-scope.mdc` |
| Escape catalog | `_archive/platform-core-legacy-escapes/` (README, не импорт) |

---

## 3. Что ОТСЕКАЕМ

### Для Cursor (`.cursorignore` — не индексировать)

| Категория | Пути |
|-----------|------|
| W2 / production | `lib/production/`, `app/brand/production/`, `components/brand/production/` |
| B2B full-app | `app/shop/b2b/` (кроме `orders/` — открыто через `!`) |
| Role apps bulk | `app/brand/`, `app/shop/`, `app/factory/` с **исключениями** core/messages/orders |
| Legacy libs | `lib/b2b/`, `lib/fashion/`, `lib/order/`, `lib/communications/`, `lib/platform/`, `lib/brand/`, `lib/routes.ts` |
| Repos | `lib/server/workshop2-*repository.ts` |
| E2E / planning | `e2e/`, `.planning/`, `DEEP-AUDIT-*.md`, `legacy-rest/`, `live-source/` |
| Монстры | § в `synth-1-full/.cursorignore` (800+ строк) |

После правок ignore → **Reload Window** в Cursor.

### Для пользователя (runtime strict)

| Режим | Поведение |
|-------|-----------|
| `dev:core` (MODE=1) | Узкий sidebar, native coerce в ссылках |
| `dev:platform-core` (MODE+STRICT) | Legacy page URL → `/platform?archived=1&from=…` |
| Исключения strict | core cabinets, `/platform`, order detail, dossier, `/api/*` |

Legacy **не удаляем** — иначе сломаются ports и cart bridge.

---

## 4. Волны — статус на 2026-06-26

| # | Задача | Статус | Артефакт |
|---|--------|--------|----------|
| 0 | MODE=1, daily `dev:platform-core` | ✅ | `scripts/core-dev-platform-core.sh` |
| 1 | Native href в `components/platform` | ✅ mostly | `platform-core-native-href.ts`, `platformCoreUiHref`, peer strips |
| 1b | Audit `rewriteHrefForDemo` → coerce | ✅ | `platform-core-hub-matrix.ts` |
| 2 | Readiness / audit не ведут в `/shop/b2b` | ✅ при MODE | coerce на legacy ROUTES |
| 3 | STRICT + middleware | ✅ | `middleware.ts`, `platform-core-strict-routes.ts` |
| 2+ | `/brand/b2b-orders` list → core CO | ✅ | middleware redirect |
| 4 | Garbage register | ✅ lite | `PLATFORM-CORE-GARBAGE-REGISTER.md` |
| B | DOC-INDEX + AUTONOMY-ROADMAP + doc→код reconcile | ✅ | `PLATFORM-CORE-DOC-INDEX.md` |
| 1− | Showroom widgets — **0** import `components/shop/b2b` | ✅ | `components/platform/showroom/` |
| 1− | Кнопки «Legacy checkout», `pc=1`, «Полный экран» | ✅ | grep `components/platform` — не найдено |
| 1c | Embedded workspaces mfr/sup (op+comms+dev) | ✅ | `workspaces/PlatformCoreRolePillarWorkspace` |
| 1d | PG-off silent demo (no bootstrap banners) | ✅ | readPath LS + `pillar-snapshot` resilient |
| 1e | `RoleCoreCabinetHub` split insight cards | ✅ | `RoleCorePillarInsightCards.tsx` (~640+150 строк) |
| 5 | Native cart write + golden e2e без legacy URL | ⏳ | wave 5 / PG bootstrap |

---

## 5. Экономия токенов (−70…90%)

### Оценка

| Дисциплина | Эффект |
|------------|--------|
| `.cursorignore` + allowlist | ~85% файлов вне индекса |
| grep → read 50–150 строк | −70% даже при слабой дисциплине |
| без @legacy, без «обзор всего репо» | до −90% |

### Агент — ✅ делать

- Первым: **этот файл** + `CURSOR-START-HERE.md`
- В запросе: **роль × pillar** + один якорный файл
- `grep` → `read` с `offset`/`limit`; файлы **>200 строк — не целиком**
- Readiness: **один** `{role}-audit.ts`, не весь каталог
- Hub matrix: grep символ в `platform-core-hub-matrix.ts`, не ~650 строк
- Проверка: `npm run validate:cursorignore-coverage` + `validate:platform-core-boundary`

### Агент — ❌ не делать

- `DEEP-AUDIT-2026-06-21.md` целиком (14k+ строк)
- `explore` / обход всего `src/`
- Параллельно: `lib/routes.ts`, `components/brand/production/`, `e2e/`
- Full build / e2e без явного запроса
- Копировать дерево `features/platform-core/` из Codex — **его нет**

### Человек

1. Корень workspace = **`Projects`**, не только `synth-1-full`
2. Dev: **`npm run dev:platform-core`** → `:3001/platform` (не `:3123` full app)
3. Новый чат на **одну ячейку** 4×5; первое сообщение: role × pillar, файл, «strict, без legacy»
4. Один vertical slice за итерацию
5. PG: `npm run db:core:up && npm run core:bootstrap` когда нужен live audit

---

## 6. Порядок открытия документов

1. `PLATFORM-CORE-DOC-INDEX.md` — полный индекс + doc→код
2. `CURSOR-START-HERE.md`
3. **`PLATFORM-CORE-ISOLATION-MAP.md`**
4. `PLATFORM-CORE-TOKEN-BUDGET.md` (cheat sheet)
5. `PLATFORM-CORE-AUTONOMY-ROADMAP.md` — фазы автономии
6. `PLATFORM-CORE-ACTION-CONTRACTS.md` / `STAGE-GATES` — по задаче
7. `DEEP-AUDIT-PROGRESS.md` — компактный статус P0/P1 (~120 строк)
8. `DEEP-AUDIT` — **только §** нужной ячейки, если compact specs не хватает

---

## 7. Критерий «изоляция работает»

- [ ] Неделя работы только с `:3001/platform` и core cabinets
- [x] В `components/platform` нет голых `href` на `/shop/b2b/*` без `platformCoreUiHref` (волна 1b)
- [x] Showroom widgets: native `components/platform/showroom/` — **0** import `components/shop/b2b`
- [x] `dev:platform-core` + STRICT в скрипте
- [x] `validate:platform-core-boundary` green
- [ ] E2E golden path без legacy URL (wave 5)
- [ ] PG :5433 ON для live readiness (infra, не изоляция)

---

## 8. Быстрые команды

```bash
cd Projects
npm run stop:stale-dev              # освободить :3001
npm run db:core:up && npm run core:bootstrap
npm run dev:platform-core           # MODE + STRICT
npm run validate:cursorignore-coverage
npm run validate:platform-core-boundary
```

Bookmark: `http://127.0.0.1:3001/platform`
