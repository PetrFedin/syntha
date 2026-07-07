'use client';

import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformDataBanner } from '@/components/client/platform-data-banner';
import { ROUTES } from '@/lib/routes';
import { products } from '@/lib/products';
import {
  exportVisualSearchSession,
  getVisualSearchTransport,
  loadVisualSearchSession,
  parseVisualSearchImport,
  runVisualSearch,
  saveVisualSearchSession,
  type VisualSearchHit,
  type VisualSearchSessionV1,
} from '@/lib/platform/visual-search';
import { downloadJsonFile, readJsonFromFile } from '@/lib/platform/json-io';
import { VISUAL_SEARCH_EXPORT_VERSION } from '@/lib/platform/types';
import { Sparkles, Download, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function ClientVisualSearchPage() {
  const { toast } = useToast();
  const transport = getVisualSearchTransport();
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [hits, setHits] = useState<VisualSearchHit[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const s = loadVisualSearchSession();
    if (s?.previewDataUrl) setPreview(s.previewDataUrl);
    if (s?.hits?.length) setHits(s.hits);
  }, []);

  const persist = useCallback((nextPreview: string | null, nextHits: VisualSearchHit[]) => {
    const session: VisualSearchSessionV1 = {
      version: VISUAL_SEARCH_EXPORT_VERSION,
      updatedAt: Date.now(),
      previewDataUrl: nextPreview,
      hits: nextHits,
    };
    saveVisualSearchSession(session);
  }, []);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f?.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = () => setPreview(String(r.result));
    r.readAsDataURL(f);
  };

  const runSearch = async () => {
    setBusy(true);
    setApiError(null);
    try {
      const next = await runVisualSearch(transport, products, preview);
      setHits(next);
      persist(preview, next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка поиска';
      setApiError(msg);
      toast({ title: 'Визуальный поиск', description: msg, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const clearSession = () => {
    setPreview(null);
    setHits([]);
    persist(null, []);
    toast({ title: 'Сессия сброшена' });
  };

  const exportSession = () => {
    const session: VisualSearchSessionV1 = {
      version: VISUAL_SEARCH_EXPORT_VERSION,
      updatedAt: Date.now(),
      previewDataUrl: preview,
      hits,
    };
    downloadJsonFile('synth-visual-search-session.json', exportVisualSearchSession(session));
  };

  const importSession = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const raw = await readJsonFromFile(f);
      const s = parseVisualSearchImport(raw);
      if (!s) {
        toast({ title: 'Неверный файл', variant: 'destructive' });
        return;
      }
      if (s.previewDataUrl) setPreview(s.previewDataUrl);
      setHits(s.hits);
      saveVisualSearchSession(s);
      toast({ title: 'Сессия импортирована' });
    } catch {
      toast({ title: 'Не удалось прочитать JSON', variant: 'destructive' });
    }
  };

  return (
    <CabinetPageContent maxWidth="4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ClientCabinetSectionHeader
            title="Визуальный поиск"
            description={
              <>
                Референс → похожие <AcronymWithTooltip abbr="SKU" />. В режиме{' '}
                <AcronymWithTooltip abbr="API" /> ожидается POST{' '}
                <code className="rounded bg-muted px-1 text-[10px]">/v1/client/visual-search</code>.
              </>
            }
          />
        </div>
        <PlatformDataBanner />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Референс</CardTitle>
          <CardDescription>
            JPEG/PNG. Сессия сохраняется в localStorage; экспорт — для бэкапа или миграции на API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input type="file" accept="image/*" className="text-sm" onChange={onFile} />
          {preview ? (
            <div className="relative aspect-video max-h-48 w-full overflow-hidden rounded-lg border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Загрузите фото — появится превью и станет доступен поиск.
            </div>
          )}
          {apiError && <p className="text-xs text-destructive">{apiError}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={runSearch} disabled={busy || !preview}>
              <Sparkles className="mr-2 h-4 w-4" />
              {busy ? 'Ищем…' : transport === 'local' ? 'Найти похожие' : 'Найти (API)'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={exportSession}
              disabled={!hits.length && !preview}
            >
              <Download className="mr-2 h-4 w-4" />
              Экспорт JSON
            </Button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
              <Upload className="mr-2 h-4 w-4" />
              Импорт JSON
              <input
                type="file"
                accept="application/json,.json"
                className="sr-only"
                onChange={importSession}
              />
            </label>
            <Button type="button" variant="ghost" size="sm" onClick={clearSession}>
              <Trash2 className="mr-2 h-4 w-4" />
              Сброс
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Выдача (последний запуск)</h2>
        {hits.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Пока нет результатов. Запустите поиск или импортируйте сессию.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {hits.map((h) => (
              <Link
                key={h.productId}
                href={`/products/${h.slug}`}
                className="group overflow-hidden rounded-lg border bg-card"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={h.imageUrl}
                    alt={h.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
                <p className="line-clamp-2 p-2 text-xs font-medium group-hover:text-primary">
                  {h.name}
                </p>
                {h.score != null && (
                  <p className="px-2 pb-2 text-[10px] text-muted-foreground">score {h.score}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </CabinetPageContent>
  );
}
