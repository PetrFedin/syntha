'use client';

import { Badge } from '@/components/ui/badge';
import {
  KeyMetrics,
  CustomerProfileCard,
  BehaviorCharts,
  ActivityFeed,
} from '@/components/customer-360';

export function Analytics360Tab({ user }: { user: any }) {
  return (
    <div className="space-y-4">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-headline text-base font-bold">Профиль клиента 360°</h1>
          <p className="text-muted-foreground">
            Полная аналитика по клиенту <span className="font-mono">{user.displayName}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="destructive">Риск оттока: Низкий</Badge>
        </div>
      </header>

      <KeyMetrics />

      <CustomerProfileCard />

      <BehaviorCharts />

      <ActivityFeed />
    </div>
  );
}
