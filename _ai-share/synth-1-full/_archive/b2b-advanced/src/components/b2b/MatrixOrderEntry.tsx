'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/lib/types';
import { MatrixCell, calculateMatrixTotals } from '@/lib/logic/matrix-order-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useB2BState } from '@/providers/b2b-state';

interface MatrixOrderEntryProps {
  product: Product;
  onClose: () => void;
}

/**
 * MatrixOrderEntry
 * Компонент для быстрого ввода оптового заказа в формате сетки.
 */
export function MatrixOrderEntry({ product, onClose }: MatrixOrderEntryProps) {
  const { addB2bOrderItem } = useB2BState();
  const colors = useMemo(
    () => product.availableColors?.map((c) => c.name).filter(Boolean) ?? [product.color],
    [product]
  );
  const sizes = useMemo(() => product.sizes?.map((s) => s.name) ?? ['—'], [product]);

  const [cells, setCells] = useState<MatrixCell[]>([]);

  const handleQtyChange = (color: string, size: string, value: string) => {
    const qty = parseInt(value) || 0;
    setCells((prev) => {
      const filtered = prev.filter((c) => !(c.color === color && c.size === size));
      if (qty <= 0) return filtered;
      return [...filtered, { color, size, quantity: qty }];
    });
  };

  const totals = useMemo(() => calculateMatrixTotals(cells, product.price), [cells, product.price]);

  const handleAddAll = () => {
    cells.forEach((cell) => {
      addB2bOrderItem(product, cell.size, cell.quantity);
    });
    onClose();
  };

  return (
    <div className="space-y-6 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold">{product.name}</h3>
          <p className="text-sm text-muted-foreground">
            Артикул: {product.id} | Цена: {product.price.toLocaleString()} ₽
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            Итого единиц: <span className="text-primary">{totals.totalUnits}</span>
          </p>
          <p className="text-sm font-medium">
            Сумма: <span className="text-primary">{totals.totalAmount.toLocaleString()} ₽</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-32">Цвет / Размер</TableHead>
              {sizes.map((size) => (
                <TableHead key={size} className="text-center">
                  {size}
                </TableHead>
              ))}
              <TableHead className="text-right font-bold">Итого</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colors.map((color) => (
              <TableRow key={color}>
                <TableCell className="font-medium">{color}</TableCell>
                {sizes.map((size) => {
                  const cell = cells.find((c) => c.color === color && c.size === size);
                  return (
                    <TableCell key={size} className="p-1">
                      <Input
                        type="number"
                        min="0"
                        className="h-8 text-center"
                        value={cell?.quantity || ''}
                        onChange={(e) => handleQtyChange(color, size, e.target.value)}
                        placeholder="0"
                      />
                    </TableCell>
                  );
                })}
                <TableCell className="text-right font-bold text-muted-foreground">
                  {totals.byColor[color] || 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={handleAddAll} disabled={totals.totalUnits === 0}>
          Добавить в корзину ({totals.totalUnits})
        </Button>
      </div>
    </div>
  );
}
