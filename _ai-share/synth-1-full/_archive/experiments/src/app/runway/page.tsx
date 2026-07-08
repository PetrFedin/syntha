import type { Metadata } from 'next';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Product } from '@/lib/types';
import { filterScrollVideoProducts } from '@/lib/product-scroll-switcher';
import { filterRunwayAvailableProducts } from '@/lib/runway/runway-brand-gate';
import {
  normalizeScrollExperienceConfig,
  SCROLL_EXPERIENCE_V3_DEFAULTS,
} from '@/lib/runway/scroll-experience-schema';
import { RunwayLandingGrid } from '@/components/runway/RunwayLandingGrid';

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://syntha.os';

function loadScrollVideoCatalog(): Product[] {
  try {
    const productsPath = join(process.cwd(), 'public/data/products.json');
    const products = JSON.parse(readFileSync(productsPath, 'utf8')) as Product[];
    const configPath = join(process.cwd(), 'public/data/scroll-experience.json');
    const rawConfig = JSON.parse(readFileSync(configPath, 'utf8'));
    const config = normalizeScrollExperienceConfig(rawConfig, SCROLL_EXPERIENCE_V3_DEFAULTS);
    return filterRunwayAvailableProducts(filterScrollVideoProducts(products), config);
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Product Scroll Switcher — Runway | Syntha',
  description:
    'Интерактивный scroll-video опыт на PDP: переключение цветовых секций, stories, complete the look и аналитика. Демо flagship и playlist всех runway SKU.',
  openGraph: {
    title: 'Product Scroll Switcher — Runway',
    description:
      'Публичная витрина scroll-video опыта Syntha: демо silk-midi-dress, playlist и каталог runway SKU.',
    url: `${SITE_ORIGIN}/runway`,
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_ORIGIN}/runway`,
  },
};

/** Публичная marketing/explainer страница Product Scroll Switcher. */
export default function RunwayLandingPage() {
  const products = loadScrollVideoCatalog();
  return <RunwayLandingGrid products={products} />;
}
