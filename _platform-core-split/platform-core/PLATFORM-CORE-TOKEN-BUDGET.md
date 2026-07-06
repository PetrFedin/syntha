# Platform Core — token budget (cheat sheet)

**Полная карта:** [`PLATFORM-CORE-ISOLATION-MAP.md`](./PLATFORM-CORE-ISOLATION-MAP.md) — три кольца A/B/C, волны, allowlist/denylist.

## Три рычага

| Рычаг | Эффект |
|-------|--------|
| `Projects/.cursorignore` | −80%+ файлов в индексе IDE |
| Allowlist в ISOLATION-MAP | агент не ищет по всему `src/` |
| `npm run dev:platform-core` | MODE + STRICT, узкий sidebar |

## Allowlist (канон — **не** `features/platform-core/`)

```text
components/platform/          ← UI (+ peers/, showroom/)
lib/platform-core-*           ← основной domain-слой (не «только re-export»)
app/platform/ + api/platform-core/
app/{brand,shop,factory}/…/core/  ← см. ISOLATION-MAP §2
platform-core-ports/ + gateways/
```

**Не существует:** `src/features/platform-core/` (Codex-черновик; не копировать).

## Правила (кратко)

1. role × pillar + один файл-якорь в первом сообщении чата  
2. grep → read ≤150 строк  
3. Не DEEP-AUDIT целиком · используй **`DEEP-AUDIT-PROGRESS.md`** · не `lib/routes.ts` · не `brand/production/`  
4. Reload Window после правок `.cursorignore`

## Проверка

```bash
npm run validate:cursorignore-coverage
npm run validate:platform-core-boundary
```
