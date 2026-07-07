'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FitGuideTopsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  audience?: 'women' | 'men';
}

const fitPhilosophyData = [
  {
    subcategory: 'Basic (базовые футболки)',
    philosophy: 'Минимум ease, прилегающий силуэт',
    features: 'Прибавка по груди 4–6 см; длина 55–60 см; эластичные ткани',
  },
  {
    subcategory: 'Graphic / Oversize',
    philosophy: 'Свободный силуэт, удлинённая спинка',
    features: 'Ease 10–16 см; плечо спущено на 2–3 см; длина 65–75 см',
  },
  {
    subcategory: 'Polo',
    philosophy: 'Структурированный верх, умеренная приталенность',
    features: 'Ease 6–8 см; длина до бедра; воротник с планкой',
  },
  {
    subcategory: 'Майки (Tank / Ribbed)',
    philosophy: 'Минимальный ease, акцент на фигуру',
    features: 'Прибавка 2–4 см; stretch 5–10%; длина 50–55 см',
  },
  {
    subcategory: 'Кроп-топы (Crop Tops)',
    philosophy: 'Укороченный торс, плотный фит',
    features: 'Ease 0–2 см; высота до талии; ткань — эластан, рибана',
  },
  {
    subcategory: 'Plus Size Fit',
    philosophy: 'Комфортная посадка, свободное плечо',
    features: 'Ease по груди 10–14 см, по талии 8–12 см; длина увеличена на +3–5 см',
  },
];

const easeAllowanceData = [
  { zone: 'Грудь', rtw: '4–8', plusSize: '8–14', note: 'У эластичных тканей минус 2–3 см' },
  { zone: 'Талия', rtw: '2–6', plusSize: '6–10', note: 'У свободных моделей ease выше' },
  { zone: 'Бёдра', rtw: '4–6', plusSize: '6–10', note: 'Применимо к удлинённым топам' },
  { zone: 'Плечо', rtw: '+0,5', plusSize: '+1–1,5', note: 'Oversize — до +2 см' },
  {
    zone: 'Пройма',
    rtw: '+0,5',
    plusSize: '+1,5',
    note: 'У моделей с рукавом-реглан или безрукавок — var.',
  },
  {
    zone: 'Рукав / Обхват руки',
    rtw: '+1',
    plusSize: '+2–3',
    note: 'Для короткого рукава — допуск по эластичности',
  },
  {
    zone: 'Длина изделия',
    rtw: '50–70',
    plusSize: '55–80',
    note: 'Зависит от типа (basic, oversize, crop)',
  },
];

const nationalFitData = [
  { system: '🇮🇹 Итальянская', characteristic: 'Приталенный силуэт, акцент на грудь' },
  { system: '🇫🇷 Французская', characteristic: 'Укороченный торс, лёгкий оверсайз' },
  { system: '🇬🇧 Британская', characteristic: 'Прямая линия, структурированный верх' },
  { system: '🇺🇸 Американская', characteristic: 'Relaxed fit, просторная пройма' },
  { system: '🇷🇺 Российская', characteristic: 'Средняя свобода, комфорт под многослойность' },
];

const practicalCommentsData = [
  { indicator: 'Ease по груди', recommendation: 'Оптимум: RTW 6–8 см, Plus 10–14 см' },
  {
    indicator: 'Длина изделия',
    recommendation:
      'Контролировать визуальный баланс с талием и брюками — при росте 170 см идеал 60–63 см',
  },
  {
    indicator: 'Stretch',
    recommendation: 'При >8% эластана — уменьшить прибавку по груди на 2–3 см',
  },
  {
    indicator: 'Плечо и рукав',
    recommendation: 'При оверсайзе важно соблюдать баланс: спущенное плечо, но без провала в груди',
  },
  {
    indicator: 'Ткань',
    recommendation: 'Хлопок — структурный, лён — требует ease +2 см, вискоза — минус 1–2 см',
  },
];

export function FitGuideTopsDialog({
  isOpen,
  onOpenChange,
  audience = 'women',
}: FitGuideTopsDialogProps) {
  if (audience === 'men') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Справочник по футболкам и поло (Мужское)</DialogTitle>
            <DialogDescription>
              Этот раздел находится в разработке. Данные для мужских категорий будут добавлены в
              ближайшее время.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Комментарии по лекалам и посадке</DialogTitle>
          <DialogDescription>Женские топы и футболки</DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 flex-1">
          <div className="space-y-4 px-6">
            <Card>
              <CardHeader>
                <CardTitle>Fit-философия по подкатегориям</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Подкатегория</TableHead>
                      <TableHead>Fit-философия</TableHead>
                      <TableHead>Конструктивные особенности</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fitPhilosophyData.map((row) => (
                      <TableRow key={row.subcategory}>
                        <TableCell className="font-medium">{row.subcategory}</TableCell>
                        <TableCell>{row.philosophy}</TableCell>
                        <TableCell className="text-muted-foreground">{row.features}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>📏 Прибавки (Ease Allowance)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Зона</TableHead>
                      <TableHead>RTW (см)</TableHead>
                      <TableHead>Plus Size (см)</TableHead>
                      <TableHead>Примечание</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {easeAllowanceData.map((row) => (
                      <TableRow key={row.zone}>
                        <TableCell className="font-medium">{row.zone}</TableCell>
                        <TableCell>{row.rtw}</TableCell>
                        <TableCell>{row.plusSize}</TableCell>
                        <TableCell className="text-muted-foreground">{row.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🌍 Национальные различия fit-а</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Система</TableHead>
                      <TableHead>Характеристика</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nationalFitData.map((row) => (
                      <TableRow key={row.system}>
                        <TableCell className="font-medium">{row.system}</TableCell>
                        <TableCell>{row.characteristic}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🧵 Практические комментарии</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Показатель</TableHead>
                      <TableHead>Рекомендация</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {practicalCommentsData.map((row) => (
                      <TableRow key={row.indicator}>
                        <TableCell className="font-medium">{row.indicator}</TableCell>
                        <TableCell>{row.recommendation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
