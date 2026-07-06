'use client';

import { useEffect, useMemo, useState } from 'react';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, ArrowLeft, Save } from 'lucide-react';
import { SectionInfoCard } from '@/components/brand/production/ProductionSectionEnhancements';
import { ProductionSuppliersFinanceBadges } from '@/components/brand/SectionBadgeCta';
import { getProductionLinks } from '@/lib/data/entity-links';
import { RelatedModulesBlock } from '@/components/brand/RelatedModulesBlock';
import { ROUTES } from '@/lib/routes';
import type { SubcontractOrder } from '@/lib/production/subcontractor';
import { useFloorTabDraftState } from '@/hooks/use-floor-tab-draft';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AcronymWithTooltip } from '@/components/ui/acronym-with-tooltip';
import type {
  Workshop2SewingContractorsPayload,
  SewingPlanPartnerRow,
} from '@/lib/production/workshop2-sewing-plan-reference-types';
import {
  WAVE_YC_BRAND_SUBCONTRACTOR_FLOOR_SCOPE,
  WAVE_YC_BRAND_SUBCONTRACTOR_HUB_DESC_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_HUB_TITLE_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_PAGE_TESTID,
  WAVE_YC_BRAND_SUBCONTRACTOR_PG_BADGE_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_PG_UNAVAILABLE_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_SAVE_TITLE_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_SAVE_TOAST_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_SECTION_DESC_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_SECTION_TITLE_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_STATUS_LABELS_RU,
  WAVE_YC_BRAND_SUBCONTRACTOR_STORAGE_PG_TESTID,
  WAVE_YC_BRAND_SUBCONTRACTOR_STORAGE_UNAVAILABLE_TESTID,
  resolveBrandSubcontractorFloorDefaultSeed,
} from '@/lib/platform/wave-yc-brand-subcontractor-draft-pg';

export default function SubcontractorPage() {
  const { toast } = useToast();
  const defaultSeed = useMemo(() => resolveBrandSubcontractorFloorDefaultSeed(), []);
  const { data, setData, save, hydrated, persistMode, pgUnavailable } = useFloorTabDraftState(
    WAVE_YC_BRAND_SUBCONTRACTOR_FLOOR_SCOPE,
    defaultSeed
  );
  const [contractors, setContractors] = useState<SewingPlanPartnerRow[]>([]);

  useEffect(() => {
    void fetch('/api/brand/sewing-contractors')
      .then(async (res) => {
        const payload = (await res.json()) as Workshop2SewingContractorsPayload;
        if (payload?.partners) {
          setContractors(payload.partners);
        }
      })
      .catch((err) => console.error('Failed to fetch contractors', err));
  }, []);

  const setOrder = (index: number, patch: Partial<SubcontractOrder>) => {
    setData((prev) => {
      const orders = [...prev.orders];
      orders[index] = { ...orders[index], ...patch };
      return { ...prev, orders };
    });
  };

  return (
    <CabinetPageContent
      maxWidth="5xl"
      className="space-y-6 pb-16"
      data-testid={WAVE_YC_BRAND_SUBCONTRACTOR_PAGE_TESTID}
    >
      <SectionInfoCard
        title={WAVE_YC_BRAND_SUBCONTRACTOR_HUB_TITLE_RU}
        description={
          <>
            {WAVE_YC_BRAND_SUBCONTRACTOR_HUB_DESC_RU}{' '}
            <AcronymWithTooltip abbr="PO" />.
          </>
        }
        icon={Building2}
        iconBg="bg-bg-surface2"
        iconColor="text-text-secondary"
        badges={<ProductionSuppliersFinanceBadges />}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.production} aria-label="Назад к производству">
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold uppercase">{WAVE_YC_BRAND_SUBCONTRACTOR_HUB_TITLE_RU}</h1>
          {persistMode === 'postgres' && !pgUnavailable ? (
            <Badge
              variant="outline"
              className="text-[9px]"
              data-testid={WAVE_YC_BRAND_SUBCONTRACTOR_STORAGE_PG_TESTID}
            >
              {WAVE_YC_BRAND_SUBCONTRACTOR_PG_BADGE_RU}
            </Badge>
          ) : persistMode === 'postgres' && pgUnavailable ? (
            <Badge
              variant="outline"
              className="border-amber-500/50 text-[9px] text-amber-800"
              data-testid={WAVE_YC_BRAND_SUBCONTRACTOR_STORAGE_UNAVAILABLE_TESTID}
            >
              {WAVE_YC_BRAND_SUBCONTRACTOR_PG_UNAVAILABLE_RU}
            </Badge>
          ) : null}
        </div>
        <Button
          size="sm"
          className="gap-1.5"
          disabled={!hydrated || pgUnavailable}
          onClick={async () => {
            await save();
            toast({
              title: WAVE_YC_BRAND_SUBCONTRACTOR_SAVE_TITLE_RU,
              description: WAVE_YC_BRAND_SUBCONTRACTOR_SAVE_TOAST_RU,
            });
          }}
        >
          <Save className="h-3.5 w-3.5" /> Сохранить
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> {WAVE_YC_BRAND_SUBCONTRACTOR_SECTION_TITLE_RU}
          </CardTitle>
          <CardDescription>{WAVE_YC_BRAND_SUBCONTRACTOR_SECTION_DESC_RU}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.orders.length === 0 ? (
            <p className="text-text-secondary text-sm">Нет заказов на сторону — добавьте после интеграции с PO.</p>
          ) : null}
          <ul className="space-y-3">
            {data.orders.map((o, i) => {
              const contractor = contractors.find(
                (c) => c.label === o.subcontractorName || c.id === o.subcontractorId
              );
              return (
                <li
                  key={o.id}
                  className="bg-bg-surface2 border-border-subtle flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{o.subcontractorName}</p>
                      {contractor?.capabilities?.map((cap) => (
                        <Badge key={cap} variant="secondary" className="h-5 px-1.5 text-[10px]">
                          {cap}
                        </Badge>
                      ))}
                      {contractor?.machines?.map((mac) => (
                        <Badge key={mac} variant="outline" className="h-5 px-1.5 text-[10px]">
                          {mac}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-text-secondary mt-1 text-xs">
                      {o.workTypeLabel} · <AcronymWithTooltip abbr="PO" /> {o.orderId} ·{' '}
                      {o.quantity} {o.unit}
                    </p>
                    {o.actNumber && (
                      <p className="text-text-secondary mt-1 text-xs">Акт: {o.actNumber}</p>
                    )}
                  </div>
                  <Select
                    value={o.status}
                    onValueChange={(v) => setOrder(i, { status: v as SubcontractOrder['status'] })}
                  >
                    <SelectTrigger className="h-8 w-[130px] text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(WAVE_YC_BRAND_SUBCONTRACTOR_STATUS_LABELS_RU) as SubcontractOrder['status'][]).map(
                        (s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {WAVE_YC_BRAND_SUBCONTRACTOR_STATUS_LABELS_RU[s]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
      <RelatedModulesBlock links={getProductionLinks()} />
    </CabinetPageContent>
  );
}
