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

interface FitGuideJeansDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  audience?: 'women' | 'men';
}

const fitPhilosophyData = [
  {
    subcategory: 'Skinny / Slim Fit',
    philosophy: 'Плотная посадка, облегающий контур',
    features: 'Stretch 8–12%; прибавка по бёдрам 0–2 см; rise 20–22 см; узкий низ 14–15 см',
  },
  {
    subcategory: 'Straight / Regular Fit',
    philosophy: 'Классический крой, универсальный силуэт',
    features: 'Ease по бёдрам 4–6 см; rise 22–24 см; длина 78–80 см',
  },
  {
    subcategory: 'Wide / Flare / Bootcut',
    philosophy: 'Расклёшенный низ, комфорт в бедре',
    features: 'Ease 6–8 см; rise 24–26 см; leg opening 24–27 см',
  },
  {
    subcategory: 'Baggy / Cargo / Boyfriend',
    philosophy: 'Oversize и уличный стиль',
    features: 'Ease 8–12 см; rise 25–28 см; увеличенная пройма бедра',
  },
  {
    subcategory: 'High Waist / Mom Fit',
    philosophy: 'Завышенная талия, короткий шаг',
    features: 'Rise 26–28 см; ease 4–6 см по бёдрам; длина 75–78 см',
  },
  {
    subcategory: 'Plus Size Fit',
    philosophy: 'Комфортная талия, корректирующий силуэт',
    features: 'Талия выше на 1,5–2 см; ease 8–14 см по бёдрам; ткань с эластаном 2–4%',
  },
];

const easeAllowanceData = [
  { zone: 'Талия', rtw: '2–4', plusSize: '4–8', note: 'High waist — минус 2 см; low — плюс 2 см' },
  { zone: 'Бёдра', rtw: '4–6', plusSize: '8–12', note: 'Зависит от плотности ткани' },
  { zone: 'Посадка (rise)', rtw: '19–28', plusSize: '22–34', note: 'High waist → длиннее торс' },
  { zone: 'Inseam', rtw: '75–82', plusSize: '77–85', note: 'У tall моделей до 87–90 см' },
  { zone: 'Ширина бедра (на 20 см ниже)', rtw: '+1', plusSize: '+2', note: 'Для свободы шага' },
  {
    zone: 'Ширина низа (leg opening)',
    rtw: '14–25',
    plusSize: '16–28',
    note: 'Пропорционально fit-типу',
  },
];

const nationalFitData = [
  { system: '🇮🇹 Итальянская', characteristic: 'Узкая талия, акцент на изгибы, короткий rise' },
  { system: '🇫🇷 Французская', characteristic: 'Компактная, высокая талия, лёгкий stretch' },
  { system: '🇬🇧 Британская', characteristic: 'Прямая посадка, стабильные пропорции' },
  { system: '🇺🇸 Американская', characteristic: 'Комфорт, высокая эластичность, generous fit' },
  {
    system: '🇷🇺 Российская',
    characteristic: 'Усреднённая между EU и US, акцент на талию и рост 170+',
  },
];

const practicalCommentsData = [
  { indicator: 'Rise (посадка)', recommendation: 'Low: 19–21 см / Mid: 22–25 см / High: 26–30 см' },
  {
    indicator: 'Inseam',
    recommendation: 'Стандарт: 78–80 см, короткий: 74–76 см, длинный: 82–85 см',
  },
  {
    indicator: 'Stretch-содержание',
    recommendation: '0–2% (жёсткий деним), 3–5% (stretch), 6–10% (super skinny)',
  },
  {
    indicator: 'Fit для Plus Size',
    recommendation: 'Завышенная талия, выравнивание линии спины и живота, корректирующие швы',
  },
  {
    indicator: 'Визуальные пропорции',
    recommendation:
      'При росте 170 см идеальное соотношение: rise 24–26 см, inseam 78 см, leg opening 16–18 см',
  },
];

export function FitGuideJeansDialog({
  isOpen,
  onOpenChange,
  audience = 'women',
}: FitGuideJeansDialogProps) {
  if (audience === 'men') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Справочник по джинсам (Мужское)</DialogTitle>
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
          <DialogDescription>Женские джинсы</DialogDescription>
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
