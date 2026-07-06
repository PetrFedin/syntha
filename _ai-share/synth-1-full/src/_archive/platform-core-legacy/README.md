# Platform Core — архив legacy page-split + Wave 7 retail/CRM

## Page-split (Wave 1–5)

Файлы из `PLATFORM_CORE_LEGACY_PAGE_SPLITS` (`src/lib/platform-core-legacy-manifest.ts`).

### Правило переноса

1. Переместить `*-legacy.tsx` в зеркальный путь под `src/_archive/platform-core-legacy/app/…`
2. В `page.tsx` оставить dynamic import на архивный путь
3. Core-path (`isPlatformCoreMode()`) не трогать — только `*-core.tsx`
4. Прогон: `npm test -- --testPathPattern=platform-core` + `npm run test:e2e:core`

### Статус page-split

- Инвентарь: **51** page-split
- Физический перенос: **51/51**

## Wave 7 · retail/CRM peer UI (Article Spine v1)

Канон: `src/lib/platform-core-wave7-retail-crm-archive.ts`

| Файл в архиве | Stub (spine → null) |
|---------------|---------------------|
| `retail-crm/BrandScCabinetRetailPeerStrip.tsx` | `components/platform/BrandScCabinetRetailPeerStrip.tsx` |
| `retail-crm/BrandScLinesheetsRetailPeerStrip.tsx` | … |
| `retail-crm/BrandScShowroomRetailPeerStrip.tsx` | … |
| `retail-crm/BrandCoRegistryRetailOnboardingStrip.tsx` | … |
| `retail-crm/BrandCoAgentRepCoPeerStrip.tsx` | … |
| `retail-crm/BrandDevMerchCoSpinePeerStrip.tsx` | … |
| `retail-crm/ShopDevelopmentBridgeGreenfieldCrmStrip.tsx` | … |

**Не в Wave 7:** pricelist/WSSI/agent-rep **hub sections** — только фильтр `ARTICLE_SPINE_ARCHIVE_SECTION_IDS` (deep-link сохранён).

## Hub-компоненты (legacy demo)

- `components/platform/`: Scorecard, DemoTrail, HubDemoContext, PillarRoleMap, InvestorWalkthrough, SupplierRfqReadonlyPanel
