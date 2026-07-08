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

interface FitGuideSandalsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const constructionParamsData = [
  {
    element: 'Высота каблука (Heel)',
    value: '15–55 мм',
    comment: 'от flat sandal до лёгкой платформы',
  },
  { element: 'Перепад (Drop)', value: '5–10 мм', comment: 'комфортный угол переката' },
  {
    element: 'Толщина подошвы (Sole)',
    value: '3–7 мм',
    comment: 'возможна двойная подошва с прокладкой EVA',
  },
  {
    element: 'Профиль арки (Arch)',
    value: 'нормальный / низкий',
    comment: 'поддержка стелькой или form insole',
  },
  { element: 'Toe allowance', value: '10–12 мм', comment: 'важен при открытом мыске' },
  {
    element: 'Вес пары (Pair Weight)',
    value: '240–420 г',
    comment: 'лёгкая конструкция, часто без подноска',
  },
  { element: 'Flex index', value: '8/10', comment: 'высокая гибкость' },
  {
    element: 'Comfort index',
    value: '7–10/10',
    comment: 'зависит от толщины подкладки и формы ремней',
  },
  {
    element: 'Материалы',
    value: 'кожа, текстиль, EVA, PU',
    comment: 'ключевой параметр — мягкость ремешков',
  },
];

const fitAndTolerancesData = [
  {
    parameter: 'Ease (внутренний запас)',
    rtw: '4–6 мм',
    comfortFit: '5–8 мм',
    comment: 'запас на расширение при жаре',
  },
  {
    parameter: 'Полнота (Width)',
    rtw: 'F–H',
    comfortFit: 'G–W',
    comment: 'расширенные модели популярны в comfort segment',
  },
  {
    parameter: 'Подъём (instep)',
    rtw: '6.0–6.5 см',
    comfortFit: '6.5–7.0 см',
    comment: 'регулируется застёжками',
  },
  {
    parameter: 'Фиксация пятки',
    rtw: 'ремешок / липучка',
    comfortFit: 'ремешок / застёжка',
    comment: 'важна эластичность заднего ремня',
  },
  {
    parameter: 'Toe security',
    rtw: 'средняя',
    comfortFit: 'высокая',
    comment: 'от открытого до полузакрытого мыска',
  },
  {
    parameter: 'Регулировка ремешков',
    rtw: '1–3 точки',
    comfortFit: 'до 4 точек',
    comment: 'для полного адаптива стопы',
  },
];

const subcategoryFitData = [
  { subcategory: 'Flat Sandal', philosophy: 'Natural Fit', features: 'без каблука, прямой drop' },
  {
    subcategory: 'Heeled Sandal',
    philosophy: 'Elegant Fit',
    features: 'каблук 40–55 мм, устойчивость + визуальная длина ноги',
  },
  {
    subcategory: 'Platform Sandal',
    philosophy: 'Balanced Fit',
    features: 'каблук 70–90 мм, sole 10–15 мм, компенсация drop',
  },
  {
    subcategory: 'Sport Sandal',
    philosophy: 'Active Fit',
    features: 'нескользящая подошва, регулируемые ремни',
  },
  {
    subcategory: 'Slide / Mule Sandal',
    philosophy: 'Relax Fit',
    features: 'без заднего ремня, комфорт, но ниже фиксация',
  },
  {
    subcategory: 'Toe-post (вьетнамки)',
    philosophy: 'Minimal Fit',
    features: 'подходит узкой стопе, часто с cushioned sole',
  },
  {
    subcategory: 'Orthopedic Sandal',
    philosophy: 'Adaptive Fit',
    features: 'широкая колодка, мягкий верх, амортизирующая подошва',
  },
];

const materialTechData = [
  {
    parameter: 'Плотность подошвы',
    value: '0.75–0.9 г/см³',
    comment: 'EVA / TPR — лёгкая амортизация',
  },
  { parameter: 'Амортизация (высота стельки)', value: '3–5 мм', comment: 'часто memory foam' },
  {
    parameter: 'Антискольжение (коэф. трения)',
    value: '≥0.6',
    comment: 'особенно важно для outdoor моделей',
  },
  { parameter: 'Вентиляция', value: 'высокая', comment: 'до 30% открытой поверхности' },
  {
    parameter: 'Водостойкость',
    value: 'базовая / повышенная',
    comment: 'зависит от материала ремешков',
  },
];

const technicalControlData = [
  { parameter: 'Длина стельки', tolerance: '±1.5', frequency: 'контроль по форме' },
  { parameter: 'Позиция ремешков', tolerance: '±2.0', frequency: 'важна симметрия' },
  { parameter: 'Drop', tolerance: '±2.0', frequency: 'критично для баланса' },
  { parameter: 'Толщина подошвы', tolerance: '±0.5', frequency: 'зависит от EVA / TPU' },
  { parameter: 'Обхват ремешков', tolerance: '±1.5', frequency: 'на уровне косточки' },
  { parameter: 'Фиксация задника', tolerance: '±1 мм', frequency: 'визуальный контроль' },
];

export function FitGuideSandalsDialog({ isOpen, onOpenChange }: FitGuideSandalsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Комментарии по лекалам и посадке</DialogTitle>
          <DialogDescription>Женские сандалии и босоножки (Sandals / Open Shoes)</DialogDescription>
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
                <CardTitle>☀️ Подкатегории и особенности</CardTitle>
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
                <CardTitle>⚙️ Материальные и технические характеристики</CardTitle>
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
                  <strong>Назначение:</strong> летняя, пляжная, urban resort
                </p>
                <p>
                  <strong>Оптимальная температура носки:</strong> 20–35 °C
                </p>
                <p>
                  <strong>Основной риск:</strong> проскальзывание стопы вперёд
                </p>
                <p>
                  <strong>Решение:</strong> анатомическая стелька + ремешок на косточке
                </p>
                <p>
                  <strong>Рекомендуемая плотность подошвы:</strong> 0.8 г/см³
                </p>
                <p>
                  <strong>Рекомендуемый drop:</strong> 5–8 мм
                </p>
                <p>
                  <strong>Срок службы:</strong> 30 000 шагов (RTW), до 50 000 в comfort линии
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
