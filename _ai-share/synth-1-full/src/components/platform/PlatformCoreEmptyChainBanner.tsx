'use client';

import Link from 'next/link';
import { GitCompare } from 'lucide-react';
import {
  getPlatformCoreCollectionLabel,
  isPlatformCoreEmptyChainCollection,
  PLATFORM_CORE_DEMO,
} from '@/lib/platform-core-hub-matrix';
import { PLATFORM_CORE_EMPTY_CHAIN_BANNER_RU } from '@/lib/platform-core-user-messages';
import { ROUTES, brandDevelopmentCabinetHref } from '@/lib/platform-core-routes';

type Props = {
  collectionId: string;
};

/** Контраст с SS27: коллекция без seed — все столпы честно «не выполнены». */
export function PlatformCoreEmptyChainBanner({ collectionId }: Props) {
  if (!isPlatformCoreEmptyChainCollection(collectionId)) return null;

  const createHref = brandDevelopmentCabinetHref(collectionId, undefined, { create: true });

  return (
    <div
      role="status"
      data-testid="platform-core-empty-chain-banner"
      className="flex gap-3 rounded-xl border border-slate-300/80 bg-slate-50 px-4 py-3 text-sm text-slate-900"
    >
      <GitCompare className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden />
      <div className="space-y-1">
        <p className="font-semibold">Пустая цепочка</p>
        <p className="text-xs leading-relaxed text-slate-800/90">
          {PLATFORM_CORE_EMPTY_CHAIN_BANNER_RU}
        </p>
        <p className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
          <Link
            href={createHref}
            data-testid="platform-core-empty-create-article"
            className="bg-accent-primary inline-flex rounded-md px-2.5 py-1 font-semibold text-white"
          >
            + Создать артикул (wizard)
          </Link>
          <Link
            href={`/platform?collection=${PLATFORM_CORE_DEMO.collectionId}`}
            className="font-medium underline underline-offset-2"
          >
            {getPlatformCoreCollectionLabel(PLATFORM_CORE_DEMO.collectionId)}
          </Link>
          <Link
            href="/platform?collection=FW27"
            className="font-medium underline underline-offset-2"
          >
            {getPlatformCoreCollectionLabel('FW27')}
          </Link>
        </p>
      </div>
    </div>
  );
}
