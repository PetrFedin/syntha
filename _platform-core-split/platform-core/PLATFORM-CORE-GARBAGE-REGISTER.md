# Platform Core — garbage register (wave 4 lite)

Legacy paths → native redirect / archive. Код не удаляется.

| Legacy path | Действие | Native target |
|-------------|----------|---------------|
| `/brand/production/workshop2` | middleware | `/brand/core?pillar=development` |
| `/platform/planner` | middleware (MODE=1) | `/platform` |
| `/brand/b2b-orders` list | middleware (MODE=1) | `/brand/core?pillar=collection_order` |
| `/shop/b2b/matrix` | coerce | shop core `collection_order` + matrix |
| `/shop/b2b/showroom` | coerce | shop core `sample_collection` + showroom |
| `/shop/b2b/checkout` | coerce | shop core checkout feature |
| `/brand/retailers` | coerce | brand core retailers feature |
| STRICT deny | middleware | `/platform?archived=1` |

Справочник: `_archive/platform-core-legacy-escapes/`

Следующие: long-tail `/shop/b2b/*` thin redirects (wave 4), native cart API (wave 5).
