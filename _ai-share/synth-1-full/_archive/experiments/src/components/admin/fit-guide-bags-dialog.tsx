'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { bagDetailsData } from '@/lib/bag-data';
import { cn } from '@/lib/utils';

interface FitGuideBagsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedBagType: string | null;
}

export function FitGuideBagsDialog({
  isOpen,
  onOpenChange,
  selectedBagType,
}: FitGuideBagsDialogProps) {
  const details = selectedBagType
    ? bagDetailsData[selectedBagType as keyof typeof bagDetailsData]
    : null;

  if (!details) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Информация не найдена</DialogTitle>
            <DialogDescription>
              Подробная информация для этого типа сумки отсутствует.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const sectionIcons: { [key: string]: string } = {
    '1': '⚙️',
    '2': '👗',
    '3': '🧩',
    '4': '🧵',
    '5': '🧪',
    '6': '🧠',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-sm">{selectedBagType}</DialogTitle>
          <DialogDescription>Конструктивные особенности и технический профиль</DialogDescription>
        </DialogHeader>
        <ScrollArea className="-mx-6 flex-1">
          <div className="space-y-6 px-6">
            {Object.entries(details).map(([key, section]) => {
              const sectionNumber = key.split('.')[0];
              const columnHasData = (colIndex: number) => {
                if (!section.rows) return true;
                return section.rows.some((row) => {
                  const value = Object.values(row)[colIndex];
                  return value !== null && value !== undefined && value !== '';
                });
              };

              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-sm">{sectionIcons[sectionNumber]}</span>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto">
                    {section.type === 'table' && section.headers && section.rows && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {section.headers.map(
                              (header, index) =>
                                columnHasData(index) && (
                                  <TableHead key={index} className="whitespace-nowrap">
                                    {header}
                                  </TableHead>
                                )
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {section.rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {Object.values(row).map(
                                (cell, cellIndex) =>
                                  columnHasData(cellIndex) && (
                                    <TableCell
                                      key={cellIndex}
                                      className={cn(
                                        cellIndex === 0 && 'font-medium',
                                        'whitespace-nowrap text-sm'
                                      )}
                                    >
                                      {cell}
                                    </TableCell>
                                  )
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {section.type === 'profile' && section.rows && (
                      <div className="space-y-2 text-sm">
                        {section.rows.map((row, index) =>
                          'key' in row && 'value' in row ? (
                            <p key={index}>
                              <strong>{row.key}:</strong> {row.value}
                            </p>
                          ) : null
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
