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

interface FitGuideBeachwearDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const fitPhilosophyData = [
  {
    subcategory: 'Купальники (One-piece)',
    philosophy: 'Комфорт + поддержка груди',
    features: 'Компрессионный материал; грудная зона с формованной вставкой; подгрудная резинка',
  },
  {
    subcategory: 'Бикини / Танккини',
    philosophy: 'Раздельный fit по зонам',
    features: 'Верх — по обхвату груди, низ — по бёдрам и rise; stretch 15–25%',
  },
  {
    subcategory: 'Плавки / Шорты',
    philosophy: 'Функциональный низ',
    features: 'Высота посадки варьируется: low 17–19 см, high 22–25 см',
  },
  {
    subcategory: 'Пляжные платья / Туники',
    philosophy: 'Relaxed fit',
    features: 'Ease по груди 10–18 см; длина 80–120 см',
  },
  {
    subcategory: 'Парео / Сарафаны',
    philosophy: 'Свободная драпировка',
    features: 'Безразмерная, регулируемая посадка',
  },
  {
    subcategory: 'Plus Size Fit',
    philosophy: 'Расширенная зона груди и талии',
    features: 'Высокий rise; более плотная ткань; удлинённая линия торса',
  },
];

const easeAllowanceData = [
  {
    zone: 'Грудь',
    rtw: '0–4',
    plusSize: '4–8',
    note: 'В купальниках компрессионный эффект, допускается отрицательный ease',
  },
  { zone: 'Под грудью', rtw: '0–2', plusSize: '2–4', note: 'Поддержка без стягивания' },
  { zone: 'Талия', rtw: '2–6', plusSize: '6–10', note: 'У shapewear-купальников — минус 2–4 см' },
  { zone: 'Бёдра', rtw: '2–6', plusSize: '6–12', note: 'По типу посадки (classic / high cut)' },
  {
    zone: 'Высота бедра',
    rtw: '20–35',
    plusSize: '25–38',
    note: 'Чем выше cut, тем визуально стройнее силуэт',
  },
  { zone: 'Rise', rtw: '17–25', plusSize: '20–30', note: 'Влияет на фиксацию по талии' },
  {
    zone: 'Длина туники / платья',
    rtw: '80–120',
    plusSize: '90–130',
    note: 'У Plus выше ease и драпировка по бокам',
  },
];

const rtwVsPlusData = [
  { parameter: 'Грудь', rtw: 'Чашка B–C', plusSize: 'Чашка D–F' },
  { parameter: 'Rise', rtw: 'Средний', plusSize: 'Высокий' },
  { parameter: 'Высота бедра', rtw: 'Средняя', plusSize: 'Ниже, с плавным контуром' },
  { parameter: 'Компрессия', rtw: 'Средняя (−2 см)', plusSize: 'Повышенная (−4 см)' },
  { parameter: 'Ткань', rtw: '180–200 г/м²', plusSize: '220–260 г/м²' },
  { parameter: 'Ease', rtw: '2–6 см', plusSize: '6–12 см' },
  { parameter: 'Линия торса', rtw: 'Стандарт', plusSize: 'Удлинённая' },
];

const practicalCommentsData = [
  {
    indicator: 'Stretch ткани (купальный полиамид/спандекс)',
    recommendation: '20–35% — оптимум для RTW; 25–40% — для Plus',
  },
  { indicator: 'Компрессия', recommendation: 'В области живота и груди: −2…−4 см' },
  { indicator: 'Rise (посадка)', recommendation: 'Low 17–19 см / Medium 20–23 / High 24–30' },
  {
    indicator: 'Поддержка груди',
    recommendation: 'Встроенные чашки или резинка; у Plus — усиленные боковые панели',
  },
  {
    indicator: 'Высота бедра (high cut)',
    recommendation: 'Повышает визуальное удлинение ног на 2–3 см пропорционально росту',
  },
  { indicator: 'Ease по талии', recommendation: 'У shapewear моделей — отрицательный (−2…−6 см)' },
  {
    indicator: 'Ease по бёдрам',
    recommendation: 'RTW 2–6 см / Plus 6–12 см; адаптация под растяжимость ткани',
  },
  {
    indicator: 'Ткань',
    recommendation: 'Полиамид + эластан (LYCRA®), с УФ-защитой 50+, формоустойчивая структура',
  },
];

const alphaScaleData = [
  { alpha: 'XXS', it: '36', ru: '38', comment: 'Petite, чашка A, low rise' },
  { alpha: 'XS', it: '38', ru: '40', comment: 'Slim fit, чашка A–B' },
  { alpha: 'S', it: '40', ru: '42', comment: 'Базовый RTW, чашка B–C' },
  { alpha: 'M', it: '42', ru: '44', comment: 'Универсальный комфорт' },
  { alpha: 'M/L', it: '44', ru: '46', comment: 'Комфортная посадка, чашка C–D' },
  { alpha: 'L', it: '46', ru: '48', comment: 'Relaxed fit, чашка D' },
  { alpha: 'XL', it: '48', ru: '50', comment: 'Верх RTW, D–E' },
  { alpha: 'XXL', it: '50', ru: '52', comment: 'Начало Plus segment' },
  { alpha: 'XL+', it: '52', ru: '54', comment: 'Curvy fit, высокая талия' },
  { alpha: 'XXL+', it: '54', ru: '56', comment: 'Plus fit, плотная поддержка груди' },
  { alpha: '3X', it: '58', ru: '60', comment: 'Full curve, корректирующая компрессия' },
  { alpha: '4X', it: '62', ru: '64', comment: 'Extended Plus, анатомический куп' },
  { alpha: '5X', it: '66', ru: '68', comment: 'Super curve, shaping зона живота' },
];

export function FitGuideBeachwearDialog({ isOpen, onOpenChange }: FitGuideBeachwearDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Комментарии по лекалам и посадке</DialogTitle>
          <DialogDescription>Женская пляжная мода</DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 flex-1">
          <div className="space-y-4 px-6">
            <Card>
              <CardHeader>
                <CardTitle>Конструктивные особенности по подкатегориям</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Подкатегория</TableHead>
                      <TableHead>Fit-философия</TableHead>
                      <TableHead>Особенности конструкции</TableHead>
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
                <CardTitle>🧩 Особенности посадки RTW vs Plus</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Параметр</TableHead>
                      <TableHead>RTW</TableHead>
                      <TableHead>Plus Size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rtwVsPlusData.map((row) => (
                      <TableRow key={row.parameter}>
                        <TableCell className="font-medium">{row.parameter}</TableCell>
                        <TableCell>{row.rtw}</TableCell>
                        <TableCell>{row.plusSize}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🔠 Буквенная шкала (Alpha) для пляжной одежды</CardTitle>
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
                <CardTitle>🧵 Практические параметры</CardTitle>
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
