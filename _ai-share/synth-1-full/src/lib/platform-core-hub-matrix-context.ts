/**
 * Query-параметры сквозного demo-контекста Platform Core hub.
 */
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';
import { appendSynthaOverlaySearchParams } from '@/lib/communications/syntha-overlay-context';
import {
  PLATFORM_CORE_DEMO,
  isPlatformCoreEmptyChainDemo,
  type PlatformCoreDemoContext,
} from '@/lib/platform-core-demo-context';

export type PlatformCoreContextQueryStyle = 'workspace' | 'syntha';

function isSynthaOverlayHrefPath(pathname: string): boolean {
  return /\/(messages|calendar)(\/|$)/.test(pathname);
}

function orderIdInHrefPath(pathname: string): boolean {
  return /\/(?:b2b-orders|orders)\/[^/?#]+/.test(pathname);
}

function articleIdInHrefPath(pathname: string): boolean {
  return /\/dossier\/[^/?#]+/.test(pathname);
}

/** Query-параметры сквозного demo-контекста для рабочих экранов или syntha overlay. */
export function buildPlatformCoreContextSearchParams(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO,
  style: PlatformCoreContextQueryStyle = 'workspace'
): URLSearchParams {
  const sp = new URLSearchParams();
  if (isPlatformCoreEmptyChainDemo(demo)) return sp;
  if (style === 'syntha') {
    appendSynthaOverlaySearchParams(sp, {
      orderId: demo.demoOrderId,
      collectionId: demo.collectionId,
      articleId: demo.demoArticleId,
      poRef: demo.productionOrderId,
    });
    return sp;
  }
  sp.set('collection', demo.collectionId);
  sp.set('orderId', demo.demoOrderId);
  sp.set('article', demo.demoArticleId);
  if (demo.demoBuyerId?.trim()) {
    sp.set('buyerId', demo.demoBuyerId.trim());
  }
  return sp;
}

/** `?collection=&orderId=&article=` или syntha overlay keys — для deep-link между ролями. */
export function buildPlatformCoreContextQuery(
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO,
  options?: { style?: PlatformCoreContextQueryStyle }
): string {
  const q = buildPlatformCoreContextSearchParams(demo, options?.style ?? 'workspace').toString();
  return q ? `?${q}` : '';
}

/** Добавляет недостающие ключи demo-контекста к href (только в Platform Core mode). */
export function appendPlatformCoreContextToHref(
  href: string,
  demo: PlatformCoreDemoContext = PLATFORM_CORE_DEMO
): string {
  if (!isPlatformCoreMode() || isPlatformCoreEmptyChainDemo(demo)) return href;

  const hashIdx = href.indexOf('#');
  const hash = hashIdx >= 0 ? href.slice(hashIdx) : '';
  const beforeHash = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const qIdx = beforeHash.indexOf('?');
  const pathname = qIdx >= 0 ? beforeHash.slice(0, qIdx) : beforeHash;
  const existing = new URLSearchParams(qIdx >= 0 ? beforeHash.slice(qIdx + 1) : '');

  const style: PlatformCoreContextQueryStyle = isSynthaOverlayHrefPath(pathname)
    ? 'syntha'
    : 'workspace';
  const contextParams = buildPlatformCoreContextSearchParams(demo, style);

  if (style === 'workspace') {
    if (orderIdInHrefPath(pathname)) {
      contextParams.delete('orderId');
      contextParams.delete('order');
    }
    if (articleIdInHrefPath(pathname)) {
      contextParams.delete('article');
      contextParams.delete('stagesSku');
      contextParams.delete('productId');
    }
  }

  for (const [key, value] of contextParams.entries()) {
    if (!existing.has(key)) {
      existing.set(key, value);
    }
  }

  const q = existing.toString();
  return `${pathname}${q ? `?${q}` : ''}${hash}`;
}
