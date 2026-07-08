import type { Product, ProductScrollSwitcherSection, ScrollExperienceConfig } from '@/lib/types';
import { safeResolveVideoCdnUrl } from '@/lib/runway/runway-media-fallback';
import { resolveVideoCdnOptions } from '@/lib/runway/runway-video-cdn';
import { resolveSectionPosterUrl } from '@/lib/runway/scroll-section-media';

export interface ScrollVideoSources {
  /** H.264 MP4 — приоритет для Safari и iOS. */
  mp4?: string;
  /** WebM VP9 — fallback для Chrome/Firefox. */
  webm?: string;
  /** Poster из первой секции / hero-изображения. */
  poster?: string;
}

function pairScrollVideoSources(resolved: string, poster?: string): ScrollVideoSources {
  if (resolved.endsWith('.mp4')) {
    return { mp4: resolved, webm: resolved.replace(/\.mp4$/i, '.webm'), poster };
  }
  if (resolved.endsWith('.webm')) {
    return { webm: resolved, mp4: resolved.replace(/\.webm$/i, '.mp4'), poster };
  }
  return { mp4: resolved, poster };
}

/** MP4/WebM/poster из резолвленного CDN URL. */
export function buildScrollVideoSources(resolved: string, poster?: string): ScrollVideoSources {
  return pairScrollVideoSources(resolved, poster);
}

/** Видео активной секции: sectionVideoUrl → product scrollVideoUrl (+ CDN prefix). */
export function resolveSectionVideoUrlRaw(
  product: Product,
  section: ProductScrollSwitcherSection | undefined,
  config?: ScrollExperienceConfig
): string | undefined {
  const raw = section?.sectionVideoUrl ?? product.scrollVideoUrl ?? product.videoUrls?.[0]?.url;
  return safeResolveVideoCdnUrl(raw, resolveVideoCdnOptions(config, product.brand));
}

/** MP4/WebM/poster для секции (per-section clip или общий scrollVideoUrl). */
export function resolveSectionVideoSourcesCore(
  product: Product,
  section: ProductScrollSwitcherSection | undefined,
  index: number,
  config: ScrollExperienceConfig | undefined,
  fallbackSection?: ProductScrollSwitcherSection
): ScrollVideoSources {
  const raw = section?.sectionVideoUrl ?? product.scrollVideoUrl ?? product.videoUrls?.[0]?.url;
  if (!raw) return {};

  const cdnOpts = resolveVideoCdnOptions(config, product.brand);
  const resolved = safeResolveVideoCdnUrl(raw, cdnOpts);
  if (!resolved) return {};

  const posterSection = section ?? fallbackSection;
  const poster = posterSection ? resolveSectionPosterUrl(product, posterSection, index) : undefined;

  return pairScrollVideoSources(resolved, poster);
}

/** Источники scroll-видео товара с poster первой секции. */
export function resolveScrollVideoSourcesCore(
  product: Product,
  config: ScrollExperienceConfig | undefined,
  firstSection?: ProductScrollSwitcherSection
): ScrollVideoSources {
  const raw = product.scrollVideoUrl ?? product.videoUrls?.[0]?.url;
  if (!raw) return {};

  const cdnOpts = resolveVideoCdnOptions(config, product.brand);
  const resolved = safeResolveVideoCdnUrl(raw, cdnOpts);
  if (!resolved) return {};

  const poster = firstSection ? resolveSectionPosterUrl(product, firstSection, 0) : undefined;
  return pairScrollVideoSources(resolved, poster);
}
