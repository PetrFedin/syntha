# Cursor Master Rules — Syntha Wholesale V2

Этот файл обязателен для любой работы Cursor в `apps/syntha-wholesale-v2`.

## 1. Продуктовый канон

- Пользовательские роли только две: `brand` и `shop`.
- Ядро продукта: `Sales Campaign → Collection → Showroom → Selection → Order Builder → Order → DealSpace`.
- Главная ценность: лучший в отрасли показ коллекции и самый удобный процесс написания оптового заказа.
- Production, PLM, BOM, QC, sourcing и supply-chain не входят в MVP.
- Производственные функции текущей Syntha подключаются позднее только как изолированные расширения.
- Любая функция обязана улучшать продажу коллекции, выбор ассортимента, написание заказа или совместную работу бренда и магазина.

## 2. Изоляция от текущей Syntha

- Новый продукт разрабатывается только внутри `apps/syntha-wholesale-v2`.
- Запрещено импортировать UI-компоненты напрямую из legacy-приложения.
- Повторно использовать можно только чистые доменные функции, типы, схемы и проверенные инфраструктурные адаптеры.
- Любой reuse оформляется через локальный adapter в `apps/syntha-wholesale-v2/src/adapters`.
- Legacy routes не являются частью новой информационной архитектуры.
- Нельзя создавать скрытые переходы из V2 в старые кабинеты.

## 3. Источник правды

Перед реализацией Cursor обязан прочитать:

1. `README.md`
2. `docs/00_PRODUCT_CANON.md`
3. `docs/01_INFORMATION_ARCHITECTURE.md`
4. `docs/02_FUNCTIONAL_MAP.md`
5. `docs/03_DOMAIN_MODEL.md`
6. `docs/04_UX_CONSTITUTION.md`
7. соответствующую задачу из `docs/05_IMPLEMENTATION_ROADMAP.md`

Если код противоречит документации, приоритет имеет документация. Если документация противоречива, код писать нельзя: сначала создаётся ADR или исправляется спецификация.

## 4. Правила интерфейса

- На экране допускается только одна Primary CTA.
- Все рабочие разделы используют один из трёх шаблонов: `Workspace`, `Entity Page`, `Builder`.
- Нельзя создавать локальные варианты Button, Table, Empty State, Modal, Drawer, Filter Bar или Entity Header.
- Нельзя использовать произвольные цвета, размеры шрифта, радиусы, тени и отступы.
- Все стили должны ссылаться на локальные design tokens.
- Desktop-first для сложной wholesale-работы, но обязательна полная адаптация для iPad landscape и usable mobile review mode.
- Любой интерактивный элемент должен иметь loading, disabled, success и error state.
- Любая таблица должна иметь empty state, loading state и error state.
- Любой destructive action требует подтверждения и audit event.

## 5. Архитектурные правила

- UI не обращается напрямую к базе данных.
- UI не знает о legacy API.
- Domain не зависит от React, Next.js или инфраструктуры.
- Use cases зависят только от портов.
- Infrastructure реализует порты.
- Все write-операции проходят через application/use-case слой.
- Все бизнес-статусы определены в domain-модели, а не строками внутри JSX.
- Все важные изменения создают audit event.
- Любая операция, которую можно повторить из-за сети, должна быть idempotent.

Рекомендуемые слои:

```text
src/
  app/              # routes and composition
  components/       # shared UI system
  features/         # feature modules
  domain/           # entities, value objects, policies
  application/      # use cases and ports
  infrastructure/   # API, persistence, integrations
  adapters/         # controlled reuse from current Syntha
  lib/              # narrow shared utilities
```

## 6. Данные и состояние

- Сервер является источником правды для кампаний, коллекций, заказов, встреч и сообщений.
- Optimistic UI разрешён только при наличии rollback и явного error state.
- Draft order должен автосохраняться с versioning.
- Любой конфликт редактирования должен быть виден пользователю и разрешаться явно.
- Demo-данные хранятся в одном fixture source of truth.
- Нельзя дублировать demo IDs в разных файлах.

## 7. Тестирование

Для каждой задачи обязательны:

- unit tests для domain/application логики;
- component tests для сложных состояний UI;
- integration tests для write-path;
- e2e для критического пользовательского потока;
- accessibility checks для ключевых экранов;
- responsive verification на 1440, 1280 и iPad landscape.

Критические e2e-пути:

```text
Brand creates campaign
→ creates collection
→ publishes showroom
→ invites shop
→ shop reviews collection
→ shop builds selection
→ shop writes and submits order
→ brand reviews and confirms order
→ both sides continue in DealSpace
```

## 8. Definition of Done

Задача считается готовой только если:

- выполнены все acceptance criteria;
- нет TODO, stub, demo-only button или dead end;
- кнопки выполняют реальное действие;
- loading/empty/error/success states реализованы;
- responsive проверен;
- тесты добавлены и проходят;
- документация обновлена;
- нет прямых legacy imports;
- нет новых ad-hoc компонентов;
- нет неиспользуемого кода.

## 9. Запрещено

- Добавлять функции, которых нет в Functional Map или roadmap.
- Создавать второй источник правды.
- Маскировать неработающий функционал декоративной кнопкой.
- Делать fallback на legacy route без отдельного утверждённого migration contract.
- Копировать крупные legacy-компоненты целиком.
- Добавлять manufacturer/supplier как пользовательские роли.
- Смешивать B2C storefront и B2B wholesale workspace.
- Начинать production-модуль до завершения Showroom, Order Builder, Orders и DealSpace.

## 10. Порядок работы Cursor

Для каждой задачи Cursor обязан:

1. Найти task ID в roadmap.
2. Перечислить затрагиваемые файлы.
3. Проверить существующие компоненты и не создавать дубли.
4. Реализовать минимальный законченный vertical slice.
5. Запустить проверки.
6. Обновить task status и changelog.
7. Не переходить к следующей задаче при незакрытых ошибках текущей.

## 11. Главный критерий качества

Пользователь должен без обучения понимать:

- где он находится;
- что он видит;
- что ему нужно сделать сейчас;
- что произойдёт после действия;
- где находится весь контекст сделки.

Если экран вызывает вопрос «что здесь делать?», он не готов.