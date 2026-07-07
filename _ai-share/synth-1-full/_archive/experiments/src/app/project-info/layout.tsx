import type { ReactNode } from 'react';
import { CategoryCatalogCheckProvider } from '@/components/project-info/CategoryCatalogCheckContext';

export default function ProjectInfoLayout({ children }: { children: ReactNode }) {
  return <CategoryCatalogCheckProvider>{children}</CategoryCatalogCheckProvider>;
}
