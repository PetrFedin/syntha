'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, LinkIcon, Send } from 'lucide-react';

interface MessageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  messageCategory: string;
  displayName: string;
  messageText: string;
  setMessageText: (text: string) => void;
  messageLink: string;
  setMessageLink: (link: string) => void;
  handleSendMessage: () => void;
}

export function MessageDialog({
  isOpen,
  onOpenChange,
  messageCategory,
  displayName,
  messageText,
  setMessageText,
  messageLink,
  setMessageLink,
  handleSendMessage,
}: MessageDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl border-none bg-background p-4 shadow-2xl">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-accent/20 bg-accent/5 text-[9px] font-black uppercase tracking-widest text-accent"
            >
              {messageCategory || 'Общий запрос'}
            </Badge>
          </div>
          <DialogTitle className="flex items-center gap-3 text-base font-black uppercase tracking-tighter">
            <MessageSquare className="h-6 w-6 text-accent" />
            Написать бренду
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm font-medium">
            Отправьте сообщение напрямую команде {displayName}. Сообщение будет доставлено в чат с
            пометкой "{messageCategory}".
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="message"
              className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              Ваше сообщение
            </Label>
            <Textarea
              id="message"
              placeholder="Опишите ваш вопрос или предложение..."
              className="min-h-[120px] resize-none rounded-2xl border-muted/20 bg-muted/5 p-4 text-sm focus:border-accent/30"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="links"
              className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              Ссылки на файлы / Инфо
            </Label>
            <div className="relative">
              <Input
                id="links"
                placeholder="Ссылка на файл (Google Диск, Яндекс.Диск…)"
                className="h-11 rounded-xl border-muted/20 bg-muted/5 pl-10 text-xs focus:border-accent/30"
                value={messageLink}
                onChange={(e) => setMessageLink(e.target.value)}
              />
              <LinkIcon className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
            <p className="px-1 text-[8px] italic text-muted-foreground">
              Прикрепите ссылку на презентацию, прайс или портфолио
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              className="h-12 flex-1 rounded-2xl bg-accent font-black uppercase tracking-widest text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send className="mr-2 h-4 w-4" /> Отправить сообщение
            </Button>
          </div>
          <p className="text-center text-[9px] font-medium uppercase tracking-tighter text-muted-foreground">
            Обычно бренды отвечают в течение 24 часов
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
