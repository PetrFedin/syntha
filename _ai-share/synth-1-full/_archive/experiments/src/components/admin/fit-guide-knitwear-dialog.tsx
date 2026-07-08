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

interface FitGuideKnitwearDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  audience?: 'women' | 'men';
}

const fitPhilosophyData = [
  {
    subcategory: 'Свитер (Crew / V-neck)',
    philosophy: 'Классический или полуприлегающий силуэт',
    features: 'Ease по груди 6–10 см; длина 58–62 см; мягкое плечо',
  },
  {
    subcategory: 'Худи',
    philosophy: 'Oversize, увеличенный ease',
    features: 'Ease 10–16 см; плечо спущено на 2–3 см; длина 65–75 см',
  },
  {
    subcategory: 'Кардиган',
    philosophy: 'Полуоткрытый, мягкая посадка',
    features: 'Ease 8–12 см; пройма +1 см; длина 60–80 см',
  },
  {
    subcategory: 'Водолазка (Turtleneck)',
    philosophy: 'Эластичный fit, минус ease',
    features: 'Stretch 8–15%; ease 0–2 см; длина 58–60 см',
  },
  {
    subcategory: 'Plus Size Fit',
    philosophy: 'Комфортная грудь, свободное плечо',
    features: 'Ease 10–16 см; длина +3–5 см; пройма +2 см',
  },
];

const easeAllowanceData = [
  { zone: 'Грудь', rtw: '6–10', plusSize: '10–16', note: 'Определяется эластичностью ткани' },
  { zone: 'Талия', rtw: '4–8', plusSize: '8–14', note: 'Важно для вязанных моделей без вытачек' },
  { zone: 'Бёдра', rtw: '6–10', plusSize: '10–14', note: 'Особенно у длинных кардиганов' },
  { zone: 'Пройма', rtw: '+1', plusSize: '+2–3', note: 'Для комфортного движения' },
  { zone: 'Плечо', rtw: '+0,5', plusSize: '+1,5', note: 'Oversize fit — до +2,5 см' },
  {
    zone: 'Длина рукава',
    rtw: '+1',
    plusSize: '+2–3',
    note: 'Для оверсайз моделей и мягкой посадки',
  },
  { zone: 'Длина изделия', rtw: '55–70', plusSize: '60–80', note: 'Меняется по типу изделия' },
];

const nationalFitData = [
  { system: '🇮🇹 Итальянская', characteristic: 'Компактный силуэт, мягкий материал' },
  { system: '🇫🇷 Французская', characteristic: 'Cropped fit, лёгкий оверсайз' },
  { system: '🇬🇧 Британская', characteristic: 'Classic fit, структурированные вязки' },
  { system: '🇺🇸 Американская', characteristic: 'Relax fit, комфортный оверсайз' },
  { system: '🇷🇺 Российская', characteristic: 'Универсальный, с запасом по длине и пройме' },
];

const practicalCommentsData = [
  {
    indicator: 'Stretch factor',
    recommendation: '5–10% у вискозного трикотажа, до 20% у эластана',
  },
  {
    indicator: 'Ease по груди',
    recommendation: 'RTW: 6–10 см / Plus: 10–16 см — критично для драпировки',
  },
  { indicator: 'Посадка по плечу', recommendation: 'Oversize допустим до +3 см без потери формы' },
  {
    indicator: 'Длина изделия',
    recommendation: 'Контролировать по типу: водолазка 58 см, худи 70 см, кардиган 75–80 см',
  },
  {
    indicator: 'Форма рукава',
    recommendation: 'У Plus моделей — слегка расширенный низ для комфортной проймы',
  },
  {
    indicator: 'Эластичность',
    recommendation: 'Всегда учитывать % растяжения: чем больше stretch, тем меньше ease',
  },
];

const alphaScaleData = [
  { alpha: 'XXS', it: '36', ru: '38', comment: 'Компактный slim, лёгкий stretch' },
  { alpha: 'XS', it: '38', ru: '40', comment: 'Slim fit, минимальный ease' },
  { alpha: 'S', it: '40', ru: '42', comment: 'Базовый RTW fit' },
  { alpha: 'M', it: '42', ru: '44', comment: 'Универсальный комфорт' },
  { alpha: 'M/L', it: '44', ru: '46', comment: 'Свободный RTW' },
  { alpha: 'L', it: '46', ru: '48', comment: 'Relaxed fit' },
  { alpha: 'XL', it: '48', ru: '50', comment: 'Верх RTW' },
  { alpha: 'XXL', it: '50', ru: '52', comment: 'Начало Plus' },
  { alpha: 'XL+', it: '52', ru: '54', comment: 'Curvy fit' },
  { alpha: 'XXL+', it: '54', ru: '56', comment: 'Полный Plus' },
  { alpha: '3X', it: '58', ru: '60', comment: 'Свободная пройма, крупная вязка' },
  { alpha: '4X', it: '62', ru: '64', comment: 'Extended Plus' },
  { alpha: '5X', it: '66', ru: '68', comment: 'Comfort stretch block' },
];

export function FitGuideKnitwearDialog({
  isOpen,
  onOpenChange,
  audience = 'women',
}: FitGuideKnitwearDialogProps) {
  if (audience === 'men') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Справочник по трикотажу (Мужское)</DialogTitle>
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
          <DialogDescription>Женский трикотаж</DialogDescription>
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
                <CardTitle>🔠 Буквенная шкала (Alpha) для трикотажа</CardTitle>
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
