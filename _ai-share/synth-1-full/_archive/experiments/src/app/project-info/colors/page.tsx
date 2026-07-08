'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { COLOR_PALETTE } from '@/lib/color-palette';

export default function ColorsPage() {
  return (
    <CabinetPageContent maxWidth="5xl" className="px-4 py-6 pb-16 pb-24 sm:px-6">
      <header className="mb-8">
        <h1 className="font-headline text-sm font-bold md:text-base">Палитра цветов</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Стандартная палитра цветов для модной индустрии. HEX и Pantone.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Справочник цветов</CardTitle>
          <CardDescription>
            {COLOR_PALETTE.length} цветов. Используется при создании вариантов товаров.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Образец</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="font-mono">HEX</TableHead>
                <TableHead>Pantone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COLOR_PALETTE.map((color) => (
                <TableRow key={color.hex + color.name}>
                  <TableCell>
                    <div
                      className="h-8 w-12 rounded-md border"
                      style={{ backgroundColor: color.hex }}
                      title={color.hex}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{color.name}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{color.hex}</TableCell>
                  <TableCell className="text-muted-foreground">{color.pantone || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
