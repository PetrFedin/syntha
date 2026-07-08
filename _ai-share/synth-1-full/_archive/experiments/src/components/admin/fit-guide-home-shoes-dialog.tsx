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

interface FitGuideHomeShoesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const constructionParamsData = [
  {
    element: 'Высота каблука (Heel)',
    value: '10–25 мм',
    comment: 'минимальный уклон, снижает давление на пятку',
  },
  {
    element: 'Толщина подошвы (Sole)',
    value: '8–14 мм',
    comment: 'амортизация за счёт вспененных материалов',
  },
  {
    element: 'Перепад (Drop)',
    value: '0–4 мм',
    comment: 'практически нулевой для стабильности походки',
  },
  {
    element: 'Профиль арки (Arch)',
    value: 'низкий / нормальный',
    comment: 'ориентирован на расслабленную стопу',
  },
  { element: 'Toe allowance', value: '10–14 мм', comment: 'свободное движение пальцев' },
  { element: 'Вес пары (Pair Weight)', value: '280–460 г', comment: 'крайне лёгкие конструкции' },
  { element: 'Flex index', value: '9/10', comment: 'высокая гибкость' },
  { element: 'Comfort index', value: '8–10/10', comment: 'мягкость и анатомическая поддержка' },
  {
    element: 'Материалы',
    value: 'текстиль, фетр, кожа, микрофибра, EVA',
    comment: 'приоритет — воздухопроницаемость и мягкость',
  },
];

const fitAndTolerancesData = [
  {
    parameter: 'Ease (внутренний запас)',
    rtw: '7–9 мм',
    orthopedicFit: '8–10 мм',
    comment: 'комфортное расширение при отёке стопы',
  },
  { parameter: 'Полнота (Width)', rtw: 'F–W', orthopedicFit: 'G–WW', comment: 'адаптивная форма' },
  {
    parameter: 'Подъём (instep)',
    rtw: '6.5–7 см',
    orthopedicFit: '7–8 см',
    comment: 'регулируется липучкой или эластичной вставкой',
  },
  {
    parameter: 'Фиксация пятки',
    rtw: 'стандарт / открытая',
    orthopedicFit: 'фиксированная',
    comment: 'важна при медицинском использовании',
  },
  {
    parameter: 'Форма мыска',
    rtw: 'round',
    orthopedicFit: 'round / square',
    comment: 'максимум свободы для пальцев',
  },
  {
    parameter: 'Съёмная стелька',
    rtw: 'иногда',
    orthopedicFit: 'обязательно',
    comment: 'позволяет использовать индивидуальные ортезы',
  },
  {
    parameter: 'Тип застёжки',
    rtw: 'open / velcro',
    orthopedicFit: 'velcro / slip-on',
    comment: 'обеспечивает easy access',
  },
];

const subcategoryFitData = [
  {
    subcategory: 'Домашние тапочки (Slippers)',
    philosophy: 'Relax Fit',
    features: 'мягкая подошва, открытая пятка',
  },
  {
    subcategory: 'Мюли / сабо (Clogs)',
    philosophy: 'Comfort Fit',
    features: 'плотная подошва, анатомическая форма',
  },
  {
    subcategory: 'Ортопедические сандалии',
    philosophy: 'Adaptive Fit',
    features: 'регулируемые ремешки, поддержка свода',
  },
  {
    subcategory: 'Recovery Shoes',
    philosophy: 'Medical Fit',
    features: 'полное прилегание, легчайшая подошва',
  },
  {
    subcategory: 'Anti-slip Medical Shoes',
    philosophy: 'Stability Fit',
    features: 'нескользящий протектор, закрытый мысок',
  },
  {
    subcategory: 'Therapeutic Warm Shoes',
    philosophy: 'Health Fit',
    features: 'утеплённая стелька и дышащая подкладка',
  },
];

const materialTechData = [
  { parameter: 'Плотность подошвы', value: '0.55–0.75 г/см³', comment: 'EVA / microporous foam' },
  { parameter: 'Амортизация (Cushion height)', value: '4–8 мм', comment: 'memory foam или латекс' },
  {
    parameter: 'Антискольжение (Grip)',
    value: '≥0.6',
    comment: 'особенно важно для медицинских учреждений',
  },
  { parameter: 'Вентиляция', value: 'высокая', comment: 'open heel / perforated upper' },
  { parameter: 'Температурный комфорт', value: '15–28 °C', comment: 'идеален для indoors' },
  {
    parameter: 'Уход',
    value: 'машинная стирка / протирка',
    comment: 'текстиль и микрофибра допускают обработку',
  },
];

const technicalControlData = [
  { parameter: 'Длина стельки', tolerance: '±1.5', frequency: 'каждая партия' },
  {
    parameter: 'Ширина подошвы',
    tolerance: '±2.0',
    frequency: 'адаптивные модели допускают до ±3',
  },
  { parameter: 'Толщина подошвы', tolerance: '±0.5', frequency: 'зависит от материала' },
  { parameter: 'Drop', tolerance: '±1.0', frequency: 'критично для ортопедии' },
  { parameter: 'Амортизация', tolerance: '±0.5', frequency: 'визуальный и весовой контроль' },
  {
    parameter: 'Плотность подошвы',
    tolerance: '±0.05 г/см³',
    frequency: 'контроль вспенивания EVA',
  },
];

export function FitGuideHomeShoesDialog({ isOpen, onOpenChange }: FitGuideHomeShoesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Комментарии по лекалам и посадке</DialogTitle>
          <DialogDescription>Женская домашняя и медицинская обувь</DialogDescription>
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
                      <TableHead>Orthopedic Fit</TableHead>
                      <TableHead>Комментарий</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fitAndTolerancesData.map((row) => (
                      <TableRow key={row.parameter}>
                        <TableCell className="font-medium">{row.parameter}</TableCell>
                        <TableCell>{row.rtw}</TableCell>
                        <TableCell>{row.orthopedicFit}</TableCell>
                        <TableCell className="text-muted-foreground">{row.comment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🏡 Подкатегории и особенности</CardTitle>
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
                <CardTitle>🔬 Материальные и технические характеристики</CardTitle>
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
                  <strong>Назначение:</strong> дом, медицинские учреждения, реабилитация
                </p>
                <p>
                  <strong>Основной риск:</strong> потеря устойчивости или излишняя мягкость
                </p>
                <p>
                  <strong>Решение:</strong> регулируемая посадка + плотная пяточная зона
                </p>
                <p>
                  <strong>Оптимальный drop:</strong> 0–3 мм
                </p>
                <p>
                  <strong>Средний вес пары:</strong> 350–400 г
                </p>
                <p>
                  <strong>Материалы:</strong> дышащие, антибактериальные, hypoallergenic
                </p>
                <p>
                  <strong>Срок службы:</strong> 40 000 шагов при ежедневном использовании
                </p>
                <p>
                  <strong>Подходит для:</strong> flat foot, лёгких ортопедических коррекций,
                  послеоперационного восстановления
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
