'use client';

import Link from 'next/link';
import {
  brandAttributeSchemaFeatureHref,
  brandAttributeSchemaMaterialPassportHref,
} from '@/lib/fashion/brand-attribute-schema-workspace';
import { buildBrandSupplierBomSession } from '@/lib/fashion/brand-supplier-bom-workspace';
import {
  WAVE_YP_ATTR_SCHEMA_RU,
  WAVE_YP_BRAND_RFQ_RU,
  WAVE_YP_MAT_PASSPORT_RU,
  WAVE_YP_SUPPLIER_BOM_RU,
  WAVE_YP_SUP_DEV_BOM_BRAND_DEV_PEER_STRIP_TESTID,
} from '@/lib/platform/wave-yp-cross-link-audit-fix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  articleId: string;
};

/** Supplier dev BOM · brand dev workspace peers (material passport, schema, RFQ). */
export function SupDevBomBrandDevPeerStrip({ collectionId, articleId }: Props) {
  const bomSession = buildBrandSupplierBomSession({ collectionId, articleId });
  const schemaHref = brandAttributeSchemaFeatureHref('health', collectionId);
  const passportHref = brandAttributeSchemaMaterialPassportHref(collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid={WAVE_YP_SUP_DEV_BOM_BRAND_DEV_PEER_STRIP_TESTID}>
      <Link
        href={passportHref}
        data-testid="sup-dev-bom-brand-material-passport-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_MAT_PASSPORT_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={schemaHref}
        data-testid="sup-dev-bom-brand-attribute-schema-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_ATTR_SCHEMA_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={bomSession.centricRfqHref}
        data-testid="sup-dev-bom-brand-centric-rfq-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_BRAND_RFQ_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={bomSession.bomHref}
        data-testid="sup-dev-bom-brand-supplier-bom-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_SUPPLIER_BOM_RU}
      </Link>
    </div>
  );
}
