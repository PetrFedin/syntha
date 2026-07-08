'use client';

import { Badge } from '@/components/ui/badge';
import {
  SUPPLIER_MATERIAL_CATALOG_PG_READ_BADGE_TESTID,
  SUPPLIER_MATERIAL_CATALOG_PG_READ_STRIP_TESTID,
  supDevMaterialCatalogPgReadBadgeRu,
  supDevMaterialCatalogPgReadLeadRu,
} from '@/lib/fashion/supplier-dev-wave-wk';

type Props = {
  listingCount: number;
  loading?: boolean;
  pgReachable?: boolean;
};

/** Wave WK · honest PG read-path stub on material catalog cabinet page. */
export function SupplierMaterialCatalogPgReadStrip({
  listingCount,
  loading = false,
  pgReachable = true,
}: Props) {
  return (
    <div
      className="border-border-subtle bg-bg-surface2/40 text-text-secondary flex flex-wrap items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs"
      data-testid={SUPPLIER_MATERIAL_CATALOG_PG_READ_STRIP_TESTID}
    >
      <Badge
        variant="outline"
        className="text-[9px]"
        data-testid={SUPPLIER_MATERIAL_CATALOG_PG_READ_BADGE_TESTID}
      >
        {supDevMaterialCatalogPgReadBadgeRu()}
      </Badge>
      <span>
        {loading
          ? 'Загрузка listing из PG…'
          : pgReachable
            ? `${supDevMaterialCatalogPgReadLeadRu()} Позиций: ${listingCount}.`
            : 'PG недоступен — listing пуст до bootstrap.'}
      </span>
    </div>
  );
}
