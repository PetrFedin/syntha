'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Download, FileText, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/platform-core-ports/api-client-headers';
import { usePlatformCoreDemoContext } from '@/components/platform/usePlatformCoreChainOverview';
import { getPlatformCoreCollectionLabel } from '@/lib/platform-core-hub-matrix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { cn } from '@/lib/utils';
import { SHOP_CORE_BUYER_PRESETS } from '@/lib/platform-core-ports/legacy/order/shop-core-buyer-context';
import { shopB2bMatrixReorderHref } from '@/lib/platform-core-routes';

type Step = { id: string; labelRu: string; done: boolean };

type StatusPayload = {
  collectionId: string;
  publishedCount: number;
  readyForBuyers: boolean;
  steps: Step[];
  workshop2Href: string;
  linesheetHref: string;
  linesheetPdfHref: string | null;
  showroomHref: string;
  shopShowroomHref: string;
  shopMatrixHref: string;
};

type Props = {
  collectionId?: string;
  variant: 'brand' | 'shop';
};

export function SampleCollectionPillarCard({ collectionId: collectionIdProp, variant }: Props) {
  const demo = usePlatformCoreDemoContext();
  const collectionId = collectionIdProp ?? demo.collectionId;
  const [status, setStatus] = useState<StatusPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/workshop2/collections/${encodeURIComponent(collectionId)}/sample-collection-status`,
          { headers: buildWorkshop2ApiRequestHeaders() }
        );
        const json = (await res.json()) as { ok?: boolean; status?: StatusPayload };
        if (!cancelled && json.ok && json.status) setStatus(json.status);
      } catch {
        if (!cancelled) setStatus(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  const ready = status?.readyForBuyers === true;

  return (
    <Card
      data-testid="sample-collection-pillar-card"
      className={cn(hubGadget.pillarCard, 'border-violet-200/50')}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold">Образец → коллекция</CardTitle>
        <CardDescription className={hubGadget.muted}>
          {variant === 'brand'
            ? 'Из одобренных образцов — коллекция, лайншит и витрина для магазинов.'
            : `Коллекция «${getPlatformCoreCollectionLabel(collectionId)}»: витрина и документы перед матрицей заказа.`}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(hubGadget.pillarBody, 'space-y-3')}>
        {variant === 'brand' && status && status.publishedCount > 0 ? (
          <Link
            href={status.shopShowroomHref}
            data-testid="sample-collection-showroom-badge"
            className="inline-flex"
          >
            <Badge variant="secondary" className="text-[10px] font-semibold">
              На витрине магазина · {status.publishedCount} арт.
            </Badge>
          </Link>
        ) : null}
        <ul className="space-y-1.5">
          {(status?.steps ?? []).map((step) => (
            <li key={step.id} className="flex items-start gap-2 text-xs">
              {step.done ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <Circle className="text-text-muted mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              <span className={step.done ? 'text-text-primary' : 'text-text-muted'}>
                {step.labelRu}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-2">
          {variant === 'brand' ? (
            <>
              <Button size="sm" variant="outline" asChild>
                <Link href={status?.workshop2Href ?? '#'}>
                  <Sparkles className="mr-1 h-3.5 w-3.5" aria-hidden />
                  Цех разработки
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={status?.linesheetHref ?? '/brand/linesheets'}>
                  <FileText className="mr-1 h-3.5 w-3.5" aria-hidden />
                  Лайншит
                </Link>
              </Button>
              {status?.linesheetPdfHref ? (
                <Button size="sm" variant="outline" asChild>
                  <a href={status.linesheetPdfHref} data-testid="sample-collection-linesheet-pdf">
                    <Download className="mr-1 h-3.5 w-3.5" aria-hidden />
                    PDF
                  </a>
                </Button>
              ) : null}
              <Button size="sm" variant="outline" asChild>
                <Link href={status?.showroomHref ?? '/brand/showroom'}>
                  <ShoppingBag className="mr-1 h-3.5 w-3.5" aria-hidden />
                  Витрина
                </Link>
              </Button>
              {status?.readyForBuyers ? (
                <div
                  className="flex flex-wrap items-center gap-1.5 text-[10px]"
                  data-testid="sample-collection-cross-role-matrix"
                >
                  {SHOP_CORE_BUYER_PRESETS.map((preset) => (
                    <Link
                      key={preset.id}
                      href={shopB2bMatrixReorderHref(collectionId, undefined, { buyerId: preset.id })}
                      className="text-accent-primary font-medium hover:underline"
                      data-testid={`sample-collection-matrix-buyer-${preset.id}`}
                    >
                      Матрица · {preset.labelRu}
                    </Link>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" asChild>
                <Link href={status?.shopShowroomHref ?? '#'}>
                  <ShoppingBag className="mr-1 h-3.5 w-3.5" aria-hidden />
                  Витрина
                </Link>
              </Button>
              {status?.linesheetPdfHref ? (
                <Button size="sm" variant="outline" asChild>
                  <a href={status.linesheetPdfHref} data-testid="sample-collection-linesheet-pdf">
                    <Download className="mr-1 h-3.5 w-3.5" aria-hidden />
                    PDF лайншита
                  </a>
                </Button>
              ) : null}
              <Button size="sm" disabled={!ready} asChild={ready}>
                {ready ? (
                  <Link href={status?.shopMatrixHref ?? '#'}>Матрица заказа</Link>
                ) : (
                  <span>Матрица (после публикации)</span>
                )}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
