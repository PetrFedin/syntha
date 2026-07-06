# Platform Core Cabinet UI Spec

Канон раскладки кабинета столпа: **Роль → Столп → Раздел → Действие**.

Источник разделов: `SECTION_AUDIT` → `buildPillarCabinetSectionItems` → `PillarSectionList`.

## Типографика (operator UI)

| Токен | iPhone | iPad+ | CSS |
|-------|--------|-------|-----|
| page-title | 17px | 18px | `hubCabinet.pillarTitle` |
| section-title | 15px | 15px | `pillarInsight.sectionRowLabel` |
| body | 13px | 14px | `text-[13px] md:text-sm` |
| caption / label | 11px | 11px | минимум для мета |

Запрет: `text-[8px]` / `text-[9px]` в operator UI (кроме dev overlay / mono-id).

## Уровни блоков

| Уровень | Компонент | Содержимое |
|---------|-----------|------------|
| L0 | `PlatformCoreContextBar` + segmented pillars | роль, коллекция, столп |
| L1 | `PillarCabinetHeader` + `PillarCabinetProgress` | заголовок, прогресс, 1 primary (inline md, rail lg) |
| L2 | `PillarSectionList` | 3–6 разделов, live dot |
| L3 | `PillarCabinetDiagnostics` | insight cards (`minimalChrome`) |
| Связи | `PillarRelatedLinks` | max 3 + sheet «Ещё» |

## Breakpoints

- **iPhone**: один вертикальный скролл; sticky L0 + pillar segments; Comms bottom bar: Чат · Календарь · Группы.
- **iPad (md+)**: pillar rail (`role-core-pillar-nav`); section grid 2 col.
- **MacBook (lg+)**: shell `11.5rem | 1fr | 16rem` — nav | content | `PillarCabinetActionRail`.

## Hub `/platform`

- Продукт по умолчанию; аудит — `PlatformCoreHubAuditLauncher` (sheet).
- Планировщик — `/platform/planner`.
- Quick entry: роль → `/platform/{role}?pillar={default}`.

## Comms pillar

- `CommsCabinetSplitLayout`: desktop tabs (Чат · Календарь · Группы · Уведомления); mobile bottom — без Уведомлений.
- PO inbox badge на «Уведомления» (manufacturer).
- Section context: `useCommsSectionContextAutoThread` в thread strip (`minimalChrome`).

## Audit / investor strips

Показывать только при hub «Аудит» ON (`usePlatformCoreAuditUi`) или investor demo mode.

## Файлы

- `src/lib/pillar-cabinet-sections.ts` — section list + overflow
- `src/lib/pillar-cross-links.ts` — registry links (max 3)
- `src/lib/pillar-cabinet-primary-actions.ts` — primary/secondary CTA
- `src/lib/platform-core-cabinet-chrome.ts` — typography tokens
