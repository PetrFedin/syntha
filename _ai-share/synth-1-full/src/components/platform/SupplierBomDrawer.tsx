'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fetchDossierMaterialPreviews } from '@/lib/platform-core-ports/platform/supplier-dossier-material-cache';
import {
  formatDossierMaterialPreviewLine,
  type Workshop2DossierMaterialPreview,
} from '@/lib/platform-core-ports/dossier-material-preview';
import {
  estimateSupplierMaterialNeed,
  formatSupplierMaterialNeedRu,
} from '@/lib/platform-core-supplier-forecast';
import { PLATFORM_CORE_BOM_UNAVAILABLE_RU } from '@/lib/platform-core-user-messages';
import { PlatformCoreTerm } from '@/components/platform/PlatformCoreTerm';

const BOM_DRAWER_LIMIT = 20;

type Props = {
  collectionId: string;
  articleId: string;
  orderQty?: number;
  previewCount?: number;
  triggerLabel?: string;
  testId?: string;
};

export function SupplierBomDrawer({
  collectionId,
  articleId,
  orderQty,
  previewCount = 0,
  triggerLabel,
  testId = 'supplier-bom-drawer-trigger',
}: Props) {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Workshop2DossierMaterialPreview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    void fetchDossierMaterialPreviews(collectionId, articleId, BOM_DRAWER_LIMIT).then((rows) => {
      if (!cancelled) {
        setLines(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, collectionId, articleId]);

  const label =
    triggerLabel ??
    (previewCount > 0
      ? `Показать все позиции (${previewCount > BOM_DRAWER_LIMIT ? `${BOM_DRAWER_LIMIT}+` : previewCount})`
      : 'Полный список материалов');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="link"
          className="text-accent-primary h-auto p-0 text-xs font-medium"
          data-testid={testId}
        >
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[85vh] max-w-md overflow-y-auto"
        data-testid="supplier-bom-drawer"
      >
        <DialogHeader>
          <DialogTitle className="text-base">
            <PlatformCoreTerm term="BOM" /> · {articleId}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Материалы из досье (только чтение)
            {orderQty != null && orderQty > 0 ? ` · заказ ${orderQty} шт.` : ''}
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="text-text-muted text-sm">Загрузка…</p>
        ) : lines.length === 0 ? (
          <p className="text-text-muted text-sm">{PLATFORM_CORE_BOM_UNAVAILABLE_RU}</p>
        ) : (
          <ul className="space-y-2 text-xs">
            {lines.map((preview) => {
              const need =
                orderQty != null && orderQty > 0
                  ? estimateSupplierMaterialNeed({ preview, orderQty })
                  : null;
              return (
                <li
                  key={`${preview.name}-${preview.unitLabelRu}`}
                  className="border-border-subtle rounded-md border p-2"
                >
                  <p className="font-medium">{formatDossierMaterialPreviewLine(preview)}</p>
                  {need ? (
                    <p className="text-text-muted mt-1">{formatSupplierMaterialNeedRu(need)}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
