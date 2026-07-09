import type { ReactNode } from 'react';

import {
  getPlatformCorePublishCtaModel,
  type PlatformCorePublishCtaState,
} from '@/lib/platform-core-publish-cta-model';
import { getPlatformCoreTypographyRole } from '@/lib/platform-core-ui-density-contract';

type PlatformCorePublishCtaProps = {
  state: PlatformCorePublishCtaState;
  onPublish?: () => void;
  nextStep?: ReactNode;
};

/**
 * Canonical Publish CTA for Sample Collection.
 *
 * Keeps label/disabled/next-step behavior tied to the publish CTA model so real
 * screens do not re-implement publish logic locally.
 */
export function PlatformCorePublishCta({ state, onPublish, nextStep }: PlatformCorePublishCtaProps) {
  const model = getPlatformCorePublishCtaModel(state);
  const body = getPlatformCoreTypographyRole('body');
  const button = getPlatformCoreTypographyRole('button');

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="min-w-0">
        <p
          className="text-neutral-700"
          style={{
            fontSize: body?.fontSize,
            lineHeight: body?.lineHeight,
            fontWeight: body?.fontWeight,
          }}
        >
          {model.helperTextRu}
        </p>
        {nextStep ? <div className="mt-2">{nextStep}</div> : null}
      </div>
      <button
        type="button"
        disabled={model.disabled}
        onClick={model.disabled ? undefined : onPublish}
        data-platform-core-action-id={model.actionId}
        data-platform-core-section-id={model.primarySectionId}
        data-platform-core-next-section-id={model.nextSectionId}
        className="inline-flex h-9 shrink-0 items-center rounded-lg border border-neutral-300 px-3 text-neutral-900 enabled:hover:bg-neutral-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
        style={{
          fontSize: button?.fontSize,
          lineHeight: button?.lineHeight,
          fontWeight: button?.fontWeight,
        }}
      >
        {model.label}
      </button>
    </div>
  );
}
