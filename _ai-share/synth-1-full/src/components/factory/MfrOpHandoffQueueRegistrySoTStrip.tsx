'use client';

import Link from 'next/link';
import { hubGadget } from '@/components/platform/platform-core-hub-gadget-styles';

type Props = {
  registryHref: string;
};

/** Core: bulk-ack на панели очереди — реестр /orders = MES/ERP без дубля кнопки. */
export function MfrOpHandoffQueueRegistrySoTStrip({ registryHref }: Props) {
  return (
    <p className={hubGadget.muted} data-testid="mfr-op-handoff-queue-registry-sot-strip">
      Пакетная приёмка — на этой панели. MES, ERP и полный реестр —{' '}
      <Link
        href={registryHref}
        className={hubGadget.goldenLink}
        data-testid="mfr-op-handoff-queue-registry-sot-link"
      >
        производственные заказы
      </Link>{' '}
      (без дубля bulk-ack).
    </p>
  );
}
