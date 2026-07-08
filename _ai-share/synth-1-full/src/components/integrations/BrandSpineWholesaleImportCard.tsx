'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShoppingCart, CheckCircle2, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { wholesaleImportChannelLabelRu } from '@/lib/integrations/spine/integration-ui-utils';
import { useSpineWholesaleImport } from '@/hooks/use-spine-wholesale-import';
import type { SpineWholesaleImportPlatform } from '@/lib/integrations/spine/spine-wholesale-import-client';

type Props = {
  platform: SpineWholesaleImportPlatform;
  archiveListLabel?: string;
  onLoadArchive?: () => void;
  archiveLoading?: boolean;
  archiveCount?: number;
  settingsHref?: string;
};

/** Столп 3 · brand integrations archive — импорт wholesale в Syntha spine v1. */
export function BrandSpineWholesaleImportCard({
  platform,
  archiveListLabel = 'Загрузить из archive GET',
  onLoadArchive,
  archiveLoading = false,
  archiveCount = 0,
  settingsHref,
}: Props) {
  const { busy, messageRu, runImport } = useSpineWholesaleImport(platform);
  const label = wholesaleImportChannelLabelRu(platform);

  return (
    <Card data-testid={`brand-spine-import-card-${platform}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase">
          <ShoppingCart className="h-4 w-4" /> Импорт заказов · {label}
        </CardTitle>
        <CardDescription>
          Импорт из внешнего архива → operational registry (столп 3 · коллекция → заказ).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {onLoadArchive ? (
            <Button variant="outline" size="sm" onClick={onLoadArchive} disabled={archiveLoading}>
              {archiveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {archiveListLabel}
            </Button>
          ) : null}
          <Button
            size="sm"
            onClick={() => void runImport()}
            disabled={busy}
            data-testid={`brand-spine-import-btn-${platform}`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Импорт в реестр заказов
          </Button>
          <Link href={ROUTES.brand.b2bOrders}>
            <Button variant="ghost" size="sm">
              B2B заказы
            </Button>
          </Link>
          {settingsHref ? (
            <Link href={settingsHref}>
              <Button variant="ghost" size="sm">
                Настройки
              </Button>
            </Link>
          ) : null}
        </div>
        {messageRu ? (
          <p className="flex items-center gap-1 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {messageRu}
          </p>
        ) : null}
        {archiveCount > 0 ? (
          <p className="text-text-secondary text-xs">В archive списке: {archiveCount} заказ(ов)</p>
        ) : null}
        {!messageRu && platform !== 'joor' ? (
          <p className="text-text-muted flex items-center gap-1 text-xs">
            <AlertCircle className="h-3 w-3" />
            Если архив пуст — создаётся демо-заказ для проверки цепочки
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
