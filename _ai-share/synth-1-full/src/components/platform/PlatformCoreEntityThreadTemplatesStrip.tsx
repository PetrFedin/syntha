'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  resolvePlatformCoreEntityThreadTemplates,
  type PlatformCoreEntityThreadKind,
  type PlatformCoreEntityThreadTemplate,
} from '@/lib/platform-core-ports/communications/platform-core-entity-thread-templates';
import { fetchPlatformCoreEntityThreadTemplates } from '@/lib/platform-core-ports/communications/platform-core-entity-thread-templates-client';
import {
  interpolateEntityThreadTemplateBody,
  type SavedPlatformCoreEntityThreadTemplate,
} from '@/lib/platform-core-ports/communications/platform-core-entity-thread-templates-storage';
import { applyPlatformCoreEntityThreadTemplate } from '@/lib/platform-core-ports/communications/platform-core-entity-thread-template-apply';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

type Props = {
  threadKind: PlatformCoreEntityThreadKind;
  collectionId: string;
  articleId: string;
  orderId?: string;
  variant: 'brand' | 'shop' | 'manufacturer' | 'supplier';
};

/** Шаблоны entity thread + POST contextual thread (Wave UH). */
export function PlatformCoreEntityThreadTemplatesStrip({
  threadKind,
  collectionId,
  articleId,
  orderId,
  variant,
}: Props) {
  const [remoteSaved, setRemoteSaved] = useState<SavedPlatformCoreEntityThreadTemplate[]>([]);
  const [storageMode, setStorageMode] = useState('unknown');
  const [busy, setBusy] = useState(false);
  const coreMode = isPlatformCoreMode();
  const builtIn = useMemo(
    () => resolvePlatformCoreEntityThreadTemplates({ threadKind }),
    [threadKind]
  );

  useEffect(() => {
    if (!coreMode) return;
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
    () => ({
      orderId: orderId?.trim() || undefined,
      collectionId,
      articleId,
      threadKind,
    }),
    [orderId, collectionId, articleId, threadKind]
  );

  const openThread = async (message: string) => {
    if (!coreMode) return;
    setBusy(true);
    try {
      await applyPlatformCoreEntityThreadTemplate({
        message,
        threadKind,
        orderId: orderId?.trim() || undefined,
        collectionId,
        articleId,
      });
    } finally {
      setBusy(false);
    }
  };

  const applyBuiltIn = (template: PlatformCoreEntityThreadTemplate) => {
    void openThread(template.buildBody(insertCtx));
  };

  const applySaved = (template: SavedPlatformCoreEntityThreadTemplate) => {
    void openThread(interpolateEntityThreadTemplateBody(template.bodyTemplate, insertCtx));
  };

  const testIdPrefix = `${variant}-comms-entity-thread-templates`;
  const storagePg = storageMode === 'postgres' || storageMode === 'pg';

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 rounded-md border border-slate-200/80 bg-slate-50/60 p-2"
      data-testid={testIdPrefix}
    >
      <span className="text-text-muted text-[10px] font-medium uppercase tracking-wide">
        Шаблоны треда
      </span>
      {coreMode ? <span className="text-text-muted text-[9px]">Без localStorage</span> : null}
      {coreMode ? (
        <Badge
          variant="outline"
          className="text-[9px]"
          data-testid={`platform-core-entity-thread-templates-storage-${storagePg ? 'pg' : storageMode}`}
        >
          {storagePg ? 'PG' : storageMode}
        </Badge>
      ) : null}
      {builtIn.map((template) => (
        <Button
          key={template.id}
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-[10px]"
          disabled={busy}
          data-testid={`${testIdPrefix}-${threadKind}-${template.id}`}
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
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 text-[10px]"
        disabled={busy}
        data-testid={`${testIdPrefix}-open-thread-${threadKind}`}
        onClick={() =>
          void openThread(`Тред · ${threadKind} · ${articleId}${orderId ? ` · ${orderId}` : ''}`)
        }
      >
        Открыть чат
      </Button>
    </div>
  );
}
