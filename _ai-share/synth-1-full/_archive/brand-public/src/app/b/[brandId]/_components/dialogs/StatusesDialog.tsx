import React from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface StatusesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assignedStatuses: any[];
  potentialStatuses: any[];
}

export function StatusesDialog({
  isOpen,
  onOpenChange,
  assignedStatuses = [],
  potentialStatuses = [],
}: StatusesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden rounded-xl border-none bg-background p-4 shadow-2xl">
        <div className="pointer-events-none absolute right-0 top-0 rotate-12 p-4 opacity-[0.05]">
          <ShieldCheck className="h-64 w-64 text-accent" />
        </div>
        <DialogHeader className="relative z-10">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-full bg-accent/10 px-3 py-1 text-center text-[10px] font-black uppercase tracking-widest text-accent">
              Статусы бренда в системе Syntha
            </div>
          </div>
          <DialogTitle className="text-sm font-black uppercase leading-tight tracking-tighter">
            Система <br />
            <span className="text-accent">Привилегий и Качества</span>
          </DialogTitle>
          <DialogDescription className="max-w-lg pt-4 text-base font-medium leading-relaxed text-foreground/80">
            Статусы присваиваются автоматически на основе объективных данных: отзывов клиентов,
            скорости логистики и результатов аудита.
          </DialogDescription>
        </DialogHeader>
        <div className="custom-scrollbar relative z-10 mt-8 max-h-[600px] space-y-4 overflow-y-auto pr-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                Присвоенные статусы
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {(assignedStatuses || []).map((status) => (
                <Card
                  key={status.id}
                  className="group relative overflow-hidden rounded-2xl border border-accent/20 bg-accent/[0.03] p-4 shadow-md"
                >
                  <div className="absolute right-0 top-0 p-2">
                    <Badge className="border-none bg-accent text-[8px] uppercase tracking-tighter text-white">
                      Активен
                    </Badge>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-accent shadow-sm">
                      {status.icon}
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-black uppercase tracking-wider text-foreground">
                        {status.name}
                      </h5>
                      <p className="text-xs font-bold text-accent/80">{status.description}</p>
                      <p className="mt-2 text-[11px] font-medium italic leading-relaxed text-muted-foreground">
                        {status.fullDesc}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Потенциальные статусы
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {(potentialStatuses || []).map((status) => (
                <Card
                  key={status.id}
                  className="cursor-help rounded-2xl border border-muted/20 bg-muted/5 p-4 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-muted-foreground">
                      {status.icon}
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-black uppercase tracking-wider text-foreground">
                        {status.name}
                      </h5>
                      <p className="text-xs font-bold text-muted-foreground">
                        {status.description}
                      </p>
                      <p className="mt-2 text-[11px] font-medium italic leading-relaxed text-muted-foreground/60">
                        {status.fullDesc}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
