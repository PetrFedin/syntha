# 01 — Master Capability Map

## 1. Назначение

Этот документ — индекс канонического каталога функций Syntha Wholesale V2.

Каждая возможность получает постоянный `Capability ID` и должна быть связана с:

```text
Capability ID
→ Product area
→ User job
→ Role
→ Screen ID / route
→ Domain entity
→ Permission and scope
→ Workflow ID
→ Query / command
→ Domain event
→ Priority / release
→ Competitor reference
→ Acceptance evidence
```

Cursor не создаёт функцию без Capability ID. Новый ID сначала добавляется в этот каталог, затем в Screen Bible, API/event contracts и task manifest.

## 2. Формат ID

```text
CAP-PLT-NNN  Platform foundation
CAP-ORG-NNN  Organisations