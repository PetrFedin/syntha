'use client';

import type { Dispatch, SetStateAction } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Instagram,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RefreshCcw,
  Store,
  Twitter,
  Video,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { OnlineStorePickerDialog } from '@/components/brand/OnlineStorePickerDialog';
import { useToast } from '@/hooks/use-toast';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/routes';
import type { Brand } from '@/lib/types';
import { formatHoursCompact } from '../brand-profile-page-utils';

export type BrandProfileContactsState = {
  email: string;
  phone: string;
  website: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  youtube: string;
  supportEmail: string;
  pressEmail: string;
  b2bEmail: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isSocialSync: boolean;
};

export type BrandProfileOnlineStore = {
  id: string;
  name: string;
  productUrl: string;
  parsingEnabled: boolean;
  platformShopId?: string;
  syncStatus?: 'confirmed' | 'linked' | 'manual';
};

export type BrandProfileStoreAddress = {
  id: string;
  name: string;
  fullAddress: string;
  phone: string;
  site: string;
  yandexMapUrl: string;
  workingHours: Record<string, string>;
  isSynced: boolean;
};

export type BrandProfileBrandInfoState = {
  logos: { id: string; url: string; isMain: boolean }[];
  storeAddresses: BrandProfileStoreAddress[];
  onlineStores: BrandProfileOnlineStore[];
  showroom: {
    hasShowroom: boolean;
    name: string;
    address: string;
    phone: string;
    site: string;
    yandexMapUrl: string;
    workingHours: Record<string, string>;
  };
  portalLogin: string;
};

export type BrandProfileBrandContactsState = {
  emails: { value: string; label: string }[];
  phones: { value: string; label: string }[];
  telegrams: { value: string; label: string }[];
  whatsapps: { value: string; label: string }[];
  externalEmails: { value: string; label: string }[];
};

export type BrandProfileBrandTabProps = {
  brand: Brand;
  setBrand: Dispatch<SetStateAction<Brand>>;
  brandInfo: BrandProfileBrandInfoState;
  setBrandInfo: Dispatch<SetStateAction<BrandProfileBrandInfoState>>;
  contacts: BrandProfileContactsState;
  setContacts: Dispatch<SetStateAction<BrandProfileContactsState>>;
  brandContacts: BrandProfileBrandContactsState;
  setBrandContacts: Dispatch<SetStateAction<BrandProfileBrandContactsState>>;
  isEditing: boolean;
  onlineStorePickerOpen: boolean;
  setOnlineStorePickerOpen: Dispatch<SetStateAction<boolean>>;
  tabPanelClassName: string;
};

export function BrandProfileBrandTab({
  brand,
  setBrand,
  brandInfo,
  setBrandInfo,
  contacts,
  setContacts,
  brandContacts,
  setBrandContacts,
  isEditing,
  onlineStorePickerOpen,
  setOnlineStorePickerOpen,
  tabPanelClassName,
}: BrandProfileBrandTabProps) {
  const { toast } = useToast();
  return (
    <TabsContent value="brand" className={tabPanelClassName}>
      {/* Информация о бренде */}
      <div className="space-y-2">
        <div className={cabinetSurface.sectionHeader}>
          <h2 className={cabinetSurface.sectionTitle}>Информация о бренде</h2>
          <p className={cabinetSurface.sectionLead}>
            Название, лого, шоурум, адреса, сайт и соцсети
          </p>
        </div>
        <Card className={cn('space-y-4 p-4 md:p-5', cabinetSurface.panelInner)}>
          {/* Название + Логотипы (несколько, основной отмечен) */}
          <div className="flex flex-wrap items-start gap-4">
            <div>
              <p className="text-text-muted mb-1 text-xs font-medium">Название</p>
              {isEditing ? (
                <Input
                  value={brand.nameRU || brand.name}
                  onChange={(e) => setBrand((prev) => ({ ...prev, nameRU: e.target.value }))}
                  className="h-8 w-48 text-sm font-bold"
                />
              ) : (
                <p className="text-text-primary text-base font-bold">
                  {brand.nameRU || brand.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {brandInfo.logos
                .filter((l) => l.url)
                .map((logo) => (
                  <div key={logo.id} className="relative">
                    <div
                      className={cn(
                        'bg-bg-surface2 size-16 overflow-hidden rounded-xl border-2',
                        logo.isMain
                          ? 'border-accent-primary ring-accent-soft ring-2'
                          : 'border-border-default'
                      )}
                    >
                      <Image
                        src={logo.url}
                        alt="Logo"
                        width={64}
                        height={64}
                        className="size-full object-cover"
                      />
                    </div>
                    {logo.isMain && (
                      <Badge className="absolute -right-1 -top-1 h-4 px-1 text-[7px]">Осн.</Badge>
                    )}
                    {isEditing && (
                      <div className="mt-1 flex gap-0.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[8px] font-bold"
                          onClick={() =>
                            setBrandInfo((prev) => ({
                              ...prev,
                              logos: prev.logos.map((l) =>
                                l.id === logo.id ? { ...l, isMain: true } : { ...l, isMain: false }
                              ),
                            }))
                          }
                        >
                          Сделать основным
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              {brandInfo.logos.some((l) => !l.url) && (
                <div className="border-border-default bg-bg-surface2 hover:border-accent-primary flex size-16 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed">
                  <span className="text-text-muted text-[9px] font-bold">+ Лого</span>
                </div>
              )}
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-[9px] font-bold uppercase"
                  onClick={() =>
                    setBrandInfo((prev) => ({
                      ...prev,
                      logos: [
                        ...prev.logos,
                        {
                          id: `logo-${Date.now()}`,
                          url: '',
                          isMain: prev.logos.every((l) => !l.isMain),
                        },
                      ],
                    }))
                  }
                >
                  <Plus className="size-3" /> Добавить лого
                </Button>
              )}
            </div>
          </div>

          {/* Шоурум: полный адрес, название, центр — карта, справа — телефон, сайт, график */}
          {brandInfo.showroom.hasShowroom && (
            <div className="border-border-subtle space-y-3 border-t pt-5">
              <div className="space-y-1">
                <h3 className="text-text-primary text-sm font-semibold">Шоурум</h3>
                <p className="text-text-secondary text-sm">Адрес, контакты, график работы</p>
              </div>
              <div className="border-border-subtle bg-bg-surface2 flex flex-wrap items-center gap-3 rounded-lg border p-3">
                <div className="min-w-[180px] flex-1">
                  <p className="text-text-primary text-sm font-bold">
                    {((brandInfo.showroom as Record<string, unknown>).name as string) || 'Шоурум'}
                  </p>
                  {isEditing ? (
                    <div className="mt-1 space-y-1">
                      <Input
                        value={(brandInfo.showroom as Record<string, unknown>).name as string}
                        onChange={(e) =>
                          setBrandInfo((prev) => ({
                            ...prev,
                            showroom: { ...prev.showroom, name: e.target.value },
                          }))
                        }
                        placeholder="Название"
                        className="h-7 text-sm"
                      />
                      <Input
                        value={brandInfo.showroom.address}
                        onChange={(e) =>
                          setBrandInfo((prev) => ({
                            ...prev,
                            showroom: { ...prev.showroom, address: e.target.value },
                          }))
                        }
                        placeholder="Полный адрес"
                        className="h-7 text-sm"
                      />
                      <Input
                        value={(brandInfo.showroom as Record<string, unknown>).phone as string}
                        onChange={(e) =>
                          setBrandInfo((prev) => ({
                            ...prev,
                            showroom: { ...prev.showroom, phone: e.target.value },
                          }))
                        }
                        placeholder="Телефон"
                        className="h-7 text-sm"
                      />
                      <Input
                        value={(brandInfo.showroom as Record<string, unknown>).site as string}
                        onChange={(e) =>
                          setBrandInfo((prev) => ({
                            ...prev,
                            showroom: { ...prev.showroom, site: e.target.value },
                          }))
                        }
                        placeholder="Сайт"
                        className="h-7 text-sm"
                      />
                      <Input
                        value={
                          (brandInfo.showroom as Record<string, unknown>).yandexMapUrl as string
                        }
                        onChange={(e) =>
                          setBrandInfo((prev) => ({
                            ...prev,
                            showroom: { ...prev.showroom, yandexMapUrl: e.target.value },
                          }))
                        }
                        placeholder="Ссылка на карту"
                        className="h-7 text-sm"
                      />
                    </div>
                  ) : (
                    <p className="text-text-secondary mt-0.5 text-sm">
                      {brandInfo.showroom.address}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {Boolean((brandInfo.showroom as Record<string, unknown>).yandexMapUrl) && (
                    <a
                      href={String((brandInfo.showroom as Record<string, unknown>).yandexMapUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-bold">
                        <MapPin className="size-3.5" /> Открыть на карте
                      </Button>
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {Boolean((brandInfo.showroom as Record<string, unknown>).phone) && (
                    <a
                      href={`tel:${String((brandInfo.showroom as Record<string, unknown>).phone)}`}
                    >
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-bold">
                        <Phone className="size-3.5" /> Телефон
                      </Button>
                    </a>
                  )}
                  {Boolean((brandInfo.showroom as Record<string, unknown>).site) && (
                    <a
                      href={String((brandInfo.showroom as Record<string, unknown>).site)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-bold">
                        <ExternalLink className="size-3.5" /> Сайт
                      </Button>
                    </a>
                  )}
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-bold"
                        >
                          <Clock className="size-3.5" /> График работы
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className={cabinetSurface.tooltipContent}>
                        {formatHoursCompact(brandInfo.showroom.workingHours)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              {isEditing && (
                <div className="flex flex-wrap gap-3 pl-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted">Основан:</span>
                    <Input
                      type="number"
                      value={brand.foundedYear}
                      onChange={(e) =>
                        setBrand((prev) => ({
                          ...prev,
                          foundedYear: parseInt(e.target.value, 10) || prev.foundedYear,
                        }))
                      }
                      className="h-6 w-14 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted">Страна:</span>
                    <Input
                      value={brand.countryOfOrigin}
                      onChange={(e) =>
                        setBrand((prev) => ({ ...prev, countryOfOrigin: e.target.value }))
                      }
                      className="h-6 w-24 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Сайт, соцсети — после шоурума, до точек продаж */}
          <div className="border-border-subtle space-y-3 border-t pt-5">
            <h3 className="text-text-primary text-sm font-semibold">Сайт и соцсети</h3>
            {contacts.isSocialSync && (
              <div className="text-state-success mb-2 flex items-center gap-2 text-xs font-medium">
                <span className="bg-state-success/10 flex size-4 shrink-0 items-center justify-center rounded-full">
                  <CheckCircle2 className="text-state-success size-2.5" />
                </span>
                <span className="text-text-muted">
                  Ссылки на сайт и соцсети, синхронизированы с профилем
                </span>
                <RefreshCcw className="text-state-success size-3.5 shrink-0" />
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <p className="text-text-muted mb-1 text-xs font-medium">Сайт</p>
                {isEditing ? (
                  <Input
                    value={contacts.website}
                    onChange={(e) => setContacts((prev) => ({ ...prev, website: e.target.value }))}
                    className="h-8 text-sm"
                  />
                ) : (
                  <a
                    href={contacts.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-primary text-sm font-medium hover:underline"
                  >
                    {contacts.website}
                  </a>
                )}
              </div>
              {[
                {
                  key: 'instagram',
                  label: 'Instagram',
                  value: contacts.instagram,
                  icon: Instagram,
                },
                {
                  key: 'twitter',
                  label: 'Twitter / X',
                  value: contacts.twitter,
                  icon: Twitter,
                },
                { key: 'tiktok', label: 'TikTok', value: contacts.tiktok, icon: Video },
                { key: 'youtube', label: 'YouTube', value: contacts.youtube, icon: Video },
              ]
                .filter((item) => isEditing || item.value)
                .map((item) => (
                  <div key={item.key}>
                    <p className="text-text-muted mb-1 text-xs font-medium">{item.label}</p>
                    {isEditing ? (
                      <Input
                        value={item.value}
                        onChange={(e) =>
                          setContacts((prev) => ({ ...prev, [item.key]: e.target.value }))
                        }
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-text-secondary text-sm font-medium">{item.value}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Адреса магазинов: полный адрес, название, центр — карта, справа — телефон, сайт, график (синхр. с профилем магазина) */}
          <div className="border-border-subtle space-y-3 border-t pt-5">
            <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div className="space-y-1">
                <h3 className="text-text-primary text-sm font-semibold">Адреса магазинов</h3>
                <p className="text-text-secondary text-sm">
                  Филиалы и точки продаж. График и ссылки — после синхронизации с магазином.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 shrink-0 gap-1 text-[9px] font-bold"
                onClick={() =>
                  setBrandInfo((prev) => ({
                    ...prev,
                    storeAddresses: [
                      ...prev.storeAddresses,
                      {
                        id: `addr-${Date.now()}`,
                        name: 'Новый магазин',
                        fullAddress: '',
                        phone: '',
                        site: '',
                        yandexMapUrl: '',
                        workingHours: {
                          mon: '',
                          tue: '',
                          wed: '',
                          thu: '',
                          fri: '',
                          sat: '',
                          sun: '',
                        },
                        isSynced: false,
                      },
                    ],
                  }))
                }
              >
                <Plus className="size-3" /> Добавить магазины
              </Button>
            </div>
            <div className="border-accent-soft bg-accent-soft/80 text-text-secondary mb-3 space-y-1 rounded-lg border p-3 text-xs">
              <p>
                <strong>Синхронизация стоков:</strong> сток бренда + сток магазина = суммарно в
                наличии. В карточке товара показывается наличие, отметка «выбранный размер есть в
                [магазин] — можно примерить».
              </p>
            </div>
            <div
              className={cn(
                'space-y-3',
                brandInfo.storeAddresses.length > 2 &&
                  'scrollbar-hide max-h-[320px] overflow-y-auto pr-1'
              )}
            >
              {brandInfo.storeAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="border-border-subtle bg-bg-surface2 flex flex-wrap items-center gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-[180px] flex-1">
                    {isEditing ? (
                      <div className="space-y-1">
                        <Input
                          value={addr.name}
                          onChange={(e) =>
                            setBrandInfo((prev) => ({
                              ...prev,
                              storeAddresses: prev.storeAddresses.map((a) =>
                                a.id === addr.id ? { ...a, name: e.target.value } : a
                              ),
                            }))
                          }
                          placeholder="Название магазина"
                          className="h-7 text-sm"
                        />
                        <Input
                          value={addr.fullAddress}
                          onChange={(e) =>
                            setBrandInfo((prev) => ({
                              ...prev,
                              storeAddresses: prev.storeAddresses.map((a) =>
                                a.id === addr.id ? { ...a, fullAddress: e.target.value } : a
                              ),
                            }))
                          }
                          placeholder="Полный адрес"
                          className="h-7 text-sm"
                        />
                        <Input
                          value={addr.phone}
                          onChange={(e) =>
                            setBrandInfo((prev) => ({
                              ...prev,
                              storeAddresses: prev.storeAddresses.map((a) =>
                                a.id === addr.id ? { ...a, phone: e.target.value } : a
                              ),
                            }))
                          }
                          placeholder="Телефон"
                          className="h-7 text-sm"
                        />
                        <Input
                          value={addr.site}
                          onChange={(e) =>
                            setBrandInfo((prev) => ({
                              ...prev,
                              storeAddresses: prev.storeAddresses.map((a) =>
                                a.id === addr.id ? { ...a, site: e.target.value } : a
                              ),
                            }))
                          }
                          placeholder="Сайт"
                          className="h-7 text-sm"
                        />
                        <Input
                          value={addr.yandexMapUrl}
                          onChange={(e) =>
                            setBrandInfo((prev) => ({
                              ...prev,
                              storeAddresses: prev.storeAddresses.map((a) =>
                                a.id === addr.id ? { ...a, yandexMapUrl: e.target.value } : a
                              ),
                            }))
                          }
                          placeholder="Ссылка на карту"
                          className="h-7 text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-text-primary text-sm font-bold">{addr.name}</p>
                        <p className="text-text-secondary mt-0.5 text-sm">{addr.fullAddress}</p>
                        {addr.isSynced && (
                          <span className="text-state-success mt-1.5 inline-flex items-center gap-1 text-[9px]">
                            <CheckCircle2 className="size-3" /> Синхронизировано с профилем магазина
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {addr.yandexMapUrl && (
                      <a href={addr.yandexMapUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-bold"
                        >
                          <MapPin className="size-3.5" /> Открыть на карте
                        </Button>
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {addr.phone && (
                      <a href={`tel:${addr.phone}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-bold"
                        >
                          <Phone className="size-3.5" /> Телефон
                        </Button>
                      </a>
                    )}
                    {addr.site && (
                      <a href={addr.site} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-bold"
                        >
                          <ExternalLink className="size-3.5" /> Сайт
                        </Button>
                      </a>
                    )}
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-bold"
                          >
                            <Clock className="size-3.5" /> График работы
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className={cabinetSurface.tooltipContent}>
                          {formatHoursCompact(addr.workingHours)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-state-error h-8 text-[9px]"
                        onClick={() =>
                          setBrandInfo((prev) => ({
                            ...prev,
                            storeAddresses: prev.storeAddresses.filter((a) => a.id !== addr.id),
                          }))
                        }
                      >
                        <X className="size-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Интернет-магазины: где продаётся бренд, ссылки на товар, парсинг цен */}
          <div className="border-border-subtle space-y-3 border-t pt-5">
            <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
              <div className="space-y-1">
                <h3 className="text-text-primary text-sm font-semibold">Интернет-магазины</h3>
                <p className="text-text-secondary text-sm">
                  Площадки и ссылки на витрину бренда; парсинг цен и суммарный сток после
                  подтверждения.
                </p>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-accent-primary h-7 text-[9px] font-bold"
              >
                <Link href={ROUTES.brand.pricingPriceComparison}>Сравнение цен →</Link>
              </Button>
            </div>
            <div className="space-y-2">
              {brandInfo.onlineStores.map((store) => (
                <div
                  key={store.id}
                  className="border-border-subtle bg-bg-surface2 flex flex-wrap items-center gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-[120px] flex-1">
                    {isEditing ? (
                      <div className="space-y-1">
                        <Input
                          value={store.name}
                          onChange={(e) =>
                            setBrandInfo((prev) => ({
                              ...prev,
                              onlineStores: prev.onlineStores.map((s) =>
                                s.id === store.id ? { ...s, name: e.target.value } : s
                              ),
                            }))
                          }
                          placeholder="Название (WB, Ozon...)"
                          className="h-7 text-sm"
                        />
                        <Input
                          value={store.productUrl}
                          onChange={(e) =>
                            setBrandInfo((prev) => ({
                              ...prev,
                              onlineStores: prev.onlineStores.map((s) =>
                                s.id === store.id ? { ...s, productUrl: e.target.value } : s
                              ),
                            }))
                          }
                          placeholder="Ссылка на товары бренда"
                          className="h-7 text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-text-primary text-sm font-bold">{store.name}</p>
                          {store.platformShopId &&
                            (store.syncStatus === 'confirmed' ? (
                              <Badge
                                variant="outline"
                                className="border-state-success/30 bg-state-success/10 text-state-success h-4 px-1 text-[8px]"
                              >
                                <CheckCircle2 className="mr-0.5 size-2.5" /> Синхр.
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="h-4 border-amber-200 bg-amber-50 px-1 text-[8px] text-amber-700"
                              >
                                Ожидает подтверждения
                              </Badge>
                            ))}
                        </div>
                        <a
                          href={store.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-primary mt-0.5 block max-w-[280px] truncate text-xs hover:underline"
                        >
                          {store.productUrl}
                        </a>
                      </>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {store.productUrl && (
                      <a href={store.productUrl} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs font-bold"
                        >
                          <ExternalLink className="size-3.5" /> Товар
                        </Button>
                      </a>
                    )}
                    <Badge
                      variant={store.parsingEnabled ? 'default' : 'secondary'}
                      className="h-6 text-[9px]"
                    >
                      {store.parsingEnabled ? 'Парсинг вкл.' : 'Парсинг выкл.'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-text-secondary h-8 text-xs"
                      onClick={() => {
                        const s = brandInfo.onlineStores.find((x) => x.id === store.id);
                        if (s) {
                          const upd = brandInfo.onlineStores.map((x) =>
                            x.id === store.id ? { ...x, parsingEnabled: !x.parsingEnabled } : x
                          );
                          setBrandInfo((prev) => ({ ...prev, onlineStores: upd }));
                          toast({
                            title: s.parsingEnabled ? 'Парсинг выключен' : 'Парсинг включён',
                          });
                        }
                      }}
                    >
                      {store.parsingEnabled ? 'Выкл.' : 'Вкл.'}
                    </Button>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-state-error h-8 text-[9px]"
                        onClick={() =>
                          setBrandInfo((prev) => ({
                            ...prev,
                            onlineStores: prev.onlineStores.filter((s) => s.id !== store.id),
                          }))
                        }
                      >
                        <X className="size-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {isEditing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 gap-1 text-[9px] font-bold">
                      <Plus className="size-3" /> Добавить интернет-магазин{' '}
                      <ChevronDown className="size-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setOnlineStorePickerOpen(true)}>
                      <Store className="mr-2 size-3.5" /> Выбрать из участников платформы
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setBrandInfo((prev) => ({
                          ...prev,
                          onlineStores: [
                            ...prev.onlineStores,
                            {
                              id: `os-${Date.now()}`,
                              name: '',
                              productUrl: '',
                              parsingEnabled: false,
                              syncStatus: 'manual' as const,
                            },
                          ],
                        }))
                      }
                    >
                      <Plus className="mr-2 size-3.5" /> Добавить вручную (название и ссылка)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <OnlineStorePickerDialog
                open={onlineStorePickerOpen}
                onOpenChange={setOnlineStorePickerOpen}
                excludeIds={
                  brandInfo.onlineStores.map((s) => s.platformShopId).filter(Boolean) as string[]
                }
                onSelect={(shop) => {
                  setBrandInfo((prev) => ({
                    ...prev,
                    onlineStores: [
                      ...prev.onlineStores,
                      {
                        id: `os-${Date.now()}`,
                        name: shop.name,
                        productUrl: shop.productUrl || shop.website || '',
                        parsingEnabled: false,
                        platformShopId: shop.id,
                        syncStatus: 'linked' as const,
                      },
                    ],
                  }));
                  toast({
                    title: 'Добавлено',
                    description: `Магазин «${shop.name}» получит запрос на подтверждение синхронизации.`,
                  });
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Контакты: Telegram, WhatsApp, почта, телефон */}
      <div className="space-y-4">
        <div className="border-border-subtle flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-text-primary text-base font-semibold">Контакты и доступ</h2>
            <p className="text-text-secondary text-sm">
              Почта, телефон, Telegram, WhatsApp — с подписью назначения канала.
            </p>
          </div>
          {contacts.isEmailVerified && (
            <Badge className="border-state-success/30 bg-state-success/10 text-state-success h-6 shrink-0 gap-1 border px-2 text-xs font-medium">
              <CheckCircle2 className="size-3.5" /> Почта подтверждена
            </Badge>
          )}
        </div>
        <Card className="border-border-default space-y-4 rounded-xl border bg-white p-4 shadow-sm md:p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-text-muted text-xs font-medium">Почта в проекте</p>
              <div className="bg-bg-surface2 flex items-center gap-2 rounded-lg p-2">
                <Mail className="text-accent-primary size-4" />
                <span className="text-md text-text-primary font-bold">
                  {brand.slug || brand.name?.toLowerCase().replace(/\s/g, '_') || 'brand'}
                  @syntha.pro
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-text-muted text-xs font-medium">Логин на портале</p>
              {isEditing ? (
                <Input
                  value={brandInfo.portalLogin}
                  onChange={(e) =>
                    setBrandInfo((prev) => ({ ...prev, portalLogin: e.target.value }))
                  }
                  className="h-9 font-mono"
                />
              ) : (
                <p className="text-md text-text-primary font-mono font-bold">
                  {brandInfo.portalLogin}
                </p>
              )}
            </div>
          </div>
          <div className="border-border-subtle space-y-3 border-t pt-3">
            <div>
              <p className="text-text-muted mb-1 text-xs font-medium">
                Контакты — подпись что за канал, для чего
              </p>
              <p className="text-text-muted text-[9px]">
                У каждого номера/почты укажите назначение: Пресса, B2B, Поддержка, Общий, Маркетинг
                и т.д.
              </p>
              {isEditing && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 gap-1 text-[8px] font-bold"
                    onClick={() =>
                      setBrandContacts((prev) => ({
                        ...prev,
                        emails: [...prev.emails, { value: '', label: 'Общий' }],
                      }))
                    }
                  >
                    <Plus className="size-2.5" /> Почта
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 gap-1 text-[8px] font-bold"
                    onClick={() =>
                      setBrandContacts((prev) => ({
                        ...prev,
                        phones: [...prev.phones, { value: '', label: 'Общий' }],
                      }))
                    }
                  >
                    <Plus className="size-2.5" /> Телефон
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 gap-1 text-[8px] font-bold"
                    onClick={() =>
                      setBrandContacts((prev) => ({
                        ...prev,
                        telegrams: [...prev.telegrams, { value: '', label: 'Общий' }],
                      }))
                    }
                  >
                    <Plus className="size-2.5" /> Telegram
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 gap-1 text-[8px] font-bold"
                    onClick={() =>
                      setBrandContacts((prev) => ({
                        ...prev,
                        whatsapps: [...prev.whatsapps, { value: '', label: 'B2B' }],
                      }))
                    }
                  >
                    <Plus className="size-2.5" /> WhatsApp
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {brandContacts.telegrams.map((item, i) => (
                <div
                  key={`tg-${i}`}
                  className="bg-bg-surface2 flex flex-col gap-1.5 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="text-text-muted size-4 shrink-0" />
                    {isEditing ? (
                      <>
                        <Input
                          value={item.label}
                          onChange={(e) =>
                            setBrandContacts((prev) => ({
                              ...prev,
                              telegrams: prev.telegrams.map((x, j) =>
                                j === i ? { ...x, label: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="Напр. Пресса, B2B"
                          className="h-7 w-24 shrink-0 text-xs"
                        />
                        <Input
                          value={item.value}
                          onChange={(e) =>
                            setBrandContacts((prev) => ({
                              ...prev,
                              telegrams: prev.telegrams.map((x, j) =>
                                j === i ? { ...x, value: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="@username"
                          className="h-7 flex-1 text-sm"
                        />
                      </>
                    ) : (
                      <>
                        <span className="text-text-muted text-[9px] font-bold uppercase">
                          {item.label}
                        </span>
                        {item.value ? (
                          <a
                            href={`https://t.me/${item.value.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-sm font-medium text-blue-600 hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-text-muted truncate text-sm font-medium">—</p>
                        )}
                      </>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() =>
                        setBrandContacts((prev) => ({
                          ...prev,
                          telegrams: prev.telegrams.filter((_, j) => j !== i),
                        }))
                      }
                      className="text-text-muted hover:text-state-error self-start text-[9px]"
                    >
                      <X className="inline size-3" /> Удалить
                    </button>
                  )}
                </div>
              ))}
              {brandContacts.whatsapps.map((item, i) => (
                <div
                  key={`wa-${i}`}
                  className="bg-bg-surface2 flex flex-col gap-1.5 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="text-text-muted size-4 shrink-0" />
                    {isEditing ? (
                      <>
                        <Input
                          value={item.label}
                          onChange={(e) =>
                            setBrandContacts((prev) => ({
                              ...prev,
                              whatsapps: prev.whatsapps.map((x, j) =>
                                j === i ? { ...x, label: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="Напр. B2B, Пресса"
                          className="h-7 w-24 shrink-0 text-xs"
                        />
                        <Input
                          value={item.value}
                          onChange={(e) =>
                            setBrandContacts((prev) => ({
                              ...prev,
                              whatsapps: prev.whatsapps.map((x, j) =>
                                j === i ? { ...x, value: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="+7..."
                          className="h-7 flex-1 text-sm"
                        />
                      </>
                    ) : (
                      <>
                        <span className="text-text-muted text-[9px] font-bold uppercase">
                          {item.label}
                        </span>
                        {item.value ? (
                          <a
                            href={`https://wa.me/${item.value.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-sm font-medium text-green-600 hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-text-muted truncate text-sm font-medium">—</p>
                        )}
                      </>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() =>
                        setBrandContacts((prev) => ({
                          ...prev,
                          whatsapps: prev.whatsapps.filter((_, j) => j !== i),
                        }))
                      }
                      className="text-text-muted hover:text-state-error self-start text-[9px]"
                    >
                      <X className="inline size-3" /> Удалить
                    </button>
                  )}
                </div>
              ))}
              {brandContacts.emails.map((item, i) => (
                <div
                  key={`em-${i}`}
                  className="bg-bg-surface2 flex flex-col gap-1.5 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="text-text-muted size-4 shrink-0" />
                    {isEditing ? (
                      <>
                        <Input
                          value={item.label}
                          onChange={(e) =>
                            setBrandContacts((prev) => ({
                              ...prev,
                              emails: prev.emails.map((x, j) =>
                                j === i ? { ...x, label: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="Напр. Общий"
                          className="h-7 w-24 shrink-0 text-xs"
                        />
                        <Input
                          value={item.value}
                          onChange={(e) =>
                            setBrandContacts((prev) => ({
                              ...prev,
                              emails: prev.emails.map((x, j) =>
                                j === i ? { ...x, value: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="email@..."
                          className="h-7 flex-1 text-sm"
                        />
                      </>
                    ) : (
                      <>
                        <span className="text-text-muted text-[9px] font-bold uppercase">
                          {item.label}
                        </span>
                        {item.value ? (
                          <a
                            href={`mailto:${item.value}`}
                            className="truncate text-sm font-medium text-blue-600 hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-text-muted truncate text-sm font-medium">—</p>
                        )}
                      </>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() =>
                        setBrandContacts((prev) => ({
                          ...prev,
                          emails: prev.emails.filter((_, j) => j !== i),
                        }))
                      }
                      className="text-text-muted hover:text-state-error self-start text-[9px]"
                    >
                      <X className="inline size-3" /> Удалить
                    </button>
                  )}
                </div>
              ))}
              {brandContacts.phones.map((item, i) => (
                <div
                  key={`ph-${i}`}
                  className="bg-bg-surface2 flex flex-col gap-1.5 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <Phone className="text-text-muted size-4 shrink-0" />
                    {isEditing ? (
                      <>
                        <Input
                          value={item.label}
                          onChange={(e) =>
                            setBrandContacts((prev) => ({
                              ...prev,
                              phones: prev.phones.map((x, j) =>
                                j === i ? { ...x, label: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="Напр. Пресса, B2B"
                          className="h-7 w-24 shrink-0 text-xs"
                        />
                        <Input
                          value={item.value}
                          onChange={(e) =>
                            setBrandContacts((prev) => ({
                              ...prev,
                              phones: prev.phones.map((x, j) =>
                                j === i ? { ...x, value: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="+7..."
                          className="h-7 flex-1 text-sm"
                        />
                      </>
                    ) : (
                      <>
                        <span className="text-text-muted text-[9px] font-bold uppercase">
                          {item.label}
                        </span>
                        {item.value ? (
                          <a
                            href={`tel:${item.value.replace(/\D/g, '')}`}
                            className="truncate text-sm font-medium text-blue-600 hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-text-muted truncate text-sm font-medium">—</p>
                        )}
                      </>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() =>
                        setBrandContacts((prev) => ({
                          ...prev,
                          phones: prev.phones.filter((_, j) => j !== i),
                        }))
                      }
                      className="text-text-muted hover:text-state-error self-start text-[9px]"
                    >
                      <X className="inline size-3" /> Удалить
                    </button>
                  )}
                </div>
              ))}
              {brandContacts.externalEmails.map((item, i) => (
                <div
                  key={`ext-${i}`}
                  className="bg-bg-surface2 flex flex-col gap-1.5 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <Mail className="text-text-muted size-4 shrink-0" />
                    {isEditing ? (
                      <>
                        <Input
                          value={item.label}
                          onChange={(e) =>
                            setBrandContacts((prev) => ({
                              ...prev,
                              externalEmails: prev.externalEmails.map((x, j) =>
                                j === i ? { ...x, label: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="Напр. Пресса, B2B"
                          className="h-7 w-24 shrink-0 text-xs"
                        />
                        <Input
                          value={item.value}
                          onChange={(e) =>
                            setBrandContacts((prev) => ({
                              ...prev,
                              externalEmails: prev.externalEmails.map((x, j) =>
                                j === i ? { ...x, value: e.target.value } : x
                              ),
                            }))
                          }
                          placeholder="email@..."
                          className="h-7 flex-1 text-sm"
                        />
                      </>
                    ) : (
                      <>
                        <span className="text-text-muted text-[9px] font-bold uppercase">
                          {item.label}
                        </span>
                        {item.value ? (
                          <a
                            href={`mailto:${item.value}`}
                            className="truncate text-sm font-medium text-blue-600 hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-text-muted truncate text-sm font-medium">—</p>
                        )}
                      </>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() =>
                        setBrandContacts((prev) => ({
                          ...prev,
                          externalEmails: prev.externalEmails.filter((_, j) => j !== i),
                        }))
                      }
                      className="text-text-muted hover:text-state-error self-start text-[9px]"
                    >
                      <X className="inline size-3" /> Удалить
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-[9px] font-bold"
                onClick={() =>
                  setBrandContacts((prev) => ({
                    ...prev,
                    externalEmails: [...prev.externalEmails, { value: '', label: '' }],
                  }))
                }
              >
                <Plus className="size-3" /> Добавить доп. почту
              </Button>
            )}
          </div>
        </Card>
      </div>
    </TabsContent>
  );
}
