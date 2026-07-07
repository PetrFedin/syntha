'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useUIState } from '@/providers/ui-state';
import ProductCard from '@/components/product-card';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

/** ASOS-style: страница «Избранное» и пункт в навбаре. */
export default function ClientWishlistPage() {
  const { wishlist } = useUIState();

  return (
    <CabinetPageContent maxWidth="6xl">
      <ClientCabinetSectionHeader
        meta={`${wishlist.length} товаров`}
        iconClassName="text-rose-500"
      />

      {wishlist.length === 0 ? (
        <Card className="border-border-subtle">
          <CardContent className="py-12 text-center">
            <Heart className="text-text-muted mx-auto mb-3 h-12 w-12" />
            <p className="text-text-secondary font-medium">В избранном пока ничего нет</p>
            <p className="text-text-muted mt-1 text-sm">
              Добавляйте понравившиеся товары — они появятся здесь.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/search">Перейти в каталог</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} viewMode="grid" />
          ))}
        </div>
      )}
      <div className="mt-6 flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/search">Каталог</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={ROUTES.client.home}>В личный кабинет</Link>
        </Button>
      </div>
    </CabinetPageContent>
  );
}
