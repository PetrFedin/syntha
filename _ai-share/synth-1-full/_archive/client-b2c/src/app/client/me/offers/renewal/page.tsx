'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import Link from 'next/link';
import { useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ROUTES } from '@/lib/routes';
import { ClientCabinetSectionHeader } from '@/components/layout/cabinet-profile-section-headers';

export default function RenewalOfferLetterPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const offer = user?.subscription?.renewalOffer;
  const title = useMemo(() => {
    if (!offer) return 'Предложение по продлению подписки';
    if (offer.type === 'promo') return 'Промокод на продление подписки';
    return offer.subject || 'Письмо с предложением по продлению';
  }, [offer]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Скопировано', description: 'Промокод скопирован в буфер обмена.' });
    } catch {
      toast({ title: 'Не удалось скопировать', variant: 'destructive' });
    }
  };

  return (
    <CabinetPageContent maxWidth="3xl" className="mx-auto py-10 pb-16">
      <ClientCabinetSectionHeader
        title={title}
        description="Письмо от Syntha с инструкцией по продлению."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>От: Syntha • Кому: {user?.email || '—'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {!offer && (
            <>
              <p>
                Сейчас для вашего аккаунта нет активного предложения. Вы можете продлить подписку в
                разделе лояльности.
              </p>
              <Button asChild>
                <Link href="/loyalty?renew=1">Перейти к продлению</Link>
              </Button>
            </>
          )}

          {offer?.type === 'promo' && (
            <>
              <p>
                Для вас доступно предложение: <strong>{offer.discountPercent}%</strong> на продление
                подписки.
              </p>
              <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Промокод</div>
                  <div className="font-mono text-sm font-bold">{offer.code}</div>
                  {offer.expiresAt && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Действует до{' '}
                      {format(new Date(offer.expiresAt), 'd MMMM yyyy', { locale: ru })}
                    </div>
                  )}
                </div>
                <Button type="button" onClick={() => copy(offer.code)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Скопировать
                </Button>
              </div>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Нажмите «Перейти к продлению».</li>
                <li>Вставьте промокод в поле оплаты и примените скидку.</li>
                <li>Подтвердите продление.</li>
              </ol>
              <Button asChild>
                <Link href="/loyalty?renew=1">Перейти к продлению</Link>
              </Button>
            </>
          )}

          {offer?.type === 'email' && (
            <>
              <Badge variant="secondary" className="w-fit">
                Уникальное предложение
              </Badge>
              <p>Для вас подготовлено персональное предложение на продление подписки.</p>
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="mb-2 text-xs text-muted-foreground">Инструкция</div>
                <ol className="list-decimal space-y-1 pl-5">
                  {offer.instructions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ol>
              </div>
              <Button asChild>
                <Link href="/loyalty?renew=1">Перейти к продлению</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </CabinetPageContent>
  );
}
