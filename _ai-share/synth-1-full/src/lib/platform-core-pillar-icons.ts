import { Factory, LayoutGrid, MessageSquare, PenLine, Table2, type LucideIcon } from 'lucide-react';
import type { CoreHubPillarId } from '@/lib/platform-core-hub-matrix';

export const PLATFORM_CORE_PILLAR_ICONS: Record<CoreHubPillarId, LucideIcon> = {
  development: PenLine,
  sample_collection: LayoutGrid,
  collection_order: Table2,
  order_production: Factory,
  comms: MessageSquare,
};
