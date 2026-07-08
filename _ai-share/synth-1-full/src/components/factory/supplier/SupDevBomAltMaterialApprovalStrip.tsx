'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  buildBrandDevBomAltMaterialApprovalHref,
  buildMaterialsAltMaterialsWorkspaceHref,
  SUP_DEV_BOM_BRAND_ALT_MATERIAL_LINK_TESTID,
  WAVE_XW_SUP_ALT_MATERIAL_APPROVAL_API,
  WAVE_XW_SUP_BOM_ALT_EMPTY_RU,
  WAVE_XW_SUP_BOM_ALT_STRIP_LABEL_RU,
  WAVE_XW_SUP_BOM_ALT_UNTRACKED_RU,
  WAVE_XW_SUP_BOM_BRAND_ALT_LINK_RU,
  WAVE_XW_SUP_BOM_WORKSPACE_LINK_RU,
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
  /** Число пар primary→alternative из BOM substitutes (если известно). */
  altPairCount?: number | null;
};

/** Supplier dev BOM cabinet · компактная полоска согласования альтернатив (PG). */
export function SupDevBomAltMaterialApprovalStrip({
  collectionId,
  articleId,
  altPairCount = null,
}: Props) {
  const [approvals, setApprovals] = useState<Record<string, SupplierAltMaterialApprovalStatus>>({});
  const [storageMode, setStorageMode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const materialsHref = buildMaterialsAltMaterialsWorkspaceHref({ collectionId, articleId });
  const brandAltHref = buildBrandDevBomAltMaterialApprovalHref({ collectionId, articleId });

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ collectionId, articleId });
      const res = await fetch(`${WAVE_XW_SUP_ALT_MATERIAL_APPROVAL_API}?${params}`, {
        headers: buildWorkshop2ApiRequestHeaders(),
        cache: 'no-store',
      });
      if (!res.ok) {
        setApprovals({});
        return;
      }
      const json = (await res.json()) as {
        approvals?: Record<string, SupplierAltMaterialApprovalStatus>;
        storageMode?: string;
      };
      setApprovals(json.approvals ?? {});
      setStorageMode(json.storageMode ?? null);
    } catch {
      setApprovals({});
    } finally {
      setLoading(false);
    }
  }, [articleId, collectionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const summary = summarizeSupplierAltMaterialApprovals(approvals);
  const hasAlts = (altPairCount ?? summary.total) > 0;

  return (
    <div
      className="border-border-subtle bg-bg-surface2/60 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-xs"
      data-testid="sup-dev-bom-alt-material-approval-strip"
    >
      <Badge variant="outline" className="text-[9px] uppercase">
        {WAVE_XW_SUP_BOM_ALT_STRIP_LABEL_RU}
      </Badge>
      {storageMode === 'postgres' ? (
        <Badge
          variant="secondary"
          className="text-[9px]"
          data-testid="sup-dev-bom-alt-material-storage-pg"
        >
          PG
        </Badge>
      ) : null}
      {loading ? (
        <span className="text-text-secondary">Загрузка статусов…</span>
      ) : !hasAlts ? (
        <span className="text-text-secondary" data-testid="sup-dev-bom-alt-material-empty">
          {WAVE_XW_SUP_BOM_ALT_EMPTY_RU}
        </span>
      ) : (
        <>
          {summary.pending > 0 ? (
            <Badge variant="secondary" data-testid="sup-dev-bom-alt-material-pending">
              {summary.pending} {formatSupplierAltMaterialApprovalStatusRu('pending')}
            </Badge>
          ) : null}
          {summary.approved > 0 ? (
            <Badge variant="outline" data-testid="sup-dev-bom-alt-material-approved">
              {summary.approved} {formatSupplierAltMaterialApprovalStatusRu('approved')}
            </Badge>
          ) : null}
          {summary.rejected > 0 ? (
            <Badge
              variant="outline"
              className="text-rose-700"
              data-testid="sup-dev-bom-alt-material-rejected"
            >
              {summary.rejected} {formatSupplierAltMaterialApprovalStatusRu('rejected')}
            </Badge>
          ) : null}
          {summary.total === 0 ? (
            <span className="text-text-secondary" data-testid="sup-dev-bom-alt-material-untracked">
              {WAVE_XW_SUP_BOM_ALT_UNTRACKED_RU(altPairCount ?? 0)}
            </span>
          ) : null}
        </>
      )}
      <Button size="sm" variant="outline" className="h-7 text-[10px]" asChild>
        <Link href={materialsHref} data-testid="sup-dev-bom-alt-material-workspace-link">
          {WAVE_XW_SUP_BOM_WORKSPACE_LINK_RU}
        </Link>
      </Button>
      <Link
        href={brandAltHref}
        className={hubGadget.goldenLink}
        data-testid={SUP_DEV_BOM_BRAND_ALT_MATERIAL_LINK_TESTID}
      >
        {WAVE_XW_SUP_BOM_BRAND_ALT_LINK_RU}
      </Link>
    </div>
  );
}
