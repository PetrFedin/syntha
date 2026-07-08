'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { ShopB2bNuOrderScope } from '@/components/shop/ShopB2bNuOrderScope';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

/** NuOrder/JOOR: быстрый заказ по артикулам — ввод строк "стиль / размер / кол-во" без каталога. */
type QuickLine = { styleNumber: string; size: string; qty: string };

const DEFAULT_LINE: QuickLine = { styleNumber: '', size: '', qty: '0' };
const MOCK_SIZES = ['XS', 'S', 'M', 'L', 'XL', '36', '38', '40', '42'];
/** NuOrder/SparkLayer: фильтр по сезону для быстрого поиска артикулов */
const SEASONS = [
  { value: '', label: 'Все сезоны' },
  { value: 'FW26', label: 'FW26' },
  { value: 'SS26', label: 'SS26' },
  { value: 'FW25', label: 'FW25' },
  { value: 'SS25', label: 'SS25' },
];
/** Фильтр по цвету (Fashion Cloud / Colect) */
const COLORS = [
  { value: '', label: 'Все цвета' },
  { value: 'black', label: 'Чёрный' },
  { value: 'white', label: 'Белый' },
  { value: 'navy', label: 'Тёмно-синий' },
  { value: 'grey', label: 'Серый' },
  { value: 'beige', label: 'Бежевый' },
  { value: 'denim', label: 'Деним' },
];

export function ShopB2bQuickOrderLegacyPage() {
  const router = useRouter();
  const [brand, setBrand] = useState('Syntha Lab');
  const [season, setSeason] = useState('');
  const [color, setColor] = useState('');
  const [lines, setLines] = useState<QuickLine[]>([{ ...DEFAULT_LINE }]);

  const addLine = () => setLines((prev) => [...prev, { ...DEFAULT_LINE }]);
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof QuickLine, value: string) => {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  };

  const validLines = lines.filter((l) => l.styleNumber.trim() && parseInt(l.qty, 10) > 0);
  const canSubmit = validLines.length > 0;

  const handleSubmit = () => {
    const params = new URLSearchParams({
      mode: 'quick',
      brand,
      lines: JSON.stringify(
        validLines.map((l) => ({
          style: l.styleNumber.trim(),
          size: l.size || 'M',
          qty: parseInt(l.qty, 10),
        }))
      ),
    });
    if (season) params.set('season', season);
    if (color) params.set('color', color);
    router.push(`${ROUTES.shop.b2bMatrix}?${params.toString()}`);
  };

  return (
    <ShopB2bNuOrderScope>
      <ShopB2bContentHeader
        backHref={LEGACY_ROUTES.shop.b2bOrderMode}
        lead="NuOrder / JOOR: артикулы стилей, размеры и количество — затем матрица для проверки и отправки."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Строки заказа</CardTitle>
          <CardDescription>
            Стиль (артикул), размер и количество. Пустые строки и qty=0 не учитываются. В матрице
            заказа отображается ATS (доступно к продаже) по размеру; при превышении — предупреждение
            «недостаточно остатка».
          </CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            <div>
              <Label className="text-text-secondary text-xs">Бренд</Label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="border-border-default mt-0.5 block w-[180px] rounded-lg border px-3 py-2 text-sm"
              >
                <option value="Syntha Lab">Syntha Lab</option>
                <option value="Nordic Wool">Nordic Wool</option>
              </select>
            </div>
            <div>
              <Label className="text-text-secondary text-xs">Сезон</Label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="border-border-default mt-0.5 block w-[140px] rounded-lg border px-3 py-2 text-sm"
              >
                {SEASONS.map((s) => (
                  <option key={s.value || 'all'} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-text-secondary text-xs">Цвет</Label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="border-border-default mt-0.5 block w-[140px] rounded-lg border px-3 py-2 text-sm"
              >
                {COLORS.map((c) => (
                  <option key={c.value || 'all'} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            {(season || color) && (
              <span className="text-text-muted self-end pb-2 text-xs">
                Фильтр: {[season, color].filter(Boolean).join(' · ') || '—'}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-text-secondary grid grid-cols-[1fr_100px_80px_40px] gap-2 text-xs font-medium uppercase">
            <span>Артикул / стиль</span>
            <span>Размер</span>
            <span>Кол-во</span>
            <span></span>
          </div>
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_80px_40px] items-center gap-2">
              <Input
                placeholder="CTP-26-001"
                value={line.styleNumber}
                onChange={(e) => updateLine(i, 'styleNumber', e.target.value)}
                className="font-mono text-sm"
              />
              <select
                value={line.size}
                onChange={(e) => updateLine(i, 'size', e.target.value)}
                className="border-border-default h-9 rounded-md border px-2 py-2 text-sm"
              >
                <option value="">—</option>
                {MOCK_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                min={0}
                value={line.qty}
                onChange={(e) => updateLine(i, 'qty', e.target.value)}
                className="h-9"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-text-muted h-9 w-9"
                onClick={() => removeLine(i)}
                disabled={lines.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addLine} className="mt-2">
            <Plus className="mr-2 h-4 w-4" /> Добавить строку
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-text-secondary text-sm">Строк к заказу: {validLines.length}</p>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            В матрицу с выбранными позициями <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bCreateOrder}>Написание по коллекции</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={LEGACY_ROUTES.shop.b2bReorder}>Reorder из истории</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={LEGACY_ROUTES.shop.b2bEzOrder}>EZ Order</Link>
        </Button>
      </div>
      <RelatedModulesBlock links={getShopB2BHubLinks()} title="Матрица, EZ Order, шаблоны" />
    </ShopB2bNuOrderScope>
  );
}
