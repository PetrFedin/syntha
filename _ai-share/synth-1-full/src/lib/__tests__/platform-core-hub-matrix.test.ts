import { ROUTES, shopB2bOrderHref, calendarHrefForRole, brandB2bOrdersAwaitingHandoffRegistryHref } from '@/lib/routes';
import { PILLAR_CAPABILITY_FEATURE_PARAM } from '@/lib/platform/pillar-capability-workspaces';
import {
  PLATFORM_CORE_BRAND_B2B_LEGACY_REDIRECTS,
} from '@/lib/platform-core-brand-b2b-legacy-redirects';
import {
  PLATFORM_CORE_SHOP_B2B_LEGACY_REDIRECTS,
  resolveShopB2bLegacyRedirect,
} from '@/lib/platform-core-shop-b2b-legacy-redirects';
import { mapPlatformCoreB2bEventToCalendar } from '@/lib/platform-core-calendar-events-client';
import {
  getRoleCabinetNavPillarIds,
  isRolePillarCabinetSelectable,
  PLATFORM_CORE_SHOW_PEER_INSIGHT_IN_UI,
} from '@/lib/platform-core-empty-cell-registry';
import {
  PLATFORM_CORE_DEMO,
  PLATFORM_CORE_DEMO_PRESETS,
  PLATFORM_CORE_DEMO_TRAIL,
  PLATFORM_CORE_HUB_ROWS,
  PLATFORM_CORE_PILLARS,
  countPillarActiveRoles,
  countActivePillarsForRole,
  countEmptyPillarsForRole,
  getActivePillarIdsForRole,
  isRolePillarActive,
  getAdjacentPillars,
  getChainStripPillarHref,
  getDemoTrailPrimaryHref,
  getRolePillarDemoHref,
  getPlatformCorePillarEntityLabel,
  getPlatformCorePillarEntityLabelForDemo,
  getPillarCrossRolePeers,
  getPillarCrossRolePeersForDemo,
  getPillarLinkForRole,
  getPlatformCoreHubRow,
  getRoleAdjacentPillarHref,
  getRoleAdjacentPillarWorkspaceHref,
  getRolePillarWorkspaceHref,
  platformCoreRolePillarHref,
  resolvePlatformCoreCollectionId,
  isPlatformCoreEmptyChainCollection,
  isPlatformCoreEmptyChainDemo,
  buildPlatformCoreDemoTrail,
  mergePlatformCoreDemoWithActiveOrder,
  getPlatformCoreDemo,
  getHubCellActionsForDemo,
  getCrossRolePeerDemoHrefForDemo,
  getPlatformCorePillarHandoffRuForDemo,
  getPlatformCoreDemoByOrderId,
  resolvePageCollectionId,
  rewriteHrefForDemo,
  rewriteHubTextForDemo,
  buildPlatformCoreContextQuery,
  buildPlatformCoreContextSearchParams,
  appendPlatformCoreContextToHref,
  brandLinesheetsHrefForDemo,
  brandShowroomHrefForDemo,
  factoryHandoffQueueHrefForDemo,
  factoryMaterialsHrefForDemo,
  factoryMaterialsProcurementHrefForDemo,
  shopShowroomHrefForDemo,
} from '@/lib/platform-core-hub-matrix';

describe('platform-core-hub-matrix', () => {
  const prevCoreMode = process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;

  afterEach(() => {
    if (prevCoreMode === undefined) delete process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE;
    else process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = prevCoreMode;
  });

  it('buildPlatformCoreContextQuery returns workspace triple', () => {
    const q = buildPlatformCoreContextQuery(PLATFORM_CORE_DEMO);
    expect(q).toContain('collection=SS27');
    expect(q).toContain('orderId=B2B-DEMO-SHOP1-SS27');
    expect(q).toContain('article=demo-ss27-01');
  });

  it('buildPlatformCoreContextQuery syntha style uses overlay keys', () => {
    const q = buildPlatformCoreContextQuery(PLATFORM_CORE_DEMO, { style: 'syntha' });
    expect(q).toContain('collectionId=SS27');
    expect(q).toContain('stagesSku=demo-ss27-01');
    expect(q).toContain('orderId=B2B-DEMO-SHOP1-SS27');
  });

  it('appendPlatformCoreContextToHref merges missing keys in core mode', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const href = appendPlatformCoreContextToHref(ROUTES.brand.rangePlanner, PLATFORM_CORE_DEMO);
    expect(href).toContain('collection=SS27');
    expect(href).toContain('orderId=B2B-DEMO-SHOP1-SS27');
    expect(href).toContain('article=demo-ss27-01');
  });

  it('appendPlatformCoreContextToHref skips orderId when id is in path', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const href = appendPlatformCoreContextToHref(
      shopB2bOrderHref(PLATFORM_CORE_DEMO.demoOrderId),
      PLATFORM_CORE_DEMO
    );
    expect(href).not.toMatch(/[?&]orderId=/);
    expect(href).toContain('collection=SS27');
    expect(href).toContain('article=demo-ss27-01');
  });

  it('getHubCellActionsForDemo appends context on secondary actions in core mode', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const actions = getHubCellActionsForDemo('brand', 'development', PLATFORM_CORE_DEMO);
    expect(actions[0]?.href).not.toContain('orderId=');
    expect(actions[1]?.href).toContain('collection=SS27');
    expect(actions[1]?.href).toContain('orderId=');
    expect(actions[1]?.href).toContain('article=');
  });

  it('getRolePillarWorkspaceHref appends context in core mode', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const href = getRolePillarWorkspaceHref('brand', 'development', PLATFORM_CORE_DEMO);
    expect(href).toContain('orderId=');
    expect(href).toContain('article=');
  });

  it('resolves pillar demo entity labels without technical order ids', () => {
    expect(getPlatformCorePillarEntityLabel('collection_order')).toBe('Оптовый заказ · Весна–лето 2027');
    expect(getPlatformCorePillarEntityLabel('development')).toBe('Разработка · артикулы');
    expect(getPlatformCorePillarEntityLabel('development')).not.toContain('Весна');
    expect(getPlatformCorePillarEntityLabel('comms')).toBe('Связь · Весна–лето 2027');
    expect(getPlatformCorePillarEntityLabel('sample_collection')).toBe('Весна–лето 2027');
    expect(getPlatformCorePillarEntityLabel('collection_order')).not.toContain('B2B-DEMO');
  });

  it('demo trail covers all five pillars', () => {
    const pillarIds = new Set(PLATFORM_CORE_DEMO_TRAIL.map((t) => t.pillarId));
    expect(pillarIds.size).toBe(5);
    expect(PLATFORM_CORE_DEMO_TRAIL.some((t) => t.href.includes('B2B-DEMO'))).toBe(true);
  });

  it('resolves demo trail primary href per pillar', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(getDemoTrailPrimaryHref('development')).toContain('pillar=development');
    expect(getDemoTrailPrimaryHref('development')).toContain('collection=SS27');
    expect(getDemoTrailPrimaryHref('sample_collection')).toContain('pillar=sample_collection');
    expect(getDemoTrailPrimaryHref('collection_order')).toContain('pillar=collection_order');
    expect(getDemoTrailPrimaryHref('order_production')).toContain('order_production');
    expect(getDemoTrailPrimaryHref('comms')).toContain('pillar=comms');
  });

  it('chain strip on hub uses demo trail, with role uses workspace', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(
      getChainStripPillarHref('order_production', { primaryHref: '/fallback' })
    ).toContain('order_production');
    expect(
      getChainStripPillarHref('collection_order', {
        highlightRole: 'shop',
        primaryHref: '/fallback',
      })
    ).toContain('pillar=collection_order');
  });

  it('role pillar workspace href points to golden path screen', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(getRolePillarWorkspaceHref('brand', 'development')).toContain('pillar=development');
    expect(getRolePillarWorkspaceHref('brand', 'development')).toContain('collection=SS27');
    expect(getRolePillarWorkspaceHref('brand', 'sample_collection')).toContain(
      'pillar=sample_collection'
    );
    expect(getRolePillarWorkspaceHref('shop', 'collection_order')).toContain('pillar=collection_order');
    expect(getRoleAdjacentPillarWorkspaceHref('brand', 'development', 'next')).toContain(
      'pillar=sample_collection'
    );
  });

  it('covers four roles and five pillars', () => {
    expect(PLATFORM_CORE_HUB_ROWS).toHaveLength(4);
    expect(PLATFORM_CORE_PILLARS).toHaveLength(5);
    expect(PLATFORM_CORE_PILLARS.map((p) => p.id)).toEqual([
      'development',
      'sample_collection',
      'collection_order',
      'order_production',
      'comms',
    ]);
    for (const row of PLATFORM_CORE_HUB_ROWS) {
      for (const id of PLATFORM_CORE_PILLARS.map((p) => p.id)) {
        expect(row.pillars[id]).toBeDefined();
      }
      expect(row.pillars.comms.kind).toBe('active');
    }
  });

  it('lands each role on personal core cabinet', () => {
    expect(getPlatformCoreHubRow('brand')?.landingHref).toBe(ROUTES.brand.coreCabinet);
    expect(getPlatformCoreHubRow('shop')?.landingHref).toBe(ROUTES.shop.coreCabinet);
  });

  it('counts active and empty pillars per role', () => {
    expect(countActivePillarsForRole('brand')).toBe(5);
    expect(countEmptyPillarsForRole('brand')).toBe(0);
    expect(countActivePillarsForRole('shop')).toBe(4);
    expect(countEmptyPillarsForRole('shop')).toBe(1);
    expect(countActivePillarsForRole('manufacturer')).toBe(3);
    expect(countEmptyPillarsForRole('manufacturer')).toBe(2);
  });

  it('sample_collection active for brand and shop only', () => {
    expect(getPlatformCoreHubRow('brand')?.pillars.sample_collection.kind).toBe('active');
    expect(getPlatformCoreHubRow('shop')?.pillars.sample_collection.kind).toBe('active');
    expect(getPlatformCoreHubRow('manufacturer')?.pillars.sample_collection.kind).toBe('empty');
    expect(getPlatformCoreHubRow('supplier')?.pillars.sample_collection.kind).toBe('empty');
  });

  it('brand sample_collection links linesheets and showroom without W2 duplicate', () => {
    const brand = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === 'brand')!;
    const cell = brand.pillars.sample_collection;
    expect(cell.kind).toBe('active');
    if (cell.kind === 'active') {
      const hrefs = cell.actions.map((a) => a.href).join(' ');
      expect(cell.actions[0]?.href).toContain('linesheets');
      expect(cell.actions[0]?.href).not.toContain('workshop2');
      expect(hrefs).toContain('showroom');
      expect(hrefs).toContain('collection=SS27');
      expect(cell.actions.some((a) => /· demo|Демо-/i.test(a.label))).toBe(false);
    }
  });

  it('brand linesheets and showroom hrefs carry collection for FW27', () => {
    const fw27 = getPlatformCoreDemo('FW27');
    expect(brandLinesheetsHrefForDemo(fw27)).toContain('collection=FW27');
    expect(brandShowroomHrefForDemo(fw27)).toContain('collection=FW27');
  });

  it('navigates adjacent pillars in chain order', () => {
    expect(getAdjacentPillars('development')).toEqual({
      prev: null,
      next: 'sample_collection',
    });
    expect(getAdjacentPillars('comms')).toEqual({
      prev: 'order_production',
      next: null,
    });
    expect(getRoleAdjacentPillarHref('brand', 'sample_collection', 'next')).toBe(
      '/brand/core?pillar=collection_order'
    );
  });

  it('resolves pillar link for highlighted role', () => {
    expect(getPillarLinkForRole('shop', 'collection_order', '/fallback')).toBe(
      '/shop/core?pillar=collection_order'
    );
    expect(getPillarLinkForRole('manufacturer', 'sample_collection', '/fallback')).not.toBe(
      '/factory/production/core?pillar=sample_collection'
    );
    expect(getActivePillarIdsForRole('brand')).toHaveLength(5);
  });

  it('cabinet nav lists active pillars and peer-insight empty cells', () => {
    expect(getRoleCabinetNavPillarIds('shop', 'SS27')).toEqual([
      'development',
      'sample_collection',
      'collection_order',
      'order_production',
      'comms',
    ]);
    expect(getRoleCabinetNavPillarIds('shop', 'EMPTY27')).toEqual([
      'sample_collection',
      'collection_order',
      'order_production',
      'comms',
    ]);
    expect(getRoleCabinetNavPillarIds('manufacturer', 'SS27')).toEqual([
      'development',
      'sample_collection',
      'collection_order',
      'order_production',
      'comms',
    ]);
    expect(getRoleCabinetNavPillarIds('supplier', 'SS27')).toEqual([
      'development',
      'sample_collection',
      'collection_order',
      'order_production',
      'comms',
    ]);
    expect(getRoleCabinetNavPillarIds('brand', 'SS27')).toHaveLength(5);
    expect(isRolePillarCabinetSelectable('shop', 'development', 'SS27')).toBe(true);
    expect(isRolePillarCabinetSelectable('shop', 'development', 'EMPTY27')).toBe(false);
    expect(isRolePillarCabinetSelectable('shop', 'order_production', 'SS27')).toBe(true);
  });

  it('cross-role comms peers use merged PG order id', () => {
    const demo = mergePlatformCoreDemoWithActiveOrder(getPlatformCoreDemo('SS27'), 'B2B-90042');
    const href = getCrossRolePeerDemoHrefForDemo('brand', 'shop', 'comms', demo);
    expect(href).toContain('B2B-90042');
    expect(href).not.toContain('B2B-DEMO');
  });

  it('buildPlatformCoreContextSearchParams includes buyerId when set on demo', () => {
    const demo = mergePlatformCoreDemoWithActiveOrder(
      getPlatformCoreDemo('SS27'),
      'B2B-90042',
      'shop2'
    );
    const sp = buildPlatformCoreContextSearchParams(demo);
    expect(sp.get('buyerId')).toBe('shop2');
    expect(sp.get('orderId')).toBe('B2B-90042');
  });

  it('builds deep link to role cabinet pillar', () => {
    expect(platformCoreRolePillarHref('brand', 'collection_order')).toBe(
      '/brand/core?pillar=collection_order'
    );
    expect(platformCoreRolePillarHref('shop', 'sample_collection')).toBe(
      '/shop/core?pillar=sample_collection'
    );
  });

  it('counts active roles per pillar', () => {
    expect(countPillarActiveRoles('sample_collection')).toBe(2);
    expect(countPillarActiveRoles('collection_order')).toBe(2);
    expect(countPillarActiveRoles('order_production')).toBe(4);
    expect(countPillarActiveRoles('development')).toBe(3);
    expect(countPillarActiveRoles('comms')).toBe(4);
  });

  it('manufacturer and supplier comms use factory routes', () => {
    const manufacturer = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === 'manufacturer')!;
    const supplier = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === 'supplier')!;
    const mComms = manufacturer.pillars.comms;
    const sComms = supplier.pillars.comms;
    expect(mComms.kind).toBe('active');
    expect(sComms.kind).toBe('active');
    if (mComms.kind === 'active' && sComms.kind === 'active') {
      expect(mComms.actions).toHaveLength(3);
      expect(sComms.actions).toHaveLength(3);
      const mHref = mComms.actions.map((a) => a.href).join(' ');
      const sHref = sComms.actions.map((a) => a.href).join(' ');
      expect(mHref).toContain('/factory/messages');
      expect(mHref).not.toContain('/brand/messages');
      expect(mComms.actions.some((a) => a.href === ROUTES.factory.messages)).toBe(false);
      expect(sHref).toContain('/factory/messages');
      expect(sHref).toContain('role=supplier');
      expect(sHref).toContain('/factory/calendar');
      expect(sComms.actions.some((a) => a.label === 'Сообщения')).toBe(false);
    }
  });

  it('hides brand factory hub from manufacturer hub actions in core', () => {
    const actions = getHubCellActionsForDemo('manufacturer', 'development', PLATFORM_CORE_DEMO, {
      hideBrandFactoryHub: true,
    });
    expect(actions.some((a) => a.href.includes('/brand/factories/'))).toBe(false);
  });

  it('role pillar demo href aligns golden path per role slice', () => {
    expect(getRolePillarDemoHref('brand', 'collection_order')).toContain('B2B-DEMO-SHOP1-SS27');
    expect(getRolePillarDemoHref('shop', 'collection_order')).toContain('matrix');
    expect(getRolePillarDemoHref('shop', 'order_production')).toContain('tracking');
    expect(getRolePillarDemoHref('manufacturer', 'order_production')).toContain(
      'factory/production'
    );
    const peers = getPillarCrossRolePeers('shop', 'collection_order');
    expect(peers.find((p) => p.roleId === 'brand')?.demoHref).toContain('B2B-DEMO');
  });

  it('cross-role peers for shop order_production link brand order not handoff', () => {
    const peers = getPillarCrossRolePeers('shop', 'order_production');
    const brand = peers.find((p) => p.roleId === 'brand');
    expect(brand?.participates).toBe(true);
    expect(brand?.demoHref).toContain('B2B-DEMO');
    expect(brand?.demoHref).not.toContain('production-handoff');
  });

  it('cross-role peers for manufacturer development link brand core development not dead-end', () => {
    const peers = getPillarCrossRolePeers('manufacturer', 'development');
    const brand = peers.find((p) => p.roleId === 'brand');
    expect(brand?.participates).toBe(true);
    expect(brand?.demoHref).toContain('/brand/core');
    expect(brand?.demoHref).toContain('pillar=development');
    expect(brand?.demoHref).toContain('collection=SS27');
  });

  it('cross-role peers expose demo href for active shop in collection_order', () => {
    const peers = getPillarCrossRolePeers('brand', 'collection_order');
    const shop = peers.find((p) => p.roleId === 'shop');
    expect(shop?.participates).toBe(true);
    expect(shop?.demoHref).toContain('tracking');
  });

  it('cross-role peers for collection_order include brand and shop', () => {
    const peers = getPillarCrossRolePeers('manufacturer', 'collection_order');
    expect(peers).toHaveLength(3);
    const shop = peers.find((p) => p.roleId === 'shop');
    const brand = peers.find((p) => p.roleId === 'brand');
    expect(shop?.participates).toBe(true);
    expect(brand?.participates).toBe(true);
    expect(shop?.cabinetHref).toContain('pillar=collection_order');
    expect(shop?.demoEntityRu).toContain('Оптовый заказ');
    expect(shop?.demoEntityRu).not.toContain('B2B-DEMO');
  });

  it('brand pillars have at most three golden-path actions each', () => {
    const brand = getPlatformCoreHubRow('brand')!;
    for (const pillar of PLATFORM_CORE_PILLARS) {
      const cell = brand.pillars[pillar.id];
      if (cell.kind === 'active') {
        expect(cell.actions.length).toBeLessThanOrEqual(3);
      }
    }
  });

  it('isRolePillarActive matches hub matrix kind', () => {
    expect(isRolePillarActive('shop', 'development')).toBe(false);
    expect(isRolePillarActive('shop', 'sample_collection')).toBe(true);
    expect(isRolePillarActive('manufacturer', 'sample_collection')).toBe(false);
    expect(isRolePillarActive('supplier', 'collection_order')).toBe(false);
    expect(getActivePillarIdsForRole('shop').length).toBe(4);
    expect(getActivePillarIdsForRole('manufacturer').length).toBe(3);
    expect(getActivePillarIdsForRole('supplier').length).toBe(3);
  });

  it('shop pillars have at most three golden-path actions each', () => {
    const shop = getPlatformCoreHubRow('shop')!;
    expect(shop.pillars.development.kind).toBe('empty');
    for (const pillar of PLATFORM_CORE_PILLARS) {
      const cell = shop.pillars[pillar.id];
      if (cell.kind === 'active') {
        expect(cell.actions.length).toBeLessThanOrEqual(3);
        expect(cell.actions.some((a) => a.href === ROUTES.shop.b2bCatalog)).toBe(false);
        expect(cell.actions.some((a) => a.href === ROUTES.shop.b2bDiscover)).toBe(false);
      }
    }
  });

  it('shop development peer demo href is brand core development not factory dossier', () => {
    const peers = getPillarCrossRolePeersForDemo('shop', 'development', PLATFORM_CORE_DEMO);
    const brand = peers.find((p) => p.roleId === 'brand');
    expect(brand?.participates).toBe(true);
    expect(brand?.demoHref).toContain('/brand/core');
    expect(brand?.demoHref).toContain('collection=SS27');
    expect(brand?.demoHref).not.toContain('/factory/production/dossier/');
    const manufacturer = peers.find((p) => p.roleId === 'manufacturer');
    expect(manufacturer?.participates).toBe(true);
    expect(manufacturer?.demoHref).toContain('/factory/production/dossier/');
  });

  it('brand development has no factory hub link in matrix source', () => {
    const brand = getPlatformCoreHubRow('brand')!;
    const dev = brand.pillars.development;
    expect(dev.kind).toBe('active');
    if (dev.kind === 'active') {
      expect(dev.actions.some((a) => a.href.includes('/brand/factories/'))).toBe(false);
    }
  });

  it('brand order_production dossier links to brand core development not factory', () => {
    const brand = getPlatformCoreHubRow('brand')!;
    const cell = brand.pillars.order_production;
    expect(cell.kind).toBe('active');
    if (cell.kind === 'active') {
      const dossier = cell.actions.find((a) => a.label.startsWith('Досье'));
      expect(dossier?.href).toContain('/brand/core');
      expect(dossier?.href).toContain('pillar=development');
      expect(dossier?.href).not.toContain('/factory/production/dossier/');
    }
  });

  it('brand dossier label rewrites for FW27 demo', () => {
    const fw27 = getPlatformCoreDemo('FW27');
    const actions = getHubCellActionsForDemo('brand', 'order_production', fw27);
    const dossier = actions.find((a) => a.label.startsWith('Досье'));
    expect(dossier?.label).toBe('Досье · Осень–зима 2027');
    expect(dossier?.label).not.toContain('demo-fw27-01');
    expect(dossier?.label).not.toContain('demo-ss27-01');
  });

  it('brand comms has three golden-path actions', () => {
    const brand = getPlatformCoreHubRow('brand')!;
    const comms = brand.pillars.comms;
    expect(comms.kind).toBe('active');
    if (comms.kind === 'active') {
      expect(comms.actions).toHaveLength(3);
      expect(comms.actions.some((a) => a.label.includes('W2'))).toBe(false);
      expect(comms.actions.some((a) => /· demo|B2B demo/i.test(a.label))).toBe(false);
      expect(comms.actions[0]?.label).toContain('Чат · заказ ·');
      expect(comms.actions[0]?.label).not.toContain('B2B-DEMO');
    }
  });

  it('brand order_production dedupes to registry, handoff and dossier', () => {
    const brand = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === 'brand')!;
    const order = PLATFORM_CORE_DEMO.demoOrderId;
    const cell = brand.pillars.order_production;
    expect(cell.kind).toBe('active');
    if (cell.kind === 'active') {
      expect(cell.actions).toHaveLength(3);
      expect(cell.actions[0]?.href).toBe(brandB2bOrdersAwaitingHandoffRegistryHref());
      expect(cell.actions[0]?.label).toBe('Реестр · ожидает передачу');
      expect(cell.actions[1]?.href).toContain('production-handoff');
      expect(cell.actions[1]?.label).toBe('Передача в производство');
      expect(cell.actions[2]?.label).toMatch(/^Досье · /);
      const orderHrefCount = cell.actions.filter((a) => a.href.includes(order)).length;
      expect(orderHrefCount).toBe(1);
    }
    const collection = brand.pillars.collection_order;
    const comms = brand.pillars.comms;
    if (collection.kind === 'active') {
      expect(collection.actions.map((a) => a.href).join(' ')).toContain(order);
    }
    if (comms.kind === 'active') {
      expect(comms.actions.map((a) => a.href).join(' ')).toContain(order);
    }
  });

  it('resolves hub collection param with SS27 fallback', () => {
    expect(resolvePlatformCoreCollectionId(null)).toBe('SS27');
    expect(resolvePlatformCoreCollectionId('SS27')).toBe('SS27');
    expect(resolvePlatformCoreCollectionId('FW27')).toBe('FW27');
    expect(resolvePlatformCoreCollectionId('EMPTY27')).toBe('EMPTY27');
    expect(resolvePlatformCoreCollectionId('UNKNOWN')).toBe('SS27');
    expect(resolvePlatformCoreCollectionId('  SS27  ')).toBe('SS27');
  });

  it('EMPTY27 is empty-chain preset without B2B demo order', () => {
    const empty = getPlatformCoreDemo('EMPTY27');
    expect(isPlatformCoreEmptyChainCollection('EMPTY27')).toBe(true);
    expect(isPlatformCoreEmptyChainDemo(empty)).toBe(true);
    expect(empty.demoOrderId).toBe('__EMPTY27__');
    expect(empty.demoOrderId.startsWith('B2B-DEMO-')).toBe(false);
    const trail = buildPlatformCoreDemoTrail(empty);
    expect(trail.some((t) => t.href.includes('collection=EMPTY27'))).toBe(true);
  });

  it('builds FW27 demo trail with collection-specific hrefs', () => {
    const fw27 = getPlatformCoreDemo('FW27');
    const trail = buildPlatformCoreDemoTrail(fw27);
    expect(trail.some((t) => t.href.includes('collection=FW27'))).toBe(true);
    expect(trail.some((t) => t.href.includes('B2B-DEMO-SHOP1-FW27'))).toBe(true);
    expect(trail.some((t) => t.href.includes('demo-fw27-01'))).toBe(true);
  });

  it('rewrites matrix hrefs for FW27 cabinet actions', () => {
    const fw27 = getPlatformCoreDemo('FW27');
    const actions = getHubCellActionsForDemo('brand', 'collection_order', fw27);
    expect(actions[0]?.href).toContain('B2B-DEMO-SHOP1-FW27');
    expect(rewriteHrefForDemo('/shop/b2b/matrix?collection=SS27', fw27)).toContain(
      'collection=FW27'
    );
  });

  it('platformCoreRolePillarHref preserves collection query', () => {
    expect(platformCoreRolePillarHref('brand', 'collection_order', 'FW27')).toBe(
      '/brand/core?pillar=collection_order&collection=FW27'
    );
    expect(platformCoreRolePillarHref('brand', 'collection_order', 'SS27')).toBe(
      '/brand/core?pillar=collection_order'
    );
  });

  it('resolvePageCollectionId reads w2col and order id maps to demo', () => {
    expect(resolvePageCollectionId({ w2col: 'FW27' })).toBe('FW27');
    expect(resolvePageCollectionId({ collection: 'FW27' })).toBe('FW27');
    expect(getPlatformCoreDemoByOrderId('B2B-DEMO-SHOP1-FW27').collectionId).toBe('FW27');
  });

  it('maps platform-core B2B calendar events to StyleCalendar shape', () => {
    const mapped = mapPlatformCoreB2bEventToCalendar(
      {
        id: 'b2b-ship-order-B2B-DEMO',
        collectionId: 'SS27',
        b2bOrderId: 'B2B-DEMO',
        source: 'b2b',
        title: 'Отгрузка B2B',
        startAt: '2026-07-01T00:00:00.000Z',
        endAt: '2026-07-01T23:59:59.000Z',
        kind: 'delivery_window',
      },
      'shop'
    );
    expect(mapped.layer).toBe('logistics');
    expect(mapped.ownerRole).toBe('shop');
    expect(mapped.type).toBe('delivery');
    expect(mapped.targetChatId).toBe('w2ctx:b2b_order:B2B-DEMO');
    expect(mapped.ownerName).toContain('B2B');
  });

  it('development cross-link brand→supplier uses BOM view=development', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const href = getCrossRolePeerDemoHrefForDemo(
      'brand',
      'supplier',
      'development',
      PLATFORM_CORE_DEMO
    );
    expect(href).toContain('view=development');
    expect(href).not.toContain('view=procurement');
  });

  it('factory materials href carries collection and article context', () => {
    const href = factoryMaterialsHrefForDemo(PLATFORM_CORE_DEMO);
    expect(href).toContain('/factory/production/materials');
    expect(href).toContain('collection=SS27');
    expect(href).toContain('article=demo-ss27-01');
    const fw27 = getPlatformCoreDemo('FW27');
    expect(factoryMaterialsHrefForDemo(fw27)).toContain('article=demo-fw27-01');
  });

  it('factoryMaterialsProcurementHrefForDemo carries procurement + order context', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    const href = factoryMaterialsProcurementHrefForDemo(PLATFORM_CORE_DEMO);
    expect(href).toContain('/factory/production/materials');
    expect(href).toContain('view=procurement');
    expect(href).toContain('collection=SS27');
    expect(href).toContain('article=demo-ss27-01');
    expect(href).toContain(`order=${encodeURIComponent(PLATFORM_CORE_DEMO.demoOrderId)}`);
    expect(href).toContain(`orderId=${encodeURIComponent(PLATFORM_CORE_DEMO.demoOrderId)}`);
    expect(href).toContain(`po=${encodeURIComponent(PLATFORM_CORE_DEMO.productionOrderId)}`);
  });

  it('supplier hub actions link materials with article context', () => {
    const supplier = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === 'supplier')!;
    const dev = supplier.pillars.development;
    const prod = supplier.pillars.order_production;
    expect(dev.kind).toBe('active');
    expect(prod.kind).toBe('active');
    if (dev.kind === 'active' && prod.kind === 'active') {
      const materialsActions = dev.actions.filter((a) => a.href.includes('/factory/production/materials'));
      expect(materialsActions).toHaveLength(1);
      expect(materialsActions[0]?.href).toContain('view=development');
      expect(materialsActions[0]?.href).toContain('article=demo-ss27-01');
      expect(prod.actions.some((a) => a.href.includes('article=demo-ss27-01'))).toBe(true);
    }
  });

  it('manufacturer order_production uses human labels not raw ids', () => {
    const manufacturer = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === 'manufacturer')!;
    const cell = manufacturer.pillars.order_production;
    expect(cell.kind).toBe('active');
    if (cell.kind === 'active') {
      expect(cell.actions.some((a) => a.label === PLATFORM_CORE_DEMO.productionOrderId)).toBe(false);
      expect(cell.actions.some((a) => a.label.includes('fact-1'))).toBe(false);
      expect(cell.actions.some((a) => a.label === 'Очередь передачи в производство')).toBe(true);
    }
  });

  it('supplier development uses chat not legacy RFQ form', () => {
    const supplier = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === 'supplier')!;
    const dev = supplier.pillars.development;
    expect(dev.kind).toBe('active');
    if (dev.kind === 'active') {
      expect(dev.lead).toContain('уточнение');
      expect(dev.lead).toContain('чат');
      expect(dev.lead).not.toMatch(/RFQ, каталог/);
      const chat = dev.actions.find((a) => a.label.includes('Чат'));
      expect(chat?.href).toContain('/factory/supplier/messages');
      expect(chat?.href).toContain('contextType=workshop2_article');
      expect(dev.actions.some((a) => a.href.includes('/brand/suppliers/rfq'))).toBe(false);
    }
  });

  it('hides discover legacy hub actions in core options', () => {
    const shopSample = getHubCellActionsForDemo('shop', 'sample_collection', PLATFORM_CORE_DEMO, {
      hideDiscoverLegacy: true,
      hideCatalogLegacy: true,
    });
    expect(shopSample.some((a) => a.href.includes('/shop/b2b/discover'))).toBe(false);
    expect(shopSample.some((a) => a.href.includes('/shop/b2b/catalog'))).toBe(false);
    expect(shopSample.some((a) => a.href.includes('/shop/b2b/partners/discover'))).toBe(true);
    expect(shopSample.some((a) => a.href.includes('showroom'))).toBe(true);
    expect(shopSample.some((a) => a.label.includes('Витрина'))).toBe(true);
  });

  it('brand collection_order links registry instead of legacy pre-orders', () => {
    const brand = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === 'brand')!;
    const cell = brand.pillars.collection_order;
    expect(cell.kind).toBe('active');
    if (cell.kind === 'active') {
      expect(cell.actions.some((a) => a.href === ROUTES.brand.preOrders)).toBe(false);
      expect(cell.actions.some((a) => a.href === ROUTES.brand.b2bOrders)).toBe(true);
      expect(cell.actions.some((a) => /\(shop1\)|shop1\)/i.test(a.label))).toBe(false);
      expect(cell.actions.some((a) => /· demo|B2B demo|Демо-/i.test(a.label))).toBe(false);
      expect(cell.actions.some((a) => a.label.includes('Оптовый заказ ·'))).toBe(true);
      expect(cell.actions.every((a) => !a.label.includes('B2B-DEMO'))).toBe(true);
    }
  });

  it('hub shop order labels use collection id, not technical order id', () => {
    const fw27 = getPlatformCoreDemo('FW27');
    const actions = getHubCellActionsForDemo('shop', 'collection_order', fw27);
    const orderAction = actions.find((a) => a.label.startsWith('Заказ ·'));
    expect(orderAction?.label).toContain('FW27');
    expect(orderAction?.label).not.toContain('B2B-DEMO-SHOP1-FW27');
    expect(orderAction?.href).toContain(fw27.demoOrderId);
  });

  it('hub matrix labels avoid demo shop1 and legacy vendor names', () => {
    const forbiddenText = /· demo|B2B demo|Демо-|демо-|\(shop1\)|shop1\)|JOOR|NuOrder|RepSpark/i;
    const stripOrderIds = (text: string) =>
      Object.values(PLATFORM_CORE_DEMO_PRESETS).reduce(
        (out, preset) =>
          out
            .split(preset.demoOrderId).join('')
            .split(preset.demoArticleId).join('')
            .split(preset.productionOrderId).join(''),
        text
      );
    for (const row of PLATFORM_CORE_HUB_ROWS) {
      for (const pillar of PLATFORM_CORE_PILLARS) {
        const cell = row.pillars[pillar.id];
        if (cell.kind === 'active') {
          for (const action of cell.actions) {
            expect(stripOrderIds(action.label)).not.toMatch(forbiddenText);
          }
          expect(cell.lead).not.toMatch(forbiddenText);
          expect(cell.title).not.toMatch(forbiddenText);
        } else {
          expect(cell.reason).not.toMatch(forbiddenText);
        }
      }
    }
  });

  it('shop collection_order lead is season-neutral (matrix inside collection)', () => {
    const shop = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === 'shop')!;
    const lead = shop.pillars.collection_order;
    expect(lead.kind).toBe('active');
    if (lead.kind === 'active') {
      expect(lead.lead).not.toMatch(/SS27|FW27/);
      expect(rewriteHubTextForDemo(lead.lead, getPlatformCoreDemo('FW27'))).toBe(lead.lead);
    }
  });

  it('pillar entity label rewrites collection label for FW27', () => {
    const fw27 = getPlatformCoreDemo('FW27');
    expect(getPlatformCorePillarEntityLabel('sample_collection')).toBe('Весна–лето 2027');
    const fw27Entity = rewriteHubTextForDemo(
      getPlatformCorePillarEntityLabel('sample_collection'),
      fw27
    );
    expect(fw27Entity).toBe('Осень–зима 2027');
    expect(getPlatformCorePillarEntityLabelForDemo('sample_collection', fw27)).toBe('Осень–зима 2027');
    expect(getPlatformCorePillarEntityLabelForDemo('sample_collection', fw27)).not.toContain(
      'SS27'
    );
  });

  it('brand collection_order primary action matches getRolePillarDemoHref', () => {
    const brand = PLATFORM_CORE_HUB_ROWS.find((r) => r.id === 'brand')!;
    const cell = brand.pillars.collection_order;
    expect(cell.kind).toBe('active');
    if (cell.kind === 'active') {
      expect(cell.actions[0]?.href).toBe(getRolePillarDemoHref('brand', 'collection_order'));
    }
  });

  it('shop B2B legacy redirect messages are business RU without demo jargon', () => {
    const forbidden = /вне demo|SS27|FW27|JOOR|NuOrder|Trade shows|Social feed|demo/i;
    for (const rule of PLATFORM_CORE_SHOP_B2B_LEGACY_REDIRECTS) {
      expect(rule.messageRu).not.toMatch(forbidden);
      expect(rule.messageRu.length).toBeGreaterThan(10);
    }
  });

  it('brand B2B legacy redirect messages are business RU without demo jargon', () => {
    const forbidden =
      /вне цепочки|вне demo|PostgreSQL|\bLIVE\b|Engagement|Trade shows|Collaborative|linesheets коллекции(?!$)|showroom коллекции|demo/i;
    for (const rule of PLATFORM_CORE_BRAND_B2B_LEGACY_REDIRECTS) {
      expect(rule.messageRu).not.toMatch(forbidden);
      expect(rule.messageRu.length).toBeGreaterThan(10);
    }
  });

  it('resolves shop B2B legacy redirects to showroom or matrix', () => {
    const catalog = resolveShopB2bLegacyRedirect(ROUTES.shop.b2bCatalog, 'FW27');
    expect(catalog?.href).toBe(`${ROUTES.shop.b2bShowroom}?collection=FW27`);
    const quick = resolveShopB2bLegacyRedirect(ROUTES.shop.b2bQuickOrder, null);
    expect(quick?.href).toBe(`${ROUTES.shop.b2bMatrix}?collection=SS27`);
    expect(resolveShopB2bLegacyRedirect(ROUTES.shop.b2bShowroom, null)).toBeNull();
    const payment = resolveShopB2bLegacyRedirect(ROUTES.shop.b2bPayment, null);
    expect(payment?.href).toBe(ROUTES.shop.b2bOrders);
    expect(payment?.testId).toBe('platform-core-payment-legacy-redirect');
    const whiteboard = resolveShopB2bLegacyRedirect(ROUTES.shop.b2bWhiteboard, 'SS27');
    expect(whiteboard?.href).toBe(`${ROUTES.shop.b2bShowroom}?collection=SS27`);
    const drafts = resolveShopB2bLegacyRedirect(ROUTES.shop.b2bOrderDrafts, null);
    expect(drafts?.href).toBe(ROUTES.shop.b2bOrders);
    const templates = resolveShopB2bLegacyRedirect(ROUTES.shop.b2bOrderTemplates, 'FW27');
    expect(templates?.href).toBe(`${ROUTES.shop.b2bMatrix}?collection=FW27`);
    const social = resolveShopB2bLegacyRedirect(ROUTES.shop.b2bSocialFeed, null);
    expect(social?.href).toBe(ROUTES.shop.b2bPartnersDiscover);
    expect(social?.testId).toBe('platform-core-social-feed-legacy-redirect');
    const rep = resolveShopB2bLegacyRedirect(ROUTES.shop.b2bSalesRepPortal, 'FW27');
    expect(rep).toBeNull();
    const apply = resolveShopB2bLegacyRedirect(ROUTES.shop.b2bApply, null);
    expect(apply?.href).toBe(ROUTES.shop.b2bPartnersDiscover);
    expect(apply?.testId).toBe('platform-core-apply-legacy-redirect');
    const agent = resolveShopB2bLegacyRedirect(ROUTES.shop.b2bAgentCabinet, 'FW27');
    expect(agent?.href).toBe(`${ROUTES.shop.b2bMatrix}?collection=FW27`);
    expect(agent?.testId).toBe('platform-core-agent-cabinet-legacy-redirect');
    const vip = resolveShopB2bLegacyRedirect(ROUTES.shop.b2bVipRoomBooking, 'SS27');
    expect(vip?.testId).toBe('platform-core-vip-room-legacy-redirect');
  });

  it('calendarHrefForRole sends shop role to B2B calendar in core mode', () => {
    process.env.NEXT_PUBLIC_PLATFORM_CORE_MODE = '1';
    expect(calendarHrefForRole('shop')).toBe(ROUTES.shop.b2bCalendar);
  });

  it('demo context hrefs include collection/order/factory query params', () => {
    const demo = PLATFORM_CORE_DEMO;
    expect(shopShowroomHrefForDemo(demo)).toBe(
      `${ROUTES.shop.b2bShowroom}?collection=${encodeURIComponent(demo.collectionId)}`
    );
    expect(factoryHandoffQueueHrefForDemo(demo)).toContain(`order=${encodeURIComponent(demo.demoOrderId)}`);
    expect(factoryHandoffQueueHrefForDemo(demo)).toContain(
      `factoryId=${encodeURIComponent(demo.factoryId)}`
    );
    expect(factoryHandoffQueueHrefForDemo(demo)).toContain(
      `collection=${encodeURIComponent(demo.collectionId)}`
    );
    expect(factoryHandoffQueueHrefForDemo(demo)).toContain(`${PILLAR_CAPABILITY_FEATURE_PARAM}=handoff`);
  });
});
