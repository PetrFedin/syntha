'use client';

import { usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { b2bHubTabLinks, getB2bHubTabValue } from '@/lib/data/shop-navigation';
import { PlusCircle } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export default function B2BLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const getCurrentTab = () => getB2bHubTabValue(pathname);

  const handleTabChange = (value: string) => {
    const link = b2bHubTabLinks.find((l) => l.value === value);
    if (link) {
      router.push(link.href);
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold">B2B</h2>
          <p className="text-muted-foreground">Закупки у брендов, заказы и аналитика.</p>
        </div>
        <Button asChild>
          <Link href={ROUTES.shop.b2bCreateOrder}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Новый заказ
          </Link>
        </Button>
      </header>
      <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="w-full">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="inline-flex w-auto">
            {b2bHubTabLinks.map((link: (typeof b2bHubTabLinks)[number]) => (
              <TabsTrigger key={link.value} value={link.value}>
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Tabs>
      <div>{children}</div>
    </div>
  );
}
