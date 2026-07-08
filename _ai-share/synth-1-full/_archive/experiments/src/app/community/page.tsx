'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Masonry } from '@/components/ui/masonry';
import LookCard from '@/components/look-card';
import { looks } from '@/lib/looks';
import { useUIState } from '@/providers/ui-state';
import { B2BNetworkingHub } from '@/components/distributor/networking-hub';

export default function CommunityPage() {
  const { viewRole } = useUIState();

  if (viewRole === 'b2b') {
    return (
      <CabinetPageContent
        maxWidth="5xl"
        className="space-y-6 px-4 py-12 py-6 pb-16 pb-24 duration-300 animate-in fade-in sm:px-6"
      >
        <header className="mb-12 space-y-2 text-center">
          <h1 className="text-text-primary text-sm font-black uppercase tracking-tighter md:text-sm">
            B2B Networking
          </h1>
          <p className="text-text-muted mx-auto max-w-2xl text-sm font-medium italic">
            Экосистема профессиональных связей, коллабораций и обмена инсайтами индустрии.
          </p>
        </header>
        <B2BNetworkingHub />
      </CabinetPageContent>
    );
  }

  return (
    <CabinetPageContent maxWidth="5xl" className="px-4 py-6 pb-16 pb-24 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-sm font-bold md:text-sm">Лента сообщества</h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          Вдохновляйтесь образами, созданными такими же ценителями моды, как и вы.
        </p>
      </header>
      <Masonry items={looks} columnGutter={24} columnWidth={300} render={LookCard} />
    </CabinetPageContent>
  );
}
