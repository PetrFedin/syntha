import type { Product, ProductScrollSwitcherSection, ScrollExperienceConfig } from '@/lib/types';
import { loadScrollExperienceConfig as loadScrollExperienceConfigFromService } from '@/lib/runway/RunwayExperienceService';
import {
  type ScrollVideoSources,
  resolveScrollVideoSourcesCore,
  resolveSectionVideoSourcesCore,
  resolveSectionVideoUrlRaw,
} from '@/lib/runway/scroll-video-sources';
import {
  resolveSectionImage,
  resolveSectionPosterUrl,
  resolveSectionThumbImage,
} from '@/lib/runway/scroll-section-media';

export type { ScrollVideoSources } from '@/lib/runway/scroll-video-sources';
export {
  resolveSectionImage,
  resolveSectionPosterUrl,
  resolveSectionThumbImage,
} from '@/lib/runway/scroll-section-media';

export {
  loadRunwayExperience,
  loadRunwayProduct,
  loadRunwayProducts,
  loadBrandRunwayCatalog,
  mergeProductWithOverrides,
  loadProductsCatalog,
  loadAllScrollVideoProducts,
} from '@/lib/runway/RunwayExperienceService';

export {
  DEFAULT_SCROLL_SWITCHER_COLORS,
  DEFAULT_SCROLL_SWITCHER_LABELS,
} from '@/lib/scroll-switcher-constants';

export {
  SCROLL_EXPERIENCE_DEFAULTS,
  productSupportsScrollVideo,
  productUsesPerSectionVideo,
  resolveScrollSwitcherSections,
  resolveColorForSection,
  resolveSectionIndexForColor,
  resolveSectionPrice,
  resolveAdjacentSectionImageUrls,
} from '@/lib/runway/runway-scroll-sections';

export type {
  RunwayStockStatus,
  RunwaySectionAvailability,
  RunwaySectionViewModel,
  RunwaySocialProofViewModel,
  RunwayAdjacentProducts,
  RunwayProductViewModel,
} from '@/lib/runway/runway-view-model';

export {
  resolveSectionStock,
  resolveSectionAvailability,
  buildRunwayProductViewModel,
  validateScrollVideoProduct,
  validateScrollVideoContent,
  resolveSectionLookItems,
  resolveAnalyticsSocialProof,
  productHasValidRunwaySections,
  resolveBrandScrollVideoProducts,
  resolveAdjacentBrandScrollVideoProducts,
} from '@/lib/runway/runway-view-model';

import {
  SCROLL_EXPERIENCE_DEFAULTS,
  productSupportsScrollVideo,
  resolveScrollSwitcherSections,
} from '@/lib/runway/runway-scroll-sections';

/** Базовый URL scroll-видео: scrollVideoUrl → videoUrls[0] (+ CDN prefix). */
export function resolveScrollVideoUrl(
  product: Product,
  config?: ScrollExperienceConfig
): string | undefined {
  const sources = resolveScrollVideoSources(product, config);
  return sources.mp4 ?? sources.webm;
}

/** Видео активной секции: sectionVideoUrl → product scrollVideoUrl (+ CDN prefix). */
export function resolveSectionVideoUrl(
  product: Product,
  section: ProductScrollSwitcherSection | undefined,
  index = 0,
  config?: ScrollExperienceConfig
): string | undefined {
  return resolveSectionVideoUrlRaw(product, section, config);
}

/** MP4/WebM/poster для секции (per-section clip или общий scrollVideoUrl). */
export function resolveSectionVideoSources(
  product: Product,
  section: ProductScrollSwitcherSection | undefined,
  index = 0,
  config?: ScrollExperienceConfig
): ScrollVideoSources {
  return resolveSectionVideoSourcesCore(
    product,
    section,
    index,
    config,
    resolveScrollSwitcherSections(product, config)[index]
  );
}

export function resolveScrollVideoSources(
  product: Product,
  config?: ScrollExperienceConfig
): ScrollVideoSources {
  const sections = resolveScrollSwitcherSections(product, config);
  return resolveScrollVideoSourcesCore(product, config, sections[0]);
}

/** Hero SKU из конфига (fallback — featuredProductSlug). */
export function resolveHeroProductSlugs(
  config: ScrollExperienceConfig = SCROLL_EXPERIENCE_DEFAULTS
): string[] {
  if (config.heroProductSlugs?.length) {
    return config.heroProductSlugs.slice(0, 10);
  }
  if (config.featuredProductSlug) {
    return [config.featuredProductSlug];
  }
  return [];
}

/** Товар в списке hero runway SKU. */
export function isHeroRunwayProduct(
  product: Product,
  config: ScrollExperienceConfig = SCROLL_EXPERIENCE_DEFAULTS
): boolean {
  const slugs = resolveHeroProductSlugs(config);
  if (slugs.length === 0) return productSupportsScrollVideo(product);
  return slugs.includes(product.slug) && productSupportsScrollVideo(product);
}

/** Фильтр каталога по hero SKU (playlist / featured). */
export function filterHeroScrollProducts(
  products: Product[],
  config: ScrollExperienceConfig = SCROLL_EXPERIENCE_DEFAULTS
): Product[] {
  const slugs = resolveHeroProductSlugs(config);
  const scrollVideo = products.filter(productSupportsScrollVideo);
  if (slugs.length === 0) return scrollVideo;
  const order = new Map(slugs.map((slug, index) => [slug, index]));
  return scrollVideo
    .filter((p) => order.has(p.slug))
    .sort((a, b) => order.get(a.slug)! - order.get(b.slug)!);
}

/** Товар для featured-блока на главной. */
export function resolveFeaturedScrollProduct(
  products: Product[],
  config: ScrollExperienceConfig = SCROLL_EXPERIENCE_DEFAULTS
): Product | undefined {
  const heroProducts = filterHeroScrollProducts(products, config);
  if (heroProducts.length > 0) return heroProducts[0];

  if (config.featuredProductSlug) {
    const bySlug = products.find(
      (product) =>
        product.slug === config.featuredProductSlug && productSupportsScrollVideo(product)
    );
    if (bySlug) return bySlug;
  }

  const flagged = products.find(
    (product) => product.featuredScrollExperience && productSupportsScrollVideo(product)
  );
  if (flagged) return flagged;

  return products.find(productSupportsScrollVideo);
}

/** Загрузка scroll-experience.json (клиент / SSR fetch) — v3 normalize. */
export async function loadScrollExperienceConfig(): Promise<ScrollExperienceConfig> {
  return loadScrollExperienceConfigFromService();
}

/** Featured scroll-товар для бренда (каталог / hero). */
export function resolveBrandFeaturedScrollProduct(
  products: Product[],
  brandName: string,
  config: ScrollExperienceConfig = SCROLL_EXPERIENCE_DEFAULTS
): Product | undefined {
  const slug = config.brandFeatured?.[brandName];
  if (slug) {
    const match = products.find((p) => p.slug === slug && productSupportsScrollVideo(p));
    if (match) return match;
  }

  return products.find((p) => p.brand === brandName && productSupportsScrollVideo(p));
}

/** Scroll-video товары из массива (каталог / админка). */
export function filterScrollVideoProducts(products: Product[]): Product[] {
  return products.filter(productSupportsScrollVideo);
}
