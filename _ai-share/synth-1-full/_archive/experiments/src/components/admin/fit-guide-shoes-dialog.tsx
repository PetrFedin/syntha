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

interface FitGuideShoesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const constructionParamsData = [
  {
    element: 'Высота каблука (Heel)',
    value: '65–110 мм',
    comment: 'зависит от стиля — kitten (45–55 мм), stiletto (85–110 мм)',
  },
  {
    element: 'Перепад (Drop)',
    value: '60–75 мм',
    comment: 'влияет на угол наклона и давление на плюсну',
  },
  {
    element: 'Толщина подошвы (Sole)',
    value: '4–8 мм',
    comment: 'в classic pumps до 5 мм, в платформенных — 8–12 мм',
  },
  {
    element: 'Toe allowance (вылет мыска)',
    value: '8–12 мм',
    comment: 'минимальный, визуально сужает стопу',
  },
  {
    element: 'Арочный профиль (Arch)',
    value: 'высокий',
    comment: '15–20° кривизна в центральной части',
  },
  {
    element: 'Объём пяточной части (Heel cup)',
    value: '30–34 мм',
    comment: 'формирует фиксацию при подъёме',
  },
  {
    element: 'Вес пары (Pair weight)',
    value: '480–740 г',
    comment: 'чем выше каблук — тем выше масса опорного блока',
  },
  {
    element: 'Flex index (гибкость подошвы)',
    value: '4/10',
    comment: 'низкая гибкость, устойчивая опора',
  },
  {
    element: 'Comfort index (оценка)',
    value: '2–9/10',
    comment: 'зависит от высоты каблука и полноты',
  },
  {
    element: 'Материалы',
    value: 'кожа, сатин, лак, suede',
    comment: 'верх без растяжения, требует точного соответствия длине',
  },
];

const fitAndTolerancesData = [
  {
    parameter: 'Ease (внутренний запас)',
    rtw: '3–5 мм',
    elegantFit: '2–4 мм',
    comment: 'минимальный допуск, визуально точный силуэт',
  },
  {
    parameter: 'Полнота (width)',
    rtw: 'F–G',
    elegantFit: 'N–F',
    comment: 'чем выше каблук, тем уже колодка',
  },
  {
    parameter: 'Подъём (instep)',
    rtw: '6–6.5 см',
    elegantFit: '6.5–7 см',
    comment: 'для drop 70–90 мм обязательна компенсация подъёма',
  },
  {
    parameter: 'Toe form (форма мыска)',
    rtw: 'almond / pointed',
    elegantFit: 'almond / pointed',
    comment: 'almond = сбалансированный, pointed = fashion',
  },
  {
    parameter: 'Heel base (площадь каблука)',
    rtw: '18–22 мм',
    elegantFit: '12–16 мм',
    comment: 'stability vs elegance',
  },
  {
    parameter: 'Insole cushioning',
    rtw: '2–3 мм',
    elegantFit: '1.5–2 мм',
    comment: 'ограничена для сохранения эстетики профиля',
  },
];

const subcategoryFitData = [
  {
    subcategory: 'Classic Pumps (лодочки)',
    philosophy: 'Universal RTW',
    features: '70–90 мм heel, узкий мысок, стандартная арка',
  },
  {
    subcategory: 'Kitten Heels',
    philosophy: 'Comfort Elegant',
    features: 'каблук 45–55 мм, низкий drop, мягкая колодка',
  },
  {
    subcategory: 'Platform Pumps',
    philosophy: 'Stability Focus',
    features: 'каблук 90–110 мм, sole 8–12 мм, баланс веса',
  },
  {
    subcategory: 'Slingback / Open Heel',
    philosophy: 'Semi-open Fit',
    features: 'регулируемая пяточная лента, уменьшенная арка',
  },
  {
    subcategory: 'Mary Jane',
    philosophy: 'Secure Fit',
    features: 'ремешок через подъём, смещение центра тяжести',
  },
  {
    subcategory: 'Pointed Toe Heels',
    philosophy: 'Visual Slim',
    features: 'уменьшенный toe allowance, требует точного подбора длины',
  },
  {
    subcategory: 'Block Heel / Square Toe',
    philosophy: 'Stable Fit',
    features: 'увеличенная площадь опоры, подходит для curvy foot',
  },
];

const technicalControlData = [
  { parameter: 'Длина стельки', tolerance: '±1.5', frequency: 'каждая партия' },
  { parameter: 'Ширина колодки', tolerance: '±1.0', frequency: 'каждая форма' },
  { parameter: 'Высота каблука', tolerance: '±2.0', frequency: '1 из 10 пар' },
  { parameter: 'Drop (перепад)', tolerance: '±2.5', frequency: 'каждая модель' },
  {
    parameter: 'Позиция центра тяжести',
    tolerance: '±1.0',
    frequency: 'визуальная проверка на баланс',
  },
];

export function FitGuideShoesDialog({ isOpen, onOpenChange }: FitGuideShoesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Комментарии по лекалам и посадке</DialogTitle>
          <DialogDescription>Женские туфли и лодочки (Classic / Elegant Fit)</DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 flex-1">
          <div className="space-y-4 px-6">
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Конструктивные параметры</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Элемент</TableHead>
                      <TableHead>Значение / Диапазон</TableHead>
                      <TableHead>Комментарий</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {constructionParamsData.map((row) => (
                      <TableRow key={row.element}>
                        <TableCell className="whitespace-nowrap font-medium">
                          {row.element}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{row.value}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {row.comment}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🧵 Fit и допуски</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Параметр</TableHead>
                      <TableHead>RTW</TableHead>
                      <TableHead>Elegant Fit</TableHead>
                      <TableHead>Комментарий</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fitAndTolerancesData.map((row) => (
                      <TableRow key={row.parameter}>
                        <TableCell className="whitespace-nowrap font-medium">
                          {row.parameter}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{row.rtw}</TableCell>
                        <TableCell className="whitespace-nowrap">{row.elegantFit}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {row.comment}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🩰 Подкатегории туфель и их посадка</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Подкатегория</TableHead>
                      <TableHead>Fit-философия</TableHead>
                      <TableHead>Особенности конструкции</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subcategoryFitData.map((row) => (
                      <TableRow key={row.subcategory}>
                        <TableCell className="whitespace-nowrap font-medium">
                          {row.subcategory}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{row.philosophy}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {row.features}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>📊 Диапазоны допуска для технического контроля</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Параметр</TableHead>
                      <TableHead>Допуск (мм)</TableHead>
                      <TableHead>Контрольная частота</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technicalControlData.map((row) => (
                      <TableRow key={row.parameter}>
                        <TableCell className="whitespace-nowrap font-medium">
                          {row.parameter}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{row.tolerance}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {row.frequency}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🧠 Технический профиль категории</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>Назначение:</strong> formal, business, evening wear
                </p>
                <p>
                  <strong>Основной риск:</strong> компрессия плюсны, давление на пальцы
                </p>
                <p>
                  <strong>Комфорт зависит от:</strong> drop ≤70 мм → высокий комфорт; heel &gt;90 мм
                  → требует амортизации
                </p>
                <p>
                  <strong>Рекомендуемый материал стельки:</strong> кожа с латексной подложкой 1.5–2
                  мм
                </p>
                <p>
                  <strong>Рекомендуемая плотность подошвы:</strong> 0.95–1.1 г/см³ (TPU или
                  микропористая кожа)
                </p>
                <p>
                  <strong>Устойчивость к износу:</strong> 25 000 шагов (тест на изгиб)
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
