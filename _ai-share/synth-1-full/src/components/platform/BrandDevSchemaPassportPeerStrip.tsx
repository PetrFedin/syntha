'use client';

import Link from 'next/link';
import {
  brandAttributeSchemaFeatureHref,
  brandAttributeSchemaMaterialPassportHref,
  brandAttributeSchemaReleaseChecklistHref,
} from '@/lib/platform-core-ports/fashion/brand-attribute-schema-workspace';
import { brandMaterialPassportFeatureHref } from '@/lib/platform-core-ports/fashion/brand-material-passport-workspace';
import {
  WAVE_YF_ATTR_HEALTH_RU,
  WAVE_YF_ATTR_SCHEMA_RU,
  WAVE_YF_MAT_CERTS_RU,
  WAVE_YF_MAT_ROLLUP_RU,
  WAVE_YF_RELEASE_GATE_RU,
} from '@/lib/platform-core-ports/platform/wave-yf-hub-compact-ru';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  collectionId: string;
  activeSide: 'schema' | 'passport';
};

/** Wave VM · dev pillar cross-links: attribute schema ↔ material passport ↔ release gate. */
export function BrandDevSchemaPassportPeerStrip({ collectionId, activeSide }: Props) {
  const schemaHealthHref = brandAttributeSchemaFeatureHref('health', collectionId);
  const schemaHref = brandAttributeSchemaFeatureHref('schemas', collectionId);
  const passportRollupHref = brandAttributeSchemaMaterialPassportHref(collectionId);
  const passportCertsHref = brandMaterialPassportFeatureHref('certs', collectionId);
  const releaseGateHref = brandAttributeSchemaReleaseChecklistHref(collectionId);

  return (
    <div className={hubGadget.goldenPath} data-testid="brand-dev-schema-passport-peer-strip">
      {activeSide === 'passport' ? (
        <>
          <Link
            href={schemaHealthHref}
            data-testid="brand-dev-schema-passport-schema-health-link"
            className={hubGadget.goldenLink}
          >
            {WAVE_YF_ATTR_HEALTH_RU}
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>·</span>
          <Link
            href={schemaHref}
            data-testid="brand-dev-schema-passport-schema-link"
            className={hubGadget.goldenLink}
          >
            {WAVE_YF_ATTR_SCHEMA_RU}
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>·</span>
        </>
      ) : null}
      {activeSide === 'schema' ? (
        <>
          <Link
            href={passportRollupHref}
            data-testid="brand-dev-schema-passport-passport-link"
            className={hubGadget.goldenLink}
          >
            {WAVE_YF_MAT_ROLLUP_RU}
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>·</span>
          <Link
            href={passportCertsHref}
            data-testid="brand-dev-schema-passport-certs-link"
            className={hubGadget.goldenLink}
          >
            {WAVE_YF_MAT_CERTS_RU}
          </Link>
          <span className={hubGadget.goldenSep} aria-hidden>·</span>
        </>
      ) : null}
      <Link
        href={releaseGateHref}
        data-testid="brand-dev-schema-passport-release-gate-link"
        className={hubGadget.goldenLink}
      >
        {WAVE_YF_RELEASE_GATE_RU}
      </Link>
    </div>
  );
}
