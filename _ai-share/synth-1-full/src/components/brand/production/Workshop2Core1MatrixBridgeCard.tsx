'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, Link2 } from 'lucide-react';
import { useArticleWorkspace } from '@/components/brand/production/article-workspace-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  buildStagesMatrixHrefForArticle,
  collectionFlowStorageKey,
} from '@/lib/production/stages-url';
import {
  applyBundlePoRefsToUnifiedFlowPoStep,
  buildCore1PlanTabBridgeState,
  collectBundlePoRefsForMatrix,
} from '@/lib/production/workshop2-core1-linkage';
import {
  BRAND_UNIFIED_SKU_FLOW_SAVED_EVENT,
  loadUnifiedSkuFlowDoc,
  saveUnifiedSkuFlowDoc,
} from '@/lib/production/unified-sku-flow-store';

/**
 * Связка матрицы этапов коллекции (unified flow) с вкладкой «План · PO» карточки артикула.
 */
export function Workshop2Core1MatrixBridgeCard() {
  const { ref, bundle } = useArticleWorkspace();
  const flowKey = useMemo(() => collectionFlowStorageKey(ref.collectionId), [ref.collectionId]);
  const [tick, setTick] = useState(0);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const onSaved = (e: Event) => {
      const k = (e as CustomEvent<{ collectionKey?: string }>).detail?.collectionKey;
      if (k === flowKey) setTick((t) => t + 1);
    };
    window.addEventListener(BRAND_UNIFIED_SKU_FLOW_SAVED_EVENT, onSaved as EventListener);
    return () =>
      window.removeEventListener(BRAND_UNIFIED_SKU_FLOW_SAVED_EVENT, onSaved as EventListener);
  }, [flowKey]);

  const state = useMemo(() => {
    const doc = loadUnifiedSkuFlowDoc(flowKey);
    return buildCore1PlanTabBridgeState(doc, ref.articleId, bundle);
  }, [flowKey, ref.articleId, bundle, tick]);

  const bundlePoRefs = useMemo(() => collectBundlePoRefsForMatrix(bundle), [bundle]);
  const matrixRefSet = useMemo(() => new Set(state.matrixPoOutputRefs), [state.matrixPoOutputRefs]);
  const pendingPoRefsFromBundle = useMemo(
    () => bundlePoRefs.filter((r) => !matrixRefSet.has(r)),
    [bundlePoRefs, matrixRefSet]
  );

  const matrixHref = buildStagesMatrixHrefForArticle(ref.collectionId, ref.articleId, 'po');

  function handleApplyBundleRefs() {
    if (pendingPoRefsFromBundle.length === 0) return;
    setApplying(true);
    try {
      const doc = loadUnifiedSkuFlowDoc(flowKey);
      const { doc: next } = applyBundlePoRefsToUnifiedFlowPoStep(doc, ref.articleId, bundle);
      saveUnifiedSkuFlowDoc(flowKey, next);
      setTick((t) => t + 1);
    } finally {
      setApplying(false);
    }
  }

  return (
    <div
      role="region"
      aria-label="Связка матрицы этапов коллекции с планом и PO"
      className={cn(
        'rounded-xl border p-3 shadow-sm',
        state.seriesHandoffReady
          ? 'border-emerald-200/80 bg-emerald-50/50'
          : 'border-amber-200/90 bg-amber-50/60'
      )}
    >
      <div className="flex flex-wrap items-start gap-2">
        <ClipboardList
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0',
            state.seriesHandoffReady ? 'text-emerald-700' : 'text-amber-800'
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-text-primary text-[11px] font-bold leading-snug">
            Матрица коллекции ↔ план (ядро №1)
          </p>
          <p className="text-text-secondary text-[10px] leading-snug">
            Статусы этапов — в <span className="font-mono text-[9px]">unified flow</span>; PO в
            таблице ниже — в бандле артикула. В матрице для этапа «PO» укажите выходы с видом{' '}
            <span className="font-mono text-[9px]">po</span>, чтобы связать номера — либо нажмите
            «PO → матрица», чтобы подтянуть id строк из плана в выходы этапа без ручного ввода.
          </p>
          <p className="text-[10px] font-semibold">
            Передача в серию (до «Площадка и сроки»):{' '}
            {state.seriesHandoffReady ? (
              <span className="text-emerald-800">предпосылки закрыты</span>
            ) : (
              <span className="text-amber-900">
                не закрыты: {state.missingPrerequisiteTitles.slice(0, 4).join(' · ')}
                {state.missingPrerequisiteTitles.length > 4
                  ? ` +${state.missingPrerequisiteTitles.length - 4}`
                  : ''}
              </span>
            )}
          </p>
          <p className="text-[10px]">
            PO в бандле: <strong>{state.bundlePurchaseOrderCount}</strong> · ref в матрице (этап{' '}
            <span className="font-mono">po</span>):{' '}
            <strong>{state.matrixPoOutputRefs.length}</strong>
            {state.poBundleAlignedWithMatrix ? (
              <span className="text-emerald-800">
                {' '}
                · <Link2 className="inline h-3 w-3" aria-hidden /> совпадение с бандлом
              </span>
            ) : state.bundlePurchaseOrderCount > 0 && state.matrixPoOutputRefs.length > 0 ? (
              <span className="text-amber-900"> · проверьте соответствие ref и id PO</span>
            ) : null}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 text-[10px] font-bold uppercase"
            disabled={pendingPoRefsFromBundle.length === 0 || applying}
            title={
              bundlePoRefs.length === 0
                ? 'Во вкладке «План · PO» нет строк заказов'
                : pendingPoRefsFromBundle.length === 0
                  ? 'Все ref из плана уже есть в матрице на этапе PO'
                  : `Добавить в матрицу: ${pendingPoRefsFromBundle.join(', ')}`
            }
            onClick={handleApplyBundleRefs}
          >
            {applying ? 'Запись…' : 'PO → матрица'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] font-bold uppercase"
            asChild
          >
            <Link href={matrixHref}>Матрица этапов</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
