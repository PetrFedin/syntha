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

interface FitGuideBootsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const constructionParamsData = [
  {
    element: 'Высота каблука (Heel)',
    value: '35–80 мм',
    comment: 'оптимум устойчивости, чаще 45–60 мм',
  },
  {
    element: 'Высота голенища (Shaft Height)',
    value: '22–38 см',
    comment: 'зависит от модели (ankle, calf, knee, overknee)',
  },
  {
    element: 'Обхват голени (Shaft Girth)',
    value: '33–42 см',
    comment: 'варьируется по полноте, stretch / zip конструкции',
  },
  {
    element: 'Толщина подошвы (Sole)',
    value: '4–8 мм',
    comment: 'city boots — 5 мм, winter — до 10 мм',
  },
  { element: 'Перепад (Drop)', value: '20–35 мм', comment: 'ниже, чем в туфлях, для устойчивости' },
  {
    element: 'Профиль арки (Arch)',
    value: 'нормальный / умеренный',
    comment: 'более мягкая посадка, адаптивная колодка',
  },
  {
    element: 'Toe allowance',
    value: '10–12 мм',
    comment: 'чуть выше, чем в pumps — комфорт при ходьбе',
  },
  {
    element: 'Вес пары (Pair Weight)',
    value: '780–1150 г',
    comment: 'зависит от высоты и материала',
  },
  { element: 'Flex index', value: '6/10', comment: 'умеренная гибкость' },
  {
    element: 'Comfort index',
    value: '6–10/10',
    comment: 'растёт с высотой голенища и мягкостью shaft',
  },
  {
    element: 'Материалы',
    value: 'кожа, замша, stretch, текстиль',
    comment: 'важно учитывать натяжение при посадке',
  },
];

const fitAndTolerancesData = [
  {
    parameter: 'Ease (внутренний запас)',
    rtw: '5–7 мм',
    comfortFit: '6–9 мм',
    comment: 'увеличение для носка и подштанников',
  },
  {
    parameter: 'Подъём (instep)',
    rtw: '6.0–7.0 см',
    comfortFit: '7.0–7.5 см',
    comment: 'под молнию или резинку',
  },
  {
    parameter: 'Ширина пяточной части',
    rtw: '60–68 мм',
    comfortFit: '68–72 мм',
    comment: 'контроль фиксации',
  },
  {
    parameter: 'Полнота (Width)',
    rtw: 'F–H',
    comfortFit: 'G–W',
    comment: 'расширенная comfort линейка',
  },
  {
    parameter: 'Крепление голенища',
    rtw: 'молния / резинка / lace',
    comfortFit: 'влияет на гибкость шафта',
    comment: '',
  },
  {
    parameter: 'Верхний край',
    rtw: '33–42 см',
    comfortFit: '35–45 см',
    comment: 'допускается растяжение 3–5%',
  },
];

const subcategoryFitData = [
  {
    subcategory: 'Ankle Boot',
    philosophy: 'Universal Fit',
    features: 'голенище 10–15 см, классический city boot',
  },
  {
    subcategory: 'Chelsea Boot',
    philosophy: 'Comfort Stretch',
    features: 'эластичные вставки, низкий подъём',
  },
  {
    subcategory: 'Calf Boot',
    philosophy: 'Proportion Fit',
    features: '25–30 см высота, гибкое голенище',
  },
  {
    subcategory: 'Knee Boot',
    philosophy: 'Tall Fit',
    features: '35–40 см, фиксирующий верх, лучше на G–H',
  },
  {
    subcategory: 'Overknee Boot',
    philosophy: 'Fashion Extended',
    features: 'до 50 см, stretch shaft, визуальное удлинение ноги',
  },
  {
    subcategory: 'Heeled Boot',
    philosophy: 'Elegant Stability',
    features: '45–70 мм каблук, ограниченный drop',
  },
  {
    subcategory: 'Block Heel Boot',
    philosophy: 'Comfort Stability',
    features: 'широкое основание, улучшенная балансировка',
  },
];

const technicalControlData = [
  { parameter: 'Длина стельки', tolerance: '±1.5', frequency: 'стабильность колодки' },
  { parameter: 'Ширина шафта', tolerance: '±2.0', frequency: 'допускается по материалу' },
  { parameter: 'Высота голенища', tolerance: '±3.0', frequency: 'допускается из-за усадки кожи' },
  { parameter: 'Drop', tolerance: '±3.0', frequency: 'визуальный контроль' },
  { parameter: 'Каблук', tolerance: '±2.0', frequency: 'замер от пятки до пола' },
  {
    parameter: 'Вентиляционные зоны',
    tolerance: '±1 отверстие',
    frequency: 'особенно в зимних моделях',
  },
];

export function FitGuideBootsDialog({ isOpen, onOpenChange }: FitGuideBootsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Комментарии по лекалам и посадке</DialogTitle>
          <DialogDescription>
            Женские ботильоны и сапоги (Ankle / Calf / Knee Fit)
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 flex-1">
          <div className="space-y-4 px-6">
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Конструктивные параметры</CardTitle>
              </CardHeader>
              <CardContent>
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
                        <TableCell className="font-medium">{row.element}</TableCell>
                        <TableCell>{row.value}</TableCell>
                        <TableCell className="text-muted-foreground">{row.comment}</TableCell>
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
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Параметр</TableHead>
                      <TableHead>RTW</TableHead>
                      <TableHead>Comfort Fit</TableHead>
                      <TableHead>Комментарий</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fitAndTolerancesData.map((row) => (
                      <TableRow key={row.parameter}>
                        <TableCell className="font-medium">{row.parameter}</TableCell>
                        <TableCell>{row.rtw}</TableCell>
                        <TableCell>{row.comfortFit}</TableCell>
                        <TableCell className="text-muted-foreground">{row.comment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🧩 Подкатегории и их особенности</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Подкатегория</TableHead>
                      <TableHead>Fit-философия</TableHead>
                      <TableHead>Особенности</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subcategoryFitData.map((row) => (
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
                <CardTitle>📊 Диапазоны допуска для технического контроля</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Параметр</TableHead>
                      <TableHead>Допуск (мм)</TableHead>
                      <TableHead>Примечание</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {technicalControlData.map((row) => (
                      <TableRow key={row.parameter}>
                        <TableCell className="font-medium">{row.parameter}</TableCell>
                        <TableCell>{row.tolerance}</TableCell>
                        <TableCell className="text-muted-foreground">{row.frequency}</TableCell>
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
                  <strong>Назначение:</strong> демисезон / зима / городской комфорт
                </p>
                <p>
                  <strong>Основной риск:</strong> компрессия подъёма или сдавливание голени при
                  молнии
                </p>
                <p>
                  <strong>Контроль качества:</strong> обхват голени должен допускать ±1 см; осевая
                  линия каблука — строго вертикальна
                </p>
                <p>
                  <strong>Материалы:</strong> кожа, нубук, stretch-leather, водоотталкивающая
                  пропитка
                </p>
                <p>
                  <strong>Рекомендуемая плотность подошвы:</strong> 0.85–0.95 г/см³
                </p>
                <p>
                  <strong>Срок службы (RTW стандарт):</strong> 50 000 шагов без потери формы
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
