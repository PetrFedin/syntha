'use client';

import type { Dispatch, SetStateAction } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  MapPin,
  RotateCcw,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type BrandProfileLegalDataState = {
  legalName: string;
  inn: string;
  kpp: string;
  ogrn: string;
  okpo: string;
  oktmo: string;
  okved: string;
  okvedDesc: string;
  okfs: string;
  okopf: string;
  legalAddress: string;
  actualAddress: string;
  bankName: string;
  bik: string;
  corrAccount: string;
  paymentAccount: string;
  ceo: string;
  ceoPosition: string;
  foundingDate: string;
  registrationAuthority: string;
  taxRegime: string;
  authorizedCapital: string;
  licenses: string;
  powersOfAttorney: string;
  insurance: string;
  isVerified: boolean;
};

export type BrandProfileLegalTabProps = {
  legalData: BrandProfileLegalDataState;
  setLegalData: Dispatch<SetStateAction<BrandProfileLegalDataState>>;
  isEditing: boolean;
  isVerifying: string | null;
  onVerifyLegal: () => void;
  tabPanelClassName: string;
};

export function BrandProfileLegalTab({
  legalData,
  setLegalData,
  isEditing,
  isVerifying,
  onVerifyLegal,
  tabPanelClassName,
}: BrandProfileLegalTabProps) {
  return (
    <TabsContent value="legal" className={tabPanelClassName}>
      <div className="border-border-subtle space-y-1 border-b pb-4">
        <h2 className="text-text-primary text-base font-semibold">Юридические данные</h2>
        <p className="text-text-secondary text-sm">
          Реквизиты и регистрационные сведения для договоров и счетов в РФ.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="border-border-subtle flex flex-wrap items-end justify-between gap-2 border-b pb-3">
            <h3 className="text-text-primary text-sm font-semibold">Регистрация компании</h3>
            <div className="flex items-center gap-2">
              {legalData.isVerified ? (
                <Badge className="border-state-success/30 bg-state-success/10 text-state-success h-6 gap-1 border px-2 text-xs font-medium">
                  <CheckCircle2 className="size-3.5" /> Верифицировано ФНС
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onVerifyLegal}
                  disabled={isVerifying === 'legal'}
                  className="h-8 gap-1.5 rounded-lg bg-amber-50 px-3 text-xs font-medium text-amber-800 hover:bg-amber-100"
                >
                  <RotateCcw
                    className={cn('size-3.5', isVerifying === 'legal' && 'animate-spin')}
                  />{' '}
                  Проверить в ФНС
                </Button>
              )}
            </div>
          </div>
          <Card className="border-border-default space-y-2 rounded-xl border bg-white p-4 shadow-sm md:p-5">
            {(
              [
                {
                  key: 'legalName' as const,
                  label: 'Наименование',
                  value: legalData.legalName,
                  icon: Building2,
                },
                { key: 'inn' as const, label: 'ИНН', value: legalData.inn, icon: FileText },
                { key: 'kpp' as const, label: 'КПП', value: legalData.kpp, icon: FileText },
                { key: 'ogrn' as const, label: 'ОГРН', value: legalData.ogrn, icon: FileText },
                { key: 'okpo' as const, label: 'ОКПО', value: legalData.okpo, icon: FileText },
                { key: 'oktmo' as const, label: 'ОКТМО', value: legalData.oktmo, icon: FileText },
                { key: 'okved' as const, label: 'ОКВЭД', value: legalData.okved, icon: FileText },
                {
                  key: 'okvedDesc' as const,
                  label: 'ОКВЭД (описание)',
                  value: legalData.okvedDesc,
                  icon: FileText,
                },
                {
                  key: 'foundingDate' as const,
                  label: 'Дата регистрации',
                  value: legalData.foundingDate,
                  icon: Calendar,
                },
              ] as const
            ).map((item, i) => (
              <div
                key={i}
                className="border-border-subtle/50 bg-bg-surface2 hover:bg-bg-surface2 group flex items-center justify-between rounded-lg border p-2.5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="border-border-subtle flex size-7 items-center justify-center rounded-lg border bg-white shadow-sm transition-transform group-hover:scale-105">
                    <item.icon className="text-accent-primary size-3.5" />
                  </div>
                  <span className="text-text-muted text-xs font-medium">{item.label}</span>
                </div>
                {isEditing ? (
                  <Input
                    value={item.value}
                    onChange={(e) =>
                      setLegalData((prev) => ({ ...prev, [item.key]: e.target.value }))
                    }
                    className="border-border-default h-8 w-full max-w-[min(100%,20rem)] rounded-md bg-white text-right text-sm font-medium sm:w-48"
                  />
                ) : (
                  <span className="text-text-primary max-w-[min(100%,20rem)] text-right text-sm font-medium tracking-tight">
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-3">
          <div className="border-border-subtle border-b pb-3">
            <h3 className="text-text-primary text-sm font-semibold">Руководство и полномочия</h3>
          </div>
          <Card className="border-border-default flex h-full flex-col justify-center space-y-2 rounded-xl border bg-white p-4 shadow-sm md:p-5">
            {(
              [
                { key: 'ceo' as const, label: 'CEO', value: legalData.ceo, icon: Users },
                {
                  key: 'ceoPosition' as const,
                  label: 'Должность',
                  value: legalData.ceoPosition,
                  icon: Briefcase,
                },
                {
                  key: 'registrationAuthority' as const,
                  label: 'Рег. Орган',
                  value: legalData.registrationAuthority,
                  icon: ShieldCheck,
                },
                {
                  key: 'taxRegime' as const,
                  label: 'Налоговый режим',
                  value: legalData.taxRegime,
                  icon: CreditCard,
                },
                {
                  key: 'authorizedCapital' as const,
                  label: 'Уставной капитал',
                  value: legalData.authorizedCapital,
                  icon: DollarSign,
                },
              ] as const
            ).map((item, i) => (
              <div
                key={i}
                className="border-border-subtle/50 bg-bg-surface2 hover:bg-bg-surface2 group flex items-center justify-between rounded-lg border p-2.5 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="border-border-subtle flex size-7 items-center justify-center rounded-lg border bg-white shadow-sm transition-transform group-hover:scale-105">
                    <item.icon className="text-state-success size-3.5" />
                  </div>
                  <span className="text-text-muted text-xs font-medium">{item.label}</span>
                </div>
                {isEditing ? (
                  <Input
                    value={item.value}
                    onChange={(e) =>
                      setLegalData((prev) => ({ ...prev, [item.key]: e.target.value }))
                    }
                    className="border-border-default h-8 w-full max-w-[min(100%,20rem)] rounded-md bg-white text-right text-sm font-medium sm:w-48"
                  />
                ) : (
                  <span className="text-text-primary max-w-[min(100%,20rem)] truncate text-right text-sm font-medium tracking-tight">
                    {item.value}
                  </span>
                )}
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="border-border-subtle border-b pb-3">
            <h3 className="text-text-primary text-sm font-semibold">Адреса</h3>
          </div>
          <Card className="border-border-default space-y-3 rounded-xl border bg-white p-4 shadow-sm md:p-5">
            {(
              [
                {
                  key: 'legalAddress' as const,
                  label: 'Юридический адрес',
                  value: legalData.legalAddress,
                },
                {
                  key: 'actualAddress' as const,
                  label: 'Фактический адрес',
                  value: legalData.actualAddress,
                },
              ] as const
            ).map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="size-3 text-blue-600" />
                  <span className="text-text-muted text-xs font-medium">{item.label}</span>
                </div>
                {isEditing ? (
                  <Textarea
                    value={item.value}
                    onChange={(e) =>
                      setLegalData((prev) => ({ ...prev, [item.key]: e.target.value }))
                    }
                    className="border-border-default bg-bg-surface2 min-h-[72px] rounded-lg p-3 text-sm font-medium"
                  />
                ) : (
                  <p className="border-border-subtle bg-bg-surface2 text-text-secondary rounded-lg border p-3 text-sm font-medium">
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-3">
          <div className="border-border-subtle border-b pb-3">
            <h3 className="text-text-primary text-sm font-semibold">Банковские реквизиты</h3>
          </div>
          <Card className="border-border-default flex h-full flex-col justify-center rounded-xl border bg-white p-4 shadow-sm md:p-5">
            <div className="space-y-2">
              {(
                [
                  { key: 'bankName' as const, label: 'Банк', value: legalData.bankName },
                  { key: 'bik' as const, label: 'БИК', value: legalData.bik },
                  {
                    key: 'corrAccount' as const,
                    label: 'Корр. счет',
                    value: legalData.corrAccount,
                  },
                  {
                    key: 'paymentAccount' as const,
                    label: 'Р/С',
                    value: legalData.paymentAccount,
                  },
                ] as const
              ).map((item, i) => (
                <div
                  key={i}
                  className="border-border-subtle flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-text-muted text-xs font-medium">{item.label}</span>
                  {isEditing ? (
                    <Input
                      value={item.value}
                      onChange={(e) =>
                        setLegalData((prev) => ({ ...prev, [item.key]: e.target.value }))
                      }
                      className="border-border-default bg-bg-surface2 h-8 w-full max-w-xs rounded-md text-right font-mono text-sm font-medium"
                    />
                  ) : (
                    <span className="text-text-primary font-mono text-sm font-medium tracking-tight">
                      {item.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border-default rounded-xl border bg-white p-4 shadow-sm md:p-5">
          <div className="border-border-subtle mb-3 flex items-center gap-2 border-b pb-3">
            <ShieldCheck className="text-accent-primary size-4" />
            <h3 className="text-text-primary text-sm font-semibold">Лицензии</h3>
          </div>
          {isEditing ? (
            <Textarea
              value={legalData.licenses}
              onChange={(e) => setLegalData((prev) => ({ ...prev, licenses: e.target.value }))}
              className="min-h-[60px] text-sm"
              placeholder="При необходимости"
            />
          ) : (
            <p className="text-text-secondary text-sm font-medium">{legalData.licenses}</p>
          )}
        </Card>
        <Card className="border-border-default rounded-xl border bg-white p-4 shadow-sm md:p-5">
          <div className="border-border-subtle mb-3 flex items-center gap-2 border-b pb-3">
            <FileText className="text-state-success size-4" />
            <h3 className="text-text-primary text-sm font-semibold">Доверенности</h3>
          </div>
          {isEditing ? (
            <Textarea
              value={legalData.powersOfAttorney}
              onChange={(e) =>
                setLegalData((prev) => ({ ...prev, powersOfAttorney: e.target.value }))
              }
              className="min-h-[60px] text-sm"
              placeholder="Ген. доверенность, спец. доверенность"
            />
          ) : (
            <p className="text-text-secondary text-sm font-medium">{legalData.powersOfAttorney}</p>
          )}
        </Card>
        <Card className="border-border-default rounded-xl border bg-white p-4 shadow-sm md:p-5">
          <div className="border-border-subtle mb-3 flex items-center gap-2 border-b pb-3">
            <Shield className="size-4 text-amber-600" />
            <h3 className="text-text-primary text-sm font-semibold">Страхование</h3>
          </div>
          {isEditing ? (
            <Input
              value={legalData.insurance}
              onChange={(e) => setLegalData((prev) => ({ ...prev, insurance: e.target.value }))}
              className="h-9 text-sm"
              placeholder="ОСАГО, ДМС, КАСКО"
            />
          ) : (
            <p className="text-text-secondary text-sm font-medium">{legalData.insurance}</p>
          )}
        </Card>
      </div>
    </TabsContent>
  );
}
