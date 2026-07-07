import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

/** Легаси URL `/u/offers/renewal` → канон [`ROUTES.client.profileOffersRenewal`] (`/client/me/offers/renewal`). */
export default function UOffersRenewalRedirectPage() {
  redirect(ROUTES.client.profileOffersRenewal);
}
