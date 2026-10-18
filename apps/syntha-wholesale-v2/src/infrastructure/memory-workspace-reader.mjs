import { invariant } from '../core/errors.mjs';
import { CAPABILITIES, membershipHasCapability } from '../modules/access-control/public.mjs';

export function createMemoryWorkspaceReader({ store, catalogStore, productSpecificationStore, measurementStore } = {}) {
  invariant(store && typeof store.snapshot === 'function', 'WORKSPACE_SOURCE_STORE_REQUIRED', 'Workspace source store is required');
  return Object.freeze({ async readForActor(actorId) {
    const source = await store.snapshot();
    const catalogSource = catalogStore && typeof catalogStore.snapshot === 'function' ? await catalogStore.snapshot() : { skus: [] };
    const specificationSource = productSpecificationStore && typeof productSpecificationStore.snapshot === 'function' ? await productSpecificationStore.snapshot() : { materials: [], materialRevisions: [], boms: [] };
    const measurementSource = measurementStore && typeof measurementStore.snapshot === 'function' ? await measurementStore.snapshot() : { measurementCharts: [], fitSamples: [], techPacks: [] };
    const memberships = array(source.memberships).filter((item) => item.userId === actorId && item.status === 'active');
    const ownIds = new Set(memberships.map((item) => item.organisationId));
    const ownBrandIds = new Set(memberships.filter((item) => item.organisationType === 'brand').map((item) => item.organisationId));
    const specificationBrandIds = new Set(memberships.filter((item) => item.organisationType === 'brand' && membershipHasCapability(item, CAPABILITIES.PRODUCT_SPECIFICATION_READ)).map((item) => item.organisationId));
    const technicalBrandIds = new Set(memberships.filter((item) => item.organisationType === 'brand' && membershipHasCapability(item, CAPABILITIES.TECHNICAL_DEVELOPMENT_READ)).map((item) => item.organisationId));
    const relationships = array(source.relationships).filter((item) => ownIds.has(item.brandId) || ownIds.has(item.shopId));
    const visibleOrgIds = new Set(ownIds); for (const item of relationships) { visibleOrgIds.add(item.brandId); visibleOrgIds.add(item.shopId); }
    const invitations = array(source.showroomInvitations).filter((item) => ownIds.has(item.brandId) || ownIds.has(item.shopId));
    const cycles = array(source.cycles).filter((item) => ownIds.has(item.brandId) || ownIds.has(item.shopId));
    const selections = array(source.selections).filter((item) => ownIds.has(item.brandId) || ownIds.has(item.shopId));
    const orders = array(source.orders).filter((item) => ownIds.has(item.brandId) || ownIds.has(item.shopId));
    const deals = array(source.deals).filter((item) => ownIds.has(item.brandId) || ownIds.has(item.shopId));
    const campaignIds = new Set(cycles.map((item) => item.campaignId)); const collectionIds = new Set(cycles.map((item) => item.collectionId));
    const showroomIds = new Set([...invitations.map((item) => item.showroomId), ...selections.map((item) => item.showroomId)]);
    const showrooms = array(source.showrooms).filter((item) => showroomIds.has(item.id) || ownIds.has(item.brandId)); for (const showroom of showrooms) collectionIds.add(showroom.collectionId);
    const styles = array(source.styles).filter((item) => ownBrandIds.has(item.brandId) || (item.status === 'approved' && collectionIds.has(item.collectionId)));
    const visibleSizeGridIds = new Set(styles.map((item) => item.sizeGrid?.id).filter(Boolean));
    const sizeGrids = array(source.sizeGrids).filter((item) => ownBrandIds.has(item.brandId) || (item.status === 'published' && visibleSizeGridIds.has(item.id)));
    return { memberships, organisations: array(source.organisations).filter((item) => visibleOrgIds.has(item.id)), relationships, invitations, campaigns: array(source.campaigns).filter((item) => campaignIds.has(item.id) || ownIds.has(item.brandId)), collections: array(source.collections).filter((item) => collectionIds.has(item.id) || ownIds.has(item.brandId)), sizeGrids, styles, materials: array(specificationSource.materials).filter((item) => specificationBrandIds.has(item.brandId)), materialRevisions: array(specificationSource.materialRevisions).filter((item) => specificationBrandIds.has(item.brandId)), boms: array(specificationSource.boms).filter((item) => specificationBrandIds.has(item.brandId)), measurementCharts: array(measurementSource.measurementCharts).filter((item) => technicalBrandIds.has(item.brandId)), fitSamples: array(measurementSource.fitSamples).filter((item) => technicalBrandIds.has(item.brandId)), techPacks: array(measurementSource.techPacks).filter((item) => technicalBrandIds.has(item.brandId)), catalogSkus: array(catalogSource.skus).filter((item) => ownBrandIds.has(item.brandId) || (item.status === 'published' && collectionIds.has(item.collectionId))), showrooms, cycles, selections, orders, deals, calendar: array(source.calendar).filter((item) => ownIds.has(item.ownerOrganisationId)) };
  } });
}
function array(value) { return Array.isArray(value) ? value : []; }
