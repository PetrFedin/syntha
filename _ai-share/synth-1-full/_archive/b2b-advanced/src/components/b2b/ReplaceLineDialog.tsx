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
import { Badge } from '@/components/ui/badge';
import { Replace, Package } from 'lucide-react';
import type { Product } from '@/lib/types';
import allProducts from '@/lib/products';

/** NuOrder: при отмене позиции бренд предлагает альтернативы (похожий стиль, другой цвет). */
interface ReplaceLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { id: string; name: string; category?: string; price?: number };
  onReplace: (replacementProductId: string) => void;
  onCancelLine: () => void;
}

export function ReplaceLineDialog({
  open,
  onOpenChange,
  item,
  onReplace,
  onCancelLine,
}: ReplaceLineDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const sameCategory = item.category
    ? allProducts
        .filter((p: Product) => p.category === item.category && p.id !== item.id)
        .slice(0, 4)
    : allProducts.slice(0, 4);

  const handleReplace = () => {
    if (selectedId) {
      onReplace(selectedId);
      onOpenChange(false);
    }
  };

  const handleCancelLine = () => {
    onCancelLine();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Replace className="h-5 w-5" /> Замена позиции
          </DialogTitle>
          <DialogDescription>
            Отменить стиль «{item.name}» или выбрать альтернативу из предложений.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm font-medium">Предложенные альтернативы (NuOrder)</p>
          <ul className="space-y-2">
            {sameCategory.map((p: Product) => (
              <li
                key={p.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                  selectedId === p.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border-default hover:border-border-default'
                }`}
                onClick={() => setSelectedId(p.id)}
              >
                <div className="flex items-center gap-3">
                  {p.images?.[0]?.url && (
                    <img src={p.images[0].url} alt="" className="h-12 w-12 rounded object-cover" />
                  )}
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-text-secondary text-xs">
                      {p.category} · {p.price?.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
                {selectedId === p.id && <Badge variant="default">Выбрано</Badge>}
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="border-rose-200 text-rose-600"
            onClick={handleCancelLine}
          >
            Отменить позицию
          </Button>
          <Button onClick={handleReplace} disabled={!selectedId}>
            Заменить на выбранный стиль
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
