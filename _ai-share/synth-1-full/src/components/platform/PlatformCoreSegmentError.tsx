'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reportError } from '@/lib/platform-core-ports/legacy/logger';
import { ROUTES } from '@/lib/platform-core-routes';
import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
  role: 'shop' | 'brand' | 'manufacturer' | 'supplier';
  defaultPillar?: CoreHubPillarId;
  title?: string;
};

export function PlatformCoreSegmentError({
  error,
  reset,
  role,
  defaultPillar = 'collection_order',
  title = 'Ошибка загрузки раздела',
}: Props) {
  useEffect(() => {
    reportError(error, { digest: error.digest, segment: role });
  }, [error, role]);

  const cabinetHref =
    role === 'shop'
      ? `${ROUTES.shop.coreCabinet}?pillar=${defaultPillar}`
      : role === 'brand'
        ? `${ROUTES.brand.coreCabinet}?pillar=${defaultPillar}`
        : role === 'supplier'
          ? `${ROUTES.factory.supplierCoreCabinet}?pillar=${defaultPillar}`
          : `${ROUTES.factory.productionCoreCabinet}?pillar=${defaultPillar}`;

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6"
      data-testid={`platform-core-${role}-segment-error`}
    >
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
        </div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-text-muted text-sm">
          Попробуйте снова или вернитесь в кабинет столпа — данные заказа и коллекции сохранены в
          PG.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" onClick={reset} className="gap-2" size="sm">
            <RefreshCw className="h-4 w-4" aria-hidden />
            Повторить
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <Link
              href={cabinetHref}
              data-testid={`platform-core-${role}-segment-error-cabinet-link`}
            >
              Кабинет столпа
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
