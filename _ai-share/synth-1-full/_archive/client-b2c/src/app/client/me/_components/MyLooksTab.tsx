'use client';

import Link from 'next/link';
import { Palette, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/user/shared/empty-state';
import LookboardCard from '@/components/lookboard-card';
import { useUIState } from '@/providers/ui-state';
import { lookboards } from '@/lib/lookboards';
import { ROUTES } from '@/lib/routes';

export function MyLooksTab() {
  const { lookboards: userLookboards } = useUIState();
  const displayLookboards = userLookboards.length > 0 ? userLookboards : lookboards;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-headline text-sm font-bold md:text-base">Мои лукборды</h2>
          <p className="mt-1 text-muted-foreground">
            {displayLookboards.length}{' '}
            {displayLookboards.length === 1
              ? 'лукборд'
              : displayLookboards.length < 5
                ? 'лукборда'
                : 'лукбордов'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.client.profileCollections}>
              <Heart className="mr-2 h-4 w-4" />
              Образы AI-стилиста
            </Link>
          </Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Palette className="mr-2 h-4 w-4" />
            Создать лукборд
          </Button>
        </div>
      </div>

      {displayLookboards.length === 0 ? (
        <EmptyState
          icon={Palette}
          title="У вас пока нет лукбордов"
          description="Создайте свой первый лукборд, чтобы сохранять любимые образы и делиться ими с сообществом"
          actionLabel="Создать первый лукборд"
          actionHref={ROUTES.client.profileWithTab('looks')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayLookboards.map((lb) => (
            <div key={lb.id} className="group">
              <LookboardCard lookboard={lb} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
