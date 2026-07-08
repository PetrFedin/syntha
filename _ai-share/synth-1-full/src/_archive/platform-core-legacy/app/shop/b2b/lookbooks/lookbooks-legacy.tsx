'use client';

import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import {
  getVisibleLookbooksForPartner,
  type LookbookProject,
} from '@/lib/b2b/lookbook-projects-store';
import { FileText, ShoppingBag, Download, Share2, LayoutGrid } from 'lucide-react';
import { ShopB2bContentHeader } from '@/components/shop/ShopB2bContentHeader';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { getShopB2BHubLinks } from '@/lib/data/entity-links';
import { SHOP_B2B_COLLECTION_QUERY_PARAM } from '@/lib/domain/cross-role-entity-ids';
/** Мок: текущий партнёр (байер). В проде — из сессии. */
const MOCK_PARTNER_ID = 'retail_msk_1';

export function ShopB2bLookbooksLegacyPage() {
  const [projects, setProjects] = useState<LookbookProject[]>([]);

  const load = useCallback(() => {
    setProjects(getVisibleLookbooksForPartner(MOCK_PARTNER_ID));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <CabinetPageContent maxWidth="3xl" className="space-y-6">
      <ShopB2bContentHeader lead="Colect: лукбуки по правам и до даты видимости; PDF с водяным знаком, заказ из лукбука." />

      <Card>
        <CardHeader>
          <CardTitle>Доступные лукбуки</CardTitle>
          <CardDescription>Коллекции как проекты: видимость до указанной даты.</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-text-secondary text-sm">
              Нет доступных лукбуков. Обратитесь к бренду для доступа.
            </p>
          ) : (
            <ul className="space-y-3">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="border-border-default flex items-center justify-between rounded-xl border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-bg-surface2 flex h-12 w-12 items-center justify-center rounded-lg">
                      <FileText className="text-text-secondary h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-text-secondary text-xs">
                        {p.brandName} · до {new Date(p.visibleUntil).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={p.watermarkedPdfUrl ?? p.lookbookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-1 h-3.5 w-3.5" /> Скачать лайншит (PDF)
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`${ROUTES.shop.b2bLookbookShare}?id=${p.id}`}>
                        <Share2 className="mr-1 h-3.5 w-3.5" /> Поделиться лайншитом
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link
                        href={`${LEGACY_ROUTES.shop.b2bOrderByCollection}?${SHOP_B2B_COLLECTION_QUERY_PARAM}=${encodeURIComponent(p.collectionId ?? p.id)}&brand=${encodeURIComponent(p.brandName)}`}
                      >
                        <ShoppingBag className="mr-1 h-3.5 w-3.5" /> Заказ из лукбука
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bShowroom}>
            <LayoutGrid className="mr-1 h-3.5 w-3.5" /> Виртуальный шоурум
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={LEGACY_ROUTES.shop.b2bCatalog}>Каталог</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.shop.b2bCreateOrder}>Создать заказ</Link>
        </Button>
      </div>
      <RelatedModulesBlock
        links={getShopB2BHubLinks()}
        title="Каталог, заказы, матрица"
        className="mt-6"
      />
    </CabinetPageContent>
  );
}
