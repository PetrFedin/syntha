'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockChat } from '@/lib/order-data';
import type { Product } from '@/lib/types';
import { AttachProductDialog } from './attach-product-dialog';
import Image from 'next/image';

export function OrderChat() {
  const [chatHistory, setChatHistory] = useState(mockChat);
  const [newMessage, setNewMessage] = useState('');
  const [isAttachProductOpen, setIsAttachProductOpen] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setChatHistory((prev) => [
        {
          user: 'Вы (бренд)',
          text: newMessage,
          time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
      setNewMessage('');
    }
  };

  const handleAttachProduct = (product: Product) => {
    setChatHistory((prev) => [
      {
        user: 'Вы (бренд)',
        text: `Прикрепляю товар для обсуждения.`,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        attachedProduct: product,
      },
      ...prev,
    ]);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Обсуждение</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[450px] flex-col">
          <ScrollArea className="mb-4 flex-1 pr-3">
            <div className="space-y-4">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex max-w-[80%] flex-col',
                    msg.isSystem
                      ? 'w-full items-center'
                      : msg.user.includes('бренд')
                        ? 'items-end self-end'
                        : 'items-start self-start'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-lg p-3',
                      msg.isSystem
                        ? 'border-none bg-transparent p-0'
                        : msg.user.includes('бренд')
                          ? 'bg-primary text-primary-foreground'
                          : 'border bg-background'
                    )}
                  >
                    {msg.isSystem ? (
                      <p className="text-center text-xs italic text-muted-foreground">{msg.text}</p>
                    ) : (
                      <p className="text-sm">{msg.text}</p>
                    )}
                    {msg.attachedProduct && (
                      <div className="mt-2 flex items-center gap-2 rounded-md bg-secondary/50 p-2">
                        <Image
                          src={msg.attachedProduct.images[0].url}
                          alt={msg.attachedProduct.name}
                          width={32}
                          height={40}
                          className="rounded-sm object-cover"
                        />
                        <div>
                          <p className="text-xs font-semibold">{msg.attachedProduct.name}</p>
                          <p className="text-xs text-muted-foreground">{msg.attachedProduct.sku}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {!msg.isSystem && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {msg.user} - {msg.time}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="flex gap-2 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsAttachProductOpen(true)}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Textarea
              placeholder="Ваше сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={1}
              className="min-h-0"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      <AttachProductDialog
        isOpen={isAttachProductOpen}
        onOpenChange={setIsAttachProductOpen}
        onAttach={handleAttachProduct}
      />
    </>
  );
}
