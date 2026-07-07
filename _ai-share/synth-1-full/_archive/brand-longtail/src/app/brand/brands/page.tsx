'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { brands } from '@/lib/placeholder-data';
import { products } from '@/lib/products';
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
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { RegistryPageHeader } from '@/components/design-system';

export default function BrandsDirectoryPage() {
  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-4 pb-16">
      <RegistryPageHeader
        title="Справочник брендов"
        leadPlain="Управление всеми брендами, представленными на платформе."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить бренд
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Все бренды</CardTitle>
          <CardDescription>На платформе зарегистрировано {brands.length} брендов.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Бренд</TableHead>
                <TableHead>Подписчики</TableHead>
                <TableHead>Товары</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => {
                const productCount = products.filter((p) => p.brand === brand.name).length;
                return (
                  <TableRow key={brand.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-md border p-1">
                          <Image
                            src={brand.logo.url}
                            alt={brand.logo.alt}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span className="font-medium">{brand.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{brand.followers.toLocaleString('ru-RU')}</TableCell>
                    <TableCell>{productCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-green-400 text-green-600">
                        Активен
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Редактировать</DropdownMenuItem>
                          <DropdownMenuItem>Деактивировать</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Удалить</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
