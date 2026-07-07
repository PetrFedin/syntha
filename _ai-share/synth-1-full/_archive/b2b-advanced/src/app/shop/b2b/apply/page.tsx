'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useSearchParamsNonNull } from '@/hooks/use-search-params-non-null';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { ShopB2bLegacyTailCorePage } from '@/app/shop/b2b/shop-b2b-legacy-tail-core';
import { ROUTES } from '@/lib/routes';
import { submitBuyerApplication } from '@/lib/api';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import type { BuyerApplication } from '@/lib/b2b/buyer-onboarding';
import { checkExclusiveConflict } from '@/lib/b2b/territory-exclusivity';

export default function ShopB2BApplyPage() {
  if (isPlatformCoreMode()) {
    return <ShopB2bLegacyTailCorePage legacyPath={ROUTES.shop.b2bApply} />;
  }

  const searchParams = useSearchParamsNonNull();
  const [sent, setSent] = useState(false);
  const [result, setResult] = useState<BuyerApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    applicantType: BuyerApplication['applicantType'];
    message: string;
    brandId?: string;
    brandName?: string;
  }>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    applicantType: 'retailer',
    message: '',
  });

  useEffect(() => {
    const brandId = searchParams.get('brandId') || undefined;
    const brandName = searchParams.get('brandName') || undefined;
    if (brandId || brandName) {
      setForm((f) => ({ ...f, brandId, brandName }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const app = await submitBuyerApplication({
        companyName: form.companyName,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone || undefined,
        country: form.country,
        city: form.city || undefined,
        applicantType: form.applicantType,
        message: form.message || undefined,
        brandId: form.brandId,
        brandName: form.brandName,
      });
      setResult(app);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent && result) {
    return (
      <CabinetPageContent maxWidth="xl" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
              <CardTitle>Заявка отправлена</CardTitle>
            </div>
            <CardDescription>
              Ваша заявка на партнёрство принята. После проверки брендом вы получите доступ к
              каталогу и B2B заказам.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-text-secondary text-sm">
              Номер заявки: <strong>{result.id}</strong>. Статус: <strong>Ожидает</strong>.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`${ROUTES.shop.b2bPartners}?tab=requests`}>Мои партнёры · Запросы</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={ROUTES.shop.b2bTradeShows}>Мои выставки</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={ROUTES.shop.b2bShowroom}>B2B Шоурум</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </CabinetPageContent>
    );
  }

  return (
    <CabinetPageContent maxWidth="xl" className="space-y-6">
      <ShopB2bContentHeader
        lead={
          <>
            <span className="text-text-primary inline-flex items-center gap-2 font-semibold">
              <UserPlus className="text-accent-primary h-4 w-4 shrink-0" aria-hidden />
              Заполните форму — заявка уйдёт бренду на рассмотрение (онбординг байера).
            </span>
          </>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Данные заявки</CardTitle>
          <CardDescription>
            Доступ к шоуруму, каталогу и оптовым заказам после одобрения брендом.
          </CardDescription>
          {form.brandName && (
            <p className="text-accent-primary mt-2 text-sm font-medium">
              Заявка на доступ к бренду: <strong>{form.brandName}</strong>
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Компания *</Label>
                <Input
                  id="companyName"
                  required
                  value={form.companyName}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                  placeholder="ООО Ритейл"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Контактное лицо *</Label>
                <Input
                  id="contactName"
                  required
                  value={form.contactName}
                  onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                  placeholder="Иван Петров"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="buyer@store.ru"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+7 495 …"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country">Страна *</Label>
                <Input
                  id="country"
                  required
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  placeholder="Россия"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Город</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Москва"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Сообщение бренду</Label>
              <Input
                id="message"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Кратко о вашем магазине и планах закупок"
              />
            </div>
            {(form.country || form.city) &&
              (() => {
                const conflict = checkExclusiveConflict(form.country, form.city || undefined);
                return conflict.conflict ? (
                  <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">
                        В вашем регионе уже назначен эксклюзивный партнёр
                      </p>
                      <p className="mt-1 text-xs text-amber-700">
                        Партнёр: <strong>{conflict.existingPartnerName}</strong> ({conflict.region}
                        ). Заявка будет рассмотрена с учётом территорий — возможно, вам предложат
                        другой формат сотрудничества.
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Отправка…' : 'Отправить заявку'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={ROUTES.shop.home}>Отмена</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Мои выставки, заказы, шоурум"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
