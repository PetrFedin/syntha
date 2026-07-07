'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  BookOpen,
  Image,
  ShoppingCart,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { jsonAs } from '@/lib/json';
import {
  archiveMessageFromB2bShape,
  useArchiveIntegrationAction,
  type ArchiveIntegrationMessage,
} from '@/hooks/use-archive-integration-action';

type ColectAddResponse = { success?: boolean; error?: string };

type ColectLookbookStructure = {
  id: string;
  name?: string;
  chapters?: unknown[];
  keyLooks?: unknown[];
};

export default function BrandIntegrationsColectPage() {
  const runArchiveAction = useArchiveIntegrationAction();
  const [lookbookId, setLookbookId] = useState('demo-lookbook');
  const [structure, setStructure] = useState<ColectLookbookStructure | null>(null);
  const [structureLoading, setStructureLoading] = useState(false);
  const [content, setContent] = useState<unknown[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [addToOrderMsg, setAddToOrderMsg] = useState<ArchiveIntegrationMessage | null>(null);
  const [addToOrderLoading, setAddToOrderLoading] = useState(false);

  const loadStructure = async () => {
    setStructureLoading(true);
    try {
      const res = await fetch(
        `/api/b2b/colect/lookbook/${encodeURIComponent(lookbookId)}/structure`
      );
      const data = res.ok ? jsonAs<ColectLookbookStructure>(await res.json()) : null;
      setStructure(data);
    } catch {
      setStructure(null);
    } finally {
      setStructureLoading(false);
    }
  };

  const loadContent = async () => {
    setContentLoading(true);
    try {
      const res = await fetch(`/api/b2b/colect/lookbook/${encodeURIComponent(lookbookId)}/content`);
      const data = res.ok ? await res.json() : [];
      setContent(Array.isArray(data) ? data : []);
    } catch {
      setContent([]);
    } finally {
      setContentLoading(false);
    }
  };

  const addToOrder = useCallback(async () => {
    await runArchiveAction({
      setMsg: setAddToOrderMsg,
      setLoading: setAddToOrderLoading,
      work: async () => {
        const res = await fetch('/api/b2b/colect/add-to-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lookbookId,
            keyLookId: 'demo-key-look',
            skus: [{ sku: 'DEMO-SKU-01', quantity: 2 }],
          }),
        });
        const data = jsonAs<ColectAddResponse>(await res.json());
        return archiveMessageFromB2bShape(data, { kind: 'literal', text: 'Добавлено в заказ' });
      },
    });
  }, [runArchiveAction, lookbookId]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <Link href={ROUTES.brand.integrations}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">Colect</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Структура лукбука (главы, Key Looks), контент (фото, видео, 3D), режимы показа,
            добавление в заказ — при появлении API.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <BookOpen className="h-4 w-4" /> Структура лукбука
            </CardTitle>
            <CardDescription>
              Главы, Key Looks. Добавление в заказ — при появлении API Colect.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              type="text"
              placeholder="ID лукбука"
              value={lookbookId}
              onChange={(e) => setLookbookId(e.target.value)}
              className="w-48 rounded border px-2 py-1.5 text-sm"
            />
            <Button variant="outline" size="sm" onClick={loadStructure} disabled={structureLoading}>
              {structureLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Загрузить структуру
            </Button>
            {structure && (
              <p className="text-sm text-slate-600">
                {structure.name ?? structure.id} · глав: {structure.chapters?.length ?? 0}, Key
                Looks: {structure.keyLooks?.length ?? 0}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <Image className="h-4 w-4" /> Контент и режимы показа
            </CardTitle>
            <CardDescription>
              Фото, видео, 3D — по документации Colect. Режимы: галерея, презентация, полноэкран,
              сетка.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" size="sm" onClick={loadContent} disabled={contentLoading}>
              {contentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Загрузить контент
            </Button>
            {content.length > 0 && (
              <p className="text-sm text-slate-600">Элементов: {content.length}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
              <ShoppingCart className="h-4 w-4" /> Добавить Key Look в заказ
            </CardTitle>
            <CardDescription>
              При появлении API — отправка в Colect или создание строк в B2B заказе.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button onClick={addToOrder} disabled={addToOrderLoading}>
              {addToOrderLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Добавить в заказ
            </Button>
            {addToOrderMsg && (
              <span
                className={addToOrderMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}
              >
                {addToOrderMsg.type === 'success' ? (
                  <CheckCircle2 className="mr-1 inline h-4 w-4" />
                ) : (
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                )}
                {addToOrderMsg.text}
              </span>
            )}
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase">При появлении API</CardTitle>
            <CardDescription>
              Настройте COLECT_API_URL и COLECT_ACCESS_TOKEN. Эндпоинты структуры, контента и
              add-to-order будут вызывать реальный API Colect.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={ROUTES.brand.lookbookProjects}>
          <Button variant="outline" size="sm">
            Проекты лукбуков
          </Button>
        </Link>
        <Link href={ROUTES.brand.integrationsZedonk}>
          <Button variant="ghost" size="sm">
            Zedonk
          </Button>
        </Link>
      </div>
    </div>
  );
}
