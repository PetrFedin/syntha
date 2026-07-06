'use client';

import { createContext, useContext, type ReactNode } from 'react';

/** RoleCoreCabinetHub уже рендерит context bar + section nav — дочерние core-страницы без второго chrome. */
const PlatformCoreEmbeddedWorkspaceContext = createContext(false);

export function PlatformCoreEmbeddedWorkspaceProvider({
  children,
  embedded = true,
}: {
  children: ReactNode;
  embedded?: boolean;
}) {
  return (
    <PlatformCoreEmbeddedWorkspaceContext.Provider value={embedded}>
      {children}
    </PlatformCoreEmbeddedWorkspaceContext.Provider>
  );
}

export function usePlatformCoreEmbeddedWorkspace(): boolean {
  return useContext(PlatformCoreEmbeddedWorkspaceContext);
}
