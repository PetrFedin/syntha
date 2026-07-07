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

interface FitGuideSneakersDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  audience?: 'women' | 'men';
}

const constructionParamsData = [
  {
    element: 'Толщина подошвы (Sole)',
    value: '18–35 мм',
    comment: 'в зависимости от стиля: lifestyle, running, trekking',
  },
  { element: 'Перепад (Drop)', value: '6–12 мм', comment: 'влияет на осанку и давление на плюсну' },
  {
    element: 'Высота пятки (Heel)',
    value: '24–47 мм',
    comment: 'выше при cushioning / max support',
  },
  {
    element: 'Профиль арки (Arch)',
    value: 'нормальный / высокий',
    comment: 'важен для стабильности и амортизации',
  },
  { element: 'Ширина колодки (Width)', value: 'F–W', comment: 'увеличенная комфортная посадка' },
  {
    element: 'Вес пары (Pair Weight)',
    value: '320–520 г',
    comment: 'лёгкость = меньше утомляемости',
  },
  {
    element: 'Flex index (гибкость подошвы)',
    value: '6–10',
    comment: 'чем выше — тем мягче и эластичнее',
  },
  {
    element: 'Comfort index',
    value: '8–10/10',
    comment: 'определяется cushioning, вентиляцией и формой стельки',
  },
  {
    element: 'Материалы',
    value: 'сетка (mesh), knit, кожа, EVA',
    comment: 'разные степени вентиляции и поддержки',
  },
];

const fitAndTolerancesData = [
  {
    parameter: 'Ease (внутренний запас)',
    rtw: '6–9 мм',
    performanceFit: '5–7 мм',
    comment: 'плотная фиксация при активности',
  },
  {
    parameter: 'Полнота (Width)',
    rtw: 'F–H',
    performanceFit: 'G–W',
    comment: 'comfort/active line — G',
  },
  {
    parameter: 'Подъём (Instep)',
    rtw: '6.5–7 см',
    performanceFit: '7–7.5 см',
    comment: 'поддержка шнуровкой или knit-воротником',
  },
  {
    parameter: 'Toe allowance',
    rtw: '10–12 мм',
    performanceFit: '8–10 мм',
    comment: 'меньше в performance-моделях',
  },
  {
    parameter: 'Heel counter (жёсткость пятки)',
    rtw: '55–65 Shore A',
    performanceFit: 'предотвращает смещение пятки',
    comment: '',
  },
  {
    parameter: 'Амортизация стельки',
    rtw: '3–8 мм',
    performanceFit: 'memory foam / EVA',
    comment: 'важна для долгих тренировок',
  },
  {
    parameter: 'Система фиксации',
    rtw: 'шнуровка, липучки, BOA',
    performanceFit: 'тип зависит от назначения модели',
    comment: '',
  },
];

const subcategoryFitData = [
  {
    subcategory: 'Casual Sneakers',
    philosophy: 'Lifestyle Fit',
    features: 'городская посадка, drop 8 мм, повышенный comfort',
  },
  {
    subcategory: 'Running / Training Shoes',
    philosophy: 'Performance Fit',
    features: 'drop 10–12 мм, лёгкая подошва, повышенная амортизация',
  },
  {
    subcategory: 'Trail / Outdoor',
    philosophy: 'Stability Fit',
    features: 'drop 8–10 мм, рельефная подошва, защита носка',
  },
  {
    subcategory: 'Court / Tennis',
    philosophy: 'Support Fit',
    features: 'drop 6–8 мм, усиление медиальной зоны',
  },
  {
    subcategory: 'Slip-on / Knit Sneakers',
    philosophy: 'Adaptive Fit',
    features: 'без шнурков, верх-носок, мягкая фиксация',
  },
  {
    subcategory: 'Orthopedic / Recovery',
    philosophy: 'Adaptive Comfort',
    features: 'широкий свод, drop 4–6 мм, стабилизирующая подошва',
  },
];

const materialTechData = [
  { parameter: 'Плотность подошвы', value: '0.45–0.75 г/см³', comment: 'EVA / TPU / Phylon' },
  {
    parameter: 'Жёсткость (Flex modulus)',
    value: '30–55 N·mm',
    comment: 'средний диапазон для urban sport',
  },
  {
    parameter: 'Амортизация (Cushion index)',
    value: '4–8 мм',
    comment: 'зависит от уровня поддержки',
  },
  { parameter: 'Вентиляция', value: 'высокая', comment: 'сетчатые материалы, knit' },
  {
    parameter: 'Водоотталкивающая защита',
    value: 'опционально',
    comment: 'WR мембрана или гидрофобная пропитка',
  },
  {
    parameter: 'Grip (сцепление)',
    value: '≥0.6 коэффициент трения',
    comment: 'противоскользящий протектор',
  },
  {
    parameter: 'Drop tolerance',
    value: '±1 мм',
    comment: 'важен при подборе пар кроссовок разных брендов',
  },
];

const technicalControlData = [
  { parameter: 'Длина стельки', tolerance: '±1.0', frequency: 'каждая партия' },
  { parameter: 'Drop', tolerance: '±1.5', frequency: 'контроль балансировки' },
  { parameter: 'Толщина подошвы', tolerance: '±0.5', frequency: 'EVA формовка' },
  { parameter: 'Ширина пятки', tolerance: '±1.5', frequency: 'стабильность при постановке ноги' },
  { parameter: 'Вес пары', tolerance: '±15 г', frequency: 'контроль производственной серии' },
  { parameter: 'Уровень сцепления', tolerance: '±0.05', frequency: 'тест на скольжение' },
];

export function FitGuideSneakersDialog({
  isOpen,
  onOpenChange,
  audience = 'women',
}: FitGuideSneakersDialogProps) {
  if (audience === 'men') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Справочник по кроссовкам (Мужское)</DialogTitle>
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
          <DialogDescription>
            Женские кроссовки и спортивная обувь (Sneakers / Trainers / Performance Fit)
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
                      <TableHead>Performance Fit</TableHead>
                      <TableHead>Комментарий</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fitAndTolerancesData.map((row) => (
                      <TableRow key={row.parameter}>
                        <TableCell className="font-medium">{row.parameter}</TableCell>
                        <TableCell>{row.rtw}</TableCell>
                        <TableCell>{row.performanceFit}</TableCell>
                        <TableCell className="text-muted-foreground">{row.comment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>👟 Подкатегории и особенности</CardTitle>
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
                  <strong>Назначение:</strong> город, спорт, фитнес, повседневная активность
                </p>
                <p>
                  <strong>Оптимальный drop:</strong> 8–10 мм (баланс осанки и стабильности)
                </p>
                <p>
                  <strong>Средний вес пары:</strong> 400–450 г
                </p>
                <p>
                  <strong>Основной риск:</strong> перегрев стопы и неустойчивость при неправильном
                  drop
                </p>
                <p>
                  <strong>Решение:</strong> вентиляция + стабильный heel counter
                </p>
                <p>
                  <strong>Плотность подошвы:</strong> 0.6 г/см³ (EVA оптимум)
                </p>
                <p>
                  <strong>Ресурс:</strong> 500 км пробега или 60 000 шагов
                </p>
                <p>
                  <strong>Комфортная температура:</strong> 10–30 °C
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
