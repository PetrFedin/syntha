'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { products } from '@/lib/products';
import { ArchiveRestore } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const archivedProducts = products.slice(8, 11).map((p) => ({
  ...p,
  archivedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  reason: Math.random() > 0.5 ? 'Снят с продажи' : 'Нет в наличии более 6 мес.',
}));

export default function ArchivePage() {
  const [inventory, setInventory] = useState(archivedProducts);
  const { toast } = useToast();

  const handleRestore = (productId: string) => {
    const productToRestore = inventory.find((p) => p.id === productId);
    setInventory((prev) => prev.filter((p) => p.id !== productId));
    // In a real app, you would make an API call to update the product status to 'pending'
    // and move it from the archive list to the main inventory list.
    toast({
      title: 'Товар отправлен на согласование',
      description: `Товар "${productToRestore?.name}" восстановлен из архива и ожидает подтверждения от бренда.`,
    });
  };

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-6 pb-24 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Архив товаров</CardTitle>
          <CardDescription>
            Здесь находятся товары, снятые с продажи или неактивные более 6 месяцев. Вы можете
            восстановить их в основной каталог для повторного согласования с брендом.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товар</TableHead>
                <TableHead>Артикул</TableHead>
                <TableHead>Дата архивации</TableHead>
                <TableHead>Причина</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={item.images[0].url}
                        alt={item.name}
                        width={40}
                        height={50}
                        className="rounded-md object-cover"
                      />
                      <p className="font-medium">{item.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                  <TableCell>{new Date(item.archivedDate).toLocaleDateString('ru-RU')}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.reason}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleRestore(item.id)}>
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      Восстановить
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {inventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Архив пуст.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
