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

interface FitGuideFlatsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const constructionParamsData = [
  {
    element: 'Высота каблука (Heel)',
    value: '5–20 мм',
    comment: 'минимальный, обеспечивает плавный перекат',
  },
  { element: 'Перепад (Drop)', value: '0–3 мм', comment: 'нулевая разница = равномерная нагрузка' },
  { element: 'Толщина подошвы (Sole)', value: '3–5 мм', comment: 'должна сгибаться на 180°' },
  {
    element: 'Профиль арки (Arch)',
    value: 'умеренный / низкий',
    comment: 'допускается flat foot-friendly',
  },
  { element: 'Toe allowance', value: '10–14 мм', comment: 'важен запас под движение пальцев' },
  { element: 'Вес пары (Pair Weight)', value: '260–440 г', comment: 'крайне лёгкая конструкция' },
  { element: 'Flex index', value: '9/10', comment: 'максимальная гибкость' },
  { element: 'Comfort index', value: '7–10/10', comment: 'зависит от амортизации и подкладки' },
  {
    element: 'Материалы',
    value: 'кожа, замша, knit, текстиль',
    comment: 'допускается стрейч верх, важно усиление пятки',
  },
];

const fitAndTolerancesData = [
  {
    parameter: 'Ease (внутренний запас)',
    rtw: '5–7 мм',
    comfortFit: '6–8 мм',
    comment: 'комфорт без соскальзывания пятки',
  },
  {
    parameter: 'Полнота (width)',
    rtw: 'F–H',
    comfortFit: 'G–W',
    comment: 'большинство comfort моделей G/H',
  },
  {
    parameter: 'Подъём (instep)',
    rtw: '6.0 см',
    comfortFit: '6.5 см',
    comment: 'регулируется эластичной вставкой',
  },
  {
    parameter: 'Пяточная фиксация',
    rtw: 'стандарт',
    comfortFit: 'усиленная',
    comment: 'возможна кожаная подкладка или кант',
  },
  {
    parameter: 'Форма мыска (Toe form)',
    rtw: 'round / almond',
    comfortFit: 'round / square',
    comment: 'round даёт больше свободы при длительном ношении',
  },
];

const subcategoryFitData = [
  {
    subcategory: 'Балетки (Ballet Flats)',
    philosophy: 'Minimal Fit',
    features: 'мягкая колодка, низкий каблук, гнущаяся подошва',
  },
  {
    subcategory: 'Лоферы (Loafers)',
    philosophy: 'Structured Fit',
    features: 'жёсткая пятка, фиксированный подъём',
  },
  {
    subcategory: 'Мокасины (Moccasins)',
    philosophy: 'Adaptive Fit',
    features: 'мягкий верх, сшивной носок, удобная стелька',
  },
  {
    subcategory: 'Мюли (Mules)',
    philosophy: 'Open Fit',
    features: 'открытая пятка, более плотный свод',
  },
  {
    subcategory: 'Эспадрильи (Espadrilles)',
    philosophy: 'Summer Fit',
    features: 'подошва из джута, drop до 5 мм',
  },
];

const materialTechData = [
  { parameter: 'Плотность подошвы', value: '0.85–0.95 г/см³', comment: 'TPR / EVA / кожа' },
  { parameter: 'Сжимаемость стельки', value: '20–30%', comment: 'для длительного комфорта' },
  {
    parameter: 'Противоскольжение',
    value: '≥0.5 коэффициент трения',
    comment: 'ISO стандарт для indoor/outdoor',
  },
  { parameter: 'Вентиляция', value: 'высокая', comment: 'тканые и knit материалы' },
  { parameter: 'Подкладка', value: 'хлопок, кожа', comment: 'должна исключать трение пятки' },
];

const technicalControlData = [
  { parameter: 'Длина стельки', tolerance: '±1.0', frequency: 'каждая партия' },
  { parameter: 'Ширина колодки', tolerance: '±1.5', frequency: 'каждая форма' },
  { parameter: 'Толщина подошвы', tolerance: '±0.5', frequency: 'на производстве' },
  { parameter: 'Toe allowance', tolerance: '±1.0', frequency: 'визуальная проверка' },
  { parameter: 'Уровень гибкости', tolerance: '±5°', frequency: 'тест изгиба под 45°' },
];

export function FitGuideFlatsDialog({ isOpen, onOpenChange }: FitGuideFlatsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Комментарии по лекалам и посадке</DialogTitle>
          <DialogDescription>Женские балетки, лоферы и мюли (Soft Fit / Flats)</DialogDescription>
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
                <CardTitle>🩰 Подкатегории и особенности</CardTitle>
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
                <CardTitle>⚙️ Материальные и технологические параметры</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Параметр</TableHead>
                      <TableHead>Диапазон / Норма</TableHead>
                      <TableHead>Комментарий</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materialTechData.map((row) => (
                      <TableRow key={row.parameter}>
                        <TableCell className="font-medium">{row.parameter}</TableCell>
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
                <CardTitle>📊 Диапазоны допуска</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Параметр</TableHead>
                      <TableHead>Допуск (мм)</TableHead>
                      <TableHead>Контроль</TableHead>
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
                  <strong>Назначение:</strong> повседневная, офисная, домашняя
                </p>
                <p>
                  <strong>Комфортная температура носки:</strong> 15–28 °C
                </p>
                <p>
                  <strong>Основной риск:</strong> сползание пятки и заломы верха
                </p>
                <p>
                  <strong>Рекомендованный материал верха:</strong> кожа, knit, текстиль
                </p>
                <p>
                  <strong>Рекомендуемая плотность подошвы:</strong> 0.9 г/см³
                </p>
                <p>
                  <strong>Оптимальный drop:</strong> 0–2 мм (естественная походка)
                </p>
                <p>
                  <strong>Срок службы:</strong> 35 000 шагов без потери формы
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
