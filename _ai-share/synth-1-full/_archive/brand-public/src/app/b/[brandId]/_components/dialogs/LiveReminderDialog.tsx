import React from 'react';
import { Radio } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LiveReminderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  liveReminderTime: string;
  setLiveReminderTime: (time: string) => void;
  toast: any;
}

export function LiveReminderDialog({
  isOpen,
  onOpenChange,
  liveReminderTime,
  setLiveReminderTime,
  toast,
}: LiveReminderDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border-none bg-background p-3 text-center shadow-2xl">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Radio className="h-10 w-10 animate-pulse" />
        </div>
        <DialogTitle className="mb-4 text-base font-black uppercase leading-tight tracking-tighter">
          Напомнить об эфире?
        </DialogTitle>
        <DialogDescription className="text-base font-medium leading-relaxed text-muted-foreground">
          Мы отправим вам PUSH-уведомление и сообщение в личный кабинет, чтобы вы не пропустили
          начало трансляции.
        </DialogDescription>

        <div className="mt-10 space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              За сколько напомнить?
            </p>
            <div className="flex justify-center gap-2">
              {['5', '15', '30', '60'].map((time) => (
                <Button
                  key={time}
                  variant={liveReminderTime === time ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-10 w-10 rounded-xl text-[10px] font-black transition-all',
                    liveReminderTime === time
                      ? 'border-black bg-black text-white shadow-lg'
                      : 'hover:bg-muted'
                  )}
                  onClick={() => setLiveReminderTime(time)}
                >
                  {time}м
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              className="h-10 w-full rounded-2xl bg-black text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-accent"
              onClick={() => {
                onOpenChange(false);
                toast({
                  title: 'Напоминание установлено!',
                  description: `Мы сообщим вам за ${liveReminderTime} минут до начала.`,
                });
              }}
            >
              Установить
            </Button>
            <Button
              variant="ghost"
              className="h-10 w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
