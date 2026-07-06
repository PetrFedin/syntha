'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SupplierAltMaterialRow } from '@/lib/platform-core-supplier-materials-reference';
import {
  supplierCanActAltMaterialApproval,
  WAVE_XW_SUP_ALT_APPROVE_LABEL_RU,
  WAVE_XW_SUP_ALT_REJECT_LABEL_RU,
  WAVE_XW_SUP_ALT_SUBMIT_LABEL_RU,
  WAVE_XW_SUP_ALT_MATERIAL_APPROVAL_API,
} from '@/lib/platform/wave-xw-sup-alt-material-approval';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import {
  buildSupplierAltMaterialApprovalKey,
  formatSupplierAltMaterialApprovalStatusRu,
  type SupplierAltMaterialApprovalStatus,
} from '@/lib/production/workshop2-supplier-alt-material-approval';

type Props = {
  collectionId: string;
  articleId: string;
  rows: SupplierAltMaterialRow[];
};

export function SupplierAltMaterialsApprovalPanel({ collectionId, articleId, rows }: Props) {
  const [approvals, setApprovals] = useState<Record<string, SupplierAltMaterialApprovalStatus>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ collectionId, articleId });
    const res = await fetch(`${WAVE_XW_SUP_ALT_MATERIAL_APPROVAL_API}?${params}`, {
      headers: buildWorkshop2ApiRequestHeaders(),
      cache: 'no-store',
    });
    if (!res.ok) return;
    const json = (await res.json()) as {
      approvals?: Record<string, SupplierAltMaterialApprovalStatus>;
    };
    setApprovals(json.approvals ?? {});
  }, [articleId, collectionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (row: SupplierAltMaterialRow, alternative: string, action: 'submit' | 'approve' | 'reject') => {
    const key = buildSupplierAltMaterialApprovalKey(row.primary, alternative);
    const currentStatus = approvals[key] ?? null;
    if (!supplierCanActAltMaterialApproval({ action, currentStatus })) return;

    setBusyKey(key);
    try {
      const res = await fetch(WAVE_XW_SUP_ALT_MATERIAL_APPROVAL_API, {
        method: 'POST',
        headers: {
          ...buildWorkshop2ApiRequestHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId,
          articleId,
          primary: row.primary,
          alternative,
          action,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        approvals?: Record<string, SupplierAltMaterialApprovalStatus>;
      };
      if (json.ok && json.approvals) setApprovals(json.approvals);
    } finally {
      setBusyKey(null);
    }
  };

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground" data-testid="materials-alt-materials-empty">
        Альтернативы не заданы в поле substitutes спецификации.
      </p>
    );
  }

  return (
    <ul className="space-y-2" data-testid="materials-alt-materials">
      {rows.map((row) =>
        row.alternatives.map((alt) => {
          const key = buildSupplierAltMaterialApprovalKey(row.primary, alt);
          const status = approvals[key] ?? null;
          const busy = busyKey === key;
          const canSubmit = supplierCanActAltMaterialApproval({ action: 'submit', currentStatus: status });
          const canApprove = supplierCanActAltMaterialApproval({ action: 'approve', currentStatus: status });
          const canReject = supplierCanActAltMaterialApproval({ action: 'reject', currentStatus: status });
          return (
            <li
              key={key}
              className="flex flex-wrap items-center gap-2 text-sm"
              data-testid={`materials-alt-row-${key.replace(/::/g, '-')}`}
            >
              <span className="font-medium">{row.primary}</span>
              <span className="text-muted-foreground">→</span>
              <span>{alt}</span>
              {status ? (
                <Badge variant="outline" className="text-[10px]" data-testid={`materials-alt-status-${key}`}>
                  {formatSupplierAltMaterialApprovalStatusRu(status)}
                </Badge>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-[10px]"
                disabled={busy || !canSubmit}
                data-testid={`materials-alt-submit-${key}`}
                onClick={() => void act(row, alt, 'submit')}
              >
                {WAVE_XW_SUP_ALT_SUBMIT_LABEL_RU}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-[10px]"
                disabled={busy || !canApprove}
                data-testid={`materials-alt-approve-${key}`}
                onClick={() => void act(row, alt, 'approve')}
              >
                {WAVE_XW_SUP_ALT_APPROVE_LABEL_RU}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-[10px] text-rose-700"
                disabled={busy || !canReject}
                data-testid={`materials-alt-reject-${key}`}
                onClick={() => void act(row, alt, 'reject')}
              >
                {WAVE_XW_SUP_ALT_REJECT_LABEL_RU}
              </Button>
            </li>
          );
        })
      )}
    </ul>
  );
}
