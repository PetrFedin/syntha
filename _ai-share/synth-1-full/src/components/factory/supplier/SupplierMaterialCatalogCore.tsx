'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, PlusCircle, Search, Edit3, Trash2, Globe, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import type { SupplierMaterialCatalogListing } from '@/lib/platform-core-supplier-material-catalog.types';
import { SupplierMaterialCatalogPgReadStrip } from '@/components/factory/supplier/SupplierMaterialCatalogPgReadStrip';

type DraftListing = {
  id?: string;
  name: string;
  category: string;
  materialType: string;
  origin: string;
  priceLabel: string;
  status: SupplierMaterialCatalogListing['status'];
};

const DEMO_LISTINGS: SupplierMaterialCatalogListing[] = [
  {
    id: 'm1',
    supplierId: 'supplier-demo',
    name: 'Кашемир 100%',
    category: 'Ткань',
    materialType: 'Натуральная',
    origin: 'Италия',
    priceLabel: '4500 ₽/м',
    status: 'active',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'm2',
    supplierId: 'supplier-demo',
    name: 'Шелк Малбери',
    category: 'Ткань',
    materialType: 'Люкс',
    origin: 'Китай',
    priceLabel: '3200 ₽/м',
    status: 'active',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const emptyDraft = (): DraftListing => ({
  name: '',
  category: 'Ткань',
  materialType: '',
  origin: '',
  priceLabel: '',
  status: 'review',
});

export function SupplierMaterialCatalogCore({ supplierId = 'supplier-demo' }: { supplierId?: string }) {
  const coreMode = isPlatformCoreMode();
  const [listings, setListings] = useState<SupplierMaterialCatalogListing[]>(
    coreMode ? [] : DEMO_LISTINGS
  );
  const [loading, setLoading] = useState(coreMode);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<DraftListing | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!coreMode) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/workshop2/supplier/material-catalog?supplierId=${encodeURIComponent(supplierId)}`
      );
      const json = (await res.json()) as { listings?: SupplierMaterialCatalogListing[]; error?: string };
      if (!res.ok) throw new Error(json.error ?? 'load_failed');
      setListings(json.listings ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'load_failed');
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [coreMode, supplierId]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q)
    );
  }, [listings, query]);

  const saveDraft = async () => {
    if (!draft?.name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/workshop2/supplier/material-catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...draft, supplierId }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'save_failed');
      setDraft(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save_failed');
    } finally {
      setBusy(false);
    }
  };

  const removeListing = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/workshop2/supplier/material-catalog?supplierId=${encodeURIComponent(supplierId)}&id=${encodeURIComponent(id)}`,
        { method: 'DELETE' }
      );
      const json = (await res.json()) as { ok?: boolean };
      if (!res.ok || !json.ok) throw new Error('delete_failed');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'delete_failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="supplier-material-catalog-core">
      <header className="flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
              B2B Material Catalog
            </span>
          </div>
          <h1 className="font-headline text-base font-black uppercase tracking-tighter">
            Каталог сырья
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            {coreMode
              ? 'PG listing · CRUD без silent memory seed.'
              : 'Демо-листинг (вне core mode).'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-border-default rounded-xl text-[10px] font-black uppercase tracking-widest"
            disabled={!coreMode || busy}
          >
            <Globe className="mr-2 h-3.5 w-3.5" /> Опубликовать в MP
          </Button>
          <Button
            className="bg-text-primary rounded-xl text-[10px] font-black uppercase tracking-widest text-white"
            disabled={!coreMode || busy}
            onClick={() => setDraft(emptyDraft())}
            data-testid="supplier-catalog-add-cta"
          >
            <PlusCircle className="mr-2 h-3.5 w-3.5" /> Добавить позицию
          </Button>
        </div>
      </header>

      {error ? (
        <p className="text-xs text-rose-600" data-testid="supplier-catalog-error">
          {error}
        </p>
      ) : null}

      {coreMode ? (
        <SupplierMaterialCatalogPgReadStrip listingCount={listings.length} loading={loading} />
      ) : null}

      {draft ? (
        <Card className="border-emerald-200/60">
          <CardHeader className="pb-2 text-sm font-semibold">
            {draft.id ? 'Редактировать' : 'Новая позиция'}
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-3">
            <Input
              placeholder="Название"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <Input
              placeholder="Категория"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            />
            <Input
              placeholder="Тип"
              value={draft.materialType}
              onChange={(e) => setDraft({ ...draft, materialType: e.target.value })}
            />
            <Input
              placeholder="Происхождение"
              value={draft.origin}
              onChange={(e) => setDraft({ ...draft, origin: e.target.value })}
            />
            <Input
              placeholder="Цена"
              value={draft.priceLabel}
              onChange={(e) => setDraft({ ...draft, priceLabel: e.target.value })}
            />
            <div className="flex gap-2">
              <Button size="sm" disabled={busy} onClick={() => void saveDraft()}>
                Сохранить
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border-subtle overflow-hidden rounded-xl shadow-sm">
        <CardHeader className="bg-bg-surface2/80 border-border-subtle border-b p-4">
          <div className="relative w-full max-w-md">
            <Search className="text-text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Поиск по каталогу..."
              className="border-border-default h-11 rounded-xl bg-white pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-text-muted p-6 text-sm">Загрузка каталога…</p>
          ) : filtered.length === 0 ? (
            <p className="text-text-muted p-6 text-sm" data-testid="supplier-catalog-empty">
              {coreMode ? 'Каталог пуст — добавьте первую позицию.' : 'Нет позиций.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-bg-surface2/30 hover:bg-bg-surface2/30">
                  <TableHead className="py-4 pl-8 text-[10px] font-black uppercase tracking-widest">
                    Материал
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Тип / Группа
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Происхождение
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Базовая цена
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">
                    Статус
                  </TableHead>
                  <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest">
                    Действия
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((mat) => (
                  <TableRow key={mat.id} className="hover:bg-bg-surface2 group transition-colors">
                    <TableCell className="py-6 pl-8">
                      <div className="flex items-center gap-3">
                        <div className="bg-bg-surface2 border-border-default flex h-12 w-12 items-center justify-center rounded-xl border">
                          <Sparkles className="text-text-muted h-5 w-5 transition-colors group-hover:text-emerald-500" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-text-primary text-xs font-black uppercase tracking-tighter">
                            {mat.name}
                          </p>
                          <p className="text-text-muted text-[9px] font-bold uppercase tracking-widest">
                            ID: {mat.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge
                          variant="outline"
                          className="border-border-subtle text-text-secondary text-[8px] font-black uppercase"
                        >
                          {mat.category}
                        </Badge>
                        <p className="text-text-muted text-[10px] font-bold uppercase tracking-tight">
                          {mat.materialType}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-secondary text-[11px] font-bold uppercase tracking-widest">
                      {mat.origin}
                    </TableCell>
                    <TableCell className="text-text-primary text-xs font-black">
                      {mat.priceLabel}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'border-none px-2 py-0.5 text-[8px] font-black uppercase',
                          mat.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        )}
                      >
                        {mat.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-text-muted hover:text-accent-primary h-8 w-8"
                          disabled={!coreMode || busy}
                          onClick={() =>
                            setDraft({
                              id: mat.id,
                              name: mat.name,
                              category: mat.category,
                              materialType: mat.materialType,
                              origin: mat.origin,
                              priceLabel: mat.priceLabel,
                              status: mat.status,
                            })
                          }
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-text-muted h-8 w-8 hover:text-rose-600"
                          disabled={!coreMode || busy}
                          onClick={() => void removeListing(mat.id)}
                          data-testid={`supplier-catalog-delete-${mat.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
