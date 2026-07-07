'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

const specs = [
  { param: 'Формат контейнера', value: 'MP4' },
  { param: 'Видеокодек', value: 'H.264 (AVC)' },
  { param: 'Аудиокодек', value: 'AAC, 48 кГц, стерео' },
  { param: 'Разрешение', value: '1080x1920 (вертикальное, 9:16)' },
  { param: 'Частота кадров (FPS)', value: '30 или 60' },
  { param: 'Битрейт видео', value: '5-8 Мбит/с' },
  { param: 'Битрейт аудио', value: '128-192 кбит/с' },
  { param: 'Профиль H.264', value: 'High' },
  { param: 'Пиксельный аспект', value: '1:1 (квадратные пиксели)' },
  { param: 'Длительность', value: '15-60 секунд' },
  { param: 'Макс. размер файла', value: '100 МБ' },
];

export default function VideoSpecsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href={ROUTES.brand.media}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-headline text-sm font-bold">Технические требования к видео</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Общие рекомендации</CardTitle>
          <CardDescription>
            Следуйте этим правилам для оптимального отображения вашего контента на платформе.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Параметр</TableHead>
                <TableHead>Рекомендуемое значение</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specs.map((spec) => (
                <TableRow key={spec.param}>
                  <TableCell className="font-medium">{spec.param}</TableCell>
                  <TableCell>{spec.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
