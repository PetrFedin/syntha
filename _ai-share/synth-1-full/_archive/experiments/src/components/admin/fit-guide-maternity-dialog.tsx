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

interface FitGuideMaternityDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const constructionFeaturesData = [
  { zone: 'Грудь', rtw: 'базовая', maternityFit: '+4–8', comment: 'рост груди в 2–3 триместре' },
  {
    zone: 'Под грудью',
    rtw: 'базовая',
    maternityFit: '+4–6',
    comment: 'изменение рёберного объёма',
  },
  {
    zone: 'Талия (живот)',
    rtw: '—',
    maternityFit: '+12–26',
    comment: 'ткань с драпировкой, jersey insert',
  },
  { zone: 'Бёдра', rtw: 'базовая', maternityFit: '+4–8', comment: 'для равновесия пропорций' },
  { zone: 'Длина переда', rtw: '+0', maternityFit: '+5–12', comment: 'компенсирует вынос живота' },
  {
    zone: 'Ease (свобода)',
    rtw: '4–6',
    maternityFit: '10–16',
    comment: 'мягкий трикотаж, jersey knit',
  },
];

const categoryExplanationData = [
  {
    subcategory: 'Платья и сарафаны для беременных',
    philosophy: 'Empire / A-line',
    features: 'высокая талия, драпировка, резинка по спинке',
  },
  {
    subcategory: 'Блузы и туники',
    philosophy: 'Relaxed top',
    features: 'складки под грудью, пуговицы для кормления',
  },
  {
    subcategory: 'Брюки и леггинсы maternity',
    philosophy: 'Stretch band',
    features: 'высокая вставка jersey на живот, удлинённая спина',
  },
  {
    subcategory: 'Худи, свитшоты, домашние костюмы',
    philosophy: 'Adaptive comfort',
    features: 'extra-length переда, заниженная линия талии',
  },
  {
    subcategory: 'Нижнее бельё и пижамы для беременных',
    philosophy: 'Seamless / nursing',
    features: 'мягкие чашки без косточек, feeding-access',
  },
];

export function FitGuideMaternityDialog({ isOpen, onOpenChange }: FitGuideMaternityDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">Комментарии по лекалам и посадке</DialogTitle>
          <DialogDescription>Женская одежда для беременных</DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 flex-1">
          <div className="space-y-4 px-6">
            <Card>
              <CardHeader>
                <CardTitle>📏 Особенности конструкции</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Зона</TableHead>
                      <TableHead>RTW (см)</TableHead>
                      <TableHead>Maternity Fit (см)</TableHead>
                      <TableHead>Комментарий</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {constructionFeaturesData.map((row) => (
                      <TableRow key={row.zone}>
                        <TableCell className="font-medium">{row.zone}</TableCell>
                        <TableCell>{row.rtw}</TableCell>
                        <TableCell>{row.maternityFit}</TableCell>
                        <TableCell className="text-muted-foreground">{row.comment}</TableCell>
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
