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
  audience?: 'women' | 'men';
}

const fitPhilosophyData = [
  {
    subcategory: 'Жакет (Blazer)',
    philosophy: 'Структурированный, подчёркивает линию плеч и талию',
    features: 'Ease по груди 4–6 см; по талии 2–4 см; спинка с вытачками; длина 60–65 см',
  },
  {
    subcategory: 'Костюм (Suit)',
    philosophy: 'Комплект жакет + брюки/юбка; классический баланс',
    features: 'Ease по груди 6–8 см; по талии 4–6 см; плечо формованное; пройма узкая',
  },
  {
    subcategory: 'Смокинг / фрак',
    philosophy: 'Вечерняя категория с акцентом на силуэт',
    features: 'Ease минимальный (4–5 см по груди); длина жакета увеличена на +5 см к RTW',
  },
  {
    subcategory: 'Блейзер оверсайз',
    philosophy: 'Современный силуэт, расслабленный fit',
    features: 'Ease 10–12 см по груди, 8 см по талии; спущенное плечо на 1,5–2 см',
  },
  {
    subcategory: 'Plus Size блейзер',
    philosophy: 'Комфортная пройма, мягкое плечо',
    features: 'Увеличена глубина проймы (+2 см); ease по груди 8–12 см; по талии 10–14 см',
  },
];

const easeAllowanceData = [
  {
    zone: 'Грудь',
    rtw: '4–6',
    plusSize: '6–10',
    note: 'Tailored fit: минимальная прибавка; oversize: до 10 см',
  },
  {
    zone: 'Талия',
    rtw: '2–4',
    plusSize: '4–8',
    note: 'Для смокингов и жакетов с поясом прибавка уменьшается',
  },
  { zone: 'Бёдра', rtw: '4–6', plusSize: '6–10', note: 'Важно для удлинённых жакетов и костюмов' },
  {
    zone: 'Плечо',
    rtw: '0,5–1',
    plusSize: '1–1,5',
    note: 'У Plus Size увеличенная посадка плеча для комфорта',
  },
  {
    zone: 'Пройма',
    rtw: '0,5',
    plusSize: '1,5–2',
    note: 'Расширенная armhole в Plus Size для движения',
  },
  { zone: 'Рукав', rtw: '+1', plusSize: '+1,5–2', note: 'На подслой (рубашку, топ)' },
];

const nationalFitData = [
  { system: '🇮🇹 Итальянская', characteristic: 'Приталенная, с акцентом на грудь и талию' },
  { system: '🇫🇷 Французская', characteristic: 'Узкие плечи, короткий торс' },
  { system: '🇬🇧 Британская', characteristic: 'Жёсткий tailoring, прямая талия' },
  { system: '🇺🇸 Американская', characteristic: 'Comfort fit, удлинённая линия' },
  { system: '🇷🇺 Российская адаптация', characteristic: 'Увеличенное плечо, средний ease' },
];

const practicalApplicationData = [
  { area: 'Закупка лекал', feature: 'Основной диапазон IT 38–54; отдельные лекала Plus 52–66' },
  {
    area: 'Size mapping e-com',
    feature: 'Сдвиг на +1 размер при конверсии IT→RU для оверсайз блейзеров',
  },
  { area: 'Фитинг', feature: 'Контроль талии и плечевой линии критичен для 70% моделей' },
  { area: 'Манекены', feature: 'Используются torso формы с точкой талии 41–42 см от плеча' },
  {
    area: 'RTW vs Tailoring',
    feature: 'Tailoring имеет меньший ease и жёсткую структуру; RTW — мягкий фит',
  },
];

export function FitGuideSuitsDialog({
  isOpen,
  onOpenChange,
  audience = 'women',
}: FitGuideDialogProps) {
  if (audience === 'men') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Справочник по костюмам (Мужское)</DialogTitle>
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
          <DialogDescription>Женские костюмы и жакеты</DialogDescription>
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
                      <TableHead>Конструктивные нюансы</TableHead>
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
                <CardTitle>🧶 Практическое применение</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Сфера</TableHead>
                      <TableHead>Особенности</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {practicalApplicationData.map((row) => (
                      <TableRow key={row.area}>
                        <TableCell className="font-medium">{row.area}</TableCell>
                        <TableCell>{row.feature}</TableCell>
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
