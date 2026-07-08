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

interface FitGuideDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const fitPhilosophyData = [
  {
    subcategory: 'Мини',
    philosophy: 'Акцент на ноги, верхняя часть укорочена',
    features: 'Длина 85–90 см; ease минимальный; баланс по груди важен',
  },
  {
    subcategory: 'Миди',
    philosophy: 'Универсальный RTW стандарт',
    features: 'Длина 100–115 см; ease 6–8 см по груди; талия акцентирована',
  },
  {
    subcategory: 'Макси',
    philosophy: 'Вечерние и повседневные длинные силуэты',
    features: 'Длина 120–150 см; ease 8–12 см; часто завышенная талия',
  },
  {
    subcategory: 'Коктейльные',
    philosophy: 'Фигура «песочные часы»',
    features: 'Минимум ease; талия 4–6 см; акцент на высоту груди',
  },
  {
    subcategory: 'Вечерние (Evening)',
    philosophy: 'Драпировки, вытачки, крой по косой',
    features: 'Ease до 10 см; длина по росту +10 см; высота груди +1 см',
  },
  {
    subcategory: 'Повседневные / Casual',
    philosophy: 'Комфорт, мягкая посадка',
    features: 'Ease 6–10 см; более свободная пройма, мягкий рукав',
  },
  {
    subcategory: 'Plus Size Fit',
    philosophy: 'Комфортный торс, корректировка талии',
    features:
      'Ease 8–14 см по груди, 10–16 см по талии; талия слегка выше для визуальной пропорции',
  },
];

const easeAllowanceData = [
  { zone: 'Грудь', rtw: '6–8', plusSize: '8–14', note: 'В зависимости от ткани и модели' },
  { zone: 'Талия', rtw: '4–6', plusSize: '6–12', note: 'У вечерних платьев — минимальные' },
  { zone: 'Бёдра', rtw: '6–8', plusSize: '8–12', note: 'Макси-силуэты требуют больше ease' },
  { zone: 'Высота груди', rtw: '±0', plusSize: '+0,5–1', note: 'Увеличивается с размером' },
  { zone: 'Пройма', rtw: '+0,5', plusSize: '+1,5', note: 'Для свободы движения' },
  {
    zone: 'Длина изделия',
    rtw: '85–130',
    plusSize: '90–150',
    note: 'В зависимости от типа (mini/midi/maxi)',
  },
];

const nationalFitData = [
  { system: '🇮🇹 Итальянская', characteristic: 'Женственная линия, акцент на талию' },
  { system: '🇫🇷 Французская', characteristic: 'Укороченный торс, лёгкий акцент на груди' },
  { system: '🇬🇧 Британская', characteristic: 'Прямая талия, строгая структура' },
  { system: '🇺🇸 Американская', characteristic: 'Relaxed fit, больше ease' },
  {
    system: '🇷🇺 Российская',
    characteristic: 'Комфортный средний fit, адаптированный под рост 170+',
  },
];

const practicalCommentsData = [
  {
    indicator: 'Основная точка измерения',
    recommendation: 'По высшей точке плеча до талии и низа (передняя длина)',
  },
  { indicator: 'Ease по груди', recommendation: 'Критичен: ошибки >2 см сильно искажают силуэт' },
  {
    indicator: 'Положение талии',
    recommendation: 'Проверять по спинке — у итальянцев выше на 1,5 см',
  },
  {
    indicator: 'Plus Fit',
    recommendation: 'Сместить талию вверх на 1–2 см, добавить ease в пройме',
  },
  {
    indicator: 'Ткани',
    recommendation:
      'Тянущиеся ткани требуют минус ease (−2–3 см), неэластичные — плюс ease (+4–6 см)',
  },
];

export function FitGuideDialog({ isOpen, onOpenChange }: FitGuideDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Комментарии по лекалам и посадке</DialogTitle>
          <DialogDescription>Женские платья и сарафаны</DialogDescription>
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
