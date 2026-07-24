import { describe, expect, it } from 'vitest';
import {
  commercialLifecycle,
  getNextWorkspaceSection,
  getPreviousWorkspaceSection,
  getWorkspaceSectionById,
  workspaceNavigation,
  workspaceSections,
} from '@/shared/navigation';

describe('workspace navigation registry', () => {
  it.each([
    ['ids', workspaceSections.map(({ id }) => id)],
    ['slugs', workspaceSections.map(({ slug }) => slug)],
    ['hrefs', workspaceSections.map(({ href }) => href)],
  ])('contains unique %s', (_label, values) => {
    expect(new Set(values).size).toBe(values.length);
  });

  it('contains valid routes and reciprocal lifecycle links', () => {
    expect(commercialLifecycle).toHaveLength(8);
    expect(commercialLifecycle[0]?.previous).toBeUndefined();
    expect(commercialLifecycle.at(-1)?.next).toBeUndefined();

    for (const section of workspaceSections) {
      expect(section.href).toMatch(/^\/[^#]+$/);
      const previous = getPreviousWorkspaceSection(section);
      const next = getNextWorkspaceSection(section);
      if (previous) expect(previous.next).toBe(section.id);
      if (next) expect(next.previous).toBe(section.id);
    }
  });

  it('walks the lifecycle once without cycles', () => {
    const visited = new Set<string>();
    let current = commercialLifecycle[0];

    while (current) {
      expect(visited.has(current.id)).toBe(false);
      visited.add(current.id);
      current = getNextWorkspaceSection(current) as typeof current;
    }

    expect(visited.size).toBe(commercialLifecycle.length);
  });

  it('keeps all navigation targets in the registry or dashboard', () => {
    for (const item of workspaceNavigation) {
      if (item.id === 'home') {
        expect(item.href).toBe('/');
      } else {
        expect(getWorkspaceSectionById(item.id).href).toBe(item.href);
      }
    }
  });
});
