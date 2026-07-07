'use client';

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
import { MoreHorizontal, PlusCircle, Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

const materials = [
  {
    id: 'mat1',
    name: 'Кашемир (смесь)',
    sku: 'MAT-CASH-01',
    type: 'Ткань',
    unit: 'м',
    stock: 150.5,
    reserved: 50,
    cost: 3500,
    supplier: 'Italian Yarns',
    status: 'В наличии',
  },
  {
    id: 'mat2',
    name: 'Пуговицы перламутровые',
    sku: 'BTN-PEARL-15',
    type: 'Фурнитура',
    unit: 'шт',
    stock: 2500,
    reserved: 800,
    cost: 50,
    supplier: 'Button Labs',
    status: 'В наличии',
  },
  {
    id: 'mat3',
    name: 'Органический хлопок',
    sku: 'MAT-COT-05',
    type: 'Ткань',
    unit: 'м',
    stock: 320,
    reserved: 0,
    cost: 1200,
    supplier: 'EcoFabrics',
    status: 'Заказано',
  },
  {
    id: 'mat4',
    name: 'Молния YKK #5',
    sku: 'ZIP-YKK-5N',
    type: 'Фурнитура',
    unit: 'шт',
    stock: 800,
    reserved: 650,
    cost: 80,
    supplier: 'YKK Group',
    status: 'В наличии',
  },
  {
    id: 'mat5',
    name: 'Шерсть мериноса',
    sku: 'MAT-MERINO-02',
    type: 'Ткань',
    unit: 'м',
    stock: 0,
    reserved: 0,
    cost: 4200,
    supplier: 'Woolmark',
    status: 'Нет в наличии',
  },
];

export default function MaterialsPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-base font-bold">Склад материалов и фурнитуры</h1>
          <p className="text-muted-foreground">
            Управляйте запасами сырья для вашего производства.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить материал
        </Button>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Материалы на складе</CardTitle>
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Поиск по названию или SKU..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>На складе</TableHead>
                <TableHead>В резерве</TableHead>
                <TableHead>Себестоимость</TableHead>
                <TableHead>Поставщик</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.stock} {item.unit}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.reserved} {item.unit}
                  </TableCell>
                  <TableCell>
                    {item.cost.toLocaleString('ru-RU')} ₽ / {item.unit}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.supplier}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'В наличии' ? 'default' : 'secondary'}>
                      {item.status}
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
                        <DropdownMenuItem>Посмотреть историю</DropdownMenuItem>
                        <DropdownMenuItem>Заказать еще</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
