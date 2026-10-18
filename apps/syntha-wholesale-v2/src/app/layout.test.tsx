import {
  Children,
  isValidElement,
  Suspense,
  type ElementType,
  type ReactNode,
} from 'react';
import { describe, expect, it } from 'vitest';
import RootLayout from '@/app/layout';
import { WorkspaceShell } from '@/shared/workspace/workspace-shell';

function countElementsByType(node: ReactNode, type: ElementType): number {
  if (!isValidElement<{ readonly children?: ReactNode }>(node)) return 0;
  const ownCount = node.type === type ? 1 : 0;
  return ownCount + Children.toArray(node.props.children)
    .reduce<number>((count, child) => count + countElementsByType(child, type), 0);
}

describe('RootLayout', () => {
  it('always owns exactly one workspace shell without a shell-level Suspense fallback', () => {
    const layout = RootLayout({
      children: <main><h1>Section content</h1></main>,
    });

    expect(countElementsByType(layout, WorkspaceShell)).toBe(1);
    expect(countElementsByType(layout, Suspense)).toBe(0);
  });
});
