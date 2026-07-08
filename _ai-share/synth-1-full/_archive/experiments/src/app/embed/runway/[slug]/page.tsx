'use client';

import { use, useEffect, useRef, useState } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductScrollSwitcher } from '@/components/product/ProductScrollSwitcher';
import { ScrollSwitcherErrorBoundary } from '@/components/product/scroll-switcher/ScrollSwitcherErrorBoundary';
import { productSupportsScrollVideo } from '@/lib/product-scroll-switcher';
import { loadRunwayProduct } from '@/lib/runway/fetch-runway-product';
import { isProductRunwayAvailable } from '@/lib/runway/runway-brand-gate';
import { loadScrollExperienceConfig } from '@/lib/product-scroll-switcher';
import { useUIState } from '@/providers/ui-state';
import { t } from '@/lib/runway/runway-i18n';
import {
  parseRunwayEmbedAspectRatio,
  parseRunwayEmbedSectionIndex,
  resolveRunwayEmbedCompact,
  useRunwayEmbedBridge,
} from '@/hooks/useRunwayEmbedBridge';
import type { Product } from '@/lib/types';

/**
 * /embed/runway/[slug] — минимальный chrome для iframe (partners / decks).
 * postMessage: data-runway-embed-ready, опционально runway-embed-resize (?resize=1).
 */
export default function EmbedRunwayPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = use(paramsPromise);
  const searchParams = useSearchParams();
  const shellRef = useRef<HTMLElement>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenDenied, setTokenDenied] = useState(false);
  const [stageReady, setStageReady] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const { addCartItem, openCart } = useUIState();

  const aspectRatio = parseRunwayEmbedAspectRatio(searchParams.get('aspect'));
  const resizeEnabled = searchParams.get('resize') === '1';
  const embedCompact = resolveRunwayEmbedCompact(searchParams.get('compact'));

  useRunwayEmbedBridge({
    slug: params.slug,
    ready: !loading && !tokenDenied && Boolean(product) && stageReady,
    resizeEnabled,
    activeSection,
    measureRef: shellRef,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const embedToken = process.env.NEXT_PUBLIC_RUNWAY_EMBED_TOKEN?.trim();
        const requestToken = searchParams.get('token');
        if (embedToken && requestToken !== embedToken) {
          if (!cancelled) {
            setTokenDenied(true);
            setLoading(false);
          }
          return;
        }

        const found = await loadRunwayProduct(params.slug);
        const config = await loadScrollExperienceConfig().catch(() => undefined);
        if (!cancelled) {
          if (found && config && !isProductRunwayAvailable(found, config)) {
            setProduct(null);
          } else {
            setProduct(found);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [params.slug, searchParams]);

  useEffect(() => {
    if (loading || tokenDenied || !product) {
      setStageReady(false);
      return;
    }

    const checkReady = () => {
      const stage = document.querySelector('[data-runway-stage][data-runway-ready="true"]');
      setStageReady(Boolean(stage));
    };

    checkReady();
    const observer = new MutationObserver(checkReady);
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-runway-ready'],
    });
    return () => observer.disconnect();
  }, [loading, tokenDenied, product]);

  /** Deep link ?section=N для embed (syncUrl=false на switcher). */
  useEffect(() => {
    if (!product) return;
    const sectionCount = product.scrollSwitcherSections?.length ?? 0;
    const fromUrl = parseRunwayEmbedSectionIndex(searchParams.get('section'), sectionCount);
    if (fromUrl != null) setActiveSection(fromUrl);
  }, [product, searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-sm text-muted-foreground">
        {t('runway.playlistLoading')}
      </div>
    );
  }

  if (tokenDenied) {
    return (
      <div
        className="flex min-h-[320px] items-center justify-center p-6 text-center text-sm text-muted-foreground"
        data-runway-embed-token-denied
      >
        {t('runway.embedTokenDenied')}
      </div>
    );
  }

  if (!product || !productSupportsScrollVideo(product)) {
    notFound();
  }

  const sizes = product.sizes?.map((s) => s.name) ?? [];
  const defaultSize = sizes[0] ?? 'One Size';

  return (
    <main
      ref={shellRef}
      className="runway-embed-shell relative mx-auto flex w-full max-w-lg flex-col bg-white p-2"
      style={{ aspectRatio, minHeight: 'min(100vw, 480px)' }}
      data-runway-embed
    >
      <div className="pointer-events-auto absolute right-3 top-3 z-30">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="min-h-[44px] bg-background/90 backdrop-blur-sm"
          onClick={() => openCart()}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {t('runway.embedCart')}
        </Button>
      </div>
      <ScrollSwitcherErrorBoundary
        productSlug={params.slug}
        fallback={
          <p className="p-8 text-center text-sm text-muted-foreground">{t('runway.loadFailed')}</p>
        }
      >
        <ProductScrollSwitcher
          product={product}
          controlledSectionIndex={activeSection}
          onAddToCart={() => {
            addCartItem(product, defaultSize, 1);
            openCart();
          }}
          requiresSize={sizes.length > 0}
          selectedSize={defaultSize}
          availableSizes={sizes}
          syncUrl={false}
          analyticsSurface="embed"
          surface="embed"
          compact={embedCompact}
          showWishlist={false}
          showShare={false}
          onSectionChange={(index) => setActiveSection(index)}
          className="min-h-0 w-full flex-1"
        />
      </ScrollSwitcherErrorBoundary>
    </main>
  );
}
