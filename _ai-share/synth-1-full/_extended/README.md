# _extended — расширенные роли (manufacturer / supplier / distributor)

Standalone UI вне baseline v1 (brand + shop). Показывается при `NEXT_PUBLIC_PC_EXTENDED_ROLES=1`.

## Оставлено в `src/` (обслуживает core + extended)

### Manufacturer (`factory/production/`)

| Path | Зачем |
|------|-------|
| `core/` | extended role cabinet |
| `dossier/` | read-only ТЗ для цеха |
| `messages/` | comms |
| `orders/` | `ManufacturerOrderProductionCabinetWorkspace` |
| `materials/` | supplier BOM / procurement (native-href → core feature) |

### Supplier (`factory/supplier/`)

| Path | Зачем |
|------|-------|
| `core/` | extended cabinet |
| `messages/` | comms |
| `rfq-inbox/` | `PlatformCoreCommsCabinetWorkspace` |

## Перенесено в `_extended/` (batch 6)

- `_extended/manufacturer/` — legacy `factory/*` root + production subdirs (auctions, finance, shop-floor, …)
- `_extended/supplier/` — `factory/supplier/circular-hub`
- `_extended/distributor/` — `app/distributor` + `components/distributor`

**Не переносить:** production/material/logistics **логику** внутри Brand `order_production` / handoff API.

См. `_extended/manufacturer/MANIFEST.md`, `_extended/distributor/MANIFEST.md`.
