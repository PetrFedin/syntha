'use client';

import { Suspense, useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { CoreWholesaleMatrix } from '@/components/b2b/CoreWholesaleMatrix';
import { WholesaleOrderMatrix } from '@/components/b2b/WholesaleOrderMatrix';
import { PlatformCoreListChrome } from '@/components/platform/PlatformCoreListChrome';
import { PillarCapabilityWorkspaceChrome } from '@/components/platform/PillarCapabilityWorkspaceChrome';
import {
  ShopMatrixArticleInspectorPanel,
  shopMatrixInspectorSearchParams,
} from '@/components/shop/b2b/ShopMatrixArticleInspectorPanel';
import { ShopMatrixPrepackPanel } from '@/components/shop/b2b/ShopMatrixPrepackPanel';
import {
  readShopMatrixPrepackApplyFromSearchParams,
  type ShopMatrixPrepackApplyRequest,
} from '@/lib/b2b/shop-matrix-prepack-apply';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { resolvePageCollectionId } from '@/lib/platform-core-hub-matrix';
import { usePillarCapabilityWorkspace } from '@/hooks/use-pillar-capability-workspace';
import { B2bOrderUrlContextBanner } from '@/components/b2b/B2bOrderUrlContextBanner';
import {
  ShopCoGoldenPathStrip,
  shopCoGoldenPathStepFromFeature,
} from '@/components/shop/b2b/ShopCoGoldenPathStrip';
import { ShopScLinesheetMatrixPrefillHint } from '@/components/shop/b2b/ShopScLinesheetMatrixPrefillHint';
import { ShopScShowroomMatrixCarryHint } from '@/components/shop/b2b/ShopScShowroomMatrixCarryHint';
import {
  BRAND_SC_CROSS_MATRIX_CARRY_QTY_TOTAL_PARAM,
  BRAND_SC_CROSS_MATRIX_LINESHEET_ARTICLE_IDS_PARAM,
} from '@/lib/b2b/brand-sc-cross-matrix';
import {
  parseShopShowroomMatrixCarryFromSearchParams,
  SHOP_SHOWROOM_MATRIX_CARRY_QTY_PARAM,
  SHOP_SHOWROOM_MATRIX_CARRY_SIZE_PARAM,
} from '@/lib/b2b/shop-showroom-eligible-for-matrix';

function B2BMatrixPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const coreMode = isPlatformCoreMode();
  const mode = (searchParams.get('mode') || 'buy_now') as 'buy_now' | 'reorder' | 'pre_order';
  const validMode = ['buy_now', 'reorder', 'pre_order'].includes(mode) ? mode : 'buy_now';
  const pimBrand = searchParams.get('brand') || undefined;
  const collectionId = resolvePageCollectionId({
    collection: searchParams.get('collection'),
    w2col: searchParams.get('w2col'),
  });
  const focusArticleId = searchParams.get('article')?.trim() || undefined;
  const linesheetArticleIdsParam = searchParams.get(
    BRAND_SC_CROSS_MATRIX_LINESHEET_ARTICLE_IDS_PARAM
  );
  const linesheetCarryQtyParam = searchParams.get(BRAND_SC_CROSS_MATRIX_CARRY_QTY_TOTAL_PARAM);
  const showroomCarry = parseShopShowroomMatrixCarryFromSearchParams({
    carryQty: searchParams.get(SHOP_SHOWROOM_MATRIX_CARRY_QTY_PARAM),
    carrySize: searchParams.get(SHOP_SHOWROOM_MATRIX_CARRY_SIZE_PARAM),
  });
  const orderId =
    searchParams.get('order') ??
    searchParams.get('orderId') ??
    searchParams.get('wholesaleOrderId') ??
    undefined;

  const urlPrepackApply = useMemo(
    () => readShopMatrixPrepackApplyFromSearchParams(searchParams),
    [searchParams]
  );
  const [prepackApply, setPrepackApply] = useState<
    ShopMatrixPrepackApplyRequest | ShopMatrixPrepackApplyRequest[] | undefined
  >(urlPrepackApply);

  const ctx = useMemo(
    () => ({
      collectionId,
      orderId,
      articleId: focusArticleId ?? prepackApply?.articleId,
      role: 'shop' as const,
    }),
    [collectionId, orderId, focusArticleId, prepackApply?.articleId]
  );
  const { activeFeatureId, setActiveFeatureId } =
    usePillarCapabilityWorkspace('shop-wholesale-matrix');

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
    <CabinetPageContent maxWidth="full" className={coreMode ? 'space-y-4 !p-4' : '!p-0'}>
      {coreMode ? (
        <PlatformCoreListChrome highlightRole="shop" pillarId="collection_order">
          <PillarCapabilityWorkspaceChrome
            workspaceId="shop-wholesale-matrix"
            ctx={ctx}
            crossLinksTitle="Оптовый заказ · связи"
            beforeTabs={<B2bOrderUrlContextBanner variant="shop" />}
          >
            <div className="mb-4">
              <ShopCoGoldenPathStrip
                collectionId={collectionId}
                orderId={orderId}
                activeStep={shopCoGoldenPathStepFromFeature(activeFeatureId)}
              />
            </div>
            {activeFeatureId === 'matrix' ? (
              <ShopScLinesheetMatrixPrefillHint
                linesheetArticleIdsParam={linesheetArticleIdsParam}
                carryQtyTotalParam={linesheetCarryQtyParam}
              />
            ) : null}
            {activeFeatureId === 'matrix' ? (
              <ShopScShowroomMatrixCarryHint articleId={focusArticleId} carry={showroomCarry} />
            ) : null}
            {activeFeatureId === 'matrix' ? (
              <CoreWholesaleMatrix
                collectionId={collectionId}
                buyerName="Партнёр"
                focusArticleId={focusArticleId ?? prepackApply?.articleId}
                carryQty={showroomCarry.carryQty}
                carrySize={showroomCarry.carrySize}
                onOpenArticleInspector={openInspector}
                prepackApply={prepackApply}
                hideCabinetGoldenPath
              />
            ) : null}
            {activeFeatureId === 'inspector' ? (
              <ShopMatrixArticleInspectorPanel
                collectionId={collectionId}
                articleId={focusArticleId}
                orderId={orderId}
                onPickFromMatrix={() => setActiveFeatureId('matrix')}
              />
            ) : null}
            {activeFeatureId === 'prepack' ? (
              <ShopMatrixPrepackPanel
                collectionId={collectionId}
                orderId={orderId}
                focusArticleId={focusArticleId}
                onApplyInMatrix={applyPrepackInMatrix}
              />
            ) : null}
          </PillarCapabilityWorkspaceChrome>
        </PlatformCoreListChrome>
      ) : (
        <WholesaleOrderMatrix
          onClose={() => router.back()}
          activeRetailer={{ id: 'shop1', name: 'Партнер' }}
          initialOrderMode={validMode}
          pimBrandContext={pimBrand}
          collectionId={collectionId}
        />
      )}
    </CabinetPageContent>
  );
}

export default function B2BMatrixPage() {
  return (
    <Suspense fallback={null}>
      <B2BMatrixPageInner />
    </Suspense>
  );
}
