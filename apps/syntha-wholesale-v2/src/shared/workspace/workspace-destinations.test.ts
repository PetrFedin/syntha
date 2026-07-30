import { describe, expect, it } from 'vitest';
import { getWorkspaceSectionById } from '@/shared/navigation';
import {
  getEntitySectionHref,
  isCommercialEntityType,
  resolveWorkspacePrimaryDestination,
} from '@/shared/workspace/workspace-destinations';

describe('workspace destinations', () => {
  it('maps every supported commercial entity to a valid workspace route', () => {
    expect(getEntitySectionHref('organisation')).toBe('/settings');
    expect(getEntitySectionHref('season')).toBe('/campaigns');
    expect(getEntitySectionHref('campaign')).toBe('/campaigns');
    expect(getEntitySectionHref('collection')).toBe('/collections');
    expect(getEntitySectionHref('showroom')).toBe('/showroom');
    expect(getEntitySectionHref('selection')).toBe('/selections');
    expect(getEntitySectionHref('order-draft')).toBe('/order-builder');
    expect(getEntitySectionHref('order')).toBe('/orders');
    expect(getEntitySectionHref('confirmation')).toBe('/confirmation');
    expect(getEntitySectionHref('deal')).toBe('/dealspace');
  });

  it('rejects damaged or obsolete entity types from URL context', () => {
    expect(isCommercialEntityType('order')).toBe(true);
    expect(isCommercialEntityType('legacy-order')).toBe(false);
    expect(isCommercialEntityType(undefined)).toBe(false);
  });

  it('prioritises the canonical next lifecycle stage', () => {
    const destination = resolveWorkspacePrimaryDestination(
      getWorkspaceSectionById('collections'),
      { entityType: 'order', entityId: 'order-42' },
    );

    expect(destination).toEqual({
      href: '/showroom',
      label: 'Перейти в showroom',
    });
  });

  it('returns a contextual entity route from service sections', () => {
    const destination = resolveWorkspacePrimaryDestination(
      getWorkspaceSectionById('messages'),
      { entityType: 'order', entityId: 'order-42' },
    );

    expect(destination).toEqual({
      href: '/orders',
      label: 'Вернуться к исходной сущности',
    });
  });

  it('uses safe service fallbacks when entity context is missing or invalid', () => {
    expect(resolveWorkspacePrimaryDestination(
      getWorkspaceSectionById('messages'),
      {},
    )).toEqual({ href: '/dealspace', label: 'Открыть DealSpace' });

    expect(resolveWorkspacePrimaryDestination(
      getWorkspaceSectionById('search'),
      { entityType: 'legacy-order', entityId: 'old-1' },
    )).toEqual({ href: '/collections', label: 'Открыть коллекции' });
  });

  it('does not leave the terminal lifecycle stage as a dead end', () => {
    expect(resolveWorkspacePrimaryDestination(
      getWorkspaceSectionById('dealspace'),
      {},
    )).toEqual({ href: '/confirmation', label: 'Вернуться к подтверждению' });
  });

  it('keeps dashboard-only services explicit', () => {
    expect(resolveWorkspacePrimaryDestination(
      getWorkspaceSectionById('analytics'),
      {},
    )).toEqual({ href: '/', label: 'Вернуться на dashboard' });
  });
});
