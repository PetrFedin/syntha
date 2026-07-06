import {
  buildCommsGroupsNavHref,
  buildCommsSectionGroupMessagesHref,
  buildCommsSectionGroupsForRole,
  buildOrderSectionCommsMessagesHref,
  inferCommsSectionPillarId,
} from '@/lib/platform-core-comms-section-groups';

describe('platform-core-comms-section-groups', () => {
  it('brand: includes collection_order and comms sections, excludes section-groups meta', () => {
    const groups = buildCommsSectionGroupsForRole('brand');
    expect(groups.length).toBeGreaterThan(10);
    expect(groups.some((g) => g.sectionId === 'brand-co-registry')).toBe(true);
    expect(groups.some((g) => g.sectionId === 'brand-cm-order-chat')).toBe(true);
    expect(groups.some((g) => g.sectionId === 'brand-cm-section-groups')).toBe(false);
  });

  it('shop: includes buyer-tracking section group', () => {
    const groups = buildCommsSectionGroupsForRole('shop');
    expect(groups.some((g) => g.sectionId === 'shop-co-buyer-tracking')).toBe(true);
    expect(groups.some((g) => g.pillarId === 'collection_order')).toBe(true);
  });

  it('buildCommsSectionGroupMessagesHref adds pillar and section query', () => {
    const href = buildCommsSectionGroupMessagesHref({
      roleId: 'brand',
      orderId: 'B2B-42',
      collectionId: 'SS27',
      pillarId: 'collection_order',
      sectionId: 'brand-co-registry',
    });
    expect(href).toContain('pillar=collection_order');
    expect(href).toContain('section=brand-co-registry');
    expect(href).toContain('B2B-42');
    expect(href).toContain('collection=SS27');
  });

  it('inferCommsSectionPillarId maps audit section prefixes', () => {
    expect(inferCommsSectionPillarId('brand-co-detail')).toBe('collection_order');
    expect(inferCommsSectionPillarId('shop-co-buyer-tracking')).toBe('collection_order');
    expect(inferCommsSectionPillarId('brand-op-handoff')).toBe('order_production');
    expect(inferCommsSectionPillarId('brand-sc-linesheets')).toBe('sample_collection');
  });

  it('buildOrderSectionCommsMessagesHref infers pillar from section id', () => {
    const href = buildOrderSectionCommsMessagesHref({
      roleId: 'brand',
      orderId: 'B2B-99',
      collectionId: 'SS27',
      sectionId: 'brand-co-detail',
    });
    expect(href).toContain('pillar=collection_order');
    expect(href).toContain('section=brand-co-detail');
  });

  it('buildCommsGroupsNavHref uses first section group', () => {
    const groups = buildCommsSectionGroupsForRole('brand');
    const href = buildCommsGroupsNavHref({
      roleId: 'brand',
      orderId: 'B2B-42',
      collectionId: 'SS27',
    });
    expect(href).toContain('B2B-42');
    expect(href).toContain(`section=${groups[0]!.sectionId}`);
    expect(href).toContain(`pillar=${groups[0]!.pillarId}`);
  });

  it('buildOrderSectionCommsMessagesHref for manufacturer and supplier op sections', () => {
    const mfr = buildOrderSectionCommsMessagesHref({
      roleId: 'manufacturer',
      orderId: 'B2B-42',
      collectionId: 'SS27',
      sectionId: 'mfr-op-dossier',
      pillarId: 'order_production',
    });
    expect(mfr).toContain('/factory/messages');
    expect(mfr).toContain('section=mfr-op-dossier');

    const sup = buildOrderSectionCommsMessagesHref({
      roleId: 'supplier',
      orderId: 'B2B-42',
      collectionId: 'SS27',
      sectionId: 'sup-op-procurement',
      pillarId: 'order_production',
    });
    expect(sup).toContain('section=sup-op-procurement');
  });
});
