'use client';

import { prefetchWorkshop2ArticleTabChunks } from '@/components/brand/production/workshop2-tab-panel-chunk-boundary';
import { WORKSHOP2_BASE_PATH } from '@/lib/production/workshop2-url';

const W2_ARTICLE_PATH = new RegExp(
  `${WORKSHOP2_BASE_PATH.replace(/\//g, '\\/')}/c/[^/]+/a/[^/?#]+`
);

/** Prefetch тяжёлых W2-чанков перед переходом из hub/cabinet. */
export function prefetchPlatformCoreW2FromHref(href: string | null | undefined): void {
  if (!href?.trim()) return;
  try {
    const path = href.startsWith('http') ? new URL(href).pathname : (href.split(/[?#]/)[0] ?? href);
    if (W2_ARTICLE_PATH.test(path)) {
      prefetchWorkshop2ArticleTabChunks('tz');
      return;
    }
    if (path.includes(WORKSHOP2_BASE_PATH)) {
      prefetchWorkshop2ArticleTabChunks('tz');
    }
  } catch {
    /* ignore malformed href */
  }
}

export const platformCoreW2PrefetchHandlers = {
  onMouseEnter: (e: { currentTarget: HTMLAnchorElement }) =>
    prefetchPlatformCoreW2FromHref(e.currentTarget.getAttribute('href')),
  onFocus: (e: { currentTarget: HTMLAnchorElement }) =>
    prefetchPlatformCoreW2FromHref(e.currentTarget.getAttribute('href')),
} as const;
