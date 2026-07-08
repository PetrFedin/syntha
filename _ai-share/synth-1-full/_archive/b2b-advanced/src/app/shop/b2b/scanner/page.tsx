'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smartphone, QrCode, Trash2 } from 'lucide-react';
import { B2BModulePage } from '@/components/shop/B2BModulePage';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';
import { fetchShowroomSampleByRegistryId } from '@/lib/fashion/showroom-sample-client';
import {
  decodeShowroomTagPayload,
  isShowroomRegistryShortId,
  loadShowroomSelection,
  parseShowroomSampleBarcodeLine,
  saveShowroomSelection,
  type ShowroomScannedLineV1,
  type ShowroomSampleTagPayloadV1,
} from '@/lib/fashion/showroom-sample-tag';

/** Демо-обогащение названия, если в штрихкоде только SKU (без бэкенда). */
const DEMO_SKU_NAMES: Record<string, string> = {
  'SKU-001-S': 'Silk Evening Dress',
  'SKU-002-M': 'Wool Oversized Coat',
  'SKU-003-XS': 'Leather Bomber Jacket',
};

function enrichPayload(p: ShowroomSampleTagPayloadV1): ShowroomSampleTagPayloadV1 {
  if (p.name && p.name !== p.sku) return p;
  const n = DEMO_SKU_NAMES[p.sku];
  return n ? { ...p, name: n } : p;
}

function newLineId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseScannedToken(
  raw: string
): { payload: ShowroomSampleTagPayloadV1; source: 'qr' | 'barcode' } | null {
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith('SYNTH1|')) {
    const payload = parseShowroomSampleBarcodeLine(t);
    return payload ? { payload: enrichPayload(payload), source: 'barcode' } : null;
  }
  const fromB64 = decodeShowroomTagPayload(t);
  if (fromB64) return { payload: enrichPayload(fromB64), source: 'qr' };
  if (t.includes('add=')) {
    try {
      const u = new URL(t.startsWith('http') ? t : `https://local.invalid${t}`);
      const add = u.searchParams.get('add');
      if (add) {
        const payload = decodeShowroomTagPayload(add);
        if (payload) return { payload: enrichPayload(payload), source: 'qr' };
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function addLineFromPayload(
  setLines: Dispatch<SetStateAction<ShowroomScannedLineV1[]>>,
  p: ShowroomSampleTagPayloadV1,
  source: 'qr' | 'barcode'
): boolean {
  let added = false;
  setLines((prev) => {
    if (prev.some((l) => l.payload.sampleId === p.sampleId)) return prev;
    added = true;
    return [
      ...prev,
      {
        id: newLineId(),
        scannedAt: new Date().toISOString(),
        source,
        payload: p,
        sizesQtyNote: '',
      },
    ];
  });
  return added;
}

function B2BScannerInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lines, setLines] = useState<ShowroomScannedLineV1[]>([]);
  const [wedge, setWedge] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLines(loadShowroomSelection());
  }, []);

  useEffect(() => {
    saveShowroomSelection(lines);
  }, [lines]);

  useEffect(() => {
    const sampleIdParam = searchParams.get('sampleId');
    if (!sampleIdParam || !isShowroomRegistryShortId(sampleIdParam)) return;
    let cancelled = false;
    (async () => {
      const raw = await fetchShowroomSampleByRegistryId(sampleIdParam.trim());
      if (cancelled) return;
      if (!raw) {
        setToast('Бирка не найдена (id устарел или другой инстанс сервера).');
        router.replace(pathname, { scroll: false });
        return;
      }
      const p = enrichPayload(raw);
      const added = addLineFromPayload(setLines, p, 'qr');
      setToast(added ? 'Модель добавлена из QR (по id бирки).' : 'Уже в списке.');
      router.replace(pathname, { scroll: false });
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, router, pathname]);

  useEffect(() => {
    const add = searchParams.get('add');
    if (!add) return;
    const decoded = decodeShowroomTagPayload(add);
    if (decoded) {
      const p = enrichPayload(decoded);
      const added = addLineFromPayload(setLines, p, 'qr');
      setToast(added ? 'Модель добавлена из QR (legacy add).' : 'Уже в списке.');
    } else {
      setToast('Не удалось разобрать QR-параметр add.');
    }
    router.replace(pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  const processWedge = useCallback(async () => {
    const raw = wedge.trim();
    setWedge('');
    if (!raw) return;
    if (isShowroomRegistryShortId(raw)) {
      try {
        const fromApi = await fetchShowroomSampleByRegistryId(raw);
        if (!fromApi) {
          setToast('Бирка не найдена по id.');
          return;
        }
        const p = enrichPayload(fromApi);
        const added = addLineFromPayload(setLines, p, 'barcode');
        setToast(added ? 'Добавлено по id бирки.' : 'Уже в списке.');
      } catch {
        setToast('Ошибка загрузки бирки.');
      }
      return;
    }
    const parsed = parseScannedToken(raw);
    if (!parsed) {
      setToast('Не распознан формат: id srs-…, SYNTH1|1|… или legacy base64url / add=');
      return;
    }
    setLines((prev) => {
      if (prev.some((l) => l.payload.sampleId === parsed.payload.sampleId)) {
        requestAnimationFrame(() => setToast('Уже в списке.'));
        return prev;
      }
      const row: ShowroomScannedLineV1 = {
        id: newLineId(),
        scannedAt: new Date().toISOString(),
        source: parsed.source,
        payload: parsed.payload,
        sizesQtyNote: '',
      };
      requestAnimationFrame(() => setToast('Добавлено со сканера.'));
      return [...prev, row];
    });
  }, [wedge]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const countLabel = useMemo(() => `${lines.length} поз.`, [lines.length]);

  return (
    <>
      {toast ? (
        <p
          className="text-accent-primary bg-accent-primary/10 border-accent-primary/20 mb-3 rounded-lg border px-3 py-2 text-sm font-medium"
          role="status"
        >
          {toast}
        </p>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Сканер шоурума</CardTitle>
          <CardDescription>
            Скан QR на бирке открывает эту страницу с параметром{' '}
            <code className="bg-bg-surface2 rounded px-1 text-xs">add</code> — модель попадает в
            список. Штрихкод (Code 128) вводится в поле ниже и обрабатывается кнопкой — удобно для
            сканера с эмуляцией клавиатуры. Дальше укажите только размеры и количества.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-border-default bg-bg-surface2 flex items-center justify-center rounded-xl border-2 border-dashed p-8">
            <QrCode className="text-text-muted h-16 w-16" aria-hidden />
          </div>

          <div className="space-y-2">
            <label htmlFor="wedge" className="text-text-primary text-sm font-medium">
              Ввод со сканера (штрихкод или вставка payload)
            </label>
            <div className="flex flex-wrap gap-2">
              <Input
                id="wedge"
                value={wedge}
                onChange={(e) => setWedge(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    processWedge();
                  }
                }}
                placeholder="srs-… или SYNTH1|1|…"
                className="max-w-xl font-mono text-sm"
                autoComplete="off"
              />
              <Button type="button" onClick={processWedge}>
                Обработать ввод
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-text-primary text-sm font-semibold">
                Выбранные модели ({countLabel})
              </h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLines([])}
                  disabled={lines.length === 0}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Очистить
                </Button>
                <Button type="button" size="sm" asChild disabled={lines.length === 0}>
                  <Link href={ROUTES.shop.b2bQuickOrder}>Быстрый заказ — перенести артикулы</Link>
                </Button>
              </div>
            </div>

            {lines.length === 0 ? (
              <p className="text-text-secondary text-sm">
                Пока пусто — отсканируйте бирки в шоуруме.
              </p>
            ) : (
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li
                    key={line.id}
                    className="border-border-default space-y-2 rounded-lg border bg-white p-3 shadow-sm"
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <p className="text-text-primary font-semibold">{line.payload.name}</p>
                        <p className="text-text-secondary font-mono text-xs">
                          {line.payload.sku} · {line.payload.productId} · образец{' '}
                          {line.payload.sampleId}
                          {line.payload.internalArticleCode
                            ? ` · внутр. ${line.payload.internalArticleCode}`
                            : ''}
                        </p>
                        <p className="text-text-muted mt-1 text-[10px]">
                          Источник: {line.source === 'qr' ? 'QR' : 'Штрихкод'} ·{' '}
                          {new Date(line.scannedAt).toLocaleString('ru-RU')}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-rose-600"
                        onClick={() => setLines((prev) => prev.filter((l) => l.id !== line.id))}
                      >
                        Убрать
                      </Button>
                    </div>
                    <div>
                      <label
                        className="text-text-secondary text-xs font-medium"
                        htmlFor={`sq-${line.id}`}
                      >
                        Размеры и количества
                      </label>
                      <Input
                        id={`sq-${line.id}`}
                        value={line.sizesQtyNote}
                        onChange={(e) =>
                          setLines((prev) =>
                            prev.map((l) =>
                              l.id === line.id ? { ...l, sizesQtyNote: e.target.value } : l
                            )
                          )
                        }
                        placeholder="Например: S — 2, M — 1, L — 0"
                        className="mt-1 text-sm"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-text-secondary text-xs">
            Список хранится в браузере на этом устройстве. Для боевого режима понадобится
            синхронизация сессии байера и резолв opaque-кода штрихкода на сервере.
          </p>
        </CardContent>
      </Card>
    </>
  );
}

function ScannerFallback() {
  return (
    <Card>
      <CardContent className="text-text-secondary p-8 text-sm">Загрузка сканера…</CardContent>
    </Card>
  );
}

/** Colect, Le New Black: Sales App — скан бирок образцов → список моделей → размеры/кол-ва. */
export default function B2BScannerPage() {
  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <B2BModulePage
        title="Sales App (мобильное)"
        description="Скан QR и штрихкода бирки образца в шоуруме — модель сразу в списке выбранного, без ручного ввода артикула."
        moduleId="sales-app"
        icon={Smartphone}
        phase={4}
      >
        <Suspense fallback={<ScannerFallback />}>
          <B2BScannerInner />
        </Suspense>
      </B2BModulePage>
    </CabinetPageContent>
  );
}
