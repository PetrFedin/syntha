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

interface FitGuideLingerieDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const fitPhilosophyData = [
  {
    subcategory: 'Бюстгальтеры (Bra / Bralette)',
    philosophy: 'Анатомическая посадка по чашке',
    features:
      'Важно соответствие “обхват под грудью” и глубине чашки; допуск по эластичности 2–3 см',
  },
  {
    subcategory: 'Трусы (Brief / Bikini / Hipster)',
    philosophy: 'Локальная посадка, зависящая от формы бёдер',
    features: 'Ease 2–4 см; линия талии варьируется от low до high rise',
  },
  {
    subcategory: 'Комплекты (Sets)',
    philosophy: 'Комбинированная посадка',
    features: 'Размер базируется на груди; низ корректируется по бёдрам',
  },
  {
    subcategory: 'Shapewear / Body',
    philosophy: 'Компрессионная посадка',
    features: 'Минус ease 4–6 см по талии и бёдрам; ткань с растяжением 15–25%',
  },
  {
    subcategory: 'Домашняя одежда (пижамы, халаты)',
    philosophy: 'Свободный relaxed fit',
    features: 'Ease по груди 8–14 см, по талии 6–10 см, длина 65–120 см',
  },
  {
    subcategory: 'Plus Size Fit',
    philosophy: 'Расширенная пройма и подгрудье',
    features: 'Под грудью ease +2–3 см; мягкая линия талии; длина +3–5 см',
  },
];

const easeAllowanceData = [
  {
    zone: 'Грудь',
    rtw: '2–6',
    plusSize: '4–10',
    note: 'У shapewear может быть отрицательный ease',
  },
  { zone: 'Под грудью', rtw: '0–2', plusSize: '2–4', note: 'Эластичные ткани допускают до −1 см' },
  {
    zone: 'Талия',
    rtw: '2–6',
    plusSize: '6–10',
    note: 'Для пижам — +4 см; для белья — минус 2 см',
  },
  { zone: 'Бёдра', rtw: '4–8', plusSize: '8–12', note: 'В shapewear — до минус 6 см' },
  { zone: 'Длина изделия', rtw: '55–120', plusSize: '60–130', note: 'Халаты и пижамы длиннее RTW' },
  {
    zone: 'Пройма / грудная высота',
    rtw: '+1',
    plusSize: '+2–3',
    note: 'Комфортная посадка при движении',
  },
];

const practicalCommentsData = [
  {
    indicator: 'Грудь vs подгрудье',
    recommendation:
      'Ключевой контрольный параметр — разница 12–16 см = чашка C, 18–20 см = D, 22+ см = E',
  },
  {
    indicator: 'Эластичность ткани',
    recommendation: 'У shapewear допускается до 25% сжатия, у пижам — до 10% растяжения',
  },
  {
    indicator: 'Plus Fit',
    recommendation:
      'Бюстгальтеры: более широкие бретели и боковые панели, трусы — увеличенный rise',
  },
  {
    indicator: 'Ease по талии и бёдрам',
    recommendation: 'У shapewear — отрицательный; у пижам — положительный (6–10 см)',
  },
  {
    indicator: 'Контроль высоты груди',
    recommendation: 'При переходе 46 → 54 IT высота груди увеличивается на 1,5–2 см',
  },
];

const alphaScaleData = [
  { alpha: 'XXS', it: '36', ru: '38', comment: 'Petite, миниатюрный размер' },
  { alpha: 'XS', it: '38', ru: '40', comment: 'Slim fit, чашка A–B' },
  { alpha: 'S', it: '40', ru: '42', comment: 'RTW стандарт, чашка B–C' },
  { alpha: 'M', it: '42', ru: '44', comment: 'Универсальный комфорт' },
  { alpha: 'M/L', it: '44', ru: '46', comment: 'Между slim и relaxed' },
  { alpha: 'L', it: '46', ru: '48', comment: 'Полный RTW комфорт' },
  { alpha: 'XL', it: '48', ru: '50', comment: 'Верх RTW, чашка C–D' },
  { alpha: 'XXL', it: '50', ru: '52', comment: 'Начало Plus сегмента' },
  { alpha: 'XL+', it: '52', ru: '54', comment: 'Curvy fit, увеличенная грудь' },
  { alpha: 'XXL+', it: '54', ru: '56', comment: 'Plus fit, поддержка D–E' },
  { alpha: '3X', it: '58', ru: '60', comment: 'Full Plus, грудь E–F' },
  { alpha: '4X', it: '62', ru: '64', comment: 'Extended Plus' },
  { alpha: '5X', it: '66', ru: '68', comment: 'Maximum comfort / curve block' },
];

export function FitGuideLingerieDialog({ isOpen, onOpenChange }: FitGuideLingerieDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Комментарии по лекалам и посадке</DialogTitle>
          <DialogDescription>Женское нижнее бельё и домашняя одежда</DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 flex-1">
          <div className="space-y-4 px-6">
            <Card>
              <CardHeader>
                <CardTitle>Конструктивные различия по подкатегориям</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Подкатегория</TableHead>
                      <TableHead>Fit-философия</TableHead>
                      <TableHead>Особенности посадки</TableHead>
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
                <CardTitle>
                  🔠 Буквенная шкала (Alpha) для нижнего белья и домашней одежды
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alpha</TableHead>
                      <TableHead>IT</TableHead>
                      <TableHead>RU</TableHead>
                      <TableHead>Fit-комментарий</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alphaScaleData.map((row) => (
                      <TableRow key={row.alpha}>
                        <TableCell className="font-medium">{row.alpha}</TableCell>
                        <TableCell>{row.it}</TableCell>
                        <TableCell>{row.ru}</TableCell>
                        <TableCell className="text-muted-foreground">{row.comment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🧶 Практические комментарии</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Параметр</TableHead>
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
