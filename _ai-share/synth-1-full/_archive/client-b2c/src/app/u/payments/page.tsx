import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

/** Легаси URL `/u/payments` → канон [`ROUTES.client.profilePayments`] (`/client/me/payments`). */
export default function UPaymentsRedirectPage() {
  redirect(ROUTES.client.profilePayments);
}
