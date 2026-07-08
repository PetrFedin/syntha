import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Quote, MessageSquare, Instagram, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

interface TeamDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  brand: any;
  currentTeamIdx: number;
  setCurrentTeamIdx: React.Dispatch<React.SetStateAction<number>>;
  /** Имя бренда для заголовка доступности (необязательно). */
  displayName?: string;
}

export function TeamDialog({
  isOpen,
  onOpenChange,
  brand,
  currentTeamIdx,
  setCurrentTeamIdx,
  displayName,
}: TeamDialogProps) {
  const brandLabel = displayName?.trim() || '';
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
        <DialogTitle className="sr-only">
          {brandLabel ? `Команда бренда ${brandLabel}` : 'Команда бренда'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Информация о ключевых участниках команды и их ролях в развитии бренда
        </DialogDescription>
        <div className="relative flex aspect-video w-full flex-col overflow-hidden rounded-xl bg-white shadow-2xl md:aspect-[16/9] md:flex-row">
          <div className="relative h-64 w-full overflow-hidden md:h-auto md:w-1/2">
            <AnimatePresence>
              <motion.div
                key={currentTeamIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <Image
                  src={brand?.team?.[currentTeamIdx]?.imageUrl || ''}
                  alt={brand?.team?.[currentTeamIdx]?.name || ''}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>

            {(brand?.team?.length || 0) > 1 && (
              <div className="absolute bottom-8 left-8 z-20 flex gap-2">
                <button
                  onClick={() =>
                    setCurrentTeamIdx((prev) =>
                      prev > 0 ? prev - 1 : (brand.team?.length || 1) - 1
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentTeamIdx((prev) =>
                      prev < (brand.team?.length || 1) - 1 ? prev + 1 : 0
                    )
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="relative flex flex-1 flex-col justify-center bg-white p-4 md:p-4">
            <DialogPrimitive.Close asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-4 rounded-full hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogPrimitive.Close>

            <AnimatePresence>
              <motion.div
                key={currentTeamIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
                    Команда
                  </p>
                  <h3 className="text-base font-black uppercase leading-none tracking-tighter">
                    {brand?.team?.[currentTeamIdx]?.name}
                  </h3>
                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {brand?.team?.[currentTeamIdx]?.role}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Quote className="absolute -left-4 -top-4 h-8 w-8 text-accent/10" />
                    <p className="relative z-10 pl-2 text-sm font-medium italic leading-relaxed text-foreground/80">
                      «{brand?.team?.[currentTeamIdx]?.quote}»
                    </p>
                  </div>
                  <div className="h-px w-12 bg-accent/20" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {brand?.team?.[currentTeamIdx]?.bio}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="group/btn flex h-10 items-center gap-2 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-accent transition-transform group-hover/btn:-rotate-12" />
                    Написать
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl border border-transparent transition-all hover:border-accent/10 hover:bg-accent/5 hover:text-accent"
                    >
                      <Instagram className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl border border-transparent transition-all hover:border-accent/10 hover:bg-accent/5 hover:text-accent"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {(brand?.team?.length || 0) > 1 && (
              <div className="absolute bottom-8 right-12 flex gap-1.5">
                {brand.team?.map((_: any, i: number) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1 rounded-full transition-all duration-300',
                      i === currentTeamIdx ? 'w-4 bg-accent' : 'w-1 bg-accent/20'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
