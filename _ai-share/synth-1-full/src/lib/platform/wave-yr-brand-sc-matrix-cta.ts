/**
 * Wave YR — brand SC 1.2: one-click shop matrix prefill + mini-matrix CTA dedup (UE/VC patterns).
 */
import {
  BRAND_SC_CROSS_MATRIX_MINI_MATRIX_LABEL_RU,
  BRAND_SC_CROSS_MATRIX_OPEN_SHOP_BTN_RU,
} from '@/lib/b2b/brand-sc-cross-matrix';
import { WAVE_YT_HUB_READPATH_OWNER_TESTID } from '@/lib/platform/wave-yt-hub-noise-pass2';

export const WAVE_YR_E2E_SPEC = 'core-233-wave-yr-matrix-cta.spec.ts' as const;

export const WAVE_YR_BRAND_SC_MINI_MATRIX_STRIP_TESTID = WAVE_YT_HUB_READPATH_OWNER_TESTID;
export const WAVE_YR_BRAND_SC_MINI_MATRIX_LINK_TESTID = 'brand-sc-mini-matrix-link';
export const WAVE_YR_BRAND_SC_MINI_MATRIX_HINT_TESTID = 'brand-sc-mini-matrix-qty-hint';
export const WAVE_YR_BRAND_SC_OPEN_SHOP_STRIP_TESTID = 'brand-sc-cross-matrix-open-shop-strip';
export const WAVE_YR_BRAND_SC_OPEN_SHOP_BTN_TESTID = 'brand-sc-cross-matrix-open-shop-btn';
export const WAVE_YR_BRAND_SC_OPEN_SHOP_PREFILL_HINT_TESTID = 'brand-sc-cross-matrix-prefill-hint';

export const WAVE_YR_BRAND_SC_MATRIX_ONE_CLICK_ARIA_SUFFIX_RU =
  'SKU лайншита подставятся в матрицу магазина';

/** Accessible one-click label for cabinet mini-matrix + workspace open-shop CTA. */
export function brandScCrossMatrixOneClickAriaLabelRu(
  articleCount: number,
  variant: 'mini-matrix' | 'open-shop' = 'mini-matrix'
): string {
  const lead =
    variant === 'open-shop'
      ? BRAND_SC_CROSS_MATRIX_OPEN_SHOP_BTN_RU
      : BRAND_SC_CROSS_MATRIX_MINI_MATRIX_LABEL_RU;
  if (articleCount <= 0) {
    return `${lead} — опубликуйте артикулы для prefill SKU`;
  }
  return `${lead} · ${articleCount} SKU · ${WAVE_YR_BRAND_SC_MATRIX_ONE_CLICK_ARIA_SUFFIX_RU}`;
}

/** Surfaces where plain matrix links are omitted when a prefill CTA is primary. */
export const WAVE_YR_BRAND_SC_MATRIX_DEDUP_FIXES = [
  {
    id: 'cabinet-golden-path-omit-plain-matrix',
    role: 'brand' as const,
    pillar: 'sample_collection' as const,
    surface: 'cabinet',
    was: 'Golden path «Матрица» дублировала mini-matrix prefill CTA (wave UE)',
    primaryTestids: [WAVE_YR_BRAND_SC_MINI_MATRIX_LINK_TESTID],
    sourceFile: 'components/brand/sample/BrandScCabinetGoldenPathStrip.tsx',
    sourceMustContain: ['omitMatrixPrefillCta'],
    sourceMustNotContain: [] as string[],
  },
  {
    id: 'cabinet-mini-matrix-one-click',
    role: 'brand' as const,
    pillar: 'sample_collection' as const,
    surface: 'cabinet',
    was: 'Mini-matrix без aria-label / wave VC readpath owner',
    primaryTestids: [
      WAVE_YR_BRAND_SC_MINI_MATRIX_STRIP_TESTID,
      WAVE_YR_BRAND_SC_MINI_MATRIX_HINT_TESTID,
    ],
    sourceFile: 'components/platform/BrandScCabinetMiniMatrixStrip.tsx',
    sourceMustContain: [
      'brandScCrossMatrixOneClickAriaLabelRu',
      'WAVE_YT_HUB_READPATH_OWNER_TESTID',
    ],
    sourceMustNotContain: [] as string[],
  },
  {
    id: 'linesheets-peer-omit-plain-matrix',
    role: 'brand' as const,
    pillar: 'sample_collection' as const,
    surface: 'linesheets',
    was: 'Peer strip «Матрица магазина» дублировала open-shop prefill strip (wave UE)',
    primaryTestids: [WAVE_YR_BRAND_SC_OPEN_SHOP_BTN_TESTID],
    sourceFile: 'components/platform/BrandScLinesheetsRetailPeerStrip.tsx',
    sourceMustContain: ['omitMatrixPrefillCta'],
    sourceMustNotContain: [] as string[],
  },
  {
    id: 'showroom-peer-omit-plain-matrix',
    role: 'brand' as const,
    pillar: 'sample_collection' as const,
    surface: 'showroom',
    was: 'Showroom peer matrix дублировала open-shop btn-only prefill (wave VC)',
    primaryTestids: [WAVE_YR_BRAND_SC_OPEN_SHOP_BTN_TESTID],
    sourceFile: 'components/platform/BrandScShowroomRetailPeerStrip.tsx',
    sourceMustContain: ['omitMatrixPrefillCta'],
    sourceMustNotContain: [] as string[],
  },
  {
    id: 'open-shop-strip-aria-polish',
    role: 'brand' as const,
    pillar: 'sample_collection' as const,
    surface: 'workspace',
    was: 'Open-shop CTA без единого aria-label контракта',
    primaryTestids: [
      WAVE_YR_BRAND_SC_OPEN_SHOP_BTN_TESTID,
      WAVE_YR_BRAND_SC_OPEN_SHOP_PREFILL_HINT_TESTID,
    ],
    sourceFile: 'components/platform/BrandScCrossMatrixOpenShopStrip.tsx',
    sourceMustContain: ['brandScCrossMatrixOneClickAriaLabelRu'],
    sourceMustNotContain: [] as string[],
  },
] as const;
