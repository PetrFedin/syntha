'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface PaymentFlowCardProps {
  orderId: string;
  amount: string;
  status: 'pending' | 'paid' | 'escrow';
  dueDate?: string;
  onPay?: () => void;
}

export function PaymentFlowCard({ orderId, amount, status, dueDate, onPay }: PaymentFlowCardProps) {
  return (
    <Card className="border-border-subtle border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold">{orderId}</CardTitle>
          <Badge
            className={cn(
              'text-[9px]',
              status === 'paid' && 'bg-emerald-100 text-emerald-700',
              status === 'escrow' && 'bg-accent-primary/15 text-accent-primary',
              status === 'pending' && 'bg-amber-100 text-amber-700'
            )}
          >
            {status === 'paid' ? 'Оплачено' : status === 'escrow' ? 'Escrow' : 'Ожидает'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-lg font-black">{amount}</p>
        {status === 'pending' && dueDate && (
          <p className="text-text-secondary flex items-center gap-1 text-[10px]">
            <Clock className="h-3 w-3" /> Оплата до {dueDate}
          </p>
        )}
        {status === 'pending' && (
          <Button size="sm" className="w-full" onClick={onPay}>
            <CreditCard className="mr-2 h-4 w-4" /> Оплатить
          </Button>
        )}
        {status === 'paid' && (
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Оплачено
          </div>
        )}
      </CardContent>
    </Card>
  );
}
