'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  getPlatformCoreDemo,
  type PlatformCoreDemoContext,
} from '@/lib/platform-core-demo-context';
import {
  articleSpineGoldenPathHrefForStep,
  buildArticleSpineGoldenPathSession,
  PLATFORM_CORE_ARTICLE_SPINE_GOLDEN_PATH_STEPS,
  type ArticleSpineGoldenStepId,
} from '@/lib/platform-core-article-spine-golden-path';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';
import { hubCabinet } from '@/lib/platform-core-cabinet-chrome';

type Props = {
  demo: Pick<PlatformCoreDemoContext, 'collectionId' | 'demoOrderId' | 'demoArticleId'>;
  activeStep?: ArticleSpineGoldenStepId;
  omitStep?: ArticleSpineGoldenStepId;
  stripTestId?: string;
  className?: string;
};

/** Article Spine · wave 6 — единая полоса W2 → досье → лайншиты → shop matrix. */
export function PlatformCoreArticleSpineGoldenPathStrip({
  demo: demoInput,
  activeStep,
  omitStep,
  stripTestId = 'platform-core-article-spine-golden-path-strip',
  className,
}: Props) {
  const demo = getPlatformCoreDemo(demoInput.collectionId);
  const merged: PlatformCoreDemoContext = {
    ...demo,
    ...demoInput,
    collectionId: demoInput.collectionId || demo.collectionId,
    demoOrderId: demoInput.demoOrderId || demo.demoOrderId,
    demoArticleId: demoInput.demoArticleId || demo.demoArticleId,
  };
  const session = buildArticleSpineGoldenPathSession(merged);
  const steps = PLATFORM_CORE_ARTICLE_SPINE_GOLDEN_PATH_STEPS.filter((s) => s.id !== omitStep);

  return (
    <nav
      aria-label="Article Spine"
      className={cn(
        hubGadget.goldenPath,
        hubCabinet.workspaceTableScroll,
        'max-md:flex-nowrap',
        className
      )}
      data-testid={stripTestId}
    >
      {steps.map((step, index) => {
        const href = articleSpineGoldenPathHrefForStep(session, step.id);
        if (!href) return null;
        return (
          <span key={step.id} className="contents">
            {index > 0 ? (
              <span className={hubGadget.goldenSep} aria-hidden>
                ·
              </span>
            ) : null}
            <Link
              href={href}
              className={cn(hubGadget.goldenLink, activeStep === step.id && 'font-bold underline')}
              data-testid={step.linkTestId}
            >
              {step.labelRu}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
