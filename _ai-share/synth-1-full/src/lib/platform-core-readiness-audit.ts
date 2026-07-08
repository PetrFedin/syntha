import type { CoreChainRoleId, CoreHubPillarId } from '@/lib/platform-core-hub-matrix';
import {
  PLATFORM_CORE_PILLARS,
  getPlatformCoreDemo,
  getPlatformCoreHubRowsForUi,
  getRolePillarWorkspaceHref,
  platformCoreRolePillarHref,
} from '@/lib/platform-core-hub-matrix';
import {
  averageSectionScores,
  buildEmptySectionSubItems,
  buildSectionSubItems,
  SECTION_AUDIT,
} from '@/lib/platform-core-readiness-sections';
import { isEmptyCellInsightVisibleInHubAudit } from '@/lib/platform-core-empty-cell-registry';

export {
  SECTION_AUDIT,
  EMPTY_SECTION_AUDIT,
  averageSectionScores,
  buildSectionSubItems,
  buildEmptySectionSubItems,
  getExpectedSectionCount,
  getExpectedEmptySectionCount,
} from '@/lib/platform-core-readiness-sections';

export type ReadinessSubItem = {
  id: string;
  label: string;
  order: number;
  staticScore: number;
  liveScore: number;
  href: string;
  /** Краткий аудит раздела: функционал, связи, инвест-привлекательность. */
  summary: string;
  good: string[];
  bad: string[];
  fix: string[];
  /** Осознанные read-only ограничения — ADR backlog, не audit bad. */
  adrBacklog?: readonly string[];
};

export type ReadinessCell = {
  roleId: CoreChainRoleId;
  pillarId: CoreHubPillarId;
  active: boolean;
  emptyReason?: string;
  staticScore: number | null;
  liveScore: number | null;
  summary: string;
  good: string[];
  bad: string[];
  fix: string[];
  cabinetHref: string;
  workspaceHref: string;
  subItems: ReadinessSubItem[];
};

const ROLE_LABELS: Record<CoreChainRoleId, string> = {
  brand: 'Бренд',
  shop: 'Магазин',
  manufacturer: 'Производство',
  supplier: 'Поставщик',
};

type CellAuditEntry = Omit<
  ReadinessCell,
  'roleId' | 'pillarId' | 'cabinetHref' | 'workspaceHref' | 'subItems' | 'active' | 'emptyReason'
>;

/**
 * Ручной честный аудит готовности (не телеметрия).
 * Оценки по коду, E2E и UX — не авто-метрики и не wave-скоры.
 * Оценки только у active (8 ячеек baseline brand+shop; 14 при extended roles); неактивные — «—».
 * Ср. активных ~7.1 static / ~7.2 live (перекалибровка 2026-06-18: section good/bad/fix, без wave-cap 8.5).
 */
const CELL_AUDIT: Partial<
  Record<CoreChainRoleId, Partial<Record<CoreHubPillarId, CellAuditEntry>>>
> = {
  brand: {
    development: {
      staticScore: 7.1,
      liveScore: 7.2,
      summary:
        'W2 dossier · ТЗ · sample peer (W2/dossier цеха, не factory queue) · nav core с SS27.',
      good: [
        'Hub read-from-PG + auto-hydrate SS27/FW27',
        'Dossier hydrate/persist API-first в Platform Core golden',
        'Состав golden-коллекций не пишется в localStorage (PG-authoritative)',
        'Range Planner metadata SS27/FW27 + PG fallback',
        'FW27 dataSource pg при core:bootstrap (e2e core-06)',
        'FW27 tier core/trend/novelty по categoryLeafId (e2e core-06)',
        'UI dossier round-trip: general, BOM, construction, composition 1–4, fiber (e2e core-02)',
        'UI create article → router.push(newArticleId)',
        'Ссылка бренд W2 → досье цеха (platform-core-workspace-peer)',
        'SS27 range planner pg-badge (e2e core-02)',
        'Честные бейджи pg/partial на range-planner-core',
        'Без dual-source баннеров в core mode',
        'core-52 TZ export + composition label e2e',
        'core-53 PATCH margin core/trend/novelty + tier assign API',
        'core-53 investor-readiness + investor-brief page e2e',
        'core-53 investor brief PDF export (brief.pdf API)',
        'brand sample peer href — без dead-end factory #sample-queue (P0)',
        'Nav augment: w2col/range/linesheets/showroom + descriptions',
        'BrandDevMerchCoSpinePeerStrip + BrandDevDossierCoPeerStrip (wave BW)',
        'W2 hub sample status SSE (`brand-w2-sample-status-sse-*`, development-status-stream bump)',
        'Wave VP: S1 LS final sweep fail-closed (`shouldUseLocalStorageClientFallbackInCore`, wave-vp-s1-final-sweep.test.ts)',
        'Wave XF: brand tasks kanban ↔ calendar + greenfield PG (`brand-dev-w2-hub-tasks-kanban-strip`, core-195)',
        'Wave XG: range planner bulk tier POST wave=xg (`/api/workshop2/range-planner/bulk-tier-assign`, core-196)',
        'Wave XE: S1 LS final sweep BFF storageMode pg (core-194)',
        'Wave XQ: phase1-dossier PG-only offline dual-write OFF + diff↔attach TZ (core-206)',
        'Wave XR: LIVE process runtime GET/PUT PG storageMode (core-207)',
        'Wave XS: W2 hub readPath banner fail-closed when PG down (core-208)',
      ],
      bad: [],
      fix: [],
    },
    sample_collection: {
      staticScore: 7,
      liveScore: 7.1,
      summary: 'Лайншиты SS27/FW27 → publish → витрина → shop matrix.',
      good: [
        'Linesheets core + PDF из PG',
        'brand-linesheet-to-shop-matrix CTA',
        'brand-pillar-to-shop-matrix в кабинете',
        'brand-sample-collection-mini-matrix в кабинете',
        'E2E linesheets → matrix (core-02)',
        'Showroom PG + legacy tab guard',
        'core-38/52 mini matrix + checkout deep-link e2e',
        'Empty linesheet fallback copy (`brand-sc-linesheets-empty-copy`)',
        'Wave VC: PDF empty disabled/hint (`brand-sc-linesheet-pdf-empty-*`, wave VH closed)',
      ],
      bad: [],
      fix: [],
    },
    collection_order: {
      staticScore: 7.1,
      liveScore: 7.2,
      summary: 'Реестр B2B PG; confirm → handoff; retailers; CollectionOrderPillarCard + SSE/poll.',
      good: [
        'isPlatformCorePgB2bOrder gate',
        'POST confirm-order до handoff',
        'Amend approve/reject panel',
        'CollectionOrderPillarCard в brand cabinet',
        'Список из API + динамический фильтр коллекций',
        'Brand B2B legacy guard',
        'pre-orders isPlatformCoreMode guard + PG panel',
        'pre-orders скрыт в brand nav core',
        'Hub matrix без legacy pre-orders в golden CTA',
        'Wave XB: CRM linesheet visibility PG → shop showroom (core-191)',
        'Wave XV: OTB plan-sync × shop replenishment rules deduped (core-211)',
      ],
      bad: [],
      fix: [],
    },
    order_production: {
      staticScore: 7.1,
      liveScore: 7.2,
      summary: 'Подтверждение → цех; handoff queue; materials BOM; dossier lock после handoff.',
      good: [
        'confirm-order + confirm-production-handoff (два шага)',
        'chain-status',
        'OrderProductionPillarCard в brand cabinet',
        'Handoff strip + cross-role на order detail',
        'Hub action «Досье» → brand W2 (не factory dossier)',
        'Handoff retry UX (brand-b2b-handoff-retry)',
        'dossierVersionAtHandoff + dossierDiff в chain-status',
        'brand-order-w2-dossier-diff-* на order detail',
        'b2bEditLock на dossier GET/PUT после handoff',
        'tzWriteDisabled в W2 editor при b2bEditLock',
      ],
      bad: [],
      fix: [],
    },
    comms: {
      staticScore: 7.1,
      liveScore: 7.2,
      summary: 'Сообщения + календарь; contextual threads; poll/SSE без notification center.',
      good: [
        'slimCore brand messages',
        'hasCommunicationsUrlContext',
        'CommunicationsArtifactPolicyStrip off при URL',
        'BrandMessagesRuWorkspaceBanner off при URL',
        'Remount MessagesPage при смене ?collection=',
        'calendar-events API targetChatId (core-01)',
        'Shop calendar: клик B2B-события → messages (core-02)',
        'Brand calendar: превью события + кнопка «Чат» в EventDialog',
        'Production-context banner → W2 hrefs в core',
        'ContextualChatThread SSE live badge + poll fallback (contextual-chat-sse-live-badge)',
        'pcTask deep-link focus на brand calendar (wave BY)',
        'Wave XZ: B2B + entity message templates PG S1 final (core-215)',
      ],
      bad: [],
      fix: [],
    },
  },
  shop: {
    sample_collection: {
      staticScore: 7.1,
      liveScore: 7.2,
      summary: 'Витрина · коллекции брендов; flat nav без side-path; → matrix checkout.',
      good: [
        'Showroom published-articles',
        'PG partnerships API',
        'ShopShowroomMini в кабинете',
        'SHOWROOM_SHOP_LEAD без сторонних платформ',
        'Shop-specific empty state (не «кабинет бренда»)',
        'Hero preview из dossier',
        'shop-showroom-mini-partner-logo из PG',
        'core-06 SS27 hero + partners-link e2e',
        'core-38 EMPTY27 empty onboarding e2e',
        'core-52 eligible badge + matrix CTA on article card',
        'Wave VH: cover hero priority + partner logo source badges (`shop-sc-showroom-cover-hero-priority-strip`, `shop-sc-showroom-partner-logo-source-*`)',
        'Wave XA: partners invite PG + eligible-for-matrix (`core-190`, `shop-sc-partners-showroom-eligible-for-matrix-link`)',
        'Wave XH: partner logo + eligible filter polish (`core-197`, `shop-sc-showroom-eligible-filter-counts`)',
      ],
      bad: [],
      fix: [],
    },
    collection_order: {
      staticScore: 8.0,
      liveScore: 8.0,
      summary:
        'Matrix → checkout → replenishment → registry → tracking — unified CO golden path 8.0 (wave YV final).',
      good: [
        'CoreWholesaleMatrix без сторонних платформ в core',
        'Matrix W2 PG + e2e create order',
        'Checkout sync → B2B-{timestamp}',
        'Orders list + detail core',
        'Честный бейдж резерва на checkout',
        'withShopB2bCoreLegacyGuard на side-paths',
        'CollectionOrderPillarCard в shop cabinet со steps',
        'Amend card + structured amend API',
        'core-15 clean PG checkout без B2B-DEMO pin',
        'core-43 checkout B2B-\\d+ в JSON export',
        'core-33/52 PG-primary native + INT operational orders',
        'Seed B2B shop2 (`B2B-DEMO-SHOP2-SS27`, db:seed:workshop2-b2b-demo-order + PLATFORM_CORE_PINNED_B2B_ORDER_IDS)',
        'SSE bump при allocated/reserve (`patchWorkshop2B2bOrderStatus` + tracking chains poll)',
        'Shop peer picker checkout (`shop-co-checkout-buyer-picker`)',
        'Cart hydrate + debounced upsert (workshop2-cart-bridge, P0)',
        'ShopCoRegistryEmptyGreenfieldMonetizationStrip pricelist CTA (wave BY)',
        'Статус бренда в кабинете CO (`shop-co-cabinet-operational-status`, wave CA)',
        'Chain peek после confirm (`shop-co-cabinet-chain-peek`, wave CA)',
        'Wave VN: shop2 greenfield registry + BY pricelist (`shop-co-greenfield-registry-*`, core-158)',
        'Wave XX: full registry PG buyer + pricelist + matrix seed (`shop-co-registry-greenfield-onboarding-*`, core-213)',
        'Wave XT: matrix draft autosave conflict + validation RU + checkout cross-link (core-209)',
        'Wave XY: CO cabinet tracking embed — OP pillar redirect dedupe (core-214)',
        'Wave YK: unified CO golden path matrix→checkout→replenishment→registry→tracking (`shop-co-golden-path-strip`, core-226)',
        'Wave YK: checkout/registry/detail legacy strips deduped monetization peers (core-226)',
        'Wave YV: shop CO cell §6 final 8.0 — YK/XT/WM/XL/WG closures + golden path dedup (core-237)',
      ],
      bad: ['Резерв WMS — после handoff, не при checkout (честный copy)'],
      fix: [],
    },
    order_production: {
      staticScore: 6.8,
      liveScore: 7,
      summary: 'Трекинг read-only; chain-status SSE/poll; без push notification center.',
      good: [
        'PlatformCoreB2bOrderDetailFacts',
        'Tracking panel PG + list chrome',
        'Cross-role peer → заказ магазина (не brand handoff)',
        'last-updated на tracking row',
        'Бейдж резерва + poll chain-status (15с активная вкладка)',
        '5 этапов chain-status + бейдж «Материалы подтверждены»',
        'platform-core-tracking-reserve e2e (честный copy)',
        'SSE chain-status-stream + hub bump на handoff/materials/status patch',
        'CTA «Чат» на каждой строке трекинга',
        'core-15 clean PG tracking smoke',
      ],
      bad: [
        'Только просмотр — нет push-уведомлений при смене статуса',
        'Poll без WebSocket — не realtime; резерв зависит от WMS',
      ],
      fix: ['WebSocket вместо SSE при масштабировании'],
    },
    comms: {
      staticScore: 7.2,
      liveScore: 7.3,
      summary: 'Сообщения + календарь orders/logistics; нет notification center на hub.',
      good: [
        '/api/shop/messages/threads',
        'CommunicationsEntityContextBanner на b2b/calendar',
        'B2bOrderUrlContextBanner off в core',
        'Canonical calendar URL',
        'targetChatId + авто-переход в чат при клике (externalEventsOnly)',
        'Universal inbox: все PG-заказы в sidebar + placeholder без сообщений',
        'POST /api/messages/contextual создаёт тред с первого сообщения',
        'Один календарь: comms canonical + delivery-calendar redirect',
        'Calendar event materials_supplied (b2b-materials-*)',
        'B2bChainPhaseBadge на tracking list',
        'Wave VH: calendar CTA context + per-row (`shop-co-tracking-calendar-link`, `shop-co-tracking-row-calendar-link-*`)',
      ],
      bad: [],
      fix: [],
    },
  },
  manufacturer: {
    development: {
      staticScore: 7.1,
      liveScore: 7.2,
      summary: 'Досье read-only; sample queue (скрыт в core nav); handoff peer из brand.',
      good: [
        'Factory dossier API',
        'PlatformCoreDossierSampleQueueCard',
        'Dossier core chrome',
        'buildWorkshop2FinalTzExportContextFromDossier на portal',
        'hideBrandFactoryHub в hub actions',
        '#sample-queue hash-scroll + pillar development',
        'DevelopmentPillarCard mfr — только factory_samples step',
        'core-52 export SKU meta + print btn e2e',
        'MfrOpDossierCoSpinePeerStrip + MfrOpMaterialsCoSpinePeerStrip (wave BW)',
        'Wave VL: sample photo DAM attach + development-status mirror (core-156)',
        'Wave VZ: read-only dossier — comment peer + chat template (core-163)',
        'Wave XC: factory sample-queue PATCH + hash-scroll + RU poll (core-192)',
      ],
      bad: [],
      fix: [],
    },
    order_production: {
      staticScore: 7.1,
      liveScore: 7.2,
      summary: 'Handoff queue + PO bulk-ack; materials → supplier; без Gantt в core.',
      good: [
        'Handoff queue PG',
        'Production orders core',
        'E2E handoff',
        'manufacturer-golden-cta-handoff-queue',
        'OrderProductionPillarCard: production_po + materials_supplied',
        'CTA «Закупка · поставщик» в кабинете цеха',
        'E2E materials_supplied на pillar card после PATCH (core-02)',
        'bulk-acknowledge API + factory-handoff-bulk-acknowledge UI',
        'B2bChainPhaseBadge на строках handoff queue',
        'ERP POST после bulk ack (live_post или FACTORY-ACK journal)',
        'factory-handoff-erp badge + retry-erp в панели',
        'Bulk ERP retry для attention rows (bulk-retry-erp API + factory-handoff-bulk-erp-retry)',
        'MfrEmptyScPeerStrip + MfrEmptyCoPeerStrip в empty-cell panels (wave BX)',
        'Wave VS: publish badge + handoff count read-only в empty panels (core-162)',
        'Wave XU: mfr dossier TZ export-print route + PO TZ PDF peer deduped (core-210)',
      ],
      bad: [
        'ERP live_failed оставляет PO в error до ручного retry (auto-retry до 3× на queue poll)',
      ],
      fix: [],
    },
    comms: {
      staticScore: 7.2,
      liveScore: 7.3,
      summary: 'Сообщения + календарь tasks/orders/production; slim inbox.',
      good: [
        'CommunicationsEntityContextBanner manufacturer',
        'slimCore factory messages',
        'E2E core-01 factory messages',
        'Dedupe factory banner при URL context',
        'Universal inbox: handoff queue → placeholder чаты (manufacturer)',
        'E2E core-02 factory messages inbox SS27',
        'core-14 factory messages dedupe e2e (order= → 0 banners)',
        'MfrCmCalendarContextPeerStrip + MfrCmArticleMessagesPeerPanel attach TZ (waves BX/BW)',
        'pcTask deep-link на factory/production calendar (wave BY)',
      ],
      bad: [],
      fix: [],
    },
  },
  supplier: {
    development: {
      staticScore: 7,
      liveScore: 7.1,
      summary: 'BOM из досье (peer); RFQ-free core → comms; nav 2 группы.',
      good: [
        'BOM из dossier API',
        'UoM в BOM preview',
        'listRfq пустой в Platform Core',
        'brand/suppliers → factory materials BOM redirect',
        'suppliers/rfq → supplier chat',
        'Wave VG/VH: единый каталог в core nav (`supplier-core-material-catalog-nav`, `supplier-core-material-catalog-*-peer`)',
        'Wave XD: RFQ SLA anchor + inbox/thread SLA badges (core-193)',
        'Wave XW: alt-material PG approve + brand notification cross-link (core-212)',
      ],
      bad: [],
      fix: [],
    },
    order_production: {
      staticScore: 8.0,
      liveScore: 8.0,
      summary: 'Procurement chain 8.0 — YJ/YI/WP/WI closure + wave YU spot e2e (core-236).',
      good: [
        'materials-procurement-view + PATCH material-request',
        'SupplierProcurementPillarCard progress + chain steps',
        'PO qty из PG queue',
        'E2E confirm PATCH (core-02)',
        'Кнопка confirm только при PO в очереди',
        'Шаг materials_supplied в chain-status (5 этапов)',
        'supplier-procurement-chain-steps в кабинете',
        'E2E materials_supplied на pillar card после PATCH (core-02)',
        'Чат бренду после PATCH material-request (core-02)',
        'PATCH idempotent + materials-procurement-idempotent-badge',
        'SSE chain-status push после materials confirm',
        'bulk-confirm API (все строки BOM одним POST)',
        'Multi-article wizard + confirmAllArticles',
        'SupOpProcurementCoPeerStrip + SupplierProcurementBrandNotifyStrip (wave BY)',
        'Wave YJ: honest procurement chain strip RU (reserve/partial/bulk/WMS webhook, core-225)',
        'Wave YJ: comms tail hrefs po= on procurement workspace',
        'Wave WI: partial ship/backorder + WMS webhook (core-172)',
        'Wave WP: BOM×PO progress + brand inventory ledger peer (core-179)',
        'Wave YI: e2e registry covers WI/WP/YJ (core-224)',
        'Wave YU: supplier OP audit 8.0 + chain completeness (core-236, wave-yu-sup-op-80-bump)',
      ],
      bad: [],
      fix: [],
    },
    comms: {
      staticScore: 7,
      liveScore: 7.1,
      summary: 'Сообщения (?role=supplier) + календарь logistics; без RFQ inbox.',
      good: [
        '/factory/supplier → /factory/supplier/core',
        'Preserve hash/search на redirect',
        'CommunicationsEntityContextBanner supplier',
        'core-14 supplier messages dedupe e2e (order= → 0 banners)',
        'Wave VK: PG chain-status push prefs (`usePlatformCoreChainStatusPushEnabled`, core-155)',
      ],
      bad: [],
      fix: [],
    },
  },
};

export function getPlatformCoreReadinessMatrix(
  collectionId: string,
  options?: { liveChain?: boolean }
): ReadinessCell[] {
  const live = options?.liveChain === true;
  const cells: ReadinessCell[] = [];

  for (const row of getPlatformCoreHubRowsForUi()) {
    for (const pillar of PLATFORM_CORE_PILLARS) {
      const hubCell = row.pillars[pillar.id];
      const audit = CELL_AUDIT[row.id]?.[pillar.id];
      const active = hubCell.kind === 'active';
      const emptyInsight = !active && isEmptyCellInsightVisibleInHubAudit(row.id, pillar.id);
      const demo = getPlatformCoreDemo(collectionId);
      const subItems = active
        ? buildSectionSubItems(row.id, pillar.id, collectionId)
        : emptyInsight
          ? buildEmptySectionSubItems(row.id, pillar.id, collectionId)
          : [];
      const sectionTemplates = SECTION_AUDIT[row.id]?.[pillar.id] ?? [];
      const templateById = new Map(sectionTemplates.map((t) => [t.id, t]));
      const visibleSubItems = subItems.filter((item) => !templateById.get(item.id)?.scoreAliasOf);
      const sectionLiveAvg = averageSectionScores(subItems, 'live', sectionTemplates);
      const sectionStaticAvg = averageSectionScores(subItems, 'static', sectionTemplates);
      const auditLive = audit?.liveScore ?? (emptyInsight ? 7.3 : 7);
      const auditStatic = audit?.staticScore ?? (emptyInsight ? 7.1 : 6);
      const honestLive = sectionLiveAvg != null ? Math.min(sectionLiveAvg, auditLive) : auditLive;
      const honestStatic =
        sectionStaticAvg != null ? Math.min(sectionStaticAvg, auditStatic) : auditStatic;

      const emptyReason = hubCell.kind === 'empty' ? hubCell.reason : undefined;
      const scored = active || emptyInsight;

      cells.push({
        roleId: row.id,
        pillarId: pillar.id,
        active,
        emptyReason,
        staticScore: scored ? honestStatic : null,
        liveScore: scored ? (live ? honestLive : honestStatic) : null,
        summary: active
          ? (audit?.summary ?? (hubCell.kind === 'active' ? hubCell.title : ''))
          : emptyInsight
            ? (subItems[0]?.summary ?? 'Peer-insight контекст')
            : (emptyReason ?? 'Роль не участвует в этом столпе'),
        good: active
          ? (audit?.good ?? (hubCell.kind === 'active' ? [hubCell.lead] : []))
          : emptyInsight
            ? [subItems[0]?.label ?? 'peer-insight']
            : [],
        bad: active ? (audit?.bad ?? []) : emptyInsight ? (subItems[0]?.bad ?? []) : [],
        fix: active
          ? (audit?.fix ?? [])
          : emptyInsight
            ? (subItems.flatMap((s) => s.fix) ?? [])
            : [],
        cabinetHref: platformCoreRolePillarHref(row.id, pillar.id),
        workspaceHref: active
          ? getRolePillarWorkspaceHref(row.id, pillar.id, demo)
          : platformCoreRolePillarHref(row.id, pillar.id),
        subItems: visibleSubItems,
      });
    }
  }

  return cells;
}

export function getReadinessCell(
  cells: ReadinessCell[],
  roleId: CoreChainRoleId,
  pillarId: CoreHubPillarId
): ReadinessCell | undefined {
  return cells.find((c) => c.roleId === roleId && c.pillarId === pillarId);
}

export type ReadinessScoreMode = 'static' | 'live';

export type ReadinessSummary = {
  mode: ReadinessScoreMode;
  scoredCellCount: number;
  activeScoredCount: number;
  allCellsAvg: number;
  activeCellsAvg: number;
  roleAverages: Record<
    CoreChainRoleId,
    { allAvg: number; activeAvg: number | null; activeCount: number }
  >;
};

function pickCellScore(cell: ReadinessCell, mode: ReadinessScoreMode): number | null {
  return mode === 'live' ? cell.liveScore : cell.staticScore;
}

function averageScores(
  cells: ReadinessCell[],
  mode: ReadinessScoreMode,
  predicate?: (cell: ReadinessCell) => boolean
): number | null {
  const subset = predicate ? cells.filter(predicate) : cells;
  const values = subset.map((c) => pickCellScore(c, mode)).filter((n): n is number => n != null);
  if (values.length === 0) return null;
  return values.reduce((s, n) => s + n, 0) / values.length;
}

/** Сводка из матрицы — единый источник для scorecard и hub. */
export function summarizePlatformCoreReadiness(
  cells: ReadinessCell[],
  mode: ReadinessScoreMode
): ReadinessSummary {
  const roleIds = [...new Set(cells.map((c) => c.roleId))];
  const roleAverages = {} as ReadinessSummary['roleAverages'];

  for (const roleId of roleIds) {
    const roleCells = cells.filter((c) => c.roleId === roleId);
    const activeCells = roleCells.filter((c) => c.active);
    roleAverages[roleId] = {
      allAvg: averageScores(roleCells, mode) ?? 0,
      activeAvg: averageScores(activeCells, mode),
      activeCount: activeCells.length,
    };
  }

  const allCellsAvg = averageScores(cells, mode) ?? 0;
  const activeCellsAvg = averageScores(cells, mode, (c) => c.active) ?? allCellsAvg;
  const scoredCellCount = cells.filter((c) => pickCellScore(c, mode) != null).length;
  const activeScoredCount = cells.filter((c) => c.active && pickCellScore(c, mode) != null).length;

  return {
    mode,
    scoredCellCount,
    activeScoredCount,
    allCellsAvg,
    activeCellsAvg,
    roleAverages,
  };
}

export function formatReadinessScore(n: number | null): string {
  if (n == null) return '—';
  return Number.isInteger(n) ? `${n}` : n.toFixed(1);
}

export function readinessScoreTone(score: number | null, live: boolean): string {
  if (score == null) return 'text-text-muted';
  if (!live) return 'text-text-secondary';
  if (score >= 8) return 'text-emerald-700';
  if (score >= 6) return 'text-amber-700';
  return 'text-rose-700';
}

export { ROLE_LABELS };
