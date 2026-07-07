'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Coins, ArrowRightLeft } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import {
  SUPPORTED_CURRENCIES,
  DEMO_RATES_TO_RUB,
  convertAmount,
  formatCurrency,
} from '@/lib/rf-market/multi-currency';

/** B2B-Center: Мультивалютность — валюты и курсы (РФ) */
export default function MultiCurrencyPage() {
  const [amount, setAmount] = useState(10000);
  const [fromCur, setFromCur] = useState('RUB');
  const [toCur, setToCur] = useState('EUR');

  const converted = convertAmount(amount, fromCur, toCur);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 pb-24">
      <div className="mb-6 flex items-center gap-3">
        <Link href={ROUTES.shop.b2b}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold uppercase tracking-tight">
            <Coins className="h-6 w-6" /> Мультивалютность
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            B2B-Center: поддержка нескольких валют и курсов для заказов
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Курсы валют к рублю</CardTitle>
          <CardDescription>
            Демо: фиксированные курсы. В проде — интеграция с ЦБ РФ или внутренний справочник
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {SUPPORTED_CURRENCIES.filter((c) => c.code !== 'RUB').map((c) => (
              <li
                key={c.code}
                className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0"
              >
                <span>
                  {c.name} ({c.code})
                </span>
                <span className="font-mono">{DEMO_RATES_TO_RUB[c.code] ?? '—'} ₽</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" /> Конвертер
          </CardTitle>
          <CardDescription>Пересчёт суммы между валютами</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-xs text-slate-500">Сумма</label>
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-36"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">Из</label>
              <select
                className="h-10 w-24 rounded-md border px-3"
                value={fromCur}
                onChange={(e) => setFromCur(e.target.value)}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-500">В</label>
              <select
                className="h-10 w-24 rounded-md border px-3"
                value={toCur}
                onChange={(e) => setToCur(e.target.value)}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-lg font-semibold">
            {formatCurrency(amount, fromCur)} = {formatCurrency(converted, toCur)}
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2b}>B2B хаб</Link>
        </Button>
      </div>
    </div>
  );
}
