import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

/** Легаси URL `/u/wardrobe` → канон [`ROUTES.client.profileWardrobe`] (`/client/me/wardrobe`). */
export default function UWardrobeRedirectPage() {
  redirect(ROUTES.client.profileWardrobe);
}
