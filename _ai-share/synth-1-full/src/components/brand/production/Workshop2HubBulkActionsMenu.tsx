'use client';

import { useState } from 'react';
import { ChevronDown, Download, FileArchive, Handshake, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import { downloadWorkshop2TzExportBundleApi } from '@/lib/production/workshop2-tz-export-api-client';
import { useToast } from '@/hooks/use-toast';

type Props = {
  collectionId: string;
  articleIds: string[];
  disabled?: boolean;
  onMessage?: (msg: string | null) => void;
};

/** Wave 13: dropdown bulk-handoff / bulk-showroom / export TZ по коллекции. */
export function Workshop2HubBulkActionsMenu({
  collectionId,
  articleIds,
  disabled,
  onMessage,
}: Props) {
  const [busy, setBusy] = useState<'handoff' | 'showroom' | 'export' | 'compliance' | null>(null);
  const { toast } = useToast();

  const notify = (msg: string | null, ok: boolean) => {
    onMessage?.(msg);
    if (msg) {
      toast({
        title: ok ? 'Массовое действие' : 'Действие заблокировано',
        description: msg,
        variant: ok ? 'default' : 'destructive',
      });
    }
  };

  const runHandoff = async () => {
    if (!articleIds.length) return;
    setBusy('handoff');
    onMessage?.(null);
    try {
      const res = await fetch(
        `/api/workshop2/collections/${encodeURIComponent(collectionId)}/bulk-handoff`,
        {
          method: 'POST',
          headers: {
            ...buildWorkshop2ApiRequestHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ articleIds }),
        }
      );
      const json = (await res.json()) as { messageRu?: string };
      notify(json.messageRu ?? (res.ok ? 'Массовый handoff выполнен' : 'Ошибка handoff'), res.ok);
    } catch {
      notify('Bulk handoff: сеть недоступна', false);
    } finally {
      setBusy(null);
    }
  };

  const runShowroom = async () => {
    if (!articleIds.length) return;
    setBusy('showroom');
    onMessage?.(null);
    try {
      const postShowroom = async (ids: string[]) => {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/bulk-showroom-publish`,
          {
            method: 'POST',
            headers: {
              ...buildWorkshop2ApiRequestHeaders(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ articleIds: ids }),
          }
        );
        return (await res.json()) as {
          ok?: boolean;
          messageRu?: string;
          passed?: number;
          blocked?: Array<{ articleId: string; reasons?: string[] }>;
        };
      };

      let json = await postShowroom(articleIds);
      const blockedIds = json.blocked?.map((row) => row.articleId).filter(Boolean) ?? [];
      let retried = 0;
      if (json.ok && blockedIds.length > 0 && (json.passed ?? 0) > 0) {
        await new Promise((r) => window.setTimeout(r, 400));
        const retryJson = await postShowroom(blockedIds);
        retried = blockedIds.length;
        json = {
          ...retryJson,
          passed: (json.passed ?? 0) + (retryJson.passed ?? 0),
          blocked: retryJson.blocked ?? [],
          messageRu: retryJson.messageRu
            ? `${retryJson.messageRu} (повтор ${retried} заблокированных)`
            : json.messageRu,
        };
      }

      notify(
        json.messageRu ??
          (json.ok
            ? `Опубликовано в витрину: ${json.passed ?? 0}, блок: ${json.blocked?.length ?? 0}${retried ? ` · retry ${retried}` : ''}`
            : 'Ошибка публикации витрины'),
        Boolean(json.ok && (json.blocked?.length ?? 0) === 0)
      );
    } catch {
      notify('Bulk showroom: сеть недоступна', false);
    } finally {
      setBusy(null);
    }
  };

  const runExportCollection = async () => {
    if (!articleIds.length) return;
    setBusy('export');
    onMessage?.(null);
    let ok = 0;
    let blocked = 0;
    for (const articleId of articleIds.slice(0, 12)) {
      const result = await downloadWorkshop2TzExportBundleApi({ collectionId, articleId });
      if (result.ok) ok += 1;
      else blocked += 1;
    }
    notify(
      `Export TZ: скачано ${ok}, блок/ошибка ${blocked} (лимит 12 артикулов за проход).`,
      blocked === 0
    );
    setBusy(null);
  };

  const runCompliancePack = () => {
    if (!articleIds.length) return;
    setBusy('compliance');
    onMessage?.(null);
    const slice = articleIds.slice(0, 20);
    if (articleIds.length > 20) {
      notify(
        `Пакет соответствия: скачиваем первые 20 из ${articleIds.length} (лимит API — 20).`,
        true
      );
    }
    const href = `/api/workshop2/collections/${encodeURIComponent(collectionId)}/compliance-pack.zip?articleIds=${encodeURIComponent(slice.join(','))}`;
    window.location.assign(href);
    setBusy(null);
  };

  const isBusy = busy !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-[10px]"
          disabled={disabled || isBusy || articleIds.length === 0}
          data-testid="workshop2-hub-bulk-actions-menu"
        >
          {isBusy ? '…' : 'Массовые действия'}
          <ChevronDown className="h-3 w-3" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem onClick={() => void runHandoff()} disabled={isBusy}>
          <Handshake className="mr-2 h-3.5 w-3.5" />
          Массовый handoff
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void runShowroom()} disabled={isBusy}>
          <Store className="mr-2 h-3.5 w-3.5" />
          Опубликовать витрину
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void runExportCollection()} disabled={isBusy}>
          <Download className="mr-2 h-3.5 w-3.5" />
          Export TZ (ZIP по артикулам)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => runCompliancePack()} disabled={isBusy}>
          <FileArchive className="mr-2 h-3.5 w-3.5" />
          Пакет соответствия коллекции
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
