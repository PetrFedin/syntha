import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@/lib/routes';
function isPlatformCoreWorkshopWriteSession(url: NextRequest['nextUrl']): boolean {
  const pc = url.searchParams.get('pc');
  return pc === '1' || pc === 'true';
}

function isWorkshop2ArticlePath(path: string): boolean {
  return path === '/brand/production/workshop2' || path.startsWith('/brand/production/workshop2/');
}


import {
  buildWorkshop2LegacyArticleRedirectPath,
  parseWorkshop2LegacyArticlePath,
} from '@/lib/production/workshop2-legacy-article-url';
import { buildWorkshop2DevBypassRequestHeaders } from '@/lib/server/workshop2-dev-auth-bypass';
import {
  buildPlatformCoreStrictRedirectUrl,
  isPlatformCoreStrictPageAllowed,
} from '@/lib/platform-core-strict-routes';

/** Edge-safe env flags (не тянуть cabinet-core-mode → lib/routes в middleware). */
function middlewareEnvOn(raw: string | undefined): boolean {
  if (raw === undefined) return false;
  const t = String(raw).trim().toLowerCase();
  return t === '1' || t === 'true' || t === 'yes' || t === 'on';
}

function middlewarePlatformCoreMode(): boolean {
  return middlewareEnvOn(process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE);
}

function middlewarePlatformCoreStrict(): boolean {
  return middlewarePlatformCoreMode() && middlewareEnvOn(process.env.NEXT_PUBLIC_PLATFORM_CORE_STRICT);
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname.replace(/\/$/, '') || '/';
  const platformCoreMode = middlewarePlatformCoreMode();
  const platformCoreStrict = middlewarePlatformCoreStrict();
  const isPageNav = req.method === 'GET' || req.method === 'HEAD';

  if (platformCoreMode && isPageNav && path === '/') {
    const next = url.clone();
    next.pathname = '/platform';
    next.search = '';
    return NextResponse.redirect(next);
  }

  if (platformCoreMode && isPageNav && path === '/platform/planner') {
    const next = url.clone();
    next.pathname = '/platform';
    next.search = '';
    return NextResponse.redirect(next);
  }

  if (platformCoreMode && isPageNav && path === '/brand/b2b-orders') {
    const next = url.clone();
    next.pathname = '/brand/core';
    next.search = '?pillar=collection_order';
    const col = url.searchParams.get('collection')?.trim();
    if (col && col !== 'SS27') {
      next.search = `?pillar=collection_order&collection=${encodeURIComponent(col)}`;
    }
    return NextResponse.redirect(next);
  }

  if (platformCoreStrict && isPageNav && !path.startsWith('/api/')) {
    const workshopWrite = isWorkshop2ArticlePath(path) && isPlatformCoreWorkshopWriteSession(url);
    if (!workshopWrite && !isPlatformCoreStrictPageAllowed(path)) {
      const next = url.clone();
      next.pathname = '/platform';
      next.search = '';
      const redirectTarget = buildPlatformCoreStrictRedirectUrl(path);
      const redirectUrl = new URL(redirectTarget, url.origin);
      next.search = redirectUrl.search;
      return NextResponse.redirect(next);
    }
  }

  if (
    (path === '/brand/production/workshop2' || path.startsWith('/brand/production/workshop2/')) &&
    !isPlatformCoreWorkshopWriteSession(url)
  ) {
    const col = url.searchParams.get('w2col') ?? url.searchParams.get('collection');
    const article = url.searchParams.get('article');
    const next = url.clone();
    next.pathname = '/brand/core';
    next.search = '';
    next.searchParams.set('pillar', 'development');
    if (col?.trim()) next.searchParams.set('collection', col.trim());
    if (article?.trim()) next.searchParams.set('article', article.trim());
    const create = url.searchParams.get('w2create') ?? url.searchParams.get('create');
    if (create === '1') next.searchParams.set('create', '1');
    return NextResponse.redirect(next);
  }

  /** Workshop2: legacy `/workshop2/{collection}/{article}` → canonical `/c/.../a/...`. */
  const legacyArticle = parseWorkshop2LegacyArticlePath(path);
  if (legacyArticle) {
    const next = url.clone();
    next.pathname = buildWorkshop2LegacyArticleRedirectPath(legacyArticle, url.search);
    return NextResponse.redirect(next);
  }

  /** Workshop2: dev-only actor headers for `/api/workshop2/*` smoke (never production). */
  if (path.startsWith('/api/workshop2')) {
    const bypassHeaders = buildWorkshop2DevBypassRequestHeaders(req);
    if (bypassHeaders) {
      return NextResponse.next({ request: { headers: bypassHeaders } });
    }
  }

  if (path === ROUTES.factory.home && url.searchParams.get('role') === 'supplier') {
    const next = url.clone();
    next.pathname = ROUTES.factory.supplier;
    next.searchParams.delete('role');
    return NextResponse.redirect(next);
  }

  if (path === '/supplier' || path.startsWith('/supplier/')) {
    const next = url.clone();
    next.pathname = path.replace(/^\/supplier/, ROUTES.factory.supplier) || ROUTES.factory.supplier;
    return NextResponse.redirect(next);
  }

  if (path === '/u') {
    const next = url.clone();
    next.pathname = '/client/me';
    return NextResponse.redirect(next);
  }
  if (path.startsWith('/u/')) {
    const next = url.clone();
    next.pathname = '/client' + path.slice(2);
    return NextResponse.redirect(next);
  }

  /** Wave 53: B2B cart/orders API — no-store (см. .planning/workshop2-cdn-routing.md). */
  if (
    path.startsWith('/api/shop/b2b/cart') ||
    path.startsWith('/api/shop/b2b/orders')
  ) {
    const res = NextResponse.next();
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
