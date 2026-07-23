import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import {
  clearWorkspaceDependencies,
  selectWorkspaceEntity,
  useWorkspaceContext,
  WorkspaceContextProvider,
} from '@/shared/workspace/workspace-context';

const populated = {
  organisationId: 'organisation-1',
  seasonId: 'season-1',
  campaignId: 'campaign-1',
  collectionId: 'collection-1',
  showroomId: 'showroom-1',
  selectionId: 'selection-1',
  orderDraftId: 'draft-1',
  orderId: 'order-1',
  confirmationId: 'confirmation-1',
  dealId: 'deal-1',
} as const;

describe('WorkspaceContext', () => {
  it('clears descendants and preserves parents when an entity changes', () => {
    expect(selectWorkspaceEntity(populated, 'collectionId', 'collection-2')).toEqual({
      organisationId: 'organisation-1',
      seasonId: 'season-1',
      campaignId: 'campaign-1',
      collectionId: 'collection-2',
    });
  });

  it('clears only entities below the requested boundary', () => {
    expect(clearWorkspaceDependencies(populated, 'order')).toEqual({
      organisationId: 'organisation-1',
      seasonId: 'season-1',
      campaignId: 'campaign-1',
      collectionId: 'collection-1',
      showroomId: 'showroom-1',
      selectionId: 'selection-1',
      orderDraftId: 'draft-1',
      orderId: 'order-1',
    });
  });

  it('provides explicit update methods', () => {
    const wrapper = ({ children }: { readonly children: ReactNode }) => (
      <WorkspaceContextProvider initialValue={populated}>{children}</WorkspaceContextProvider>
    );
    const { result } = renderHook(() => useWorkspaceContext(), { wrapper });

    act(() => result.current.selectCampaign('campaign-2'));
    expect(result.current.campaignId).toBe('campaign-2');
    expect(result.current.collectionId).toBeUndefined();
    expect(result.current.organisationId).toBe('organisation-1');
  });

  it('rejects use outside the provider', () => {
    expect(() => renderHook(() => useWorkspaceContext())).toThrow(
      /must be used within WorkspaceContextProvider/,
    );
  });
});
