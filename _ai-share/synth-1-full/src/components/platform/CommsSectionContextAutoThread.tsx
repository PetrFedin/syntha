'use client';

import { useCommsSectionContextAutoThread } from '@/hooks/use-comms-section-context-auto-thread';

type Variant = 'brand' | 'shop' | 'manufacturer' | 'supplier';

type Props = {
  variant: Variant;
  collectionId: string;
  /** Если не передан — берётся из ?order= в URL (messages/calendar deep-link). */
  orderId?: string;
  disabled?: boolean;
  readerId?: string;
};

/** При ?pillar=&section= на comms — idempotent ensure PG thread (legacy block; в minimalChrome — hook в thread strip). */
export function CommsSectionContextAutoThread({
  variant,
  collectionId,
  orderId: orderIdProp,
  disabled,
  readerId,
}: Props) {
  const row = useCommsSectionContextAutoThread({
    variant,
    collectionId,
    orderId: orderIdProp,
    disabled,
    readerId,
    enabled: !disabled,
  });

  if (!row) return null;

  return (
    <p
      className="text-text-muted rounded-md border border-sky-200/50 bg-sky-50/40 px-2 py-1.5 text-[11px]"
      data-testid="comms-section-context-auto-thread"
      data-section-id={row.sectionId}
    >
      Контекст раздела: <span className="text-text-primary font-semibold">{row.label}</span>
    </p>
  );
}
