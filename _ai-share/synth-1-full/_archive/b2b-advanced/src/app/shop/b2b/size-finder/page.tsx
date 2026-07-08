'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ruler, ArrowLeft, Info } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import { getRecommendedSize, getSizeChartByBrand, type FitPreference } from '@/lib/b2b/size-fit';

const FIT_OPTIONS: { value: FitPreference; label: string }[] = [
  { value: 'slim', label: 'Узкая посадка (slim)' },
  { value: 'true_to_size', label: 'По размеру (true to size)' },
  { value: 'regular', label: 'Обычная (regular)' },
  { value: 'oversized', label: 'Свободная (oversized)' },
];

export default function SizeFinderPage() {
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [chestCm, setChestCm] = useState<string>('');
  const [waistCm, setWaistCm] = useState<string>('');
  const [hipsCm, setHipsCm] = useState<string>('');
  const [fitPreference, setFitPreference] = useState<FitPreference>('true_to_size');
  const [brandName, setBrandName] = useState<string>('Syntha');
  const [submitted, setSubmitted] = useState(false);

  const recommendation = submitted
    ? getRecommendedSize({
        brandName,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        chestCm: chestCm ? Number(chestCm) : undefined,
        waistCm: waistCm ? Number(waistCm) : undefined,
        hipsCm: hipsCm ? Number(hipsCm) : undefined,
        fitPreference,
      })
    : null;

  const chart = getSizeChartByBrand(brandName);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <Link href={ROUTES.shop.b2b}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-tight">
            <Ruler className="h-6 w-6" /> Подбор размера / Размерная сетка
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Рост и вес или замеры (грудь, талия, бёдра) + предпочтение посадки. Рекомендация по
            размерной сетке бренда.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ваши параметры</CardTitle>
          <CardDescription>
            Укажите рост и вес или замеры в см. По отзывам можно увидеть подсказку «часто берут на
            размер больше».
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Рост (см)</Label>
              <Input
                type="number"
                placeholder="170"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Вес (кг)</Label>
              <Input
                type="number"
                placeholder="65"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Info className="h-3.5 w-3.5" /> Опционально: замеры дают точнее
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Грудь (см)</Label>
              <Input
                type="number"
                placeholder="92"
                value={chestCm}
                onChange={(e) => setChestCm(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Талия (см)</Label>
              <Input
                type="number"
                placeholder="72"
                value={waistCm}
                onChange={(e) => setWaistCm(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Бёдра (см)</Label>
              <Input
                type="number"
                placeholder="96"
                value={hipsCm}
                onChange={(e) => setHipsCm(e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Предпочтение посадки</Label>
            <div className="flex flex-wrap gap-2">
              {FIT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={fitPreference === opt.value ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-lg"
                  onClick={() => setFitPreference(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Бренд (сетка)</Label>
            <Input
              placeholder="Бренд"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="rounded-lg"
            />
          </div>
          <Button className="w-full rounded-xl" onClick={() => setSubmitted(true)}>
            Подобрать размер
          </Button>
        </CardContent>
      </Card>

      {recommendation && (
        <Card className="mt-6 border-indigo-100 bg-indigo-50/30">
          <CardHeader>
            <CardTitle className="text-indigo-900">Рекомендуемый размер</CardTitle>
            <CardDescription>{recommendation.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-black uppercase tracking-tight text-indigo-700">
              {recommendation.retailerSize ?? recommendation.size}
            </p>
            {recommendation.sizeUpWarning && recommendation.sizeUpMessage && (
              <p className="flex items-center gap-1 text-sm font-bold text-amber-700">
                <Info className="h-4 w-4 shrink-0" /> {recommendation.sizeUpMessage}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Размерная сетка — {brandName}</CardTitle>
          <CardDescription>EU → ритейл, обхваты в см (диапазон ±2 см).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-4 font-medium">Размер (EU)</th>
                  <th className="py-2 pr-4 font-medium">Ритейл</th>
                  <th className="py-2 pr-4 font-medium">Грудь (см)</th>
                  <th className="py-2 pr-4 font-medium">Талия</th>
                  <th className="py-2 font-medium">Бёдра</th>
                </tr>
              </thead>
              <tbody>
                {chart.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium">{row.size}</td>
                    <td className="py-2 pr-4">{row.retailerSize ?? '—'}</td>
                    <td className="py-2 pr-4">
                      {row.chestMin}–{row.chestMax}
                    </td>
                    <td className="py-2 pr-4">
                      {row.waistMin}–{row.waistMax}
                    </td>
                    <td className="py-2">
                      {row.hipsMin}–{row.hipsMax}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 border-emerald-100 bg-emerald-50/20">
        <CardHeader>
          <CardTitle className="text-base">Обратная связь по посадке (SKU)</CardTitle>
          <CardDescription>
            Агрегаты «маломерит / в размер / большемерит» с карточек и заказов подмешиваются в
            рекомендации. На витрине — блок на PDP; B2C:{' '}
            <Link href={ROUTES.client.visualSearch} className="font-medium underline">
              визуальный поиск
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <p className="text-xs">
            Демо-сплит по категории верх: <strong>12%</strong> маломерит · <strong>58%</strong> в
            размер · <strong>8%</strong> большемерит — источник: отзывы + возвраты «не подошёл
            размер».
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bSizeMapping}>Маппинг размеров</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bCatalog}>Каталог</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bMatrix}>Матрица заказа</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.client.profile}>Мерки в профиле</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Заказы, каталог, матрица"
        className="mt-6"
      />
    </div>
  );
}
