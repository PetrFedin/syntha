import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface PressDialogProps {
  press: any;
  onClose: () => void;
}

export function PressDialog({ press, onClose }: PressDialogProps) {
  return (
    <Dialog open={!!press} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl overflow-hidden rounded-xl border-none bg-background p-0 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Статья: {press?.title}</DialogTitle>
        </VisuallyHidden>
        <div className="relative aspect-[16/7]">
          <Image src={press?.imageUrl} alt={press?.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute left-8 top-4 flex h-10 w-32 items-center justify-center rounded-xl bg-white/90 p-2 shadow-lg backdrop-blur-md">
            <img src={press?.logoUrl} alt={press?.name} className="h-full object-contain" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-6 top-4 rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/40"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-6 p-3">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
              {press?.name} Special Feature
            </span>
            <h3 className="text-base font-black uppercase leading-tight tracking-tighter">
              {press?.title}
            </h3>
          </div>
          <p className="text-sm font-medium italic leading-relaxed text-foreground/80">
            "Syntha Lab устанавливает новые стандарты в индустрии, объединяя экологическую
            ответственность with передовыми AI-технологиями."
          </p>
          <div className="flex gap-3 pt-6">
            <Button className="h-12 flex-1 rounded-xl bg-black text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-accent">
              Читать статью на сайте издания
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-xl border-muted-foreground/10 px-6 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-muted"
            >
              Скачать PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
