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

interface FitGuideShirtsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  audience?: 'women' | 'men';
}

const fitPhilosophyData = [
  {
    subcategory: 'Офисные рубашки (Tailored)',
    philosophy: 'Структурированные, строгая линия плеч',
    features: 'Ease по груди 4–6 см; по талии 2–4 см; вытачки формируют приталенный силуэт',
  },
  {
    subcategory: 'Oversize / Relaxed fit',
    philosophy: 'Свободная посадка, удлинённая спинка',
    features: 'Ease 8–14 см; спущенное плечо; длина 70–80 см',
  },
  {
    subcategory: 'Casual (linen, cotton)',
    philosophy: 'Натуральные ткани, расслабленный крой',
    features: 'Ease 6–10 см; мягкая линия плеч; допускается асимметрия',
  },
  {
    subcategory: 'Шёлковые и вечерние блузы',
    philosophy: 'Мягкое драпирование, лёгкий оверсайз',
    features: 'Ease 8–12 см; узкая пройма, прибавка к длине изделия +3 см',
  },
  {
    subcategory: 'Блузы с объёмным рукавом',
    philosophy: 'Акцент на рукав и пройму',
    features: 'Обхват руки +4–6 см; ease по груди 8–10 см',
  },
  {
    subcategory: 'Plus Size Fit',
    philosophy: 'Увеличенная свобода, баланс верхней части тела',
    features: 'Ease по груди 10–14 см, талия 8–12 см; пройма +2 см; плечи шире на +1,5 см',
  },
];

const easeAllowanceData = [
  { zone: 'Грудь', rtw: '4–8', plusSize: '8–14', note: 'Ключевой параметр для комфортной посадки' },
  { zone: 'Талия', rtw: '2–6', plusSize: '6–12', note: 'В зависимости от вытачек и ткани' },
  { zone: 'Бёдра', rtw: '4–6', plusSize: '6–10', note: 'У длинных блуз допускается больший ease' },
  { zone: 'Плечо', rtw: '+0,5', plusSize: '+1–1,5', note: 'Для балансировки рукава' },
  { zone: 'Пройма', rtw: '+1', plusSize: '+2–3', note: 'Особенно важно для Plus Fit' },
  { zone: 'Обхват руки', rtw: '+2', plusSize: '+4–6', note: 'Для объёмных рукавов и слоёв' },
  { zone: 'Длина изделия', rtw: '60–75', plusSize: '65–85', note: 'Удлинённая версия для Plus' },
];

const nationalFitData = [
  { system: '🇮🇹 Итальянская', characteristic: 'Чёткая линия плеч, лёгкое приталивание' },
  { system: '🇫🇷 Французская', characteristic: 'Узкая пройма, короткий торс, мягкая ткань' },
  { system: '🇬🇧 Британская', characteristic: 'Структурированные плечи, чёткие вытачки' },
  { system: '🇺🇸 Американская', characteristic: 'Relaxed fit, комфорт, ease высокий' },
  { system: '🇷🇺 Российская адаптация', characteristic: 'Средняя свобода, баланс плеч и проймы' },
];

const practicalCommentsData = [
  {
    indicator: 'Ease по груди',
    recommendation: 'Прибавка 6–8 см — универсальный баланс между офисным и casual',
  },
  {
    indicator: 'Рукав и плечо',
    recommendation:
      'Контролировать баланс: у итальянских — узкое плечо, у французских — узкая пройма',
  },
  {
    indicator: 'Пройма',
    recommendation: 'Для Plus Size — +2–3 см по глубине; критична для комфорта',
  },
  {
    indicator: 'Талия',
    recommendation: 'У офисных моделей — вытачки, у casual — свободный силуэт',
  },
  {
    indicator: 'Ткани',
    recommendation:
      'Хлопок и лён требуют ease +2 см, шёлк и вискоза — минус ease (за счёт драпировки)',
  },
];

export function FitGuideShirtsDialog({
  isOpen,
  onOpenChange,
  audience = 'women',
}: FitGuideShirtsDialogProps) {
  if (audience === 'men') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Справочник по рубашкам (Мужское)</DialogTitle>
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
          <DialogDescription>Женские рубашки и блузы</DialogDescription>
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
