'use client';

import Link from 'next/link';
import {
  resolvePlatformCoreCollectionId,
  type CoreHubPillarId,
} from '@/lib/platform-core-hub-matrix';
import { getPlatformCoreDemo } from '@/lib/platform-core-demo-context';
import {
  articleSpineGoldenPathHrefForStep,
  buildArticleSpineGoldenPathSession,
  PLATFORM_CORE_HUB_CHAIN_SPINE_STEPS,
} from '@/lib/platform-core-article-spine-golden-path';
import { PLATFORM_CORE_CHAIN_STRIP_TITLE } from '@/lib/platform-core-canonical-labels';
import { isDefaultPlatformCoreCollectionId } from '@/lib/platform-core-url-canon';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubSectionLabelClassName } from '@/lib/platform-core-hub-layout';

type Props = {
  collectionId: string;
};

/** Wave 6 · Article Spine — три шага с /platform на конкретные section в core hub. */
export function PlatformCoreHubChainStrip({ collectionId }: Props) {
  const resolvedId = resolvePlatformCoreCollectionId(collectionId);
  const demo = getPlatformCoreDemo(resolvedId);
  const session = buildArticleSpineGoldenPathSession(demo);

  return (
    <section data-testid="platform-core-hub-chain-strip" className="space-y-2">
      <p className={hubSectionLabelClassName()}>{PLATFORM_CORE_CHAIN_STRIP_TITLE}</p>
      <div className={hubGadget.goldenPath}>
        {PLATFORM_CORE_HUB_CHAIN_SPINE_STEPS.map((step, index) => {
          const href = articleSpineGoldenPathHrefForStep(session, step.stepId);
          return (
            <span key={step.stepId} className="contents">
              {index > 0 ? (
                <span className={hubGadget.goldenSep} aria-hidden>
                  →
                </span>
              ) : null}
              <Link
                href={href}
                className={hubGadget.goldenLink}
                data-testid={`platform-core-hub-chain-${step.chainTestId as CoreHubPillarId}`}
              >
                {step.labelRu}
              </Link>
            </span>
          );
        })}
      </div>
    </section>
  );
}
