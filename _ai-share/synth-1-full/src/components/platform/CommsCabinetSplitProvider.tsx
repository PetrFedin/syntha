'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type CommsCabinetSplitContextValue = {
  selectedThreadKey: string | null;
  setSelectedThreadKey: (key: string | null) => void;
};

const CommsCabinetSplitContext = createContext<CommsCabinetSplitContextValue | null>(null);

export function CommsCabinetSplitProvider({ children }: { children: ReactNode }) {
  const [selectedThreadKey, setSelectedThreadKey] = useState<string | null>(null);
  const value = useMemo(() => ({ selectedThreadKey, setSelectedThreadKey }), [selectedThreadKey]);
  return (
    <CommsCabinetSplitContext.Provider value={value}>{children}</CommsCabinetSplitContext.Provider>
  );
}

export function useCommsCabinetSplitSelection(): CommsCabinetSplitContextValue {
  const ctx = useContext(CommsCabinetSplitContext);
  if (!ctx) {
    throw new Error('useCommsCabinetSplitSelection must be used within CommsCabinetSplitProvider');
  }
  return ctx;
}

/** Optional selection — safe outside provider (mobile-only strip). */
export function useCommsCabinetSplitSelectionOptional(): CommsCabinetSplitContextValue | null {
  return useContext(CommsCabinetSplitContext);
}
