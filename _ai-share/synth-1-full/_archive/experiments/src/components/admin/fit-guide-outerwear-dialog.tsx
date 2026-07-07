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

interface FitGuideOuterwearDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  audience?: 'women' | 'men';
}

const fitPhilosophyData = [
  {
    subcategory: 'Пальто (Coat)',
    philosophy: 'Женственный силуэт, ease по груди 8–12 см',
    features:
      'Важно контролировать баланс плеча и талии; для Plus Size линия плеча расширяется на +1,5–2 см',
  },
  {
    subcategory: 'Тренч (Trench)',
    philosophy: 'Приталенный силуэт, талия акцентирована',
    features: 'Ease 10 см по груди; британская посадка длиннее, итальянская — выше талии',
  },
  {
    subcategory: 'Парка (Parka)',
    philosophy: 'Relaxed fit, высокая мобильность',
    features: 'Ease 12–16 см; регулируемая талия; пройма увеличена на +2 см',
  },
  {
    subcategory: 'Пуховик (Down Coat)',
    philosophy: 'Oversized или cocoon',
    features: 'Ease до 18 см; рукав расширен; длина mid–calf в среднем 110–120 см',
  },
  {
    subcategory: 'Куртка (Jacket)',
    philosophy: 'Короткая посадка, баланс на плечах',
    features: 'Ease по груди 8–10 см; длина 55–65 см; biker — узкая талия, bomber — расширенная',
  },
  {
    subcategory: 'Жилет (Vest)',
    philosophy: 'Средняя длина, layering-friendly',
    features: 'Ease по груди 6–10 см; плечи укорочены; часто без талиевого акцента',
  },
  {
    subcategory: 'Плащ (Raincoat)',
    philosophy: 'Свободный или поясной силуэт',
    features: 'Ease по груди 10–14 см; акцент на равномерности длины и свободе проймы',
  },
];

const easeAllowanceData = [
  { zone: 'Грудь', rtw: '8–12', plusSize: '10–18', note: 'зависит от утепления и модели' },
  { zone: 'Талия', rtw: '10–14', plusSize: '12–20', note: 'oversize +4 см' },
  { zone: 'Бёдра', rtw: '10–14', plusSize: '12–22', note: 'особенно для long coat' },
  { zone: 'Плечо', rtw: '+0,5–1', plusSize: '+1–2', note: 'компенсация слоя под одеждой' },
  { zone: 'Пройма', rtw: '+1', plusSize: '+2–3', note: 'для комфорта при движении' },
  { zone: 'Рукав', rtw: '+1,5', plusSize: '+2,5', note: 'особенно при подкладке и утеплении' },
];

const nationalFitData = [
  { system: '🇮🇹 Итальянская', characteristic: 'Мягкий силуэт, высокая талия, женственная линия' },
  { system: '🇫🇷 Французская', characteristic: 'Узкие плечи, лёгкая приталенность' },
  { system: '🇬🇧 Британская', characteristic: 'Структурированный tailoring, строгая линия плеч' },
  { system: '🇺🇸 Американская', characteristic: 'Комфорт, relaxed fit, просторный рукав' },
  { system: '🇷🇺 Российская', characteristic: 'Увеличенная ширина плеч и ease под подслой' },
];

export function FitGuideOuterwearDialog({
  isOpen,
  onOpenChange,
  audience = 'women',
}: FitGuideOuterwearDialogProps) {
  if (audience === 'men') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Справочник по верхней одежде (Мужское)</DialogTitle>
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
          <DialogDescription>Женская верхняя одежда</DialogDescription>
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
                      <TableHead>Технические нюансы</TableHead>
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
