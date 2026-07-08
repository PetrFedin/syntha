import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Ruler, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function VendorTechPackPage({ params }: { params: { articleId: string } }) {
  // Mock data for the tech pack
  const article = {
    id: params.articleId,
    name: 'Худи Оверсайз Базовое',
    season: 'FW26',
    category: 'Толстовки',
    status: 'development',
  };

  const mockBom = [
    {
      id: '1',
      item: 'Футер 3-х нитка петля, 320г/м2, 100% хлопок',
      placement: 'Основная ткань',
      consumption: '1.2 м',
    },
    {
      id: '2',
      item: 'Кашкорсе, 95% хлопок 5% эластан',
      placement: 'Манжеты, пояс',
      consumption: '0.3 м',
    },
    { id: '3', item: 'Шнур хлопковый 8мм', placement: 'Капюшон', consumption: '1.5 м' },
    { id: '4', item: 'Люверс металлический 8мм', placement: 'Капюшон', consumption: '2 шт' },
  ];

  const mockMeasurements = [
    {
      point: 'A',
      description: 'Длина по спинке',
      s: '70',
      m: '72',
      l: '74',
      xl: '76',
      tolerance: '±1.0',
    },
    {
      point: 'B',
      description: 'Ширина на уровне груди',
      s: '58',
      m: '60',
      l: '62',
      xl: '64',
      tolerance: '±1.0',
    },
    {
      point: 'C',
      description: 'Длина рукава от горловины',
      s: '78',
      m: '80',
      l: '82',
      xl: '84',
      tolerance: '±0.5',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link
          href="/vendor"
          className="hover:bg-bg-surface2 text-text-secondary rounded-full p-2 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-text-primary text-2xl font-bold">{article.name}</h1>
            <span className="rounded border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-800">
              {article.id}
            </span>
          </div>
          <p className="text-text-secondary mt-1 text-sm">
            {article.season} • {article.category}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <strong>Режим только для чтения.</strong> Это ограниченное представление технического
          задания для поставщиков. Финансовая информация и внутренние комментарии бренда скрыты.
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="border-border-default border-b pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="text-text-muted h-4 w-4" />
                Спецификация материалов (BOM)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-bg-surface2">
                  <TableRow>
                    <TableHead className="h-9 text-xs">Материал / Фурнитура</TableHead>
                    <TableHead className="h-9 text-xs">Назначение</TableHead>
                    <TableHead className="h-9 text-right text-xs">Расход на ед.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBom.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="py-3 text-sm font-medium">{row.item}</TableCell>
                      <TableCell className="text-text-secondary py-3 text-sm">
                        {row.placement}
                      </TableCell>
                      <TableCell className="py-3 text-right text-sm">{row.consumption}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-border-default border-b pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Ruler className="text-text-muted h-4 w-4" />
                Таблица измерений (в см)
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader className="bg-bg-surface2">
                  <TableRow>
                    <TableHead className="h-9 w-12 text-center text-xs">Код</TableHead>
                    <TableHead className="h-9 text-xs">Измерение</TableHead>
                    <TableHead className="h-9 text-center text-xs">S</TableHead>
                    <TableHead className="h-9 text-center text-xs">M</TableHead>
                    <TableHead className="h-9 text-center text-xs">L</TableHead>
                    <TableHead className="h-9 text-center text-xs">XL</TableHead>
                    <TableHead className="h-9 text-right text-xs">Допуск</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMeasurements.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="bg-bg-surface2/50 py-2 text-center font-mono text-xs font-bold">
                        {row.point}
                      </TableCell>
                      <TableCell className="py-2 text-sm">{row.description}</TableCell>
                      <TableCell className="py-2 text-center text-sm">{row.s}</TableCell>
                      <TableCell className="bg-blue-50/50 py-2 text-center text-sm font-bold">
                        {row.m}
                      </TableCell>
                      <TableCell className="py-2 text-center text-sm">{row.l}</TableCell>
                      <TableCell className="py-2 text-center text-sm">{row.xl}</TableCell>
                      <TableCell className="text-text-muted py-2 text-right text-xs">
                        {row.tolerance}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-border-default border-b pb-3">
              <CardTitle className="text-base">Эскиз</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-bg-surface2 border-border-default text-text-muted flex aspect-[3/4] items-center justify-center rounded-md border text-sm">
                Технический эскиз
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
