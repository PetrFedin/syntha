'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PlusCircle,
  Trash2,
  Save,
  Warehouse,
  DollarSign,
  Truck,
  Bell,
  Users,
  FileText,
  Landmark,
  Briefcase,
  Building,
  Banknote,
  BookUser,
  FileBadge,
  Factory,
  Handshake,
  Link as LinkIcon,
  Code,
  Upload,
  Globe,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  BrainCircuit,
  Youtube,
  MessageSquare,
  Film,
  Leaf,
  Send,
  Sigma,
  Edit,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Brand } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BrandSyncConfirmation } from '@/components/shop/BrandSyncConfirmation';

const initialWarehouses = [
  {
    id: 'wh1',
    name: 'Основной склад (Москва)',
    address: '123456, Москва, ул. Складская, д. 1',
    isDefault: true,
  },
  {
    id: 'wh2',
    name: 'Склад (Санкт-Петербург)',
    address: '190000, Санкт-Петербург, пр. Невский, д. 10',
    isDefault: false,
  },
];

const initialTeam = [
  {
    id: 'user1',
    name: 'Елена Васильева',
    email: 'elena.v@demo-retail.local',
    role: 'Администратор',
    limit: 'Безлимитно',
    permissions: ['approve_orders', 'manage_team', 'view_analytics', 'manage_contracts'],
  },
  {
    id: 'user2',
    name: 'Игорь Семенов',
    email: 'igor.s@demo-retail.local',
    role: 'Байер',
    limit: '500 000 ₽',
    permissions: [],
  },
  {
    id: 'user3',
    name: 'Мария Лебедева',
    email: 'maria.l@demo-retail.local',
    role: 'Ассистент',
    limit: '50 000 ₽',
    permissions: [],
  },
];

const initialShopProfile: Partial<Brand> = {
  name: 'Демо-магазин · Москва 1',
  nameRU: 'Демо MSK 1',
  primaryLanguage: 'ru',
  description: 'Демонстрационный ритейлер премиальной одежды (мок-данные).',
  logo: {
    url: 'https://picsum.photos/seed/demo-retail-msk1/100/100',
    alt: 'Демо-магазин',
    hint: 'retail logo',
  },
  website: 'https://example.com/demo-retail-msk1',
  segment: 'Luxury',
  priceRange: [15000, 150000],
  socials: {
    instagram: 'https://instagram.com/example',
    telegram: 'https://t.me/example',
  },
  contact: {
    publicEmail: 'hello@demo-retail.local',
    phone: '+7 495 123-45-67',
  },
  legal: {
    entityName: `ООО "Демо Ритейл МСК 1"`,
    regNumber: '1234567890',
    address: '123456, Москва, ул. Петровка, д. 2',
    bankDetails:
      'р/с 40702810123456789012 в АО "Альфа-Банк", к/с 30101810200000000593, БИК 044525123',
    representative: 'Васильева Елена Игоревна',
  },
};

const initialDocTemplates = [
  {
    id: 'dtmpl1',
    name: 'Договор поставки (стандарт).docx',
    type: 'Договор',
    lastUpdated: '2024-07-01',
  },
  { id: 'dtmpl2', name: 'Шаблон инвойса.xlsx', type: 'Инвойс', lastUpdated: '2024-06-15' },
];

interface SeasonNumbering {
  id: string;
  season: string;
  prefix: string;
  startNumber: number;
}

const initialSeasonNumbering: SeasonNumbering[] = [
  { id: 's1', season: 'FW24', prefix: 'FW24-DEMO-', startNumber: 13 },
  { id: 's2', season: 'SS25', prefix: 'SS25-DEMO-', startNumber: 1 },
];

export default function B2BSettingsPage() {
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [team, setTeam] = useState(initialTeam);
  const [shopProfile, setShopProfile] = useState(initialShopProfile);
  const [docTemplates, setDocTemplates] = useState(initialDocTemplates);
  const [seasonNumbering, setSeasonNumbering] = useState(initialSeasonNumbering);

  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);

  const { toast } = useToast();

  const handleSetDefault = (id: string) => {
    setWarehouses(warehouses.map((wh) => ({ ...wh, isDefault: wh.id === id })));
  };

  const handleSeasonChange = (id: string, field: keyof SeasonNumbering, value: string | number) => {
    setSeasonNumbering((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addSeason = () => {
    setSeasonNumbering((prev) => [
      ...prev,
      { id: `s${Date.now()}`, season: '', prefix: '', startNumber: 1 },
    ]);
  };

  const removeSeason = (id: string) => {
    setSeasonNumbering((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSaveChanges = () => {
    toast({
      title: 'Настройки сохранены',
      description: 'Ваши B2B-настройки были успешно обновлены.',
    });
  };

  const handleAddWarehouse = (newWarehouse: { name: string; address: string }) => {
    setWarehouses((prev) => [
      ...prev,
      { id: `wh${Date.now()}`, ...newWarehouse, isDefault: prev.length === 0 },
    ]);
    setIsWarehouseDialogOpen(false);
  };

  const handleAddTeamMember = (newMember: { name: string; email: string; role: string }) => {
    setTeam((prev) => [
      ...prev,
      { id: `user${Date.now()}`, ...newMember, limit: '0 ₽', permissions: [] },
    ]);
    setIsTeamDialogOpen(false);
  };

  return (
    <CabinetPageContent maxWidth="5xl" className="space-y-4 px-4 py-6 pb-24 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" /> Профиль магазина
          </CardTitle>
          <CardDescription>Публичная информация, которую видят бренды-партнеры.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="relative h-24 w-24 flex-shrink-0 rounded-lg border bg-muted/30 p-1">
              <Image
                src={shopProfile.logo?.url || ''}
                alt={shopProfile.name || ''}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Название магазина</Label>
                  <Input id="shopName" defaultValue={shopProfile.name} />
                </div>
                <div className="space-y-2">
                  <Label>Основной язык</Label>
                  <RadioGroup
                    defaultValue={shopProfile.primaryLanguage}
                    className="flex gap-3 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ru" id="lang-ru" />
                      <Label htmlFor="lang-ru">RU</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="en" id="lang-en" />
                      <Label htmlFor="lang-en">EN</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopDescription">Краткое описание</Label>
                <Textarea id="shopDescription" defaultValue={shopProfile.description} rows={2} />
              </div>
            </div>
            <Button variant="outline" type="button" onClick={() => setIsLogoDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Загрузить лого
            </Button>
          </div>
        </CardContent>
      </Card>

      <BrandSyncConfirmation
        currentShopId="shop1"
        currentShopName={shopProfile.name || 'Демо-магазин · Москва 1'}
        directMatches={[
          {
            brandId: 'brand_syntha_lab',
            brandName: 'Syntha Lab',
            brandLogo: 'https://picsum.photos/seed/syntha-lab/40/40',
            storeEntryId: 'os-syntha-demo-msk1',
            storeNameInBrand: 'Демо-магазин · Москва 1',
            storeProductUrl: 'https://example.com/demo-retail-msk1',
            matchType: 'direct',
          },
        ]}
        possibleMatches={[
          {
            brandId: 'brand_syntha_lab',
            brandName: 'Syntha Lab',
            brandLogo: 'https://picsum.photos/seed/syntha-lab/40/40',
            storeEntryId: 'os-syntha-demo-msk1-alt',
            storeNameInBrand: 'Демо (витрина)',
            storeProductUrl: 'https://example.com/demo-retail-msk1/syntha-lab',
            matchType: 'possible',
          },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" /> Медиа и Соцсети
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="website">Веб-сайт</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="website" defaultValue={shopProfile.website} className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="instagram"
                defaultValue={shopProfile.socials?.instagram}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram</Label>
            <div className="relative">
              <Send className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="telegram" defaultValue={shopProfile.socials?.telegram} className="pl-9" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid items-start gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" /> Юридическая информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entityName">Название юр. лица</Label>
              <Input id="entityName" defaultValue={shopProfile.legal?.entityName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regNumber">ИНН/ОГРН</Label>
              <Input id="regNumber" defaultValue={shopProfile.legal?.regNumber} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Юридический адрес</Label>
              <Input id="address" defaultValue={shopProfile.legal?.address} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankDetails">Банковские реквизиты</Label>
              <Textarea id="bankDetails" defaultValue={shopProfile.legal?.bankDetails} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5" /> Коммерческие параметры
            </CardTitle>
            <CardDescription>Условия по умолчанию для новых партнерств.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Валюта расчётов</Label>
              <Select defaultValue="RUB">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUB">RUB</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Условия оплаты</Label>
              <Select defaultValue="50_prepaid">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50_prepaid">50% предоплата</SelectItem>
                  <SelectItem value="100_prepaid">100% предоплата</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Условия логистики</Label>
              <Select defaultValue="exw">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exw">Самовывоз (EXW)</SelectItem>
                  <SelectItem value="ddp">Доставка (DDP)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Мин. заказ (MOQ)</Label>
              <Input type="number" placeholder="Напр. 50000" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" /> Управление складами
          </CardTitle>
          <CardDescription>
            Добавьте адреса ваших складов для автоматического заполнения при оформлении заказов.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {warehouses.map((wh) => (
            <div key={wh.id} className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex-1">
                <Input
                  className="h-auto border-none p-0 text-base font-semibold focus-visible:ring-0"
                  defaultValue={wh.name}
                />
                <Input
                  className="mt-1 h-auto border-none p-0 text-sm text-muted-foreground focus-visible:ring-0"
                  defaultValue={wh.address}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`default-${wh.id}`}
                    checked={wh.isDefault}
                    onCheckedChange={() => handleSetDefault(wh.id)}
                  />
                  <Label htmlFor={`default-${wh.id}`}>По умолчанию</Label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setWarehouses(warehouses.filter((w) => w.id !== wh.id))}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setIsWarehouseDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Добавить склад
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Команда и роли
          </CardTitle>
          <CardDescription>Управляйте доступом и лимитами для вашей команды.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Сотрудник</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Лимит на закупку (сезон)</TableHead>
                <TableHead>Доп. права</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={member.role}>
                      <SelectTrigger className="h-8 w-40 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Администратор">Администратор</SelectItem>
                        <SelectItem value="Байер">Байер</SelectItem>
                        <SelectItem value="Ассистент">Ассистент</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input className="h-8 w-32" defaultValue={member.limit} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`approve-${member.id}`}
                        defaultChecked={member.permissions.includes('approve_orders')}
                      />
                      <Label htmlFor={`approve-${member.id}`} className="text-xs font-normal">
                        Согласование
                      </Label>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTeam(team.filter((t) => t.id !== member.id))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => setIsTeamDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Пригласить сотрудника
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sigma className="h-5 w-5" /> Настройки нумерации заказов
          </CardTitle>
          <CardDescription>Задайте уникальные префиксы для заказов разных сезонов.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {seasonNumbering.map((season) => (
              <div key={season.id} className="grid grid-cols-[1fr_2fr_1fr_auto] items-center gap-2">
                <Input
                  value={season.season}
                  onChange={(e) => handleSeasonChange(season.id, 'season', e.target.value)}
                  placeholder="Сезон (напр. FW25)"
                />
                <Input
                  value={season.prefix}
                  onChange={(e) => handleSeasonChange(season.id, 'prefix', e.target.value)}
                  placeholder="Префикс"
                />
                <Input
                  type="number"
                  value={season.startNumber}
                  onChange={(e) =>
                    handleSeasonChange(season.id, 'startNumber', Number(e.target.value))
                  }
                  placeholder="Начать с"
                />
                <Button variant="ghost" size="icon" onClick={() => removeSeason(season.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={addSeason}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить сезон
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Шаблоны документов
          </CardTitle>
          <CardDescription>
            Загрузите ваши стандартные договоры и инвойсы для быстрого использования.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {docTemplates.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4 text-muted-foreground" /> {doc.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{doc.type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    Обновлен: {doc.lastUpdated}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Загрузить шаблон
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" /> Настройки AI-ассистента
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Основная цель</Label>
            <Select defaultValue="maximize_margin">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maximize_margin">Максимизация маржи</SelectItem>
                <SelectItem value="maximize_sell_through">
                  Максимизация оборачиваемости (Sell-Through)
                </SelectItem>
                <SelectItem value="focus_on_trends">Фокус на новые тренды</SelectItem>
                <SelectItem value="risk_averse">
                  Минимизация рисков (заказ проверенных SKU)
                </SelectItem>
              </SelectContent>
            </Select>
            <CardDescription>
              AI будет использовать эту стратегию при формировании рекомендаций по закупкам.
            </CardDescription>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" /> Интеграции и API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">API-ключи</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Используйте ключи для интеграции с вашими системами.
            </p>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Сгенерировать новый ключ
            </Button>
          </div>
          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">Вебхуки (Webhooks)</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Получайте уведомления о событиях в реальном времени.
            </p>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Настроить вебхук
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSaveChanges}>
          <Save className="mr-2 h-4 w-4" />
          Сохранить все настройки
        </Button>
      </div>

      <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить новый склад</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddWarehouse({
                name: formData.get('name') as string,
                address: formData.get('address') as string,
              });
            }}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="wh-name">Название</Label>
              <Input id="wh-name" name="name" placeholder="Напр., Флагманский магазин" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-address">Адрес</Label>
              <Input id="wh-address" name="address" placeholder="Город, улица, дом" required />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWarehouseDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button type="submit">Добавить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Пригласить сотрудника</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddTeamMember({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as string,
              });
            }}
            className="space-y-4 py-4"
          >
            <div className="space-y-2">
              <Label htmlFor="team-name">Имя</Label>
              <Input id="team-name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-email">Email</Label>
              <Input id="team-email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-role">Роль</Label>
              <Select name="role" defaultValue="Ассистент">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Администратор">Администратор</SelectItem>
                  <SelectItem value="Байер">Байер</SelectItem>
                  <SelectItem value="Ассистент">Ассистент</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">Отправить приглашение</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Загрузить логотип</DialogTitle>
          </DialogHeader>
          <div className="my-4 flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-muted">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Нажмите, чтобы выбрать файл</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsLogoDialogOpen(false)}>
              Отмена
            </Button>
            <Button type="submit">Загрузить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CabinetPageContent>
  );
}
