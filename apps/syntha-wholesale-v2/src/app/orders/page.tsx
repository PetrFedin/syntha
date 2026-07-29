import type { Metadata } from 'next';

import { OrderWorkspacePage } from '@/shared/workspace/components/order-workspace-page';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Immutable submitted commercial contracts for buyers and sellers.',
};

export default function OrdersPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <OrderWorkspacePage
      sectionId="orders"
      mode="submitted"
      searchParams={searchParams}
    />
  );
}
