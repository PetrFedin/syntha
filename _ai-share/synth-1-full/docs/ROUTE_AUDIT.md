# Route Audit — Platform Core Phase 20

**Дата:** 2026-07-08  
**Runtime:** `_ai-share/synth-1-full`

## Слои маршрутизации

| Слой | Файл | Назначение |
|------|------|------------|
| Baseline | `src/lib/platform-core-routes.ts` | brand + shop — SoT для PC UI |
| Extended | `src/lib/platform-core-extended-routes.ts` | factory / manufacturer / supplier |
| Legacy | `src/lib/platform-core-legacy-routes.ts` | advanced B2B, B2C, denylist |
| Full app | `src/lib/routes.ts` | marketing/admin — не импортировать из PC |
| Coercion | `platform-core-native-href.ts` | MODE=1: legacy → cabinet |
| Strict | `platform-core-strict-routes.ts` | STRICT=1 allowlist |

## Таблица маршрутов (ключевые)

| Route | Canonical | Legacy / Alias | Удалить | Оставить | Создать |
|-------|-----------|----------------|---------|----------|---------|
| `/platform` | hub | `/` redirect | | ✓ | |
| `/brand/core` | `?pillar=&collection=` | — | | ✓ | |
| `/shop/core` | same | — | | ✓ | |
| `/brand/production/workshop2` | development cabinet | W2 UI | UI links | ✓ redirect | |
| `/brand/b2b-orders` | collection_order pillar | list | page later | ✓ redirect | |
| `/shop/b2b-orders` | `/shop/b2b/orders` | dead path | | | middleware redirect |
| `/shop/b2b/catalog` | showroom/platform | LEGACY | ✓ page | ✓ guard | |
| `/factory/production/core` | order_production | `/factory/production` | | ✓ | |
| `/api/platform-core/b2b-message-templates` | templates | duplicate | ✓ one | ✓ | merge paths |

## P0 cleanup

1. CREATE middleware `/shop/b2b-orders` → `/shop/b2b/orders`
2. DELETE duplicate BFF message-templates prefix
3. DELETE archived LEGACY_ROUTES pages after e2e
4. CREATE native-href for `/brand/pre-orders`, `/shop/b2b/working-order`

## Верификация

```bash
npm run validate:platform-core-boundary
npm test -- --testPathPattern=platform-core-boundaries
```
