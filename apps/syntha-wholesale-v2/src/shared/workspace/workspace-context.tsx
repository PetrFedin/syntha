'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  CommercialContext,
  CommercialEntityType,
} from '@/shared/commercial-context';

export type OrganisationType = 'BRAND' | 'SHOP';

export interface WorkspaceContextData extends CommercialContext {
  readonly organisationName?: string;
  readonly organisationType?: OrganisationType;
  readonly seasonName?: string;
  readonly partnerId?: string;
  readonly currency?: string;
  readonly locale?: string;
}

export interface WorkspaceContextValue extends WorkspaceContextData {
  readonly selectOrganisation: (organisation: {
    readonly id: string;
    readonly name: string;
    readonly type: OrganisationType;
  }) => void;
  readonly selectSeason: (season: { readonly id: string; readonly name: string }) => void;
  readonly selectCampaign: (campaignId: string) => void;
  readonly selectCollection: (collectionId: string) => void;
  readonly selectShowroom: (showroomId: string) => void;
  readonly selectSelection: (selectionId: string) => void;
  readonly selectOrderDraft: (orderDraftId: string) => void;
  readonly selectOrder: (orderId: string) => void;
  readonly selectConfirmation: (confirmationId: string) => void;
  readonly selectDeal: (dealId: string) => void;
  readonly selectPartner: (partnerId?: string) => void;
  readonly setCurrency: (currency: string) => void;
  readonly setLocale: (locale: string) => void;
  readonly clearDependentContext: (from: CommercialEntityType) => void;
}

const dependencyKeys = [
  'organisationId',
  'seasonId',
  'campaignId',
  'collectionId',
  'showroomId',
  'selectionId',
  'orderDraftId',
  'orderId',
  'confirmationId',
  'dealId',
] as const satisfies readonly (keyof WorkspaceContextData)[];

const entityKey: Record<CommercialEntityType, (typeof dependencyKeys)[number]> = {
  organisation: 'organisationId',
  season: 'seasonId',
  campaign: 'campaignId',
  collection: 'collectionId',
  showroom: 'showroomId',
  selection: 'selectionId',
  'order-draft': 'orderDraftId',
  order: 'orderId',
  confirmation: 'confirmationId',
  deal: 'dealId',
};

function clearKeysAfter(
  state: WorkspaceContextData,
  key: (typeof dependencyKeys)[number],
): WorkspaceContextData {
  const next = { ...state };
  const index = dependencyKeys.indexOf(key);

  for (const dependentKey of dependencyKeys.slice(index + 1)) {
    delete next[dependentKey];
  }

  if (index < dependencyKeys.indexOf('seasonId')) delete next.seasonName;
  return next;
}

export function selectWorkspaceEntity(
  state: WorkspaceContextData,
  key: (typeof dependencyKeys)[number],
  id: string,
): WorkspaceContextData {
  const normalizedId = id.trim();
  if (!normalizedId) {
    throw new Error(`${key} cannot be empty`);
  }

  return {
    ...clearKeysAfter(state, key),
    [key]: normalizedId,
  };
}

export function clearWorkspaceDependencies(
  state: WorkspaceContextData,
  from: CommercialEntityType,
): WorkspaceContextData {
  return clearKeysAfter(state, entityKey[from]);
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceContextProvider({
  children,
  initialValue = {},
}: {
  readonly children: ReactNode;
  readonly initialValue?: WorkspaceContextData;
}) {
  const [state, setState] = useState<WorkspaceContextData>({
    currency: 'RUB',
    locale: 'ru-RU',
    ...initialValue,
  });

  const select = useCallback(
    (key: (typeof dependencyKeys)[number], id: string) => {
      setState((current) => selectWorkspaceEntity(current, key, id));
    },
    [],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      ...state,
      selectOrganisation: ({ id, name, type }) => {
        setState((current) => ({
          ...selectWorkspaceEntity(current, 'organisationId', id),
          organisationName: name,
          organisationType: type,
        }));
      },
      selectSeason: ({ id, name }) => {
        setState((current) => ({
          ...selectWorkspaceEntity(current, 'seasonId', id),
          seasonName: name,
        }));
      },
      selectCampaign: (id) => select('campaignId', id),
      selectCollection: (id) => select('collectionId', id),
      selectShowroom: (id) => select('showroomId', id),
      selectSelection: (id) => select('selectionId', id),
      selectOrderDraft: (id) => select('orderDraftId', id),
      selectOrder: (id) => select('orderId', id),
      selectConfirmation: (id) => select('confirmationId', id),
      selectDeal: (id) => select('dealId', id),
      selectPartner: (partnerId) => {
        setState((current) => ({ ...current, partnerId: partnerId?.trim() || undefined }));
      },
      setCurrency: (currency) => {
        setState((current) => ({ ...current, currency: currency.trim() || 'RUB' }));
      },
      setLocale: (locale) => {
        setState((current) => ({ ...current, locale: locale.trim() || 'ru-RU' }));
      },
      clearDependentContext: (from) => {
        setState((current) => clearWorkspaceDependencies(current, from));
      },
    }),
    [select, state],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspaceContext must be used within WorkspaceContextProvider');
  }
  return context;
}
