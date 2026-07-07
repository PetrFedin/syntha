import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

/** Legacy orphan — canonical supplier circular hub under factory ACL. */
export default function SupplierCircularHubLegacyRedirect() {
  redirect(ROUTES.factory.supplierCircularHub);
}
