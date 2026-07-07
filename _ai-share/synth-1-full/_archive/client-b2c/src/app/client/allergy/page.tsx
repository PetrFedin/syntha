'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tag } from 'lucide-react';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { getClientAllergyLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

const MOCK_ALLERGIES = ['Шерсть', 'Латекс'];
const MOCK_PRODUCTS = [
  { id: '1', name: 'Cyber Parka', composition: '100% хлопок', safe: true },
  { id: '2', name: 'Wool Coat', composition: '80% шерсть, 20% кашемир', safe: false },
];

export default function AllergyPage() {
  const [tags, setTags] = useState<string[]>(MOCK_ALLERGIES);

  return (
    <CabinetPageContent maxWidth="2xl">
      <ClientCabinetSectionHeader iconClassName="text-amber-600" />

      <Card className="rounded-xl border border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="text-sm">Ваши ограничения</CardTitle>
          <CardDescription>Добавьте материалы, которых стоит избегать</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1">
                {t}{' '}
                <span
                  className="cursor-pointer"
                  onClick={() => setTags((s) => s.filter((x) => x !== t))}
                >
                  ×
                </span>
              </Badge>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input placeholder="Добавить материал..." className="max-w-xs rounded-lg" />
            <Button size="sm" className="rounded-lg">
              Добавить
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4" /> Пример товаров
          </CardTitle>
          <CardDescription>Бейдж «Безопасно» или предупреждение по составу</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {MOCK_PRODUCTS.map((p) => (
              <li
                key={p.id}
                className="bg-bg-surface2 border-border-default flex items-center justify-between rounded-xl border p-3"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-text-secondary text-[11px]">{p.composition}</p>
                </div>
                {p.safe ? (
                  <Badge className="bg-emerald-100 text-emerald-800">Безопасно</Badge>
                ) : (
                  <Badge variant="destructive">Внимание: шерсть</Badge>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <RelatedModulesBlock links={getClientAllergyLinks()} />
    </CabinetPageContent>
  );
}
