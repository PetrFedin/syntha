import type { Metadata } from 'next';
import { InvestorBriefPageClient } from '@/components/investors/InvestorBriefPageClient';

export const metadata: Metadata = {
  title: 'Syntha — Fashion OS | Product & Investor Brief',
  description:
    'Syntha связывает Brand, Shop, Manufacturer и Supplier в сквозной Fashion OS: разработка, коллекция, заказ, производство, поставка и коммуникации.',
  robots: { index: true, follow: true },
};

export default function InvestorsPage() {
  return <InvestorBriefPageClient />;
}
