'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import {
  resolvePlatformCoreEntityThreadTemplates,
  type PlatformCoreEntityThreadKind,
  type PlatformCoreEntityThreadTemplate,
} from '@/lib/platform-core-ports/communications/platform-core-entity-thread-templates';
import { fetchPlatformCoreEntityThreadTemplates } from '@/lib/platform-core-ports/communications/platform-core-entity-thread-templates-client';
import { applyPlatformCoreEntityThreadTemplate } from '@/lib/platform-core-ports/communications/platform-core-entity-thread-template-apply';
import {
  interpolateEntityThreadTemplateBody,
  type SavedPlatformCoreEntityThreadTemplate,
} from '@/lib/platform-core-ports/communications/platform-core-entity-thread-templates-storage';
import { parseSynthaOverlayContext } from '@/lib/platform-core-ports/communications/syntha-overlay-context';
import { PLATFORM_CORE_DEMO, resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';

type Variant = 'brand' | 'shop' | 'manufacturer' | 'supplier';

type Props = {
  variant: Variant;
  threadKind?: PlatformCoreEntityThreadKind;
  onInsert: (text: string) => void;
  collectionId?: string;
  articleId?: string;
  orderId?: string;
};

function resolveChatEntityThreadKind(input: {
  explicit?: PlatformCoreEntityThreadKind;
  orderId?: string;
  articleId?: string;
}): PlatformCoreEntityThreadKind | undefined {
  if (input.explicit) return input.explicit;
  if (input.orderId?.trim()) return 'handoff';
  if (input.articleId?.trim()) return 'bom';
  return undefined;
}

function PlatformCoreEntityThreadTemplatePickerInner({
  variant,
  threadKind: threadKindProp,
  onInsert,
  collectionId: collectionIdProp,
  articleId: articleIdProp,
  orderId: orderIdProp,
}: Props) {
  const searchParams = useSearchParams();
  const overlay = parseSynthaOverlayContext(searchParams);
  const coreMode = isPlatformCoreMode();
  const collectionId =
    collectionIdProp?.trim() ||
    resolvePageCollectionId({ collection: searchParams.get('collection') }) ||
    overlay.collectionId ||
    PLATFORM_CORE_DEMO.collectionId;
  const articleId =
    articleIdProp?.trim() ||
    overlay.articleId ||
    PLATFORM_CORE_DEMO.demoArticleId ||
    'demo-ss27-01';
  const orderId =
    orderIdProp?.trim() ||
    overlay.orderId ||
    searchParams.get('order')?.trim() ||
    searchParams.get('orderId')?.trim() ||
    undefined;

  const threadKind = resolveChatEntityThreadKind({
    explicit: threadKindProp,
    orderId,
    articleId,
  });

  const [remoteSaved, setRemoteSaved] = useState<SavedPlatformCoreEntityThreadTemplate[]>([]);
  const [storageMode, setStorageMode] = useState('unknown');
  const [busy, setBusy] = useState(false);

  const builtIn = useMemo(
    () => resolvePlatformCoreEntityThreadTemplates({ threadKind }),
    [threadKind]
  );

  useEffect(() => {
    if (!coreMode) {
      setRemoteSaved([]);
      return;
    }
    let cancelled = false;
    void fetchPlatformCoreEntityThreadTemplates({ threadKind }).then((res) => {
      if (!cancelled) {
        setRemoteSaved(res.templates);
        setStorageMode(res.storageMode);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [coreMode, threadKind]);

  const insertCtx = useMemo(
    () => ({ orderId, collectionId, articleId, threadKind }),
    [orderId, collectionId, articleId, threadKind]
  );

  const applyTemplate = useCallback(
    async (message: string, kind: PlatformCoreEntityThreadKind | string) => {
      if (!coreMode) {
        onInsert(message);
        return;
      }
      setBusy(true);
      try {
        await applyPlatformCoreEntityThreadTemplate({
          message,
          threadKind: kind,
          orderId,
          collectionId,
          articleId,
        });
        onInsert(message);
      } finally {
        setBusy(false);
      }
    },
    [articleId, collectionId, coreMode, onInsert, orderId]
  );

  const applyBuiltIn = (template: PlatformCoreEntityThreadTemplate) => {
    void applyTemplate(template.buildBody(insertCtx), template.threadKind);
  };

  const applySaved = (template: SavedPlatformCoreEntityThreadTemplate) => {
    void applyTemplate(
      interpolateEntityThreadTemplateBody(template.bodyTemplate, insertCtx),
      template.threadKind
    );
  };

  if (!coreMode) return null;
  if (builtIn.length === 0 && remoteSaved.length === 0) return null;

  const storagePg = storageMode === 'postgres' || storageMode === 'pg';
  const testIdPrefix = `${variant}-comms-entity-thread-templates`;

  return (
    <div
      className="border-border-subtle space-y-2 border-t bg-white px-3 py-2"
      data-testid={`${testIdPrefix}-picker`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-text-muted text-[10px] font-medium uppercase tracking-wide">
          Шаблоны треда
        </span>
        <Badge
          variant="outline"
          className="text-[9px]"
          data-testid={`platform-core-entity-thread-templates-storage-${storagePg ? 'pg' : storageMode}`}
        >
          {storagePg ? 'Шаблоны · PG' : storageMode}
        </Badge>
        <span className="text-text-muted text-[10px]">Без localStorage в core mode</span>
      </div>
      <div className="flex flex-wrap items-center gap-1" data-testid={testIdPrefix}>
        {builtIn.map((template) => (
          <Button
            key={template.id}
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-[10px]"
            disabled={busy}
            data-testid={`${testIdPrefix}-${threadKind ?? 'all'}-${template.id}`}
            onClick={() => applyBuiltIn(template)}
          >
            {template.labelRu}
          </Button>
        ))}
        {remoteSaved.map((template) => (
          <Button
            key={template.id}
            type="button"
            size="sm"
            variant="secondary"
            className="h-7 text-[10px]"
            disabled={busy}
            data-testid={`${testIdPrefix}-custom-${template.id}`}
            onClick={() => applySaved(template)}
          >
            {template.labelRu}
          </Button>
        ))}
      </div>
    </div>
  );
}

/** RU template picker для comms chat — PG store + POST contextual thread (Wave WF). */
export function PlatformCoreEntityThreadTemplatePicker(props: Props) {
  return (
    <Suspense fallback={null}>
      <PlatformCoreEntityThreadTemplatePickerInner {...props} />
    </Suspense>
  );
}
