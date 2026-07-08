'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildBrandSupplierBomSession } from '@/lib/fashion/brand-supplier-bom-workspace';
import { factoryMaterialsHrefForDemo } from '@/lib/platform-core-hub-matrix';
import {
  BRAND_ALT_MATERIAL_APPROVAL_API_PATH,
  type BrandAltMaterialPendingItem,
} from '@/lib/production/workshop2-brand-alt-material-approval';
import {
  WAVE_XW_BRAND_SUP_CABINET_LINK_RU,
  buildSupplierDevBomCabinetAltMaterialHref,
} from '@/lib/platform/wave-xw-sup-alt-material-approval';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  formatSupplierAltMaterialApprovalStatusRu,
  summarizeSupplierAltMaterialApprovals,
  type SupplierAltMaterialApprovalStatus,
} from '@/lib/production/workshop2-supplier-alt-material-approval';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
};

/** Brand dev BOM · согласование альтернатив от поставщика (wave WB). */
export function BrandDevBomAltMaterialApprovalStrip({ collectionId, articleId }: Props) {
  const [approvals, setApprovals] = useState<Record<string, SupplierAltMaterialApprovalStatus>>({});
  const [pending, setPending] = useState<BrandAltMaterialPendingItem[]>([]);
  const [storageMode, setStorageMode] = useState<string>('loading');
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ collectionId, articleId });
      const res = await fetch(`${BRAND_ALT_MATERIAL_APPROVAL_API_PATH}?${params}`, {
        headers: buildWorkshop2ApiRequestHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) {
        setApprovals({});
        setPending([]);
        setStorageMode('error');
        return;
      }
      const json = (await res.json()) as {
        approvals?: Record<string, SupplierAltMaterialApprovalStatus>;
        pending?: BrandAltMaterialPendingItem[];
        storageMode?: string;
      };
      setApprovals(json.approvals ?? {});
      setPending(json.pending ?? []);
      setStorageMode(json.storageMode ?? 'unknown');
    } catch {
      setApprovals({});
      setPending([]);
      setStorageMode('error');
    } finally {
      setLoading(false);
    }
  }, [articleId, collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const decide = async (item: BrandAltMaterialPendingItem, action: 'approve' | 'reject') => {
    setBusyKey(item.key);
    try {
      const res = await fetch(BRAND_ALT_MATERIAL_APPROVAL_API_PATH, {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId,
          articleId,
          primary: item.primary,
          alternative: item.alternative,
          action,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        approvals?: Record<string, SupplierAltMaterialApprovalStatus>;
        pending?: BrandAltMaterialPendingItem[];
      };
      if (json.ok && json.approvals) {
        setApprovals(json.approvals);
        setPending(json.pending ?? []);
      }
    } finally {
      setBusyKey(null);
    }
  };

  const summary = summarizeSupplierAltMaterialApprovals(approvals);
  const supplierMaterialsHref = factoryMaterialsHrefForDemo({
    collectionId,
    demoArticleId: articleId,
    demoOrderId: '',
    factoryId: '',
  });
  const supplierCabinetHref = buildSupplierDevBomCabinetAltMaterialHref({
    collectionId,
    articleId,
  });
  const brandBomHref = buildBrandSupplierBomSession({ collectionId, articleId }).bomHref;

  return (
    <div
      className="border-border-subtle bg-bg-surface2/60 flex flex-col gap-2 rounded-md border px-3 py-2 text-xs"
      data-testid="brand-dev-bom-alt-material-approval-strip"
    >
      <div
        className="flex flex-wrap items-center gap-2"
        data-testid="brand-dev-bom-alt-material-status-strip"
      >
        <Badge variant="outline" className="text-[9px] uppercase">
          Согласование альтернатив
        </Badge>
        {storageMode === 'postgres' ? (
          <Badge
            variant="secondary"
            className="text-[9px]"
            data-testid="brand-dev-bom-alt-material-storage-pg"
          >
            PG
          </Badge>
        ) : null}
        {loading ? (
          <span className="text-text-secondary">Загрузка очереди…</span>
        ) : summary.total === 0 ? (
          <span className="text-text-secondary" data-testid="brand-dev-bom-alt-material-empty">
            Поставщик ещё не отправлял альтернативы на согласование
          </span>
        ) : (
          <>
            {summary.pending > 0 ? (
              <Badge variant="secondary" data-testid="brand-dev-bom-alt-material-pending">
                {summary.pending} {formatSupplierAltMaterialApprovalStatusRu('pending')}
              </Badge>
            ) : null}
            {summary.approved > 0 ? (
              <Badge variant="outline" data-testid="brand-dev-bom-alt-material-approved">
                {summary.approved} {formatSupplierAltMaterialApprovalStatusRu('approved')}
              </Badge>
            ) : null}
            {summary.rejected > 0 ? (
              <Badge
                variant="outline"
                className="text-rose-700"
                data-testid="brand-dev-bom-alt-material-rejected"
              >
                {summary.rejected} {formatSupplierAltMaterialApprovalStatusRu('rejected')}
              </Badge>
            ) : null}
          </>
        )}
        <Link
          href={supplierMaterialsHref}
          className={hubGadget.goldenLink}
          data-testid="brand-dev-bom-alt-material-supplier-peer-link"
        >
          Материалы поставщика →
        </Link>
        <Link
          href={supplierCabinetHref}
          className={hubGadget.goldenLink}
          data-testid="brand-dev-bom-alt-material-supplier-cabinet-link"
        >
          {WAVE_XW_BRAND_SUP_CABINET_LINK_RU}
        </Link>
        <Link
          href={brandBomHref}
          className={hubGadget.goldenLink}
          data-testid="brand-dev-bom-alt-material-bom-link"
        >
          BOM · закупка →
        </Link>
      </div>

      {!loading && pending.length > 0 ? (
        <ul className="flex flex-col gap-1.5" data-testid="brand-dev-bom-alt-material-pending-list">
          {pending.slice(0, 5).map((item) => {
            const busy = busyKey === item.key;
            const rowKey = item.key.replace(/::/g, '-');
            return (
              <li
                key={item.key}
                className="flex flex-wrap items-center gap-2"
                data-testid={`brand-dev-bom-alt-material-pending-row-${rowKey}`}
              >
                <span className="font-medium">{item.primary}</span>
                <span className="text-text-secondary">→</span>
                <span>{item.alternative}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px]"
                  disabled={busy}
                  data-testid={`brand-dev-bom-alt-material-approve-${rowKey}`}
                  onClick={() => void decide(item, 'approve')}
                >
                  Согласовать
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 text-[10px] text-rose-700"
                  disabled={busy}
                  data-testid={`brand-dev-bom-alt-material-reject-${rowKey}`}
                  onClick={() => void decide(item, 'reject')}
                >
                  Отклонить
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
