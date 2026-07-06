import fs from 'node:fs';
import path from 'node:path';
/** Дублирует список из platform-core-ui-surfaces (без import — Jest/SWC). */
const PLATFORM_CORE_UI_FORBIDDEN_DUPES = [
  'lead под context-bar на workspace',
  'RegistryPageHeader title/lead на core-path',
  'ShopB2bContentHeader lead на core-path',
  'CardHeader pillar title в compact insight',
  'full variant RolePillarCrossRoleLinks',
  'cross-role выше контента страницы',
  'повтор orderId/PO в facts и context-bar',
  'CabinetHubTitleRow / CabinetHubSectionBar при platform core',
  'BrandSectionHeaderBlock / StageContextBar при platform core',
  'BrandMessagesRuWorkspaceBanner при platform core comms',
  'PlatformCorePillarHandoffStrip (удалён — дубль cross-role)',
  'CardHeader коллекции/столпа на workspace при slim ListChrome',
  'CommsNotificationCenterStrip + OrderCommsWorkspaceNotificationBar на одном экране',
] as const;

const SRC_ROOT = path.join(__dirname, '..', '..');

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(tsx|ts)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

function rel(p: string): string {
  return path.relative(SRC_ROOT, p).replace(/\\/g, '/');
}

function read(p: string): string {
  return fs.readFileSync(p, 'utf8');
}

function corePathFiles(): string[] {
  const all = walk(SRC_ROOT);
  return all.filter((f) => {
    const r = rel(f);
    if (r.includes('/_archive/')) return false;
    return (
      r.endsWith('-core.tsx') ||
      r.includes('/core/') ||
      (r.startsWith('components/platform/') && r.endsWith('.tsx'))
    );
  });
}

const CORE_LAYOUTS = [
  'app/brand/layout.tsx',
  'app/shop/layout.tsx',
  'app/factory/production/layout.tsx',
  'app/factory/supplier/layout.tsx',
] as const;

describe('platform-core-ui-dedup-audit', () => {
  it('канон PLATFORM_CORE_UI_FORBIDDEN_DUPES не пустой', () => {
    expect(PLATFORM_CORE_UI_FORBIDDEN_DUPES.length).toBeGreaterThanOrEqual(8);
  });

  it('core-path: нет ShopB2bContentHeader и RegistryPageHeader', () => {
    const offenders: string[] = [];
    for (const file of corePathFiles()) {
      const text = read(file);
      if (text.includes('ShopB2bContentHeader')) offenders.push(rel(file));
      if (text.includes('RegistryPageHeader')) offenders.push(rel(file));
    }
    expect(offenders).toEqual([]);
  });

  it('core-path: RolePillarCrossRoleLinks только compact', () => {
    const offenders: string[] = [];
    for (const file of corePathFiles()) {
      const text = read(file);
      if (/RolePillarCrossRoleLinks[\s\S]{0,120}variant=["']full["']/.test(text)) {
        offenders.push(rel(file));
      }
      if (/variant=\{['"]full['"]\}/.test(text) && text.includes('RolePillarCrossRoleLinks')) {
        offenders.push(rel(file));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('core-path: PlatformCoreListChrome с children (не самозакрывающийся)', () => {
    const offenders: string[] = [];
    for (const file of corePathFiles()) {
      if (rel(file) === 'components/platform/PlatformCoreListChrome.tsx') continue;
      const text = read(file);
      if (/<PlatformCoreListChrome[^>]*\/>/.test(text)) offenders.push(rel(file));
    }
    expect(offenders).toEqual([]);
  });

  it('layout кабинетов: platform core → CabinetHubMobileNavOnly', () => {
    const offenders: string[] = [];
    for (const layout of CORE_LAYOUTS) {
      const text = read(path.join(SRC_ROOT, layout));
      if (!text.includes('isPlatformCoreMode'))
        offenders.push(`${layout}: missing isPlatformCoreMode`);
      if (!text.includes('CabinetHubMobileNavOnly'))
        offenders.push(`${layout}: missing CabinetHubMobileNavOnly`);
      if (!/platformCore\s*\?\s*\(\s*[\s\S]*CabinetHubMobileNavOnly/.test(text)) {
        offenders.push(`${layout}: platformCore branch without MobileNavOnly`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('brand extras: suppress при platform core', () => {
    const brandHeader = read(path.join(SRC_ROOT, 'components/brand/BrandSectionHeaderBlock.tsx'));
    const stageBar = read(path.join(SRC_ROOT, 'components/brand/production/StageContextBar.tsx'));
    expect(brandHeader).toContain('shouldSuppressCabinetHubLayoutChrome');
    expect(stageBar).toContain('shouldSuppressCabinetHubLayoutChrome');
  });

  it('comms core: RU workspace banner suppressed', () => {
    const banner = read(
      path.join(SRC_ROOT, 'components/brand/messages/BrandMessagesRuWorkspaceBanner.tsx')
    );
    expect(banner).toContain('isPlatformCoreMode');
  });

  it('нет PlatformCorePillarHandoffStrip в src', () => {
    expect(
      fs.existsSync(path.join(SRC_ROOT, 'components/platform/PlatformCorePillarHandoffStrip.tsx'))
    ).toBe(false);
  });

  it('ListChrome: cross-role только столп comms', () => {
    const chrome = read(path.join(SRC_ROOT, 'components/platform/PlatformCoreListChrome.tsx'));
    expect(chrome).toContain("pillarId === 'comms'");
    expect(chrome).not.toMatch(/pillarId \? \([\s\S]*RolePillarCrossRoleLinks/);
  });

  it('order detail chrome: cross-role rail lg+ и footer < lg', () => {
    const chrome = read(
      path.join(SRC_ROOT, 'components/platform/PlatformCoreOrderDetailChrome.tsx')
    );
    expect(chrome).toContain('RolePillarCrossRoleLinks');
    expect(chrome).toContain('orderDetailRail');
    expect(chrome).toContain('platform-core-order-detail-rail');
    expect(chrome).toContain('orderDetailCrossRoleMobile');
    expect(chrome).toContain('platform-core-order-detail-cross-role-mobile');
    expect(chrome).not.toContain('shop-co-detail-cross-links');
  });

  it('brand order detail: cross-role только в chrome (без workspace footer)', () => {
    const brandDetail = read(
      path.join(SRC_ROOT, 'app/brand/b2b-orders/[orderId]/brand-order-detail-core.tsx')
    );
    expect(brandDetail).toContain('showCrossLinks={false}');
    expect(brandDetail).toContain('PlatformCoreOrderDetailChrome');
  });

  it('order detail facts: один nav-блок (без footer cross-links)', () => {
    const facts = read(
      path.join(SRC_ROOT, 'components/platform/PlatformCoreB2bOrderDetailFacts.tsx')
    );
    expect(facts).not.toContain('brand-co-detail-footer-');
    expect(facts).not.toContain('brand-co-detail-cross-links');
    expect(facts).not.toContain('shop-co-detail-footer-');
    expect(facts).not.toContain('shop-co-detail-cross-links');
  });

  it('hub: investor-slim — без scope, telemetry, audit-kicker', () => {
    expect(
      fs.existsSync(path.join(SRC_ROOT, 'components/platform/PlatformCoreScopeNote.tsx'))
    ).toBe(false);
    const matrix = read(
      path.join(SRC_ROOT, 'components/platform/PlatformCorePillarRoleScoreMatrix.tsx')
    );
    expect(matrix).not.toContain('platform-core-readiness-telemetry');
    expect(matrix).not.toContain('Оценка готовности · ручной аудит');
    const hub = read(path.join(SRC_ROOT, 'components/platform/PlatformHubPageClient.tsx'));
    expect(hub).not.toContain('PlatformCoreScopeNote');
    expect(hub).not.toContain('Syntha · ядро платформы');
    expect(matrix).not.toContain(' (PG)');
    expect(matrix).not.toContain('ср. {formatReadinessScore');
    const coreHeader = read(path.join(SRC_ROOT, 'components/layout/core-mode-header.tsx'));
    expect(coreHeader).toContain('PlatformCoreHubViewToggle');
    expect(hub).toContain('usePlatformCoreHubViews');
    expect(hub).toContain('hubViews.business');
    expect(hub).toContain('hubViews.audit');
    expect(hub).toContain('PlatformCoreHubAuditLauncher');
    expect(hub).not.toContain('platform-core-hub-business-hint');
    expect(hub).not.toContain('platform-core-hub-heading');
  });

  it('RoleCoreCabinetHub: section list + pillar rail в core (без карусели столпов)', () => {
    const hub = read(path.join(SRC_ROOT, 'components/platform/RoleCoreCabinetHub.tsx'));
    expect(hub).toMatch(/RoleCorePillarInsightCards/);
    expect(hub).toMatch(/compact/);
    expect(hub).not.toMatch(/cell\.kind === 'active'[\s\S]{0,200}RolePillarCrossRoleLinks/);
    expect(hub).toContain('!isPlatformCoreMode()');
    expect(hub).toContain('RoleCabinetPillarNavMobile');
    expect(hub).toContain('PillarSectionList');
    expect(hub).toContain('PillarCabinetHeader');
    expect(hub).toContain('role-core-pillar-nav');
    expect(hub).toContain('hubCabinet.pillarNav');
    expect(hub).toMatch(/showEmbeddedWorkspace[\s\S]{0,120}'flex w-full min-w-0 flex-col gap-3'/);
  });

  it('Workshop2ArticleFlatHub: embedded hub — широкие карточки, 1 col / xl:2', () => {
    const flat = read(
      path.join(SRC_ROOT, 'components/brand/production/Workshop2ArticleFlatHub.tsx')
    );
    expect(flat).toMatch(/embeddedHub[\s\S]{0,80}'grid-cols-1 xl:grid-cols-2'/);
    expect(flat).toContain('workshop2-article-flat-hub-card');
    expect(flat).not.toMatch(/ArticleCard[\s\S]{0,400}absolute/);
  });

  it('ListChrome: без strip столпов в core (назад — в context bar)', () => {
    const chrome = read(path.join(SRC_ROOT, 'components/platform/PlatformCoreListChrome.tsx'));
    expect(chrome).toContain('PlatformCoreRolePillarStrip');
    expect(chrome).toMatch(/\{!coreMode \?[\s\S]{0,220}PlatformCoreRolePillarStrip/);
  });

  it('linesheets core: publish только на W2 hub', () => {
    const linesheets = read(path.join(SRC_ROOT, 'app/brand/linesheets/linesheets-core.tsx'));
    expect(linesheets).toContain('isPlatformCoreMode');
    expect(linesheets).toContain('{!coreMode ? (');
    expect(linesheets).toContain('LinesheetsBatchPublishPanel');
    const w2 = read(path.join(SRC_ROOT, 'app/brand/production/workshop2/workshop2-hub-core.tsx'));
    const w2Strip = read(
      path.join(SRC_ROOT, 'components/brand/production/BrandDevW2HubContextStrip.tsx')
    );
    expect(w2).toContain('BrandScPublishAuditLog');
    expect(w2).toContain('brand-dev-w2-hub-publish-strip');
    expect(w2).toContain('BrandDevW2HubContextStrip');
    expect(w2Strip).toContain('brand-dev-w2-hub-showroom-link');
  });

  it('mini cabinet: golden strip в compact core hub', () => {
    const brandMini = read(
      path.join(SRC_ROOT, 'components/platform/BrandSampleCollectionMini.tsx')
    );
    const shopMini = read(path.join(SRC_ROOT, 'components/platform/ShopShowroomMini.tsx'));
    expect(brandMini).toMatch(/!compact \|\| coreMode[\s\S]{0,80}BrandScCabinetGoldenPathStrip/);
    expect(shopMini).toMatch(/!compact \|\| coreMode[\s\S]{0,80}ShopScCabinetGoldenPathStrip/);
  });

  it('showroom core: mode label + без collection-chip card в slim', () => {
    const showroom = read(
      path.join(SRC_ROOT, 'components/platform/PlatformCorePublishedShowroom.tsx')
    );
    expect(showroom).toContain('showroom-mode-label');
    expect(showroom).toMatch(/!slimChrome[\s\S]{0,120}collection-chip/);
    expect(showroom).toContain('omitStep="showroom"');
  });

  it('linesheets core: mode label «Лайншиты»', () => {
    const linesheets = read(path.join(SRC_ROOT, 'app/brand/linesheets/linesheets-core.tsx'));
    expect(linesheets).toContain('brand-sc-linesheets-mode-label');
    expect(linesheets).toContain('Лайншиты');
    expect(linesheets).toContain('brand-sc-linesheets-card-grid');
  });

  it('order production cabinet compact: spine peer CTA', () => {
    const op = read(path.join(SRC_ROOT, 'components/platform/OrderProductionPillarCard.tsx'));
    expect(op).toMatch(/hasActiveOrder[\s\S]{0,280}BrandOpCabinetSpinePeerStrip/);
    expect(op).toMatch(/inventory_reserved[\s\S]{0,48}!compact/);
  });

  it('order detail: навигация в chain card, без отдельных context strips', () => {
    const facts = read(
      path.join(SRC_ROOT, 'components/platform/PlatformCoreB2bOrderDetailFacts.tsx')
    );
    const chain = read(path.join(SRC_ROOT, 'components/b2b/B2bOrderChainStatusCard.tsx'));
    expect(facts).not.toContain('PlatformCoreB2bOrderDetailBrandCoContextStrip');
    expect(facts).not.toContain('PlatformCoreB2bOrderDetailShopCoContextStrip');
    expect(chain).toContain('brand-co-chain-context-strip');
    expect(chain).toContain('shop-co-chain-context-strip');
  });

  it('brand registry production strip: без чата в golden path', () => {
    const registry = read(path.join(SRC_ROOT, 'app/brand/b2b-orders/b2b-orders-core.tsx'));
    expect(registry).not.toContain('brand-op-registry-chat-link');
    expect(registry).toContain('hubGadget.goldenSep');
  });

  it('registry core: чат только на карточке заказа, не в строке реестра', () => {
    const shopRegistry = read(path.join(SRC_ROOT, 'app/shop/b2b/orders/orders-core.tsx'));
    const brandRegistry = read(path.join(SRC_ROOT, 'app/brand/b2b-orders/b2b-orders-core.tsx'));
    const chain = read(path.join(SRC_ROOT, 'components/b2b/B2bOrderChainStatusCard.tsx'));
    expect(shopRegistry).toContain("useB2bOrderThreadPreviews('shop', !coreMode)");
    expect(brandRegistry).toContain("useB2bOrderThreadPreviews('brand', !coreMode)");
    expect(shopRegistry).toMatch(/!coreMode \? \([\s\S]*shop-b2b-order-chat/);
    expect(brandRegistry).toMatch(/!coreMode \? \([\s\S]*brand-b2b-order-chat/);
    expect(chain).toContain('shop-co-detail-chat-link');
    expect(chain).toContain('brand-co-detail-chat-link');
  });

  it('materials procurement core: без дубля chain workspace', () => {
    const materials = read(
      path.join(SRC_ROOT, 'app/factory/production/materials/materials-core.tsx')
    );
    expect(materials).toMatch(/supplierChainSteps\.length > 0[\s\S]{0,80}!isPlatformCoreMode\(\)/);
    expect(materials).toContain('hubCabinet.pillarNavPillRow');
    expect(materials).toContain('mfr-dev-materials-context-strip');
    expect(materials).toContain('hubCabinet.workspaceTableScroll');
  });

  it('comms slimCore: mobile list/chat split без дубля DOM', () => {
    const messages = read(path.join(SRC_ROOT, 'components/user/messages/MessagesPage.tsx'));
    const chatHeader = read(path.join(SRC_ROOT, 'components/user/messages/ChatHeader.tsx'));
    expect(messages).toContain('platform-core-comms-inbox-shell');
    expect(messages).toContain('platform-core-comms-thread-list');
    expect(messages).toContain('platform-core-comms-chat-pane');
    expect(chatHeader).toContain('platform-core-comms-chat-back');
    expect(messages).toContain('mobileCommsPane');
    expect(messages).toMatch(/hasDeepLink|setMobileCommsPane\('chat'\)/);
  });

  it('calendar slimCore: compact month grid на Platform Core', () => {
    const calendar = read(path.join(SRC_ROOT, 'components/user/style-calendar.tsx'));
    const grid = read(path.join(SRC_ROOT, 'components/user/calendar/_components/CalendarGrid.tsx'));
    expect(calendar).toContain('platform-core-calendar-shell');
    expect(grid).toContain('platform-core-calendar-month-grid');
    expect(grid).toContain('slimCore');
  });

  it('tracking core: без toolbar SSE и без «Выпуск» на строке', () => {
    const tracking = read(
      path.join(SRC_ROOT, 'components/platform/PlatformCoreShopB2bTrackingPanel.tsx')
    );
    expect(tracking).toMatch(/!coreSlim \? \([\s\S]{0,200}shop-co-tracking-sse-live-badge/);
    expect(tracking).toMatch(/production_po.*&& !coreSlim/);
    expect(tracking).toContain('shop-co-tracking-calendar-link');
    expect(tracking).toContain('shop-co-tracking-row-calendar-link-');
  });

  it('wave VH: operator RU labels (Live/stub/audit noise)', () => {
    const sectionList = read(path.join(SRC_ROOT, 'components/platform/PillarSectionList.tsx'));
    const chainBadge = read(
      path.join(SRC_ROOT, 'components/platform/PlatformCoreChainStatusRefreshBadge.tsx')
    );
    const diffPanel = read(path.join(SRC_ROOT, 'components/platform/BrandDossierFactoryDiffPanel.tsx'));
    const diagnostics = read(path.join(SRC_ROOT, 'components/platform/PillarCabinetDiagnostics.tsx'));
    expect(sectionList).toContain('В эфире');
    expect(sectionList).toContain('SSE в эфире');
    expect(sectionList).not.toMatch(/\{liveConnected \? 'Live'/);
    expect(chainBadge).toContain('В эфире');
    expect(chainBadge).not.toMatch(/\? 'Live' :/);
    expect(diffPanel).toContain('В эфире');
    expect(diffPanel).toContain('заглушка');
    expect(diffPanel).toContain("'файл'");
    expect(diagnostics).toContain('аудит / SSE');
    expect(diagnostics).not.toContain('audit / SSE');
  });

  it('chain card: peer mirror strip без второго inbox', () => {
    const chain = read(path.join(SRC_ROOT, 'components/b2b/B2bOrderChainStatusCard.tsx'));
    const mirror = read(path.join(SRC_ROOT, 'components/b2b/B2bOrderChainPeerMirrorStrip.tsx'));
    expect(chain).toContain('B2bOrderChainPeerMirrorStrip');
    expect(chain).toMatch(/coreSlim && !productionPillar && chain/);
    expect(mirror).not.toContain('messagesHref');
    expect(mirror).not.toContain('MessageSquare');
    expect(mirror).toContain('shop-co-chain-peer-mirror');
    expect(mirror).toContain('brand-co-chain-peer-mirror');
    expect(mirror).toContain('shop-co-chain-peer-po-pending');
    expect(mirror).toContain('shop-co-chain-peer-po-synced');
    expect(mirror).toContain('shop-co-chain-peer-status-summary');
  });

  it('order detail core: без дубля amend-card и короткий PO copy', () => {
    const facts = read(
      path.join(SRC_ROOT, 'components/platform/PlatformCoreB2bOrderDetailFacts.tsx')
    );
    const chain = read(path.join(SRC_ROOT, 'components/b2b/B2bOrderChainStatusCard.tsx'));
    expect(facts).toMatch(/!isPlatformCoreMode\(\) \? \([\s\S]{0,240}shop-co-detail-amend-card/);
    expect(facts).toContain('const coreSlim = isPlatformCoreMode()');
    expect(chain).toMatch(/coreSlim && productionPillar/);
  });

  it('factory OP core: чат только в comms, не в materials/handoff/cabinet', () => {
    const materials = read(
      path.join(SRC_ROOT, 'app/factory/production/materials/materials-core.tsx')
    );
    const handoff = read(
      path.join(SRC_ROOT, 'components/factory/FactoryWorkshop2ProductionHandoffPanel.tsx')
    );
    const op = read(path.join(SRC_ROOT, 'components/platform/OrderProductionPillarCard.tsx'));
    const mfrOpCabinetStrip = read(
      path.join(SRC_ROOT, 'components/factory/MfrOpCabinetSpinePeerStrip.tsx')
    );
    const dossier = read(path.join(SRC_ROOT, 'components/platform/FactoryDossierCoreChrome.tsx'));
    expect(materials).toMatch(
      /!isPlatformCoreMode\(\) \? \([\s\S]{0,600}materials-procurement-chat-link/
    );
    expect(handoff).toMatch(
      /!isPlatformCoreMode\(\) \? \([\s\S]{0,500}mfr-op-handoff-queue-chat-link/
    );
    expect(mfrOpCabinetStrip).toMatch(/\{!coreSlim \? \([\s\S]{0,300}data-testid="mfr-op-cabinet-chat-link"/);
    expect(op).toMatch(/item\.b2bOrderId && !coreSlim \? \([\s\S]{0,450}mfr-op-queue-chat-/);
    expect(dossier).toContain('mfr-dev-dossier-context-strip');
    expect(dossier).toContain('hubGadget.goldenPath');
    expect(dossier).toContain('mfr-dev-dossier-actions-strip');
    expect(dossier).not.toMatch(/hubGadget[\s\S]{0,400}mfr-op-dossier-order-chat-link/);
  });

  it('core inbox: только PG-треды, без synthetic placeholder merge', () => {
    const chatState = read(path.join(SRC_ROOT, 'components/user/messages/hooks/useChatState.ts'));
    expect(chatState).toMatch(/placeholders: !coreMode/);
  });

  it('comms banner core: без shortcuts и без дубля CTA в workspace', () => {
    const banner = read(
      path.join(SRC_ROOT, 'components/brand/communications/CommunicationsEntityContextBanner.tsx')
    );
    expect(banner).toMatch(
      /workspaceShortcuts = showWorkspaceShortcuts && !slimWorkspace && !coreMode/
    );
    expect(banner).toContain('!platformCoreWorkspace ? (');
    expect(banner).toMatch(/\{!coreMode && workshop2Href \? \(/);
    expect(banner).not.toMatch(/\{workshop2Href \|\| coreMode \? \(/);
  });

  it('WMS reserve copy: единый модуль + PlatformCoreWmsReserveStrip', () => {
    const wms = read(path.join(SRC_ROOT, 'lib/platform-core-wms-reserve-copy.ts'));
    const strip = read(path.join(SRC_ROOT, 'components/platform/PlatformCoreWmsReserveStrip.tsx'));
    const checkout = read(path.join(SRC_ROOT, 'app/shop/b2b/checkout/checkout-core.tsx'));
    const checkoutBadge = read(
      path.join(SRC_ROOT, 'components/shop/b2b/ShopCoCheckoutInventoryReserveBadge.tsx')
    );
    const op = read(path.join(SRC_ROOT, 'components/platform/OrderProductionPillarCard.tsx'));
    const sup = read(path.join(SRC_ROOT, 'components/platform/SupplierProcurementPillarCard.tsx'));
    const tracking = read(path.join(SRC_ROOT, 'lib/platform-core-tracking-reserve-label.ts'));
    expect(strip).toContain('PlatformCoreWmsReserveStrip');
    expect(checkout).toContain('ShopCoCheckoutInventoryReserveBadge');
    expect(checkoutBadge).toContain('platform-core-wms-reserve-copy');
    expect(wms).toContain('PLATFORM_CORE_WMS_RESERVE_CHECKOUT_RU');
    expect(op).toContain('formatPlatformCoreWmsReserveBrandBadgeRu');
    expect(sup).toContain('formatPlatformCoreWmsReserveCabinetLongRu');
    expect(tracking).toContain('platform-core-wms-reserve-copy');
    const materials = read(
      path.join(SRC_ROOT, 'app/factory/production/materials/materials-core.tsx')
    );
    expect(materials).toContain('PlatformCoreWmsReserveStrip');
    expect(materials).toContain('variant="supplier"');
    expect(strip).toContain('sup-op-procurement-wms-reserve-strip');
  });

  it('comms inbox: dedicated SSE stream + hub bump', () => {
    const hub = read(path.join(SRC_ROOT, 'lib/server/platform-core-comms-inbox-hub.ts'));
    const stream = read(path.join(SRC_ROOT, 'app/api/platform-core/comms/inbox-stream/route.ts'));
    const strip = read(path.join(SRC_ROOT, 'components/platform/CommsPillarThreadStrip.tsx'));
    const threadsHook = read(path.join(SRC_ROOT, 'hooks/use-comms-hub-merged-threads.ts'));
    const domainEvents = read(path.join(SRC_ROOT, 'lib/server/workshop2-domain-events.ts'));
    expect(hub).toContain('COMMS_INBOX_BUMP');
    expect(domainEvents).toContain('bumpPlatformCoreCommsInbox');
    expect(stream).toContain('subscribePlatformCoreCommsInbox');
    expect(strip).toContain('useCommsHubMergedThreads');
    expect(threadsHook).toContain('usePlatformCoreCommsInboxPoll');
  });

  it('comms messages: universal inbox без OrderCommsWorkspaceNotificationBar', () => {
    const mfrMessages = read(
      path.join(SRC_ROOT, 'app/factory/production/messages/messages-core.tsx')
    );
    const shopMessages = read(path.join(SRC_ROOT, 'app/shop/messages/messages-core.tsx'));
    const brandMessages = read(path.join(SRC_ROOT, 'app/brand/messages/messages-core.tsx'));
    expect(mfrMessages).toContain('PlatformCoreCommsUniversalInboxStrip');
    expect(mfrMessages).not.toContain('OrderCommsWorkspaceNotificationBar');
    expect(shopMessages).toContain('PlatformCoreCommsUniversalInboxStrip');
    expect(shopMessages).not.toContain('OrderCommsWorkspaceNotificationBar');
    expect(brandMessages).toContain('PlatformCoreCommsUniversalInboxStrip');
    expect(brandMessages).not.toContain('OrderCommsWorkspaceNotificationBar');
  });

  it('shop comms: notification prefs compact stub', () => {
    const prefs = read(
      path.join(SRC_ROOT, 'components/platform/PlatformCoreShopCommsNotificationPrefsStrip.tsx')
    );
    const center = read(
      path.join(SRC_ROOT, 'components/platform/CommsNotificationCenterStrip.tsx')
    );
    expect(prefs).toContain('${prefix}-notification-prefs-compact');
    expect(prefs).toContain("return 'shop-cm'");
    expect(prefs).toContain('loadPlatformCoreCommsNotificationPrefs');
    expect(prefs).toContain('-notification-pref-chain-push');
    expect(center).toContain('PlatformCoreCommsNotificationPrefsStrip');
    expect(center).toContain('/api/platform-core/comms/unread-summary');
  });

  it('brand dossier wayfinding: minimal back link only (no peer strips)', () => {
    const wf = read(
      path.join(
        SRC_ROOT,
        'app/brand/production/workshop2/(w2-enterprise)/c/[collectionId]/a/[articleId]/workshop2-article-core-wayfinding.tsx'
      )
    );
    expect(wf).toContain('brand-dev-dossier-panel');
    expect(wf).toContain('platform-core-workspace-back');
    expect(wf).not.toContain('brand-dev-dossier-context-strip');
    expect(wf).not.toContain('BrandDossierFactoryDiffPanel');
    const footer = read(
      path.join(
        SRC_ROOT,
        'components/brand/production/workshop2-phase1-dossier-panel-footer-actions.tsx'
      )
    );
    expect(footer).toContain('brand-dev-dossier-actions-strip');
  });

  it('dossier panel: decomposition manifest + rollback extract', () => {
    const manifest = read(
      path.join(
        SRC_ROOT,
        'components/brand/production/workshop2-phase1-dossier-panel-decomposition-manifest.ts'
      )
    );
    const panel = read(
      path.join(SRC_ROOT, 'components/brand/production/Workshop2Phase1DossierPanel.tsx')
    );
    const mainLayout = read(
      path.join(
        SRC_ROOT,
        'components/brand/production/use-workshop2-phase1-dossier-panel-main-layout-zone.tsx'
      )
    );
    const rollback = read(
      path.join(
        SRC_ROOT,
        'components/brand/production/Workshop2Phase1DossierPanelRollbackBanner.tsx'
      )
    );
    const coreState = read(
      path.join(SRC_ROOT, 'components/brand/production/use-workshop2-phase1-dossier-core-state.ts')
    );
    expect(manifest).toContain('WORKSHOP2_PHASE1_DOSSIER_PANEL_DECOMPOSITION_MANIFEST');
    expect(manifest).toContain('use-workshop2-phase1-dossier-core-state.ts');
    expect(mainLayout).toContain('Workshop2Phase1DossierPanelRollbackBanner');
    expect(panel).toContain('useWorkshop2Phase1DossierPanelTailZone');
    expect(panel).toContain('sectionBodyFlat:');
    expect(panel).toContain('buildWorkshop2Phase1DossierPanelTailInput');
    expect(panel).toContain('useWorkshop2Phase1DossierJumpAnchors');
    expect(panel).toContain('useWorkshop2Phase1DossierCoreState');
    expect(panel).toContain('useWorkshop2Phase1DossierAttrCommentsController');
    expect(panel).toContain('useWorkshop2Phase1DossierSketchWorkspaceState');
    expect(panel).toContain('useWorkshop2Phase1DossierFinalTzWizardController');
    expect(panel).toContain('useWorkshop2Phase1DossierTzSignoffZone');
    expect(panel).toContain('useWorkshop2Phase1DossierActiveSectionRows');
    expect(panel).toContain('useWorkshop2Phase1DossierMaterialBomZone');
    expect(panel).toContain('useWorkshop2Phase1DossierHandbookControlZone');
    expect(panel).toContain('useWorkshop2Phase1DossierSectionRowsOrchestration');
    expect(panel).toContain('useWorkshop2Phase1DossierPassportHubZone');
    expect(panel).toContain('useWorkshop2Phase1DossierSendHandoffZone');
    expect(rollback).toContain('workshop2-phase1-dossier-rollback-banner');
    expect(coreState).toContain('useWorkshop2Phase1DossierHydrateFromStorage');
  });

  it('investor hub banner: скрыт в Platform Core mode', () => {
    const banner = read(
      path.join(SRC_ROOT, 'components/brand/production/Workshop2InvestorDemoHubBanner.tsx')
    );
    expect(banner).toContain('isPlatformCoreMode');
    expect(banner).toMatch(/if \(isPlatformCoreMode\(\)\) return null/);
  });

  it('brand tasks core: calendar strip CTA', () => {
    const page = read(path.join(SRC_ROOT, 'app/brand/tasks/page.tsx'));
    expect(page).toContain('brand-tasks-core-calendar-strip');
    expect(page).toContain('isPlatformCoreMode');
  });

  it('dev chrome: скрыт на Platform Core golden path', () => {
    const chrome = read(path.join(SRC_ROOT, 'components/layout/dev-only-chrome.tsx'));
    const banner = read(path.join(SRC_ROOT, 'components/layout/dev-session-banner.tsx'));
    expect(chrome).toContain('isPlatformCoreGoldenPath');
    expect(banner).toContain('isPlatformCoreGoldenPath');
  });

  it('workspace chrome: без H1 workspace в core mode', () => {
    const chrome = read(
      path.join(SRC_ROOT, 'components/platform/PillarCapabilityWorkspaceChrome.tsx')
    );
    expect(chrome).toContain('!coreMode ?');
    expect(chrome).toMatch(/!coreMode \? \([\s\S]*<h1/);
  });

  it('platform-core: typecheck gate script + brand OP BOM single line', () => {
    const pkg = read(path.join(SRC_ROOT, '..', 'package.json'));
    const tsconfigCi = read(path.join(SRC_ROOT, '..', 'tsconfig.ci.json'));
    const op = read(path.join(SRC_ROOT, 'components/platform/OrderProductionPillarCard.tsx'));
    expect(pkg).toContain('typecheck:platform-core');
    expect(pkg).toMatch(/typecheck:ci/);
    expect(tsconfigCi).toContain('**/__tests__/**');
    expect(op).toContain('материалы');
    expect(op).not.toMatch(
      /data-testid="brand-op-materials-step-badge"[\s\S]{0,80}Материалы подтверждены/
    );
  });
});
