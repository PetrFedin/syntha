# Индекс архитектурных решений (ADR)

Единая **витрина-оглавление** по репозиторию full: куда смотреть агентам и людям, не дублируя текст ADR. Сами документы остаются в **фазовых папках** и в **`docs/architecture/`**.

## Этап 0 — журнал ADR

| Зона | Описание |
|------|----------|
| [Журнал ADR (этап 0)](./phase-0/ADR/README.md) | Таблица ADR-0001…0003, шаблон, статус «принято (этап 0)». |

## Кросс-резюме и этапы вне phase-0/ADR

| ID | Тема | Статус (по файлу) | Файл |
|----|------|-------------------|------|
| ADR-001 | Расширение контура Workshop2 (фаза C — Enterprise) | См. файл | [ADR-001-w2-enterprise-phase-c.md](./architecture/ADR-001-w2-enterprise-phase-c.md) |
| ADR-002 | Integration map: Centric, NuOrder, JOOR, Apparel Magic, Zedonk, AIMS360 × 5 pillars × 4 roles (v4) | принято | [ADR-002-integration-map-wholesale-plm-platforms.md](./architecture/ADR-002-integration-map-wholesale-plm-platforms.md) |
| ADR-003 | Platform Core empty cells — intentional read-only peer insight (wave ZA) | принято (stub) | [ADR-003-platform-core-empty-cells-readonly.md](./architecture/ADR-003-platform-core-empty-cells-readonly.md) |

## Как добавлять новые ADR

1. Новый документ — в **`docs/architecture/`** (сквозная нумерация после существующих ADR) **или** в журнал соответствующей фазы под **`docs/phase-*/ADR/`**, если решение привязано к фазе.
2. Добавьте **одну строку** в таблицу выше (или в [phase-0/ADR/README.md](./phase-0/ADR/README.md), если это ADR этапа 0).
3. Домен и публичные контракты — с **`domain-canon-pr`** и каноном в **`docs/CANONICAL_FULL.md`** / **`SOURCE_OF_TRUTH.md`**, без «тихой правды» только в коде.
4. **Один PR с ADR:** если в PR меняется текст ADR или добавляется новый файл ADR — в **том же PR** закоммитьте правку **`docs/ADR-INDEX.md`** (таблица выше) **или** соответствующего фазового **`docs/phase-*/ADR/README.md`**, чтобы витрина не отставала от репозитория.

## Связанные документы (не ADR)

- **[CANONICAL_FULL.md](./CANONICAL_FULL.md)**, **[SOURCE_OF_TRUTH.md](./SOURCE_OF_TRUTH.md)**, **[INTEGRATION_MAP.md](../INTEGRATION_MAP.md)** — продуктовый канон; ADR фиксируют **изменения** и компромиссы относительно него.
