'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/platform-core-routes';
import { isSynthaEmbedClient } from '@/lib/platform-core-ports/legacy/syntha-embed';
import { platformCoreUiHref } from '@/lib/platform-core-ui-href';

type Props = {
  collectionId: string;
};

/** FW27 — demo-only sibling коллекция; инвесторский path = SS27 clean PG. */
export function PlatformCoreFw27DevBanner({ collectionId }: Props) {
  if (isSynthaEmbedClient()) return null;
  if (collectionId.trim().toUpperCase() !== 'FW27') return null;

  return (
    <div
      className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-sm text-amber-950"
      data-testid="platform-core-fw27-dev-banner"
    >
      <p className="text-xs font-medium">
        FW27 — dev-only. Golden path:{' '}
        <Link
          href="/platform?collection=SS27"
          className="text-accent-primary hover:underline"
          data-testid="platform-core-fw27-dev-banner-ss27-link"
        >
          SS27
        </Link>
        {' · '}
        <Link
          href={platformCoreUiHref(`${ROUTES.shop.b2bMatrix}?collection=SS27`)}
          className="text-accent-primary hover:underline"
          data-testid="platform-core-fw27-dev-banner-matrix-link"
        >
          матрица
        </Link>
      </p>
    </div>
  );
}
