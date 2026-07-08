'use client';

import Link from 'next/link';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

/** Clarifies nav SoT: chain card here, dossier facts in #production-dossier below. */
export function BrandOpChainDossierSoTStrip() {
  return (
    <div className={hubGadget.goldenPath} data-testid="brand-op-chain-dossier-sot-strip">
      <span className={hubGadget.muted}>SoT: цепочка здесь</span>
      <span className={hubGadget.goldenSep} aria-hidden>
        ·
      </span>
      <Link
        href="#production-dossier"
        data-testid="brand-op-chain-dossier-anchor-link"
        className={hubGadget.goldenLink}
      >
        ТЗ / PO факты ↓
      </Link>
    </div>
  );
}
