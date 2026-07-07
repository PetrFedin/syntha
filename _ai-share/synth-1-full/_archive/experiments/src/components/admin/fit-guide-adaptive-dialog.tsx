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

interface FitGuideAdaptiveDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const constructionPrinciplesData = [
  {
    element: 'Easy Access (легкий доступ)',
    description: 'боковые молнии, магниты, липучки, кнопки',
    purpose: 'одевание без подъёма рук / сгибания',
  },
  {
    element: 'Seated Pattern',
    description: 'укороченная спинка, повышенная посадка спереди',
    purpose: 'комфорт в инвалидной коляске',
  },
  {
    element: 'Adaptive Waistband',
    description: 'эластичный, регулируемый пояс, часто с velcro',
    purpose: 'стабилизация и удобство при сидении',
  },
  {
    element: 'Magnetic Front Closure',
    description: 'магниты вместо пуговиц на блузах и жакетах',
    purpose: 'лёгкое закрытие одной рукой',
  },
  {
    element: 'Stretch Insert Panels',
    description: 'вставки из биэластичных тканей',
    purpose: 'компенсируют ограниченное движение',
  },
  {
    element: 'No-Pressure Zones',
    description: 'отсутствие боковых швов, плоские отстрочки',
    purpose: 'предотвращение пролежней',
  },
  {
    element: 'Seamless Shoulder Construction',
    description: 'мягкие плечевые швы, магниты',
    purpose: 'упрощённое надевание и снятие',
  },
  {
    element: 'Footwear Access',
    description: 'застёжки на липучке / сбоку',
    purpose: 'обувание без наклона',
  },
];

const categoryExplanationData = [
  {
    subcategory: 'Блузы и топы Adaptive',
    philosophy: 'Magnetic front',
    features: 'магниты, flat seam, мягкие ткани',
  },
  {
    subcategory: 'Брюки и леггинсы Adaptive',
    philosophy: 'Easy waistband',
    features: 'эластичный верх, extra rise для сидения',
  },
  {
    subcategory: 'Платья Adaptive',
    philosophy: 'Side or front entry',
    features: 'боковой доступ, jersey вставки',
  },
  {
    subcategory: 'Домашняя одежда / пижамы Adaptive',
    philosophy: 'Soft comfort',
    features: 'без швов, хлопок с эластаном',
  },
  {
    subcategory: 'Верхняя одежда Adaptive',
    philosophy: 'Open-back / dual zip',
    features: 'облегчённое одевание, термоподкладка',
  },
];

const fitAllowanceData = [
  {
    zone: 'Грудь',
    rtw: '0–6',
    adaptiveFit: '+6–10',
    comment: 'обеспечивает комфорт при застёжке одной рукой',
  },
  { zone: 'Талия', rtw: '0–6', adaptiveFit: '+8–14', comment: 'мягкий пояс, адаптивные складки' },
  { zone: 'Бёдра', rtw: '0–6', adaptiveFit: '+10–16', comment: 'сидячий баланс' },
  { zone: 'Спинка', rtw: 'стандарт', adaptiveFit: '−3…−5', comment: 'короткая спинка при сидении' },
  { zone: 'Посадка', rtw: 'стандарт', adaptiveFit: '+4–8', comment: 'компенсирует наклон таза' },
  {
    zone: 'Ease (свобода)',
    rtw: '4–6',
    adaptiveFit: '8–12',
    comment: 'ткани с bi-stretch и jersey blend',
  },
];

export function FitGuideAdaptiveDialog({ isOpen, onOpenChange }: FitGuideAdaptiveDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Комментарии по лекалам и посадке</DialogTitle>
          <DialogDescription>Женская одежда для ограниченной подвижности</DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 flex-1">
          <div className="space-y-4 px-6">
            <Card>
              <CardHeader>
                <CardTitle>🧠 Технические принципы конструкции</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Элемент</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Техническая цель</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {constructionPrinciplesData.map((row) => (
                      <TableRow key={row.element}>
                        <TableCell className="font-medium">{row.element}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell className="text-muted-foreground">{row.purpose}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>🧵 Категорийные пояснения</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Подкатегория</TableHead>
                      <TableHead>Fit-философия</TableHead>
                      <TableHead>Особенности кроя</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryExplanationData.map((row) => (
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
                <CardTitle>📏 Fit-допуски по зонам</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Зона</TableHead>
                      <TableHead>RTW (см)</TableHead>
                      <TableHead>Adaptive Fit (см)</TableHead>
                      <TableHead>Комментарий</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fitAllowanceData.map((row) => (
                      <TableRow key={row.zone}>
                        <TableCell className="font-medium">{row.zone}</TableCell>
                        <TableCell>{row.rtw}</TableCell>
                        <TableCell>{row.adaptiveFit}</TableCell>
                        <TableCell className="text-muted-foreground">{row.comment}</TableCell>
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
