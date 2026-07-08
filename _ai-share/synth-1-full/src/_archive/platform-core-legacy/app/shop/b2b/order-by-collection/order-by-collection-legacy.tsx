'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { getVisibleLookbooksForPartner } from '@/lib/b2b/lookbook-projects-store';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';

const MOCK_PARTNER_ID = 'retail_msk_1';

export function ShopB2bOrderByCollectionLegacyPage() {
  const projects = getVisibleLookbooksForPartner(MOCK_PARTNER_ID);

  return (
    <CabinetPageContent maxWidth="4xl" className="space-y-6">
      <ShopB2bContentHeader lead="Выберите коллекцию или лукбук — затем оформите заказ из каталога коллекции." />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase">Коллекции и лукбуки</CardTitle>
          <CardDescription>
            Доступные вам коллекции. Заказ из лукбука в виртуальном шоуруме.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.length === 0 ? (
            <p className="text-text-secondary text-sm">
              Нет доступных коллекций. Обратитесь к бренду для доступа.
            </p>
          ) : (
            projects.slice(0, 12).map((p) => (
              <div
                key={p.id}
                className="border-border-subtle bg-bg-surface2/80 hover:bg-bg-surface2/50 flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors"
              >
                <div>
                  <p className="text-text-primary font-bold">{p.name}</p>
                  <p className="text-text-secondary text-xs">
                    {p.brandName} · {p.season ?? '—'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-[10px] font-black uppercase"
                  asChild
                >
                  <Link href={`${ROUTES.shop.b2bShowroom}?project=${encodeURIComponent(p.id)}`}>
                    Заказать <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="mb-6 flex gap-3">
        <Button
          asChild
          variant="default"
          className="rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          <Link href={ROUTES.shop.b2bShowroom}>Виртуальный шоурум</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          <Link href={LEGACY_ROUTES.shop.b2bLookbooks}>Мои лукбуки</Link>
        </Button>
      </div>

      <RelatedModulesBlock
        title="Связанные разделы"
        links={getShopB2BHubLinks().filter((l) =>
          [ROUTES.shop.b2bShowroom, LEGACY_ROUTES.shop.b2bLookbooks, ROUTES.shop.b2bCreateOrder].includes(
            l.href as string
          )
        )}
      />
    </CabinetPageContent>
  );
}
