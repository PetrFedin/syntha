'use client';

import Link from 'next/link';
import {
  brandAttributeSchemaFeatureHref,
  brandAttributeSchemaMaterialPassportHref,
} from '@/lib/platform-core-ports/fashion/brand-attribute-schema-workspace';
import {
  brandMaterialPassportReleaseChecklistHref,
  brandMaterialPassportFeatureHref,
} from '@/lib/platform-core-ports/fashion/brand-material-passport-workspace';
import {
  WAVE_YP_ATTR_SCHEMA_RU,
  WAVE_YP_BRAND_SC_RELEASE_GATE_SCHEMA_PASSPORT_PEER_STRIP_TESTID,
  WAVE_YP_MAT_CERTS_RU,
  WAVE_YP_MAT_ROLLUP_RU,
  WAVE_YP_RELEASE_CHECKLIST_RU,
} from '@/lib/platform-core-ports/platform/wave-yp-cross-link-audit-fix';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
};

/** Wave UV · SC release gate · dev pillar peers: attribute schema ↔ material passport. */
export function BrandScReleaseGateSchemaPassportPeerStrip({ collectionId }: Props) {
  const schemaHref = brandAttributeSchemaFeatureHref('schemas', collectionId);
  const passportHref = brandAttributeSchemaMaterialPassportHref(collectionId);
  const certsHref = brandMaterialPassportFeatureHref('certs', collectionId);
  const checklistHref = brandMaterialPassportReleaseChecklistHref(collectionId);

  return (
    <div
      className={hubGadget.goldenPath}
      data-testid={WAVE_YP_BRAND_SC_RELEASE_GATE_SCHEMA_PASSPORT_PEER_STRIP_TESTID}
    >
      <Link
        href={schemaHref}
        data-testid="brand-sc-release-gate-schema-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_ATTR_SCHEMA_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={passportHref}
        data-testid="brand-sc-release-gate-passport-rollup-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_MAT_ROLLUP_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={certsHref}
        data-testid="brand-sc-release-gate-passport-certs-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_MAT_CERTS_RU}
      </Link>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href={checklistHref}
        data-testid="brand-sc-release-gate-checklist-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YP_RELEASE_CHECKLIST_RU}
      </Link>
    </div>
  );
}
