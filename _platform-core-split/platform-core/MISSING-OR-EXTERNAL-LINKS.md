# Missing Or External Links

Во время анализа Platform Core были обнаружены зависимости, которые нужны слою, но в копии репозитория не были найдены как отдельные файлы.

## Закрыто 2026-06-22

- `_ai-share/synth-1-full/src/app/platform/page.tsx` создан.
- `_ai-share/synth-1-full/src/lib/platform-core-hub-matrix.ts` создан.
- `_ai-share/synth-1-full/src/lib/platform-core-readiness-audit.ts` создан.
- core cabinet route constants и helper builders добавлены в `_ai-share/synth-1-full/src/lib/routes.ts`.

Их импортируют файлы из `src/lib/platform-core-readiness-sections`.

## Route constants, которые были закрыты

Audit-файлы ссылаются на core cabinet routes вроде:

- `ROUTES.brand.coreCabinet`
- `ROUTES.shop.coreCabinet`
- `ROUTES.factory.productionCoreCabinet`
- `ROUTES.factory.supplierCoreCabinet`

Они добавлены как явные ключи или helper-ссылки. Это не означает полный физический перенос Platform Core в отдельный namespace; это закрывает P0, чтобы `/platform` и audit-секции могли ссылаться на рабочие экраны.

## Что все еще внешнее

Platform Core пока не автономен. Он все еще использует общие shared-слои:

- `@/lib/routes`
- `@/lib/b2b`
- `@/lib/order`
- `@/lib/production`
- `@/components/...`
- Next routes в `src/app/...`
- API routes в `src/app/api/...`

Следующий этап - переносить это через `src/features/platform-core` и compatibility re-export слой, а не физическим перемещением за один шаг.
