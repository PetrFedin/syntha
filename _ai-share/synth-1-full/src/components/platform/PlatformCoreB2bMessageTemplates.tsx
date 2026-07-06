'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookmarkPlus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { parseSynthaOverlayContext } from '@/lib/platform-core-ports/communications/syntha-overlay-context';
import {
  deletePlatformCoreB2bMessageTemplateRemote,
  fetchPlatformCoreB2bMessageTemplates,
  savePlatformCoreB2bMessageTemplateRemote,
} from '@/lib/platform-core-ports/communications/platform-core-b2b-message-templates-client';
import {
  resolvePlatformCoreB2bMessageTemplates,
  type PlatformCoreB2bMessageTemplate,
} from '@/lib/platform-core-ports/communications/platform-core-b2b-message-templates';
import {
  deletePlatformCoreB2bMessageTemplate,
  interpolateB2bMessageTemplateBody,
  listSavedPlatformCoreB2bMessageTemplates,
  savePlatformCoreB2bMessageTemplate,
  type SavedPlatformCoreB2bMessageTemplate,
} from '@/lib/platform-core-ports/communications/platform-core-b2b-message-templates-storage';

type Props = {
  onInsert: (text: string) => void;
  draftText?: string;
};

function PlatformCoreB2bMessageTemplatesInner({ onInsert, draftText = '' }: Props) {
  const searchParams = useSearchParams();
  const ctx = parseSynthaOverlayContext(searchParams);
  const builtIn = resolvePlatformCoreB2bMessageTemplates(ctx);
  const [savedNonce, setSavedNonce] = useState(0);
  const [remoteSaved, setRemoteSaved] = useState<SavedPlatformCoreB2bMessageTemplate[]>([]);
  const [templatesStorageMode, setTemplatesStorageMode] = useState<string>('unknown');
  const coreMode = isPlatformCoreMode();

  const context = builtIn[0]?.context;

  useEffect(() => {
    if (!coreMode || !context) {
      setRemoteSaved([]);
      return;
    }
    let cancelled = false;
    void fetchPlatformCoreB2bMessageTemplates({ context }).then((res) => {
      if (!cancelled) {
        setRemoteSaved(res.templates);
        setTemplatesStorageMode(res.storageMode);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [context, coreMode, savedNonce]);

  const saved = useMemo(() => {
    void savedNonce;
    if (coreMode) return remoteSaved.filter((row) => !context || row.context === context);
    return context ? listSavedPlatformCoreB2bMessageTemplates(context) : [];
  }, [context, coreMode, remoteSaved, savedNonce]);

  const insertCtx = useMemo(
    () => ({
      orderId: ctx.orderId ?? undefined,
      collectionId: ctx.collectionId ?? undefined,
      articleId: ctx.articleId ?? undefined,
    }),
    [ctx.orderId, ctx.collectionId, ctx.articleId]
  );

  const handleInsertBuiltIn = useCallback(
    (template: PlatformCoreB2bMessageTemplate) => {
      onInsert(template.buildBody(insertCtx));
    },
    [insertCtx, onInsert]
  );

  const handleInsertSaved = useCallback(
    (template: SavedPlatformCoreB2bMessageTemplate) => {
      onInsert(interpolateB2bMessageTemplateBody(template.bodyTemplate, insertCtx));
    },
    [insertCtx, onInsert]
  );

  const handleSaveDraft = useCallback(async () => {
    const body = draftText.trim();
    if (!body || !context) return;
    const label =
      window.prompt('Название шаблона', body.slice(0, 32))?.trim() ||
      body.slice(0, 32);
    if (!label) return;
    if (coreMode) {
      const savedRemote = await savePlatformCoreB2bMessageTemplateRemote({
        labelRu: label,
        context,
        bodyTemplate: body,
      });
      if (!savedRemote) return;
    } else {
      savePlatformCoreB2bMessageTemplate({
        labelRu: label,
        context,
        bodyTemplate: body,
      });
    }
    setSavedNonce((n) => n + 1);
  }, [context, coreMode, draftText]);

  const handleDeleteSaved = useCallback(
    async (id: string) => {
      if (coreMode) {
        const ok = await deletePlatformCoreB2bMessageTemplateRemote({ id });
        if (!ok) return;
      } else {
        deletePlatformCoreB2bMessageTemplate(id);
      }
      setSavedNonce((n) => n + 1);
    },
    [coreMode]
  );

  if (builtIn.length === 0 && saved.length === 0) return null;

  const templatesPg =
    templatesStorageMode === 'postgres' || templatesStorageMode === 'pg';

  return (
    <div
      className="border-border-subtle space-y-2 border-t bg-white px-3 py-2"
      data-testid="platform-core-b2b-message-templates"
    >
      {coreMode ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="text-[9px] uppercase tracking-wide"
            data-testid={`platform-core-b2b-message-templates-storage-${templatesPg ? 'pg' : 'local'}`}
          >
            {templatesPg ? 'Шаблоны · PG' : 'Шаблоны · локально'}
          </Badge>
          <span className="text-text-muted text-[10px]">Без localStorage в core mode</span>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-1">
        {builtIn.map((template) => (
          <Button
            key={template.id}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 rounded-md px-2 text-[10px] font-semibold"
            data-testid={`platform-core-b2b-message-template-${template.id}`}
            onClick={() => handleInsertBuiltIn(template)}
          >
            {template.labelRu}
          </Button>
        ))}
        {saved.map((template) => (
          <span key={template.id} className="inline-flex items-center gap-0.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-7 rounded-md px-2 text-[10px] font-semibold"
              data-testid={`platform-core-b2b-message-template-custom-${template.id}`}
              onClick={() => handleInsertSaved(template)}
            >
              {template.labelRu}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label={`Удалить шаблон ${template.labelRu}`}
              data-testid={`platform-core-b2b-message-template-delete-${template.id}`}
              onClick={() => void handleDeleteSaved(template.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </span>
        ))}
      </div>
      {context && draftText.trim() ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-[10px] font-semibold"
          data-testid="platform-core-b2b-message-template-save-draft"
          onClick={handleSaveDraft}
        >
          <BookmarkPlus className="h-3 w-3" />
          Сохранить как шаблон
        </Button>
      ) : null}
    </div>
  );
}

/** Шаблоны быстрых сообщений B2B в slimCore (заказ / артикул W2) + свои шаблоны. */
export function PlatformCoreB2bMessageTemplates(props: Props) {
  return (
    <Suspense fallback={null}>
      <PlatformCoreB2bMessageTemplatesInner {...props} />
    </Suspense>
  );
}
