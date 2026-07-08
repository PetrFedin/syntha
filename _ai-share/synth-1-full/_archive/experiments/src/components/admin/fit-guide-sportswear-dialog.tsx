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

interface FitGuideSportswearDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  audience?: 'women' | 'men';
}

const fitPhilosophyData = [
  {
    subcategory: 'Леггинсы',
    philosophy: 'Компрессионная посадка, высокая талия',
    features: 'Отрицательный ease по талии −2…−4 см; ткань с растяжением 20–30%',
  },
  {
    subcategory: 'Спортивные топы / бра',
    philosophy: 'Комфортная компрессия, поддержка груди',
    features: 'Подгрудная резинка, растяжение 10–20%, чашка B–D',
  },
  {
    subcategory: 'Футболки / лонгсливы',
    philosophy: 'Active slim fit',
    features: 'Ease по груди 2–6 см; ткань с эластаном 5–10%',
  },
  {
    subcategory: 'Шорты',
    philosophy: 'Средний или высокий rise',
    features: 'Ease 2–6 см; ткань с растяжением по бёдрам 10–15%',
  },
  {
    subcategory: 'Худи / свитшоты',
    philosophy: 'Relaxed fit, пост-тренировочный комфорт',
    features: 'Ease 8–12 см, увеличенная пройма',
  },
  {
    subcategory: 'Plus Size Fit',
    philosophy: 'Расширенная пройма и линия талии',
    features: 'Ease 10–14 см; rise выше на +2 см; удлинённый торс',
  },
];

const easeAllowanceData = [
  { zone: 'Грудь', rtw: '2–6', plusSize: '6–10', note: 'У топов — до минус 2 см компрессии' },
  { zone: 'Талия', rtw: '0–4', plusSize: '4–8', note: 'У леггинсов — минус ease' },
  {
    zone: 'Бёдра',
    rtw: '2–6',
    plusSize: '6–12',
    note: 'Для tights и компрессионных брюк — минус 2–4 см',
  },
  {
    zone: 'Посадка (rise)',
    rtw: '18–26',
    plusSize: '22–32',
    note: 'Высокий rise стабилизирует живот',
  },
  { zone: 'Пройма', rtw: '+1', plusSize: '+2', note: 'У Plus моделей — мягкая свобода' },
  { zone: 'Inseam', rtw: '68–78', plusSize: '70–82', note: 'От cropped до full length' },
  {
    zone: 'Длина изделия (топы/лонгсливы)',
    rtw: '50–65',
    plusSize: '55–70',
    note: 'В зависимости от ткани и фасона',
  },
];

const alphaScaleData = [
  { alpha: 'XXS', it: '36', ru: '38', comment: 'Компрессионный, профессиональный fit' },
  { alpha: 'XS', it: '38', ru: '40', comment: 'Slim fit, тренировки высокой интенсивности' },
  { alpha: 'S', it: '40', ru: '42', comment: 'Стандарт RTW sport' },
  { alpha: 'M', it: '42', ru: '44', comment: 'Универсальный фит для большинства тренировок' },
  { alpha: 'M/L', it: '44', ru: '46', comment: 'Свободный активный комфорт' },
  { alpha: 'L', it: '46', ru: '48', comment: 'Relaxed, лёгкий оверсайз' },
  { alpha: 'XL', it: '48', ru: '50', comment: 'Верх RTW, универсальный Plus entry' },
  { alpha: 'XXL', it: '50', ru: '52', comment: 'Начало Plus сегмента' },
  { alpha: 'XL+', it: '52', ru: '54', comment: 'Curvy fit, высокая талия, мягкий пояс' },
  { alpha: 'XXL+', it: '54', ru: '56', comment: 'Полный Plus, усиленная эластичность' },
  { alpha: '3X', it: '58', ru: '60', comment: 'Full curve, корректирующая компрессия' },
  { alpha: '4X', it: '62', ru: '64', comment: 'Extended Plus, анатомическая пройма' },
  { alpha: '5X', it: '66', ru: '68', comment: 'Super comfort, лёгкий shaping effect' },
];

const practicalCommentsData = [
  {
    indicator: 'Эластичность ткани (stretch)',
    recommendation: '15–30% — оптимум; больше 30% — shapewear-эффект',
  },
  { indicator: 'Компрессия', recommendation: 'Active: −2 см по талии, −4 см по бёдрам' },
  { indicator: 'Длина inseam', recommendation: '68–72 см — 7/8; 74–78 см — full length' },
  { indicator: 'Rise (посадка)', recommendation: 'High: 25–30 см для стабильности в движении' },
  { indicator: 'Ease по груди', recommendation: 'Топы 2–6 см, худи 10–14 см' },
  {
    indicator: 'Талия / пояс',
    recommendation: 'Мягкая эластичная лента или двойная резинка для стабильности',
  },
  {
    indicator: 'Ткань',
    recommendation:
      'Трикотаж с лайкрой, power-mesh, нейлон/спандекс; у Plus — с большей плотностью (220–280 г/м²)',
  },
  {
    indicator: 'Cut lines',
    recommendation: 'Анатомические швы по бокам и под ягодицами для визуальной коррекции',
  },
];

const rtwVsPlusData = [
  { parameter: 'Грудь', rtw: 'стандартная высота', plusSize: '+1,5–2 см' },
  { parameter: 'Подгрудье', rtw: 'мягкий пояс', plusSize: 'утолщённая резинка' },
  { parameter: 'Талия', rtw: 'mid-rise', plusSize: 'high-rise' },
  { parameter: 'Бёдра', rtw: 'плотный контур', plusSize: 'расслабленная посадка по нижней части' },
  { parameter: 'Длина изделия', rtw: 'стандарт', plusSize: '+3–5 см' },
  { parameter: 'Эластичность', rtw: '15–20%', plusSize: '20–30% с компрессией' },
];

export function FitGuideSportswearDialog({
  isOpen,
  onOpenChange,
  audience = 'women',
}: FitGuideSportswearDialogProps) {
  if (audience === 'men') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Справочник по спортивной одежде (Мужское)</DialogTitle>
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
          <DialogDescription>Женская спортивная одежда</DialogDescription>
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
                <CardTitle>🔠 Буквенная шкала (Alpha) для спортивной одежды</CardTitle>
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
