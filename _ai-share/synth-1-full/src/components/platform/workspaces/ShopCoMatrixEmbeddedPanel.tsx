'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  PlatformCoreShopCoGoldenPathStrip,
  shopCoGoldenPathStepFromFeature,
} from '@/components/platform/peers/PlatformCoreShopCoGoldenPathStrip';
import { ShopCoMatrixInspectorPrepackPeerStrip } from '@/components/platform/ShopCoMatrixInspectorPrepackPeerStrip';
import {
  ShopMatrixArticleInspectorPanel,
  shopMatrixInspectorSearchParams,
} from '@/components/shop/b2b/ShopMatrixArticleInspectorPanel';
import { ShopMatrixPrepackPanel } from '@/components/shop/b2b/ShopMatrixPrepackPanel';
import {
  readShopMatrixPrepackApplyFromSearchParams,
  type ShopMatrixPrepackApplyRequest,
} from '@/lib/b2b/shop-matrix-prepack-apply';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { PLATFORM_CORE_DEMO } from '@/lib/platform-core-demo-context';

const CoreWholesaleMatrix = dynamic(
  () =>
    import('@/components/b2b/CoreWholesaleMatrix').then((m) => ({
      default: m.CoreWholesaleMatrix,
    })),
  { ssr: false }
);

type Props = {
  collectionId: string;
  orderId?: string | null;
};

/** Матрица CO · shop — matrix / inspector / prepack в hub без legacy URL. */
export function ShopCoMatrixEmbeddedPanel({ collectionId, orderId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedOrder = orderId?.trim() || PLATFORM_CORE_DEMO.demoOrderId;
  const focusArticleId = searchParams.get('article')?.trim() || undefined;

  const urlPrepackApply = useMemo(
    () => readShopMatrixPrepackApplyFromSearchParams(searchParams),
    [searchParams]
  );
  const [prepackApply, setPrepackApply] = useState<
    ShopMatrixPrepackApplyRequest | ShopMatrixPrepackApplyRequest[] | undefined
  >(urlPrepackApply);

  const { activeFeatureId, setActiveFeatureId } = usePillarCapabilityWorkspace('shop-wholesale-matrix');
  const matrixTab = activeFeatureId === 'matrix';
  const inspectorTab = activeFeatureId === 'inspector';
  const prepackTab = activeFeatureId === 'prepack';

  const openInspector = useCallback(
    (articleId: string) => {
      const sp = shopMatrixInspectorSearchParams(
        articleId,
        new URLSearchParams(searchParams.toString())
      );
      router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const applyPrepackInMatrix = useCallback(
    (request: ShopMatrixPrepackApplyRequest | ShopMatrixPrepackApplyRequest[]) => {
      setPrepackApply(request);
      setActiveFeatureId('matrix');
    },
    [setActiveFeatureId]
  );

  return (
    <div data-testid="shop-co-matrix-embedded-panel" className="min-w-0 space-y-3">
      <PlatformCoreShopCoGoldenPathStrip
        collectionId={collectionId}
        orderId={resolvedOrder}
        activeStep={shopCoGoldenPathStepFromFeature(activeFeatureId)}
      />
      <ShopCoMatrixInspectorPrepackPeerStrip
        collectionId={collectionId}
        orderId={resolvedOrder}
        articleId={focusArticleId}
        activeTab={matrixTab ? 'matrix' : inspectorTab ? 'inspector' : prepackTab ? 'prepack' : undefined}
        embedded
      />
      {matrixTab ? (
        <CoreWholesaleMatrix
          collectionId={collectionId}
          buyerName="Партнёр"
          focusArticleId={focusArticleId ?? prepackApply?.articleId}
          onOpenArticleInspector={openInspector}
          prepackApply={prepackApply}
          hideCabinetGoldenPath
        />
      ) : null}
      {inspectorTab ? (
        <ShopMatrixArticleInspectorPanel
          collectionId={collectionId}
          articleId={focusArticleId}
          orderId={resolvedOrder}
          onPickFromMatrix={() => setActiveFeatureId('matrix')}
        />
      ) : null}
      {prepackTab ? (
        <ShopMatrixPrepackPanel
          collectionId={collectionId}
          orderId={resolvedOrder}
          focusArticleId={focusArticleId}
          onApplyInMatrix={applyPrepackInMatrix}
        />
      ) : null}
    </div>
  );
}
