import type { Metadata } from 'next';

import { OrderConfirmationWorkspacePage } from '@/shared/workspace/components/order-confirmation-workspace-page';

export const metadata: Metadata = {
  title: 'Order Confirmation',
  description: 'Seller approval, amendment requests and immutable confirmed Order versions.',
};

export default function ConfirmationPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <OrderConfirmationWorkspacePage searchParams={searchParams} />;
}
