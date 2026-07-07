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

interface FitGuideSkirtsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const fitPhilosophyData = [
  {
    subcategory: 'Мини',
    philosophy: 'Короткая посадка, акцент на бёдра',
    features: 'Длина 40–50 см; rise 20–22 см; ease минимальный',
  },
  {
    subcategory: 'Миди',
    philosophy: 'Универсальный RTW стандарт',
    features: 'Длина 60–75 см; rise 22–25 см; ease 4–6 см по бёдрам',
  },
  {
    subcategory: 'Макси',
    philosophy: 'Полная длина, удлинённый силуэт',
    features: 'Длина 80–95 см; ease 6–8 см; mid или high rise',
  },
  {
    subcategory: 'Карандаш (Pencil)',
    philosophy: 'Узкий крой, фигура “песочные часы”',
    features: 'Ease минимальный (2–4 см); длина до колена',
  },
  {
    subcategory: 'А-силуэт (A-Line)',
    philosophy: 'Расклёшенный низ, мягкая талия',
    features: 'Ease по талии 4–6 см, по бёдрам 6–8 см',
  },
  {
    subcategory: 'Плиссе / складки',
    philosophy: 'Объём и движение',
    features: 'Ease по талии 8–10 см, визуальное увеличение объёма на +5–10%',
  },
  {
    subcategory: 'Plus Size Fit',
    philosophy: 'Корректирующая посадка, мягкий верх',
    features: 'Талия выше на 1,5–2 см; ease 10–16 см по бёдрам, 6–10 см по талии',
  },
];

const easeAllowanceData = [
  { zone: 'Талия', rtw: '2–4', plusSize: '4–8', note: 'Зависит от типа ткани и модели' },
  { zone: 'Бёдра', rtw: '4–6', plusSize: '8–12', note: 'Ключевой параметр для fit-а' },
  {
    zone: 'Посадка (rise)',
    rtw: '19–26',
    plusSize: '22–33',
    note: 'С увеличением размера посадка выше',
  },
  { zone: 'Длина изделия', rtw: '45–90', plusSize: '50–95', note: 'Мини/миди/макси' },
  { zone: 'Пройма по бедру', rtw: '+1', plusSize: '+2', note: 'Для свободы шага и движения' },
];

const nationalFitData = [
  { system: '🇮🇹 Итальянская', characteristic: 'Узкая талия, акцент на изгиб' },
  { system: '🇫🇷 Французская', characteristic: 'Укороченный торс, маленький rise' },
  { system: '🇬🇧 Британская', characteristic: 'Прямая посадка, строгий силуэт' },
  { system: '🇺🇸 Американская', characteristic: 'Relaxed fit, комфортная талия' },
  { system: '🇷🇺 Российская', characteristic: 'Средний rise, более высокая талия' },
];

const practicalCommentsData = [
  { indicator: 'Контрольная точка', recommendation: 'Высшая точка бёдер — 20 см ниже талии' },
  { indicator: 'Ease по бёдрам', recommendation: 'Критичен: 4–6 см RTW, 8–12 см Plus' },
  { indicator: 'Талия', recommendation: 'Для Plus Fit — выше естественной линии на 1–2 см' },
  {
    indicator: 'Rise',
    recommendation: 'У французских брендов — ниже (19–21 см), у итальянских — средний (22–24 см)',
  },
  { indicator: 'Ткань', recommendation: 'Стрейч → минус ease; плотная шерсть/твид → плюс 2–3 см' },
];

export function FitGuideSkirtsDialog({ isOpen, onOpenChange }: FitGuideSkirtsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Комментарии по лекалам и посадке</DialogTitle>
          <DialogDescription>Женские юбки</DialogDescription>
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
