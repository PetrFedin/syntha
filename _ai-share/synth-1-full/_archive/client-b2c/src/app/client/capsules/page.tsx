'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlatformDataBanner } from '@/components/client/platform-data-banner';
import { ROUTES } from '@/lib/routes';
import type { Product } from '@/lib/types';
import { downloadJsonFile, readJsonFromFile } from '@/lib/platform/json-io';
import {
  loadCapsuleFromStorage,
  parseCapsuleImport,
  resolveCapsuleSlots,
  saveCapsuleToStorage,
  toCapsuleExport,
} from '@/lib/platform/capsule-store';
import { Plus, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function ClientCapsulesPage() {
  const { toast } = useToast();
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [name, setName] = useState('Мой образ SS26');
  const [slots, setSlots] = useState<(Product | null)[]>([null, null, null]);

  useEffect(() => {
    fetch('/data/products.json')
      .then((r) => r.json())
      .then((d) => setCatalog((d as Product[]).slice(0, 48)))
      .catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    const saved = loadCapsuleFromStorage();
    if (!saved) return;
    setName(saved.name);
    if (catalog.length) {
      setSlots(resolveCapsuleSlots(catalog, saved.ids));
    }
  }, [catalog]);

  const pick = (idx: number, product: Product) => {
    const next = [...slots];
    next[idx] = product;
    setSlots(next);
  };

  const clearSlot = (idx: number) => {
    const next = [...slots];
    next[idx] = null;
    setSlots(next);
  };

  const save = () => {
    saveCapsuleToStorage(name, slots);
    toast({ title: 'Капсула сохранена', description: 'Данные в localStorage этого браузера.' });
  };

  const exportJson = () => {
    downloadJsonFile('synth-capsule.json', toCapsuleExport(name, slots));
  };

  const importJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      const raw = await readJsonFromFile(f);
      const exp = parseCapsuleImport(raw);
      if (!exp) {
        toast({ title: 'Неверный формат', variant: 'destructive' });
        return;
      }
      setName(exp.name);
      if (catalog.length) {
        setSlots(
          resolveCapsuleSlots(
            catalog,
            exp.productIds.map((id) => id ?? undefined)
          )
        );
      }
      toast({ title: 'Импорт выполнен', description: 'Сохраните, чтобы записать в localStorage.' });
    } catch {
      toast({ title: 'Ошибка чтения файла', variant: 'destructive' });
    }
  };

  const emptySlots = slots.filter((s) => !s).length;

  return (
    <CabinetPageContent maxWidth="4xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ClientCabinetSectionHeader />
        </div>
        <PlatformDataBanner />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Название и слоты</CardTitle>
          <CardDescription>
            {catalog.length === 0
              ? 'Загрузка каталога…'
              : emptySlots === 3
                ? 'Выберите до трёх товаров из сетки ниже.'
                : `Заполнено ${3 - emptySlots} из 3 слотов.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="min-h-[140px] space-y-2 rounded-lg border p-3">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Слот {i + 1}
                </p>
                {slots[i] ? (
                  <div className="space-y-2">
                    <div className="relative aspect-square overflow-hidden rounded-md">
                      <Image
                        src={slots[i]!.images[0]?.url || '/placeholder.jpg'}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="120px"
                      />
                    </div>
                    <p className="line-clamp-2 text-xs">{slots[i]!.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => clearSlot(i)}
                    >
                      Снять
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Пустой слот</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={save}>
              Сохранить в браузер
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={exportJson}>
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
                onChange={importJson}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Добавить из каталога
          </CardTitle>
        </CardHeader>
        <CardContent>
          {catalog.length === 0 ? (
            <p className="text-sm text-muted-foreground">Нет товаров в демо-каталоге.</p>
          ) : (
            <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-4">
              {catalog.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="rounded-md border p-1 text-left hover:border-primary"
                  onClick={() => {
                    const empty = slots.findIndex((s) => !s);
                    if (empty >= 0) pick(empty, p);
                  }}
                >
                  <div className="relative aspect-square overflow-hidden rounded">
                    <Image
                      src={p.images[0]?.url || '/placeholder.jpg'}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[10px]">{p.name}</p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
