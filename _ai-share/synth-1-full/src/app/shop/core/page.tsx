import { PlatformCoreCabinetPage } from '@/components/platform/PlatformCoreCabinetPage';

export const dynamic = 'force-dynamic';

export default function ShopCoreCabinetPage() {
  return <PlatformCoreCabinetPage roleId="shop" fallbackHref="/platform" />;
}
