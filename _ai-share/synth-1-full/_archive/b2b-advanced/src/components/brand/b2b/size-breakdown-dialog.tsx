'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function SizeBreakdownDialog({
  isOpen,
  onOpenChange,
  item,
  onSave,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  onSave: (id: string, newSizes: any) => void;
}) {
  const [sizes, setSizes] = useState(
    (item.sizes || []).map((s: any) => ({
      name: s.name,
      quantity: Math.floor(item.orderedQuantity / (item.sizes.length || 1)),
    }))
  );

  const handleQuantityChange = (sizeName: string, quantity: number) => {
    setSizes((prevSizes: any[]) =>
      prevSizes.map((s: any) => (s.name === sizeName ? { ...s, quantity } : s))
    );
  };

  const totalQuantity = sizes.reduce((acc: number, s: any) => acc + (s.quantity || 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Разбивка по размерам</DialogTitle>
          <DialogDescription>
            {item.name} - {item.color}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Размер</TableHead>
                <TableHead className="text-right">Количество</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizes.map((s: any) => (
                <TableRow key={s.name}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="ml-auto h-8 w-24 text-right"
                      value={s.quantity}
                      onChange={(e) =>
                        handleQuantityChange(s.name, parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4 text-right font-semibold">Итого: {totalQuantity} шт.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={() => {
              onSave(item.id, sizes);
              onOpenChange(false);
            }}
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
