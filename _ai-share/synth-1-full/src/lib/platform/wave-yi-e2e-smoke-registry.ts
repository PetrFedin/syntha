/**
 * Wave YI — E2E smoke registry: meta spec core-224 + batch verify for core-156…223.
 * SoT for playwright.core.config.ts coverage (unit test) and API smoke probes (e2e).
 */
import { BRAND_COLLECTION_INVENTORY_OVERLAY_API } from '@/lib/platform/wave-yb-brand-inventory-overlay-pg';
import { BRAND_SKU_WIZARD_DRAFT_API } from '@/lib/platform/wave-yd-brand-sku-wizard-draft-pg';
import { WAVE_YH_SHOP_CHECKOUT_STOCK_ATP_API } from '@/lib/platform/wave-yh-wms-reserve-checkout';
import { BRAND_RETAILERS_B2B_ORDERS_SUMMARY_API_PATH } from '@/lib/b2b/brand-co-wave-yg';

/** Inclusive wave batch: core-156 … core-223 (core-224 is this meta registry spec). */
export const WAVE_YI_CORE_E2E_MIN_SPEC_NUMBER = 156;
export const WAVE_YI_CORE_E2E_MAX_SPEC_NUMBER = 223;

/** Registered wave e2e specs in the YI batch window (68 files, core-156…223). */
export const WAVE_YI_CORE_E2E_SMOKE_REGISTRY_SPECS = [
  'core-156-wave-vl-mfr-dev-dam.spec.ts',
  'core-157-wave-vm-release-gate-e2e.spec.ts',
  'core-158-wave-vn-greenfield-shop2.spec.ts',
  'core-159-wave-vo-sup-logistics.spec.ts',
  'core-160-wave-vq-brand-op.spec.ts',
  'core-161-wave-vr-brand-co-otb.spec.ts',
  'core-162-wave-vs-mfr-empty-pillars.spec.ts',
  'core-163-wave-vz-audit-closure.spec.ts',
  'core-164-wave-wa-matrix-qty-carry.spec.ts',
  'core-165-wave-wb-brand-bom-alt.spec.ts',
  'core-166-wave-wc-pctask-deeplinks.spec.ts',
  'core-167-wave-wd-syndication.spec.ts',
  'core-168-wave-we-investor.spec.ts',
  'core-169-wave-wf-thread-templates.spec.ts',
  'core-170-wave-wg-replenishment.spec.ts',
  'core-171-wave-wh-size-run.spec.ts',
  'core-172-wave-wi-partial-ship.spec.ts',
  'core-173-wave-wj-gantt-wip.spec.ts',
  'core-174-wave-wk-material-catalog.spec.ts',
  'core-175-wave-wl-brand-amend.spec.ts',
  'core-176-wave-wm-collaborative.spec.ts',
  'core-177-wave-wn-tier-sync.spec.ts',
  'core-178-wave-wo-wip-tablet.spec.ts',
  'core-179-wave-wp-bom-po.spec.ts',
  'core-180-wave-wq-release-gate.spec.ts',
  'core-181-wave-wr-s1-ls-purge.spec.ts',
  'core-182-wave-ws-rep-payout.spec.ts',
  'core-183-wave-wt-w2-sse.spec.ts',
  'core-184-wave-wu-material-request.spec.ts',
  'core-185-wave-wv-dev-bridge.spec.ts',
  'core-186-wave-ww-sup-empty.spec.ts',
  'core-187-wave-wx-commission.spec.ts',
  'core-188-wave-wy-mfr-comms.spec.ts',
  'core-189-wave-wz-ru-dedup.spec.ts',
  'core-190-wave-xa-partners-invite.spec.ts',
  'core-191-wave-xb-crm-segments.spec.ts',
  'core-192-wave-xc-sample-patch.spec.ts',
  'core-193-wave-xd-rfq-sla.spec.ts',
  'core-194-wave-xe-s1-sweep.spec.ts',
  'core-195-wave-xf-tasks-kanban.spec.ts',
  'core-196-wave-xg-range-planner.spec.ts',
  'core-197-wave-xh-showroom-logo.spec.ts',
  'core-198-wave-xi-prod-ops.spec.ts',
  'core-199-wave-xj-stage-modules.spec.ts',
  'core-200-wave-xk-accept-invite.spec.ts',
  'core-201-wave-xl-working-order.spec.ts',
  'core-202-wave-xm-supplier-link.spec.ts',
  'core-203-wave-xn-dossier-comments.spec.ts',
  'core-204-wave-xo-unread.spec.ts',
  'core-205-wave-xp-audit-8.spec.ts',
  'core-206-wave-xq-dossier-core.spec.ts',
  'core-207-wave-xr-process-runtime.spec.ts',
  'core-208-wave-xs-readpath.spec.ts',
  'core-209-wave-xt-matrix-autosave.spec.ts',
  'core-210-wave-xu-tz-print.spec.ts',
  'core-211-wave-xv-otb-sync.spec.ts',
  'core-212-wave-xw-alt-material.spec.ts',
  'core-213-wave-xx-greenfield.spec.ts',
  'core-214-wave-xy-tracking-embed.spec.ts',
  'core-215-wave-xz-templates.spec.ts',
  'core-216-wave-ya-mfr-dossier.spec.ts',
  'core-217-wave-yb-inventory-overlay.spec.ts',
  'core-218-wave-yc-subcontractor.spec.ts',
  'core-219-wave-yd-sku-wizard.spec.ts',
  'core-220-wave-ye-audit-final.spec.ts',
  'core-221-wave-yf-compact.spec.ts',
  'core-222-wave-yg-partner-count.spec.ts',
  'core-223-wave-yh-wms-reserve.spec.ts',
] as const;

export const WAVE_YI_META_E2E_SPEC = 'core-224-wave-yi-e2e-smoke-registry.spec.ts' as const;

export type WaveYiE2eSmokeApiProbe = {
  wave: string;
  path: string;
  /** Max HTTP status (inclusive). Default 499 (no 5xx). */
  maxStatus?: number;
};

/** Sample GET health + wave API probes (YA–YH + platform spine). */
export const WAVE_YI_E2E_SMOKE_API_PROBES: readonly WaveYiE2eSmokeApiProbe[] = [
  { wave: 'spine', path: '/api/workshop2/platform-core/health' },
  { wave: 'YE', path: '/api/dev/platform-core/planner?collection=SS27', maxStatus: 404 },
  { wave: 'YB', path: `${BRAND_COLLECTION_INVENTORY_OVERLAY_API}?collectionId=SS27` },
  { wave: 'YD', path: `${BRAND_SKU_WIZARD_DRAFT_API}/SS27` },
  { wave: 'YG', path: `${BRAND_RETAILERS_B2B_ORDERS_SUMMARY_API_PATH}?collectionId=SS27` },
  { wave: 'YH', path: `${WAVE_YH_SHOP_CHECKOUT_STOCK_ATP_API}?collection=SS27&limit=12` },
  { wave: 'comms', path: '/api/platform-core/comms/notification-prefs?role=shop' },
  { wave: 'XT', path: '/api/shop/b2b/matrix/draft', maxStatus: 403 },
];

export function waveYiCoreE2eSmokeRegistryGlob(specBasename: string): string {
  return `**/${specBasename}`;
}
