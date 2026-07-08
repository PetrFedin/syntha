'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Promotion, PromotionStatus } from '@/lib/types';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface AppealPromotionDialogProps {
  promotion: Promotion;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAppeal: (promotion: Promotion, reason: string) => void;
}

export function AppealPromotionDialog({
  promotion,
  isOpen,
  onOpenChange,
  onAppeal,
}: AppealPromotionDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [requestedStatus, setRequestedStatus] = useState<PromotionStatus>('pending');

  const handleSubmit = () => {
    onAppeal(promotion, reason);
    onOpenChange(false);
    toast({
      title: 'Апелляция отправлена',
      description: 'Ваш запрос на пересмотр статуса кампании отправлен администратору.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Обжаловать решение по кампании</DialogTitle>
          <DialogDescription>
            Опишите причину, по которой вы не согласны с текущим статусом кампании "
            {promotion.productName}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="requested-status">Запросить статус</Label>
            <Select
              value={requestedStatus}
              onValueChange={(v) => setRequestedStatus(v as PromotionStatus)}
            >
              <SelectTrigger id="requested-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">На пересмотр</SelectItem>
                <SelectItem value="active">Активировать</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appeal-reason">Обоснование</Label>
            <Textarea
              id="appeal-reason"
              placeholder="Например, 'Считаем, что креатив соответствует правилам платформы...'"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!reason.trim()}>
            Отправить апелляцию
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
