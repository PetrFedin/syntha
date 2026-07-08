import React from 'react';
import Image from 'next/image';
import { X, Heart, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface MentionDialogProps {
  mention: any;
  onClose: () => void;
}

export function MentionDialog({ mention, onClose }: MentionDialogProps) {
  return (
    <Dialog open={!!mention} onOpenChange={onClose}>
      <DialogContent className="max-w-xl overflow-hidden rounded-xl border-none bg-background p-0 shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>Отметка покупателя: @{mention?.user}</DialogTitle>
        </VisuallyHidden>
        <div className="relative aspect-square">
          <Image src={mention?.imageUrl} alt="Mention" fill className="object-cover" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-full bg-black/20 text-white hover:bg-black/40"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-6 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-accent">
              <Image src={mention?.avatar} alt="user" width={40} height={40} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-tight">@{mention?.user}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {mention?.date}
              </p>
            </div>
          </div>
          <p className="text-base font-medium italic leading-relaxed text-foreground/80">
            "{mention?.text}"
          </p>
          <div className="flex gap-3 pt-4">
            <Button className="h-11 flex-1 rounded-xl bg-black text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-accent">
              Смотреть в Instagram
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-muted-foreground/10 transition-all hover:bg-muted"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
