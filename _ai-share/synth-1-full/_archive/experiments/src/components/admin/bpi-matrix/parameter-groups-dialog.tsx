'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ParameterGroupsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  parameters: { id: string; name: string; group: string }[];
}

export function ParameterGroupsDialog({
  isOpen,
  onOpenChange,
  parameters,
}: ParameterGroupsDialogProps) {
  const groupedParameters = parameters.reduce(
    (acc, param) => {
      const group = param.group || 'Без группы';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(param);
      return acc;
    },
    {} as Record<string, typeof parameters>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Тематические группы параметров (P)</DialogTitle>
          <DialogDescription>
            Все параметры сгруппированы по их влиянию на бизнес-модель бренда.
          </DialogDescription>
        </DialogHeader>
        <div className="-mr-6 flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-3 px-6 md:grid-cols-2">
            {Object.entries(groupedParameters).map(([groupName, params]) => (
              <Card key={groupName}>
                <CardHeader>
                  <CardTitle className="text-sm">{groupName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {params.map((p) => (
                      <li key={p.id}>
                        <span className="inline-block w-8 font-mono font-semibold">{p.id}</span>
                        <span className="text-muted-foreground">{p.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
