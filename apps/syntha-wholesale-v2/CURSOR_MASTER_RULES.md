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

1. `README.md`;
2. `docs/00_PRODUCT_CANON.md`;
3. `docs/13_PRODUCT_PRINCIPLES.md`;
4. `docs/01_INFORMATION_ARCHITECTURE.md`;
5. `docs/02_FUNCTIONAL_MAP.md`;
6. `docs/03_DOMAIN_MODEL.md`;
7. `docs/04_UX_CONSTITUTION.md`;
8. `docs/14_ADAPTIVE_UI_VISUAL_SYSTEM.md`;
9. `design-system/tokens.json`;
10. `design-system/responsive-contract.json`;
11. `docs/09_COMPONENT_LIBRARY.md`;
12. соответствующую задачу из `tasks/` и её источник в `docs/05_IMPLEMENTATION_ROADMAP.md`.

Если код противоречит документации, приоритет имеет документация. Если Markdown и machine-readable tokens расходятся, код писать нельзя: сначала исправляется спецификация. Cursor не выбирает удобный вариант самостоятельно.

## 4. Правила интерфейса

- На экране допускается только одна Primary CTA.
- Все рабочие разделы используют один из канонических шаблонов: `Registry`, `Entity`, `Builder`, `Showroom`, `Split Communication`.
- Нельзя создавать локальные варианты Button, Table, Empty State, Modal, Drawer, Filter Bar, Product Card или Entity Header.
- Нельзя использовать произвольные цвета, размеры шрифта, радиусы, тени и отступы.
- Feature code не содержит raw hex, ad-hoc Tailwind values или arbitrary pixel typography.
- Runtime design tokens генерируются из `design-system/tokens.json`.
- Responsive поведение реализуется по `design-system/responsive-contract.json`.
- Один App Shell используется для Brand и Shop; меняется содержание навигации, но не её визуальная система.
- Showroom может иметь editorial canvas, но системные pricing, selection, statuses, filters и order controls не меняют платформенный язык.
- Desktop/MacBook является основным режимом сложного order writing.
- iPad landscape должен поддерживать полноценную рабочую сессию.
- iPhone получает самостоятельный адаптированный flow, а не уменьшенный desktop.
- Mobile Order Builder является пошаговым; сжатая desktop matrix запрещена.
- Любой интерактивный элемент должен иметь loading, disabled, success и error state.
- Любая таблица должна иметь empty, loading, no-results и error state.
- Любой destructive action требует подтверждения и audit event.

## 5. Визуальный канон

Обязательная основа:

- light theme в MVP;
- warm neutral canvas;
- white operational surfaces;
- restrained dark green accent;
- Inter для всего рабочего интерфейса;
- Source Serif 4 допускается только в buyer-facing editorial hero;
- рабочие карточки: radius 12 px максимум;
- editorial cards: radius 16 px максимум;
- минимум теней;
- одна icon family — Lucide;
- минимальный touch target 44 × 44 px;
- input font на iPhone минимум 16 px;
- WCAG 2.2 AA;
- tabular numerals для цен, quantity, budgets и totals.

Запрещено:

- bright SaaS blue/purple как доминирующий стиль;
- glassmorphism;
- декоративные градиенты в операционном UI;
- тяжёлые тени;
- карточка внутри карточки без функциональной причины;
- разные палитры по разделам;
- oversized rounded cards 20–32 px;
- смешивание icon libraries;
- зависимость критического действия от hover.

## 6. Responsive contract

Каждый P0 UI-screen проверяется минимум на:

- 390 × 844;
- 768 × 1024;
- 1024 × 768;
- 1440 × 900;
- 1728 × 1117.

Порядок адаптации при уменьшении viewport:

1. Скрыть low-priority metadata.
2. Перенести secondary actions в overflow.
3. Перенести inspector/context rail в drawer или sheet.
4. Преобразовать registry table в mobile list cards.
5. Преобразовать сложный builder в последовательные шаги.

Нельзя первым действием уменьшать controls и typography ниже canonical sizes.

## 7. Архитектурные правила

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

## 8. Данные и состояние

- Сервер является источником правды для кампаний, коллекций, заказов, встреч и сообщений.
- Optimistic UI разрешён только при наличии rollback и явного error state.
- Draft order должен автосохраняться с versioning.
- Любой конфликт редактирования должен быть виден пользователю и разрешаться явно.
- Demo-данные хранятся в одном fixture source of truth.
- Нельзя дублировать demo IDs в разных файлах.

## 9. Тестирование

Для каждой задачи обязательны:

- unit tests для domain/application логики;
- component tests для сложных состояний UI;
- integration tests для write-path;
- e2e для критического пользовательского потока;
- accessibility checks для ключевых экранов;
- responsive screenshots на всех обязательных viewport;
- проверка keyboard path на MacBook/iPad hardware keyboard;
- проверка touch path на iPhone/iPad;
- отсутствие непредусмотренного horizontal overflow.

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

## 10. Definition of Done

Задача считается готовой только если:

- выполнены все acceptance criteria;
- нет TODO, stub, demo-only button или dead end;
- кнопки выполняют реальное действие;
- loading/empty/no-results/error/success states реализованы;
- применены только canonical design tokens;
- responsive проверен на 390/768/1024/1440/1728;
- приложены screenshots для UI review;
- touch targets не меньше 44 × 44 px;
- keyboard focus видим;
- safe-area учтена на iPhone/iPad;
- тесты добавлены и проходят;
- документация обновлена;
- нет прямых legacy imports;
- нет новых ad-hoc компонентов;
- нет неиспользуемого кода.

## 11. Запрещено

- Добавлять функции, которых нет в Functional Map или roadmap.
- Создавать второй источник правды.
- Создавать второй visual system document или локальную token palette.
- Маскировать неработающий функционал декоративной кнопкой.
- Делать fallback на legacy route без отдельного утверждённого migration contract.
- Копировать крупные legacy-компоненты целиком.
- Добавлять manufacturer/supplier как пользовательские роли.
- Смешивать B2C storefront и B2B wholesale workspace.
- Начинать production-модуль до завершения Showroom, Order Builder, Orders и DealSpace.

## 12. Порядок работы Cursor

Для каждой задачи Cursor обязан:

1. Найти task ID в `tasks/`.
2. Прочитать связанные product, screen, component и visual specifications.
3. Перечислить затрагиваемые файлы.
4. Проверить существующие компоненты и не создавать дубли.
5. Реализовать минимальный законченный vertical slice.
6. Запустить typecheck, lint, tests и responsive review.
7. Обновить task status и changelog.
8. Не переходить к следующей задаче при незакрытых ошибках текущей.

## 13. Главный критерий качества

Пользователь должен без обучения понимать:

- где он находится;
- что он видит;
- что ему нужно сделать сейчас;
- что произойдёт после действия;
- где находится весь контекст сделки.

Если экран вызывает вопрос «что здесь делать?» или визуально выглядит частью другого продукта, он не готов.
