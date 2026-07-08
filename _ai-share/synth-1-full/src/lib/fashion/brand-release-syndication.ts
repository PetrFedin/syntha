import type { Product } from '@/lib/types';
import { assessLaunchReadiness } from '@/lib/fashion/launch-readiness';
import { assessProductAttributeHealth } from '@/lib/fashion/attribute-health';

export type BrandReleaseSyndicationChannel = 'b2b_linesheet' | 'showroom' | 'wholesale_matrix';

export type BrandReleaseSyndicationTechPackGate = {
  ready: boolean;
  sheetsReady: number;
  sheetsTotal: number;
  qtyBridged: boolean;
};

export type BrandReleaseSyndicationRow = {
  sku: string;
  slug: string;
  name: string;
  launchPercent: number;
  attributePercent: number;
  channels: BrandReleaseSyndicationChannel[];
  ready: boolean;
  techPackReady: boolean | null;
  techPackSheetsReady: number | null;
  techPackSheetsTotal: number | null;
  techPackQtyBridged: boolean | null;
};

const DEFAULT_CHANNELS: BrandReleaseSyndicationChannel[] = [
  'b2b_linesheet',
  'showroom',
  'wholesale_matrix',
];

export function buildBrandReleaseSyndicationRows(
  products: Product[],
  options?: {
    techPackBySku?: ReadonlyMap<string, BrandReleaseSyndicationTechPackGate>;
  }
): BrandReleaseSyndicationRow[] {
  return products.map((product) => {
    const launchPercent = assessLaunchReadiness(product).percent;
    const attributePercent = assessProductAttributeHealth(product).completeness;
    const techPack = options?.techPackBySku?.get(product.sku) ?? null;
    const techPackReady = techPack?.ready ?? null;
    const launchAttrsOk = launchPercent === 100 && attributePercent >= 85;
    const techPackOk = techPackReady === null || techPackReady === true;
    const ready = launchAttrsOk && techPackOk;
    return {
      sku: product.sku,
      slug: product.slug,
      name: product.name,
      launchPercent,
      attributePercent,
      channels: ready ? DEFAULT_CHANNELS : ['b2b_linesheet'],
      ready,
      techPackReady,
      techPackSheetsReady: techPack?.sheetsReady ?? null,
      techPackSheetsTotal: techPack?.sheetsTotal ?? null,
      techPackQtyBridged: techPack?.qtyBridged ?? null,
    };
  });
}

export function techPackGateMapFromReleaseRows(
  rows: readonly {
    sku: string;
    ready: boolean;
    sheetsReady: number;
    sheetsTotal: number;
    qtyBridged: boolean;
  }[]
): Map<string, BrandReleaseSyndicationTechPackGate> {
  return new Map(
    rows.map((r) => [
      r.sku,
      {
        ready: r.ready,
        sheetsReady: r.sheetsReady,
        sheetsTotal: r.sheetsTotal,
        qtyBridged: r.qtyBridged,
      },
    ])
  );
}

export function summarizeBrandReleaseSyndication(rows: BrandReleaseSyndicationRow[]): {
  total: number;
  ready: number;
  pending: number;
} {
  const readyRows = rows.filter((r) => r.ready);
  return {
    total: rows.length,
    ready: readyRows.length,
    pending: rows.length - readyRows.length,
  };
}

export function brandReleaseSyndicationToCsv(rows: readonly BrandReleaseSyndicationRow[]): string {
  const header = [
    'sku',
    'slug',
    'launchPercent',
    'attributePercent',
    'techPackReady',
    'techPackSheets',
    'ready',
    'channels',
  ];
  const lines = rows.map((r) =>
    [
      r.sku,
      r.slug,
      String(r.launchPercent),
      String(r.attributePercent),
      r.techPackReady === null ? '' : r.techPackReady ? '1' : '0',
      r.techPackSheetsReady === null
        ? ''
        : `${r.techPackSheetsReady}/${r.techPackSheetsTotal ?? 6}`,
      r.ready ? '1' : '0',
      `"${r.channels.join('|')}"`,
    ].join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

export function brandReleaseSyndicationChannelLabel(
  channel: BrandReleaseSyndicationChannel
): string {
  switch (channel) {
    case 'b2b_linesheet':
      return 'B2B linesheet';
    case 'showroom':
      return 'Showroom';
    case 'wholesale_matrix':
      return 'Wholesale matrix';
    default:
      return channel;
  }
}
