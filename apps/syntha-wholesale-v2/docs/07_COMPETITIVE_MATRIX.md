# 07 — Competitive Feature Matrix

## Назначение

Этот документ определяет структуру конкурентного анализа для Syntha Wholesale V2.

**Правило:** сведения о возможностях конкурентов можно переводить из `VERIFY` в `YES / PARTIAL / NO` только после проверки по официальной документации, продуктовым страницам, help center или подтверждённому demo.

Легенда:

- `YES` — функция подтверждена;
- `PARTIAL` — функция есть, но покрывает только часть сценария;
- `NO` — подтверждено отсутствие;
- `VERIFY` — требуется проверка;
- `TARGET` — обязательная целевая возможность Syntha;
- `LATER` — не входит в MVP, но предусмотрена архитектурно.

## Сравниваемые продукты

- JOOR;
- NuORDER;
- Le New Black;
- Brandboom;
- RepSpark;
- Faire;
- Fashion Cloud;
- Ordre;
- Pepperi;
- Elastic Suite;
- Syntha Wholesale V2.

## Матрица

| ID | Категория | Функция | JOOR | NuORDER | Le New Black | Brandboom | RepSpark | Faire | Fashion Cloud | Syntha V2 | Приоритет |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CM-001 | Campaign | Sales campaign workspace | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-002 | Campaign | Campaign status and dates | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-003 | Campaign | Campaign team and ownership | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-004 | Campaign | Campaign KPI dashboard | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-005 | Campaign | Campaign-level buyer segmentation | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-006 | Collection | Digital collection presentation | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-007 | Collection | Grid presentation mode | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-008 | Collection | Look-based presentation mode | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-009 | Collection | Editorial/story presentation | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-010 | Collection | Runway/video presentation | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-011 | Collection | Collection chapters/drops | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-012 | Collection | Buyer-specific assortment visibility | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-013 | Collection | Buyer-specific price lists | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-014 | Collection | Buyer preview before publish | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-015 | Collection | Versioned publish/release | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-016 | Product | Product detail with variants | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-017 | Product | Multiple images and video | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-018 | Product | 360/3D media support | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | LATER | P2 |
| CM-019 | Product | Color and size matrices | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-020 | Product | MOQ and pack rules | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-021 | Product | Delivery windows | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-022 | Product | Availability and ATS | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-023 | Product | Product-level buyer notes | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-024 | Showroom | Self-service digital showroom | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-025 | Showroom | Live guided appointment | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-026 | Showroom | Shared cursor/presentation state | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-027 | Showroom | Presenter-controlled navigation | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-028 | Showroom | Order writing during appointment | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-029 | Showroom | Appointment summary and follow-up | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-030 | Buying | Favorites and shortlist | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-031 | Buying | Compare products | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-032 | Buying | Compare colorways | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-033 | Buying | Multi-brand buying workspace | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-034 | Buying | Budget by brand/category/store | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-035 | Buying | Internal buying notes | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-036 | Buying | Team selection and approval | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-037 | Order Builder | Three-panel builder | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-038 | Order Builder | Quick quantity entry | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-039 | Order Builder | Size × color matrix | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-040 | Order Builder | Add complete look/capsule | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-041 | Order Builder | Split by store | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-042 | Order Builder | Split by delivery window | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-043 | Order Builder | Real-time totals | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-044 | Order Builder | Budget guardrails | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-045 | Order Builder | MOQ/pack validation | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-046 | Order Builder | Margin calculation | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-047 | Order Builder | Scenario versions | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-048 | Order Builder | Collaborative editing | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-049 | Order | Draft/review/submit lifecycle | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-050 | Order | Brand revision proposal | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-051 | Order | Buyer approval of revision | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-052 | Order | Audit history | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-053 | Order | PDF/Excel export | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-054 | Order | ERP export API | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | LATER | P2 |
| CM-055 | DealSpace | Shared brand-shop workspace | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-056 | DealSpace | Context chat by campaign | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-057 | DealSpace | Context chat by collection | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-058 | DealSpace | Context chat by order | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-059 | DealSpace | Context chat by product | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-060 | DealSpace | Shared documents | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-061 | DealSpace | Tasks from messages | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-062 | DealSpace | Mentions and notifications | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-063 | DealSpace | Unified activity timeline | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-064 | Calendar | Brand sales calendar | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-065 | Calendar | Shop buying calendar | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-066 | Calendar | Shared appointments | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-067 | Calendar | Propose/accept/reschedule | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-068 | Calendar | Time-zone aware scheduling | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-069 | Calendar | Google/Outlook sync | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | LATER | P2 |
| CM-070 | Calendar | Industry event calendar | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-071 | Analytics | Collection engagement | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-072 | Analytics | Product view/favorite/order funnel | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-073 | Analytics | Appointment-to-order conversion | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-074 | Analytics | Buyer activity scoring | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P2 |
| CM-075 | Analytics | Sales campaign revenue dashboard | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-076 | Platform | Multi-language | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P1 |
| CM-077 | Platform | Multi-currency | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-078 | Platform | Granular permissions | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-079 | Platform | Responsive desktop/iPad | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | TARGET | P0 |
| CM-080 | Platform | Offline appointment mode | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | VERIFY | LATER | P2 |

## Исследовательский процесс

Для каждого продукта необходимо создать карточку источников:

1. официальная продуктовая страница;
2. официальный help center;
3. release notes за последние 18 месяцев;
4. доступный demo или обучающее видео;
5. дата последней проверки;
6. цитата или краткое подтверждение функции;
7. ограничения функции.

## Критерий конкурентного преимущества

Функция не считается преимуществом Syntha только потому, что она присутствует в плане. Преимущество подтверждается, когда одновременно выполнены условия:

- сценарий реализован end-to-end;
- на экране нет тупиков и legacy-переходов;
- операция быстрее или понятнее аналога;
- есть измеримый эффект для бренда или магазина;
- функция покрыта acceptance tests и UX review.
