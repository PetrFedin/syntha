'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { estimateFashionImportDuty } from '@/lib/fashion/duty-estimate';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function DutyEstimatePage() {
  const [amount, setAmount] = useState('15000');
  const [category, setCategory] = useState('куртка outerwear');
  const [origin, setOrigin] = useState('CN');

  const result = useMemo(() => {
    const n = parseFloat(amount.replace(/\s/g, '').replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) return null;
    return estimateFashionImportDuty(Math.round(n), category, origin);
  }, [amount, category, origin]);

  return (
    <CabinetPageContent maxWidth="lg">
      <ClientCabinetSectionHeader />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Входные данные</CardTitle>
          <CardDescription>
            Сумма в ₽ (CIF-оценка для демо), текст категории, код страны.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amt">Сумма, ₽</Label>
            <Input
              id="amt"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat">Категория (ключевые слова)</Label>
            <Input
              id="cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="обувь, сумка, пальто…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="origin">Страна (ISO2)</Label>
            <Input
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 2))}
              maxLength={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Результат</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {!result ? (
            <p className="text-muted-foreground">Введите положительную сумму.</p>
          ) : (
            <>
              <p>
                Ставка пошлины: <strong>{result.ratePct}%</strong>
              </p>
              <p>
                Пошлина: <strong className="font-mono">{result.dutyRub} ₽</strong>
              </p>
              <p>
                НДС 20%: <strong className="font-mono">{result.vatRub} ₽</strong>
              </p>
              <p className="border-t pt-2">
                Итого с пошлиной и НДС: <strong className="font-mono">{result.totalRub} ₽</strong>
              </p>
              <p className="pt-2 text-xs leading-snug text-muted-foreground">{result.note}</p>
            </>
          )}
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
