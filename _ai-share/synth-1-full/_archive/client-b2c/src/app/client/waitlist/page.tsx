'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import { products } from '@/lib/products';
import {
  loadWaitlist,
  removeFromWaitlist,
  type WaitlistEntryV1,
} from '@/lib/fashion/waitlist-store';
import { Trash2, ShoppingBag } from 'lucide-react';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';
import { useToast } from '@/hooks/use-toast';
import { CabinetPageContent } from '@/components/layout/cabinet-page-content';

export default function WaitlistPage() {
  const { toast } = useToast();
  const [list, setList] = useState<WaitlistEntryV1[]>([]);

  useEffect(() => {
    setList(loadWaitlist());
  }, []);

  const handleRemove = (sku: string, size: string) => {
    const next = removeFromWaitlist(sku, size);
    setList(next);
    toast({ title: 'Удалено из списка' });
  };

  return (
    <CabinetPageContent maxWidth="4xl">
      <ClientCabinetSectionHeader />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ваш список</CardTitle>
          <CardDescription>
            {list.length === 0 ? 'Список пуст' : `Ждем ${list.length} позиций`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {list.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-muted-foreground opacity-20" />
              <p className="text-sm text-muted-foreground">
                Пока ничего не добавлено. На странице товара с отсутствующим размером нажмите
                «Узнать о наличии».
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {list.map((item) => {
                const p = products.find((x) => x.sku === item.sku);
                return (
                  <div
                    key={`${item.sku}-${item.size}`}
                    className="flex items-center gap-4 rounded-lg border p-3"
                  >
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded border">
                      {p?.images[0] && (
                        <Image
                          src={p.images[0].url}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          Размер: {item.size}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Добавлено {new Date(item.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(item.sku, item.size)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
