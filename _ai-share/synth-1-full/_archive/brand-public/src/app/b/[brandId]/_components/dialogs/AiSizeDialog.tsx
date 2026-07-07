import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AiSizeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
}

export function AiSizeDialog({ isOpen, onOpenChange, displayName }: AiSizeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-xl border-none bg-background p-3 text-center shadow-2xl">
        <div className="absolute left-0 top-0 h-1.5 w-full bg-muted/10">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: '30%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Brain className="h-12 w-12" />
          <Sparkles className="absolute -right-2 -top-2 h-6 w-6 animate-bounce" />
        </div>
        <DialogTitle className="mb-4 text-base font-black uppercase leading-tight tracking-tighter">
          AI Подбор размера
        </DialogTitle>
        <DialogDescription className="text-base font-medium leading-relaxed text-muted-foreground">
          Нейросеть анализирует ваши параметры и историю покупок в {displayName} для определения
          идеальной посадки.
        </DialogDescription>

        <div className="mt-10 space-y-4">
          <div className="space-y-4 rounded-3xl border-2 border-dashed border-accent/20 bg-muted/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Ваш профиль
              </span>
              <Badge className="border-none bg-accent text-[8px] font-black uppercase text-white">
                Active
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <p className="mb-1 text-[8px] font-black uppercase text-muted-foreground/60">
                  Рост
                </p>
                <p className="text-sm font-black uppercase">178 см</p>
              </div>
              <div>
                <p className="mb-1 text-[8px] font-black uppercase text-muted-foreground/60">Вес</p>
                <p className="text-sm font-black uppercase">72 кг</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="h-10 w-full rounded-2xl bg-black text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-accent">
              Запустить сканирование
            </Button>
            <p className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground/60">
              Точность подбора: 98.4%
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
