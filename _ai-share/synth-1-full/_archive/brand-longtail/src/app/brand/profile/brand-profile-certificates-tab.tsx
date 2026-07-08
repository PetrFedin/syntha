'use client';

import type { Dispatch, SetStateAction } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  Check,
  Database,
  Download,
  ExternalLink,
  Globe,
  Loader2,
  Package,
  Plus,
  ShieldCheck,
  Upload,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';

export type BrandProfileCertificateStatus = 'active' | 'expiring' | 'expired';

export type BrandProfileCertificateItem = {
  id: number;
  name: string;
  type: string;
  certNumber: string;
  issueDate: string;
  expiryDate: string;
  status: BrandProfileCertificateStatus;
  file: string;
  issuingBody: string;
  scope: string;
  trTs: string;
  notes: string;
};

export type BrandProfileCertificatesTabProps = {
  certificates: BrandProfileCertificateItem[];
  isEditing: boolean;
  canEditProfile: boolean;
  tabPanelClassName: string;
  showCertificateDialog: boolean;
  setShowCertificateDialog: Dispatch<SetStateAction<boolean>>;
  uploadingCertificate: number | null;
  setUploadingCertificate: Dispatch<SetStateAction<number | null>>;
  onUploadCertificate: (certId: number) => void;
};

export function BrandProfileCertificatesTab({
  certificates,
  isEditing,
  canEditProfile,
  tabPanelClassName,
  showCertificateDialog,
  setShowCertificateDialog,
  uploadingCertificate,
  setUploadingCertificate,
  onUploadCertificate,
}: BrandProfileCertificatesTabProps) {
  return (
    <>
      <TabsContent value="certificates" className={tabPanelClassName}>
        <div className="border-border-subtle space-y-1 border-b pb-4">
          <h2 className="text-text-primary text-base font-semibold">Сертификаты и соответствие</h2>
          <p className="text-text-secondary text-sm">
            Сертификаты качества, сроки, ТР ТС и связка с ESG и маркировкой.
          </p>
        </div>
        <div className="border-border-default flex flex-wrap items-center gap-2 rounded-xl border bg-muted/30 p-3">
          <span className="text-text-secondary text-sm font-medium">Связанные разделы:</span>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border-default h-9 gap-1.5 rounded-lg text-xs font-medium"
          >
            <Link href={ROUTES.brand.esg}>
              <Globe className="size-3.5" /> ESG
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border-default h-9 gap-1.5 rounded-lg text-xs font-medium"
          >
            <Link href={ROUTES.brand.compliance}>
              <ShieldCheck className="size-3.5" /> EAC и Честный ЗНАК
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-border-default h-9 gap-1.5 rounded-lg text-xs font-medium"
          >
            <Link href={ROUTES.brand.complianceStock}>
              <Database className="size-3.5" /> Склад и КИЗ
            </Link>
          </Button>
        </div>
        <div className="space-y-4">
          <div className="border-border-subtle flex flex-wrap items-center justify-between gap-3 border-b pb-3">
            <h3 className="text-text-primary text-sm font-semibold">Список сертификатов</h3>
            <div className="flex items-center gap-2">
              {isEditing && canEditProfile && (
                <Button
                  size="sm"
                  className="bg-accent-primary text-text-inverse hover:bg-accent-hover h-9 gap-2 rounded-lg px-3 text-xs font-medium shadow-sm"
                  onClick={() => setShowCertificateDialog(true)}
                >
                  <Plus className="size-3.5" /> Добавить сертификат
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {certificates.map((cert) => (
              <Card
                key={cert.id}
                className={cn(
                  'group rounded-xl border p-4 shadow-sm transition-all hover:shadow-md md:p-5',
                  cert.status === 'active'
                    ? 'border-border-default bg-white'
                    : cert.status === 'expiring'
                      ? 'border-amber-200 bg-amber-50/40'
                      : 'border-state-error/30 bg-state-error/10'
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex size-12 shrink-0 items-center justify-center rounded-lg border shadow-inner transition-transform group-hover:scale-105',
                      cert.status === 'active'
                        ? 'border-state-success/30 bg-state-success/10 text-state-success'
                        : cert.status === 'expiring'
                          ? 'border-amber-200 bg-amber-100 text-amber-700'
                          : 'border-state-error/30 bg-state-error/15 text-state-error'
                    )}
                  >
                    <Award className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h4
                        className={cn(
                          'truncate text-base font-semibold tracking-tight',
                          cert.status === 'active'
                            ? 'text-text-primary'
                            : cert.status === 'expiring'
                              ? 'text-amber-950'
                              : 'text-state-error'
                        )}
                      >
                        {cert.name}
                      </h4>
                      <Badge
                        className={cn(
                          'h-6 rounded-md border-none px-2 text-xs font-medium text-white',
                          cert.status === 'active'
                            ? 'bg-state-success'
                            : cert.status === 'expiring'
                              ? 'bg-amber-600'
                              : 'bg-state-error'
                        )}
                      >
                        {cert.status === 'active'
                          ? 'Активен'
                          : cert.status === 'expiring'
                            ? 'Истекает'
                            : 'Истёк'}
                      </Badge>
                    </div>
                    <p className="text-text-secondary mb-2 text-sm">{cert.type}</p>
                    {cert.certNumber ? (
                      <p className="text-text-secondary mb-2 font-mono text-xs">
                        № {cert.certNumber}
                      </p>
                    ) : null}
                    <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                      <div className="border-border-subtle bg-bg-surface2 rounded-lg border p-2.5">
                        <p className="text-text-muted mb-0.5 text-xs font-medium">Выдан</p>
                        <p className="text-text-primary text-sm font-semibold">{cert.issueDate}</p>
                      </div>
                      <div
                        className={cn(
                          'rounded-lg border p-2.5',
                          cert.status === 'active'
                            ? 'border-state-success/30 bg-state-success/10'
                            : cert.status === 'expiring'
                              ? 'border-amber-100 bg-amber-50'
                              : 'border-state-error/30 bg-state-error/10'
                        )}
                      >
                        <p className="text-text-muted mb-0.5 text-xs font-medium">Истекает</p>
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            cert.status === 'active'
                              ? 'text-state-success'
                              : cert.status === 'expiring'
                                ? 'text-amber-800'
                                : 'text-state-error'
                          )}
                        >
                          {cert.expiryDate}
                        </p>
                      </div>
                      {cert.issuingBody ? (
                        <div className="border-border-subtle bg-bg-surface2 col-span-2 rounded-lg border p-2.5">
                          <p className="text-text-muted mb-0.5 text-xs font-medium">
                            Орган сертификации
                          </p>
                          <p className="text-text-primary text-sm font-medium">
                            {cert.issuingBody}
                          </p>
                        </div>
                      ) : null}
                    </div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {cert.scope ? (
                        <Badge
                          variant="outline"
                          className="border-border-default text-xs font-normal"
                        >
                          Область: {cert.scope}
                        </Badge>
                      ) : null}
                      {cert.trTs ? (
                        <Badge
                          variant="outline"
                          className="border-accent-soft text-accent-hover text-xs font-normal"
                        >
                          {cert.trTs}
                        </Badge>
                      ) : null}
                    </div>
                    {cert.notes ? (
                      <p className="text-text-secondary mb-3 text-sm italic">{cert.notes}</p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border-default h-9 gap-1.5 rounded-lg text-xs font-medium"
                      >
                        <Download className="size-3.5" /> Скачать PDF
                      </Button>
                      {cert.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border-default h-9 gap-1.5 rounded-lg text-xs font-medium"
                        >
                          <ExternalLink className="size-3.5" /> Верифицировать
                        </Button>
                      )}
                      {(cert.status === 'expiring' || cert.status === 'expired') && isEditing && (
                        <Button
                          onClick={() => {
                            setShowCertificateDialog(true);
                            setUploadingCertificate(cert.id);
                          }}
                          size="sm"
                          className="bg-accent-primary text-text-inverse hover:bg-accent-hover h-9 gap-2 rounded-lg px-3 text-xs font-medium"
                        >
                          <Upload className="size-3.5" /> Обновить
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <div className="border-border-subtle flex flex-wrap items-end justify-between gap-2 border-b pb-3">
            <h3 className="text-text-primary text-sm font-semibold">Декларации ТР ТС / EAC</h3>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-accent-primary hover:text-accent-hover h-9 text-xs font-medium"
            >
              <Link href={ROUTES.brand.compliance}>
                Compliance <ArrowUpRight className="ml-0.5 inline size-3.5" />
              </Link>
            </Button>
          </div>
          <Card className="border-border-default bg-bg-surface2/60 rounded-xl border p-4 md:p-5">
            <p className="text-text-secondary mb-3 text-sm">
              Декларации о соответствии техническим регламентам (ТР ТС 017/2011, ТР ТС 019/2011 и
              др.) ведутся в разделе Compliance, с привязкой к Честному ЗНАК и КИЗ.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                ТР ТС 017/2011 — лёгкая промышленность
              </Badge>
              <Badge variant="outline" className="text-xs font-normal">
                ТР ТС 019/2011 — СИЗ
              </Badge>
            </div>
          </Card>
        </div>

        <div className="mt-8 space-y-3">
          <div className="border-border-subtle flex flex-wrap items-end justify-between gap-2 border-b pb-3">
            <h3 className="text-text-primary text-sm font-semibold">Устойчивое развитие (ESG)</h3>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-state-success hover:bg-state-success/10 h-9 gap-1 rounded-lg px-2 text-xs font-medium"
            >
              <Link href={ROUTES.brand.esg}>
                ESG-дашборд <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>
          <Card className="border-state-success/30 from-state-success/10 to-bg-surface rounded-xl border bg-gradient-to-br p-4 shadow-sm md:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {(
                [
                  {
                    label: 'Углеродная нейтральность',
                    value: '2025',
                    icon: Globe,
                    achieved: true,
                  },
                  { label: 'Ноль отходов', value: '2026', icon: Package, achieved: false },
                  { label: 'Справедливая торговля', value: '100%', icon: Users, achieved: true },
                ] as const
              ).map((goal, i) => (
                <div
                  key={i}
                  className="border-state-success/30/50 group rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={cn(
                        'flex size-9 items-center justify-center rounded-lg border shadow-inner transition-transform group-hover:scale-105',
                        goal.achieved
                          ? 'border-state-success/30 bg-state-success/10 text-state-success'
                          : 'border-border-subtle bg-bg-surface2 text-text-muted'
                      )}
                    >
                      <goal.icon className="h-4.5 w-4.5" />
                    </div>
                    {goal.achieved && (
                      <Badge className="bg-state-success/100 h-4 rounded-md border-none px-1.5 text-white">
                        <Check className="size-2.5" />
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-text-secondary mb-1 text-xs font-medium">{goal.label}</h4>
                  <p className="text-text-primary text-lg font-semibold tracking-tight">
                    {goal.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </TabsContent>

      <Dialog open={showCertificateDialog} onOpenChange={setShowCertificateDialog}>
        <DialogContent className="border-border-default rounded-xl sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-text-primary flex items-center gap-2 text-base font-bold uppercase tracking-tight">
              <Upload className="text-accent-primary size-4" />
              Обновить сертификат
            </DialogTitle>
            <DialogDescription className="text-text-muted text-sm font-medium">
              Загрузите актуальный документ для верификации статуса
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-text-primary text-sm font-semibold">
                Файл сертификата <span className="text-state-error">*</span>
              </Label>
              <div className="border-border-subtle hover:border-accent-primary hover:bg-accent-soft/30 group cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all">
                <Upload className="text-text-muted group-hover:text-accent-primary mx-auto mb-2 size-8 transition-colors" />
                <p className="text-md text-text-primary mb-0.5 font-bold uppercase">
                  Загрузите файл
                </p>
                <p className="text-text-muted text-[9px] font-medium">PDF, JPG или PNG до 5MB</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-text-primary text-sm font-semibold">Номер сертификата</Label>
              <Input
                className="border-border-default bg-bg-surface2 h-9 rounded-lg text-[13px]"
                placeholder="Напр. ISO-9001-2024"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-text-primary text-sm font-semibold">Дата выдачи</Label>
                <Input
                  type="date"
                  className="border-border-default bg-bg-surface2 h-9 rounded-lg text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-text-primary text-sm font-semibold">Срок действия</Label>
                <Input
                  type="date"
                  className="border-border-default bg-bg-surface2 h-9 rounded-lg text-[13px]"
                />
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase text-amber-900">Важное уведомление</p>
                  <p className="text-xs font-medium leading-snug text-amber-700 opacity-90">
                    Документ будет верифицирован AI в течение 2-х минут. Статус обновится
                    автоматически.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowCertificateDialog(false)}
              className="text-text-muted h-8 rounded-lg text-xs font-bold uppercase tracking-widest"
            >
              Отмена
            </Button>
            <Button
              onClick={() => uploadingCertificate && onUploadCertificate(uploadingCertificate)}
              className="bg-accent-primary text-text-inverse shadow-accent-soft hover:bg-accent-hover h-8 rounded-lg px-6 text-xs font-bold uppercase tracking-widest shadow-lg"
              disabled={uploadingCertificate === null}
            >
              {uploadingCertificate ? (
                <>
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Upload className="mr-2 size-3.5" />
                  Сохранить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
