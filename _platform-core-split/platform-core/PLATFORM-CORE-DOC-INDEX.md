# Platform Core — индекс документов и связь с кодом

**Runtime:** `_ai-share/synth-1-full`  
**Planning / канон:** `_platform-core-split/platform-core/`  
**Корень Cursor:** `Projects` (не только `synth-1-full`)

> **Projects truth (2026-06-26):** папки `src/features/platform-core/` **нет**.  
> Домен и workflow живут в `src/lib/platform-core-*`; UI — `src/components/platform/`; мост к legacy — `src/lib/platform-core-ports/`.  
> Старые доки с `features/platform-core/*` — **целевая схема**; см. [`PLATFORM-CORE-AUTONOMY-ROADMAP.md`](./PLATFORM-CORE-AUTONOMY-ROADMAP.md) фаза M.

---

## Обязательно (каждая задача)

| # | Документ | Зачем |
|---|----------|--------|
| 0 | **TOKEN-BUDGET** + **ISOLATION-MAP** | Allowlist / denylist, −70…90% токенов |
| 1 | [CURSOR-START-HERE.md](./CURSOR-START-HERE.md) | Точка входа: роли, столпы, golden path, запреты |
| 2 | [PLATFORM-CORE-CURSOR-RUN.md](./PLATFORM-CORE-CURSOR-RUN.md) | `dev:platform-core`, scope / вне scope |
| 3 | [PLATFORM-CORE-ISOLATION-MAP.md](./PLATFORM-CORE-ISOLATION-MAP.md) | Кольца A/B/C, strict, ports, волны |
| 4 | [PLATFORM-CORE-TOKEN-BUDGET.md](./PLATFORM-CORE-TOKEN-BUDGET.md) | Cheat sheet allowlist |
| 5 | [CONNECTIONS.md](./CONNECTIONS.md) | Границы ports, что вырезано из default scope |
| 6 | [PLATFORM-CORE-ACTION-CONTRACTS.md](./PLATFORM-CORE-ACTION-CONTRACTS.md) | Любая кнопка/действие — контракт **до** кода |
| 7 | [PLATFORM-CORE-STAGE-GATES.md](./PLATFORM-CORE-STAGE-GATES.md) | G1–G8: article → closeout |

**Код (канон Projects, не документ):**

```text
src/app/platform/*
src/app/api/platform-core/*
src/components/platform/          (+ peers/, showroom/)
src/lib/platform-core-*.ts
src/lib/platform-core-readiness-sections/
src/lib/platform-core-gateways/
src/lib/platform-core-ports/
src/lib/server/platform-core-*.ts
```

Core cabinets (тонкие page): `app/{brand,shop,factory}/…/core/page.tsx` → `PlatformCoreCabinetPage`.

---

## По типу задачи

| Задача | Документ |
|--------|----------|
| Поля, обязательные данные ячейки | [ROLE-PILLAR-FIELD-MATRIX.md](./PLATFORM-CORE-ROLE-PILLAR-FIELD-MATRIX.md), [ROLE-PILLAR-MATRIX.md](./ROLE-PILLAR-MATRIX.md) |
| Вкладки, без дублей | [TAB-RULES.md](./PLATFORM-CORE-TAB-RULES.md) |
| UI: тихий, без простыней | [UX-DETAIL-SPEC.md](./PLATFORM-CORE-UX-DETAIL-SPEC.md), [UI-STANDARD.md](./PLATFORM-CORE-UI-STANDARD.md) |
| BOM, routing, QC, capacity | [PRODUCTION-DEPTH-SPEC.md](./PLATFORM-CORE-PRODUCTION-DEPTH-SPEC.md) |
| Исключения, SLA | [EXCEPTION-SLA-SPEC.md](./PLATFORM-CORE-EXCEPTION-SLA-SPEC.md) |
| РФ: ЭДО, 1С, маркировка | [RU-OPERATING-PACKET.md](./PLATFORM-CORE-RU-OPERATING-PACKET.md) |
| Автономия, legacy | [AUTONOMY-PLAN-2026-06-24.md](./PLATFORM-CORE-AUTONOMY-PLAN-2026-06-24.md), [AUTONOMY-ROADMAP.md](./PLATFORM-CORE-AUTONOMY-ROADMAP.md) |
| Идея из archive | [ARCHIVE-INTEGRATION-RULES.md](./PLATFORM-CORE-ARCHIVE-INTEGRATION-RULES.md) |
| Битые ссылки | [MISSING-OR-EXTERNAL-LINKS.md](./MISSING-OR-EXTERNAL-LINKS.md) |
| Workshop2 UI запрет | [NO-WORKSHOP2-UI.md](./PLATFORM-CORE-NO-WORKSHOP2-UI.md) |
| Redirect / мусор | [GARBAGE-REGISTER.md](./PLATFORM-CORE-GARBAGE-REGISTER.md) |

**Readiness / audit (код, не DEEP-AUDIT):**

```text
src/lib/platform-core-readiness-audit.ts
src/lib/platform-core-readiness-sections/{brand|shop|manufacturer|supplier}-audit.ts  ← один файл за задачу
```

Action contracts / stage gates — **пока в markdown** (§6–7); runtime TS workflow-модуль — фаза M3 roadmap.

---

## Не открывать по умолчанию

| Документ / зона | Когда можно |
|-----------------|-------------|
| `DEEP-AUDIT-2026-06-21.md` (~14k) | Только § роли/столпа |
| `PERFORMANCE-UX-CLEANUP-*.md` | Рефактор монстров |
| `FOLDER-AUDIT-2026-06-24.md` | Аудит split |
| `live-source/` | Snapshot, не SoT |
| `legacy-rest/` | Явный запрос «миграция из archive» |
| `source-links/` (если есть) | Дубль runtime; не читать целиком |

---

## Порядок работы (чеклист)

```text
0. TOKEN-BUDGET + ISOLATION-MAP + этот индекс
1. CURSOR-START-HERE → роль × pillar
2. STAGE-GATES — этап golden path (G?)
3. ACTION-CONTRACTS — что делает действие
4. ROLE-PILLAR-FIELD-MATRIX — поля
5. TAB-RULES + UX/UI-STANDARD — если UI
6. Код: components/platform + lib/platform-core-* (+ ports)
7. npm run validate:cursorignore-coverage
   npm run validate:platform-core-boundary
   npm test -- --testPathPattern="platform-core-native-href|platform-core-strict-routes"  # по задаче
```

Спецконтуры: PRODUCTION-DEPTH / EXCEPTION-SLA / RU-OPERATING — только если задача про них.

---

## Связь «док → код» (Projects runtime)

| Документ | Целевая схема (старые доки) | **Факт Projects (2026-06-26)** |
|----------|----------------------------|--------------------------------|
| Action contracts | `features/.../workflow/action-contracts.ts` | `PLATFORM-CORE-ACTION-CONTRACTS.md` (+ planner items) |
| Stage gates | `features/.../workflow/*` | `PLATFORM-CORE-STAGE-GATES.md` |
| Role/pillar fields | `features/.../domain/roles-pillars.ts` | `lib/platform-core-hub-matrix.ts`, `lib/platform-core-demo-context.ts` |
| Routing native | `features/.../routing/native-workspace-hrefs.ts` | `lib/platform-core-native-href.ts`, `lib/platform-core-ui-href.ts`, `lib/platform-core-routes.ts` |
| Legacy hrefs (убирать) | `routing/platform-core-routes.ts` | `lib/platform-core-native-href.ts` + middleware strict |
| Readiness audit | `features/.../readiness/sections/*` | `lib/platform-core-readiness-sections/*-audit.ts` |
| Adapters / gateways | `features/.../adapters/*` | `lib/platform-core-gateways/*` |
| Data / ports | `features/.../server/ports/*` | `lib/platform-core-ports/*`, `lib/server/platform-core-*.ts` |
| UI hub / cabinets | — | `components/platform/*`, `app/platform/*` |

---

## Минимальный стек «сделать одну ячейку»

1. CURSOR-START-HERE.md  
2. ACTION-CONTRACTS.md  
3. STAGE-GATES.md  
4. ROLE-PILLAR-FIELD-MATRIX.md (§ вашей ячейки)  
5. ISOLATION-MAP + TOKEN-BUDGET  
6. **Код:** один `*-audit.ts` + один pillar card / cabinet shell в `components/platform/`  

DEEP-AUDIT — справочник рисков, не ежедневный план.

---

## Правила репо (вне platform-core/)

| Артефакт | Назначение |
|----------|------------|
| `.cursor/rules/platform-core-scope.mdc` | Scope guard агента |
| `Projects/.cursorignore` | Denylist индекса |
| `_checks/validate-platform-core-boundary.mjs` | Нет legacy lib/UI в platform |
| `_checks/validate-cursorignore-coverage.mjs` | Allowlist core cabinets |

---

## Пример: brand × development

**Доки (4):** ACTION-CONTRACTS (create article / W2 handoff), STAGE-GATES G1–G2, FIELD-MATRIX brand/dev, ISOLATION-MAP §A.

**Код (7):**

```text
components/platform/DevelopmentPillarCard.tsx
components/platform/RoleCoreCabinetHub.tsx          # grep development
lib/platform-core-readiness-sections/brand-audit.ts # grep brand-dev
lib/platform-core-native-href.ts                    # development workspace
lib/platform-core-hub-matrix.ts                     # grep development
app/brand/core/page.tsx
hooks/use-platform-core-hub-views.ts                # при hub UX
```

**Verify:** boundary + `npm run dev:platform-core` → `/brand/core?pillar=development`

---

## Пример: shop × collection_order

**Доки:** ACTION-CONTRACTS (matrix, cart, checkout), STAGE-GATES G3–G4, FIELD-MATRIX shop/CO.

**Код:**

```text
components/platform/CollectionOrderPillarCard.tsx
components/platform/peers/PlatformCoreShopCoGoldenPathStrip.tsx
components/platform/showroom/                      # витрина → matrix
lib/platform-core-shop-co-golden-path.ts
lib/platform-core-readiness-sections/shop-audit.ts
app/shop/core/page.tsx
```

---

*Обновлять этот файл при смене канона кода (фаза M в AUTONOMY-ROADMAP).*
