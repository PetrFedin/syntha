'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getOptimizedAttributeCards } from '@/lib/optimized-attributes-display';

export default function AttributesInfoPage() {
  const cards = useMemo(() => getOptimizedAttributeCards(), []);

  return (
    <CabinetPageContent maxWidth="5xl" className="px-4 py-6 pb-16 pb-24 sm:px-6">
      <header className="mb-8">
        <h1 className="font-headline text-sm font-bold md:text-base">Справочник атрибутов</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Оптимизированный перечень: название атрибута и значения. Дедуп внутри списков и между
          атрибутами (первое вхождение по приоритету). Карточка{' '}
          <strong>«Стиль, повод и активность»</strong> объединяет эстетику, контекст ношения и тип
          активности (Urban, Sport…). Обувь, сумки, шкалы аксессуаров, парфюм/косметика/дом, носки,
          багаж, уход, питомцы, шторы — <strong>каждый атрибут отдельной карточкой</strong> (без
          смешивания в один список). Гаджеты для новорождённых — в «Гаджеты, часы и техника». Полный
          перечень <strong>типов игрушек</strong>. Специальные группы расширены (размеры, рост,
          modest и др.). Старых объединённых карточек с префиксами вроде «vertical…» в справочнике
          больше нет — только отдельные атрибуты; под заголовком карточки показан технический ключ
          для разработки.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Всего атрибутов в списке: <span className="font-mono tabular-nums">{cards.length}</span>
        </p>
      </header>

      <div className="space-y-5">
        {cards.map(({ key, label, values }) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{label}</CardTitle>
              <CardDescription className="font-mono text-xs text-muted-foreground">
                {key}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[min(18rem,50vh)]">
                <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 pr-3 text-sm sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {values.map((item) => (
                    <li key={item} className="text-muted-foreground">
                      {item}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
              <p className="mt-2 text-[11px] tabular-nums text-muted-foreground">
                Значений: {values.length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </CabinetPageContent>
  );
}
