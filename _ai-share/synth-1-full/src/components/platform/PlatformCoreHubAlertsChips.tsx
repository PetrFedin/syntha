'use client';

import Link from 'next/link';
import { GitCompare } from 'lucide-react';
import {
  getPlatformCoreCollectionLabel,
  isPlatformCoreEmptyChainCollection,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import { ROUTES, brandDevelopmentCabinetHref } from '@/lib/platform-core-routes';
import { isSynthaEmbedClient } from '@/lib/platform-core-ports/legacy/syntha-embed';

type Props = {
  collectionId: string;
};

/** Компактные алерты hub — одна строка-чип, детали по ссылке. */
export function PlatformCoreHubAlertsChips({ collectionId }: Props) {
  const embed = isSynthaEmbedClient();
  const isFw27 = !embed && collectionId.trim().toUpperCase() === 'FW27';
  const isEmpty = isPlatformCoreEmptyChainCollection(collectionId);

  if (!isFw27 && !isEmpty) return null;

  return (
    <div
      data-testid="platform-core-hub-alerts"
      className="flex flex-wrap items-center gap-2"
    >
      {isFw27 ? (
        <span
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-950"
          data-testid="platform-core-fw27-dev-banner"
        >
          <span className="shrink-0 font-semibold">FW27</span>
          <span className="text-amber-800/80">dev</span>
          <Link
            href="/platform?collection=SS27"
            className="text-accent-primary shrink-0 font-semibold hover:underline"
            data-testid="platform-core-fw27-dev-banner-ss27-link"
          >
            SS27
          </Link>
        </span>
      ) : null}

      {isEmpty ? (
        <span
          role="status"
          data-testid="platform-core-empty-chain-banner"
          className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-800"
        >
          <GitCompare className="h-3 w-3 shrink-0 text-slate-500" aria-hidden />
          <span className="font-semibold">Пустая цепочка</span>
          <Link
            href={brandDevelopmentCabinetHref(collectionId, undefined, { create: true })}
            data-testid="platform-core-empty-create-article"
            className="text-accent-primary font-semibold hover:underline"
          >
            + артикул
          </Link>
          <Link
            href={`/platform?collection=${PLATFORM_CORE_DEMO.collectionId}`}
            className="font-medium underline underline-offset-2"
          >
            {getPlatformCoreCollectionLabel(PLATFORM_CORE_DEMO.collectionId)}
          </Link>
        </span>
      ) : null}
    </div>
  );
}
