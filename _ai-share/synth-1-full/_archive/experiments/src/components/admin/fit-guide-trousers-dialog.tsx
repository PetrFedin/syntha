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

interface FitGuideTrousersDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  audience?: 'women' | 'men';
}

const fitPhilosophyData = [
  {
    subcategory: 'Классические (Tailored)',
    philosophy: 'Строгий силуэт, средняя посадка',
    features: 'Ease по бёдрам 4–6 см; rise 22–24 см; прямая линия бедра',
  },
  {
    subcategory: 'Чиносы',
    philosophy: 'Универсальный smart-casual',
    features: 'Ease 6–8 см; rise 23–25 см; укороченный inseam (72–76 см)',
  },
  {
    subcategory: 'Карго / утилитарные',
    philosophy: 'Функциональный комфорт',
    features: 'Ease 8–10 см; rise 25–27 см; объёмная пройма',
  },
  {
    subcategory: 'Джоггеры / спортивные',
    philosophy: 'Relax fit, высокая талия',
    features: 'Ease 8–12 см; rise 26–28 см; длина 72–78 см',
  },
  {
    subcategory: 'Палаццо / Wide Fit',
    philosophy: 'Расклёшенный силуэт, высокая посадка',
    features: 'Ease 8–12 см; rise 27–30 см; leg opening 28–35 см',
  },
  {
    subcategory: 'Plus Size Fit',
    philosophy: 'Мягкая линия талии, удлинённый торс',
    features: 'Rise выше на +1,5–2 см; ease 10–14 см по бёдрам; ткань с эластаном 2–5%',
  },
];

const easeAllowanceData = [
  { zone: 'Талия', rtw: '2–4', plusSize: '4–8', note: 'Завышенная талия требует +2 см' },
  { zone: 'Бёдра', rtw: '4–6', plusSize: '8–12', note: 'Ключевой параметр посадки' },
  {
    zone: 'Посадка (rise)',
    rtw: '20–28',
    plusSize: '23–35',
    note: 'Mid — универсальная; high — визуально корректирует',
  },
  { zone: 'Inseam', rtw: '74–82', plusSize: '76–85', note: 'Tall range до 88 см' },
  { zone: 'Колено', rtw: '+2', plusSize: '+3', note: 'Для свободы шага' },
  {
    zone: 'Линия бёдра',
    rtw: '+1',
    plusSize: '+2',
    note: 'Особенно для плотных тканей (шерсть, костюмка)',
  },
];

const nationalFitData = [
  { system: '🇮🇹 Итальянская', characteristic: 'Узкая талия, высокий rise, чистый силуэт' },
  { system: '🇫🇷 Французская', characteristic: 'Укороченная длина, меньше ease' },
  { system: '🇬🇧 Британская', characteristic: 'Прямой крой, средний rise' },
  { system: '🇺🇸 Американская', characteristic: 'Relax fit, комфортная посадка' },
  { system: '🇷🇺 Российская', characteristic: 'Баланс EU+US: выше талия, рост 170+' },
];

const practicalCommentsData = [
  {
    indicator: 'Rise (посадка)',
    recommendation: 'Low — 19–21 см, Mid — 22–25 см, High — 26–30 см',
  },
  {
    indicator: 'Inseam (длина)',
    recommendation: 'Regular: 78–80 см, Short: 72–75 см, Long: 82–86 см',
  },
  { indicator: 'Ease по бёдрам', recommendation: 'RTW 4–6 см / Plus 8–12 см — контроль fit' },
  {
    indicator: 'Пояс и застёжка',
    recommendation: 'У Plus моделей — выше, с эластичной вставкой или shaping-поясом',
  },
  {
    indicator: 'Ткани',
    recommendation: 'Tailored — шерсть, вискоза; Relax — хлопок, лён, трикотаж с эластаном',
  },
];

const alphaScaleData = [
  { alpha: 'XXS', it: '36', ru: '38', comment: 'Низкий rise, узкий силуэт' },
  { alpha: 'XS', it: '38', ru: '40', comment: 'Slim fit, минимальный ease' },
  { alpha: 'S', it: '40', ru: '42', comment: 'Универсальный RTW' },
  { alpha: 'M', it: '42', ru: '44', comment: 'Средний комфортный fit' },
  { alpha: 'M/L', it: '44', ru: '46', comment: 'Между slim и relaxed' },
  { alpha: 'L', it: '46', ru: '48', comment: 'Комфортный крой' },
  { alpha: 'XL', it: '48', ru: '50', comment: 'Верх RTW' },
  { alpha: 'XXL', it: '50', ru: '52', comment: 'Переход к Plus' },
  { alpha: 'XL+', it: '52', ru: '54', comment: 'Curvy fit, высокая талия' },
  { alpha: 'XXL+', it: '54', ru: '56', comment: 'Полный Plus Size' },
  { alpha: '3X', it: '58', ru: '60', comment: 'Комфортная линия бедра' },
  { alpha: '4X', it: '62', ru: '64', comment: 'Extended curve' },
  { alpha: '5X', it: '66', ru: '68', comment: 'Super Plus, shaping waist' },
];

export function FitGuideTrousersDialog({
  isOpen,
  onOpenChange,
  audience = 'women',
}: FitGuideTrousersDialogProps) {
  if (audience === 'men') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Справочник по брюкам (Мужское)</DialogTitle>
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
          <DialogDescription>Женские брюки</DialogDescription>
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
            <Card>
              <CardHeader>
                <CardTitle>🔠 Буквенная шкала (Alpha) для брюк</CardTitle>
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
