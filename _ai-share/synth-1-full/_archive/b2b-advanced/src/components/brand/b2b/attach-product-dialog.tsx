'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { initialOrderItems } from '@/lib/order-data';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

export function AttachProductDialog({
  isOpen,
  onOpenChange,
  onAttach,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAttach: (product: Product) => void;
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Прикрепить товар к сообщению</DialogTitle>
          <DialogDescription>Выберите товар, чтобы добавить его в обсуждение.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 pr-4">
          <div className="space-y-2">
            {initialOrderItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedProduct(item)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md border p-2 text-left hover:bg-muted',
                  selectedProduct?.id === item.id && 'ring-2 ring-primary'
                )}
              >
                {item.images && item.images.length > 0 && item.images[0].url && (
                  <Image
                    src={item.images[0].url}
                    alt={item.name}
                    width={40}
                    height={50}
                    className="rounded-sm object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            disabled={!selectedProduct}
            onClick={() => {
              if (selectedProduct) {
                onAttach(selectedProduct);
                onOpenChange(false);
              }
            }}
          >
            Прикрепить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
