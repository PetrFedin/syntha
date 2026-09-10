import type { Metadata } from 'next';
import { InvestorBriefPageClient } from '@/components/investors/InvestorBriefPageClient';
import { resolveCanonicalInvestorUrl } from '@/lib/investors/investor-brief-route';

const title = 'Syntha — Fashion OS | Обзор платформы';
const description =
  'Syntha связывает бренд, магазин, производителя и поставщика в сквозной Fashion OS: разработка, коллекция, заказ, производство, поставка и коммуникации.';

export function generateMetadata(): Metadata {
  const canonicalUrl = resolveCanonicalInvestorUrl(process.env.NEXT_PUBLIC_INVESTORS_URL, null);

  return {
    title,
    description,
    robots: canonicalUrl ? { index: true, follow: true } : { index: false, follow: true },
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl ?? undefined,
      siteName: 'Syntha',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function InvestorsPage() {
  return <InvestorBriefPageClient />;
}
