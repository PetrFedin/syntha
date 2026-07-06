# Source Links — карта (не читать папку `source-links/`)

**Runtime SoT:** файлы в `_ai-share/synth-1-full/src/…` по путям ниже.  
**Planning mirror:** `_platform-core-split/platform-core/` (markdown).  
**Не открывать:** `_platform-core-split/live-source/` (snapshot), `legacy-rest/`.

## Активные зоны (default scope)

| Symlink / имя в split | Runtime path |
|----------------------|--------------|
| app-platform | `src/app/platform/` |
| api-platform-core/* | `src/app/api/platform-core/` |
| components-platform | `src/components/platform/` |
| domain / hub | `src/lib/platform-core-hub-matrix.ts`, `platform-core-demo-context.ts` |
| routing | `src/lib/platform-core-native-href.ts`, `platform-core-routes.ts` |
| readiness | `src/lib/platform-core-readiness-audit.ts`, `readiness-sections/` |
| adapters | `src/lib/platform-core-gateways/` |
| ports | `src/lib/platform-core-ports/` |
| server hubs | `src/lib/server/platform-core-*.ts` |

## Вырезано из default scope

`app-brand-production`, `app-shop-b2b`, `components-brand-production`, `lib-production`, `lib-b2b`, broad `api-workshop2` UI paths — см. [CONNECTIONS.md](./CONNECTIONS.md).

## Doc → code

Полная таблица: [PLATFORM-CORE-DOC-INDEX.md](./PLATFORM-CORE-DOC-INDEX.md).

## Устаревшее имя

`src/features/platform-core/*` — в старых split-файлах; в Projects **не существует**. Фаза переименования: [AUTONOMY-ROADMAP.md](./PLATFORM-CORE-AUTONOMY-ROADMAP.md) §M.
