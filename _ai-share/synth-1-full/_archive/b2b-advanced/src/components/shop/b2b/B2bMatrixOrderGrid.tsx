'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import type { Workshop2B2bCatalogMatrix } from '@/lib/production/workshop2-b2b-campaign-hub';
import { cn } from '@/lib/utils';

type Props = {
  collectionId: string;
  articleId: string;
  /** Компактный режим для rep portal card. */
  compact?: boolean;
  className?: string;
};

type QtyMap = Record<string, number>;

function cellKey(colorCode: string, size: string): string {
  return `${colorCode}::${size}`;
}

/**
 * Wave 43: NuOrder-style matrix grid — debounced batch POST /api/shop/b2b/cart/matrix.
 */
export function B2bMatrixOrderGrid({ collectionId, articleId, compact, className }: Props) {
  const [matrix, setMatrix] = useState<Workshop2B2bCatalogMatrix | null>(null);
  const [qty, setQty] = useState<QtyMap>({});
  const [loading, setLoading] = useState(true);
  const [errorRu, setErrorRu] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'pending' | 'saved' | 'error'>('idle');
  const [moqHintRu, setMoqHintRu] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef(`b2b-matrix-${Date.now()}`);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setErrorRu(null);
      try {
        const res = await fetch(
          `/api/shop/b2b/catalog/matrix?collectionId=${encodeURIComponent(collectionId)}&articleId=${encodeURIComponent(articleId)}`
        );
        const json = (await res.json()) as {
          ok?: boolean;
          matrix?: Workshop2B2bCatalogMatrix;
          messageRu?: string;
        };
        if (cancelled) return;
        if (!res.ok || !json.matrix) {
          setErrorRu(json.messageRu ?? `Матрица недоступна (${res.status})`);
          setMatrix(null);
          return;
        }
        setMatrix(json.matrix);
        const initial: QtyMap = {};
        for (const cell of json.matrix.cells) {
          initial[cellKey(cell.colorCode, cell.size)] = cell.qty ?? 0;
        }
        setQty(initial);
      } catch {
        if (!cancelled) setErrorRu('Сеть недоступна при загрузке матрицы.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId, articleId]);

  const flushBatch = useCallback(
    async (nextQty: QtyMap) => {
      if (!matrix) return;
      setSaveState('pending');
      setMoqHintRu(null);
      const updates = matrix.cells
        .map((cell) => ({
          colorCode: cell.colorCode,
          size: cell.size,
          qty: nextQty[cellKey(cell.colorCode, cell.size)] ?? 0,
          moq: cell.moq,
          wholesalePriceRub: cell.wholesalePriceRub,
        }))
        .filter((u) => u.qty > 0);

      try {
        const res = await fetch('/api/shop/b2b/cart/matrix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            collectionId,
            articleId,
            updates,
          }),
        });
        const json = (await res.json()) as { ok?: boolean; messageRu?: string; moqViolations?: string[] };
        if (!res.ok || !json.ok) {
          setSaveState('error');
          setMoqHintRu(json.messageRu ?? 'Ошибка сохранения матрицы');
          return;
        }
        if (json.moqViolations?.length) {
          setMoqHintRu(json.moqViolations.join(' · '));
        }
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2500);
      } catch {
        setSaveState('error');
        setMoqHintRu('Сеть недоступна при сохранении.');
      }
    },
    [matrix, collectionId, articleId]
  );

  const scheduleBatch = useCallback(
    (nextQty: QtyMap) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => void flushBatch(nextQty), 450);
    },
    [flushBatch]
  );

  const onQtyChange = (colorCode: string, size: string, value: string) => {
    const parsed = Math.max(0, parseInt(value, 10) || 0);
    setQty((prev) => {
      const next = { ...prev, [cellKey(colorCode, size)]: parsed };
      scheduleBatch(next);
      return next;
    });
  };

  const sizes = matrix?.sizes ?? [];
  const colorways = useMemo(
    () => matrix?.colorways ?? [],
    [matrix?.colorways]
  );

  if (loading) {
    return (
      <p className="text-text-secondary text-sm" data-testid="b2b-matrix-order-grid">
        Загрузка матрицы…
      </p>
    );
  }

  if (errorRu || !matrix) {
    return (
      <p className="text-destructive text-sm" data-testid="b2b-matrix-order-grid">
        {errorRu ?? 'Матрица не загружена'}
      </p>
    );
  }

  return (
    <div
      className={cn('space-y-2', compact && 'text-sm', className)}
      data-testid="b2b-matrix-order-grid"
    >
      <div className="flex flex-wrap items-center gap-2">
        {saveState === 'pending' ? (
          <span
            className="text-text-secondary text-xs"
            data-testid="b2b-matrix-batch-save-indicator"
          >
            Сохранение…
          </span>
        ) : saveState === 'saved' ? (
          <span
            className="text-primary text-xs font-medium"
            data-testid="b2b-matrix-batch-save-indicator"
          >
            Сохранено
          </span>
        ) : saveState === 'error' ? (
          <span className="text-destructive text-xs" data-testid="b2b-matrix-batch-save-indicator">
            Ошибка
          </span>
        ) : null}
        {moqHintRu ? (
          <span className="text-amber-800 text-xs" data-testid="b2b-matrix-moq-hint">
            {moqHintRu}
          </span>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[320px] text-left text-xs">
          <thead>
            <tr className="bg-muted/40 border-b">
              <th className="p-2 font-semibold">Цвет</th>
              {sizes.map((size) => (
                <th key={size} className="p-2 text-center font-semibold">
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colorways.map((cw) => (
              <tr key={cw.code} className="border-b last:border-0">
                <td className="p-2 font-medium">{cw.label}</td>
                {sizes.map((size) => {
                  const key = cellKey(cw.code, size);
                  const testId = `b2b-matrix-qty-${cw.code}-${size}`;
                  return (
                    <td key={size} className="p-1 text-center">
                      <Input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        className="mx-auto h-8 w-14 text-center"
                        value={qty[key] ?? 0}
                        data-testid={testId}
                        onChange={(e) => onQtyChange(cw.code, size, e.target.value)}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
