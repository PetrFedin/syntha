'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Building2, FileCheck, ShoppingCart } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

/** Онбординг партнёра (Zalando для РФ): пошаговый мастер подключения нового магазина — данные, верификация, первый заказ. */
const STEPS = [
  { id: 1, title: 'Данные компании', icon: Building2, desc: 'ИНН, название, юридический адрес' },
  { id: 2, title: 'Верификация', icon: FileCheck, desc: 'Проверка брендом, договор, ЭДО' },
  { id: 3, title: 'Первый заказ', icon: ShoppingCart, desc: 'Доступ к каталогу и матрице заказа' },
];

export default function PartnerOnboardingPage() {
  const [step, setStep] = useState(1);

  return (
    <CabinetPageContent maxWidth="2xl" className="space-y-6">
      <ShopB2bContentHeader lead="Пошаговое подключение: компания → верификация → первый заказ (ИНН, ЭДО, маркировка для РФ)." />

      <div className="mb-6 flex gap-2">
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex flex-1 items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                step === s.id
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-border-default hover:bg-bg-surface2'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${step === s.id ? 'bg-accent-primary/15' : 'bg-bg-surface2'}`}
              >
                <Icon
                  className={`h-4 w-4 ${step === s.id ? 'text-accent-primary' : 'text-text-secondary'}`}
                />
              </div>
              <div>
                <p className="text-xs font-medium">Шаг {s.id}</p>
                <p className="text-text-secondary truncate text-xs">{s.title}</p>
              </div>
            </button>
          );
        })}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{STEPS[step - 1].title}</CardTitle>
          <CardDescription>{STEPS[step - 1].desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Название организации</Label>
                <Input placeholder="ООО «Ритейл»" />
              </div>
              <div className="space-y-2">
                <Label>ИНН</Label>
                <Input placeholder="7707123456" />
              </div>
              <div className="space-y-2">
                <Label>Юридический адрес</Label>
                <Input placeholder="г. Москва, ул. Примерная, 1" />
              </div>
              <p className="text-text-secondary text-xs">
                После отправки бренд проверит данные. Подключение ЭДО и маркировки — по запросу.
              </p>
            </>
          )}
          {step === 2 && (
            <>
              <div className="bg-bg-surface2 border-border-subtle rounded-lg border p-4">
                <p className="text-sm">
                  Бренд проверит заявку и отправит договор. Подписание через ЭДО (Диадок, СБИС и
                  др.). После подписания — доступ к каталогу.
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Ожидаем проверки
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                <p className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-600" /> Доступ к шоуруму и матрице заказа
                  открыт. Можете оформить первый заказ.
                </p>
              </div>
              <Button asChild>
                <Link href={ROUTES.shop.b2bOrderMode}>Перейти к заказу</Link>
              </Button>
            </>
          )}
          {step < 3 && step === 1 && <Button onClick={() => setStep(2)}>Далее</Button>}
        </CardContent>
      </Card>

      <div className="mb-6 flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bApply}>Подать заявку бренду</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bPartners}>Мои бренды</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Заявка, партнёры, заказы"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
