'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ClassifierDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  classificationData: { id: number; group: string; segment: string; description: string }[];
}

export function ClassifierDialog({
  isOpen,
  onOpenChange,
  classificationData,
}: ClassifierDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Классификатор брендов</DialogTitle>
          <DialogDescription>
            Матрица для сегментации брендов по стилю, ценностям и позиционированию. Эта модель
            используется для обучения AI, рекомендательных систем и аналитических отчетов.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Номер</TableHead>
                <TableHead className="w-[200px]">Группа</TableHead>
                <TableHead className="w-[300px]">Классификатор</TableHead>
                <TableHead>Описание</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classificationData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono">{row.id}</TableCell>
                  <TableCell className="font-semibold">{row.group}</TableCell>
                  <TableCell className="font-medium">{row.segment}</TableCell>
                  <TableCell className="text-muted-foreground">{row.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
