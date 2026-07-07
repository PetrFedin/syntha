import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

/** Легаси URL `/u/collections` → канон [`ROUTES.client.profileCollections`] (`/client/me/collections`). */
export default function UCollectionsRedirectPage() {
  redirect(ROUTES.client.profileCollections);
}
