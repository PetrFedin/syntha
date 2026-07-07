'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { kickstarterProjects } from '@/lib/kickstarter';
import {
  Users,
  Clock,
  ShoppingCart,
  Target,
  Wand2,
  Loader2,
  Check,
  CheckCircle,
  Share2,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { brands } from '@/lib/placeholder-data';
import BrandCard from '@/components/brand-card';
import { outfitPreviewClient } from '@/lib/ai-client/api';
import ProductCard from '@/components/product-card';
import { products } from '@/lib/products';
import { cn } from '@/lib/utils';
import { cabinetSurface } from '@/lib/ui/cabinet-surface';
import { Badge } from '@/components/ui/badge';
import kickstarterUpdates from '@/lib/data/kickstarter-updates.json';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useUIState } from '@/providers/ui-state';
import { useB2BState } from '@/providers/b2b-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/lib/routes';
import { RegistryPageHeader } from '@/components/design-system';

const mockComments = [
  {
    author: 'Анна',
    text: 'Очень жду! Выглядит потрясающе.',
    avatar: 'https://picsum.photos/seed/comment1/40/40',
  },
  {
    author: 'Михаил',
    text: 'Будут ли другие цвета?',
    avatar: 'https://picsum.photos/seed/comment2/40/40',
  },
];

function OutfitRecommender({ productTitle }: { productTitle: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [outfitImage, setOutfitImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setOutfitImage(null);
    try {
      const result = await outfitPreviewClient({
        prompt: `A full stylish outfit recommendation featuring a "${productTitle}". The image should be a full-body shot of a model against a clean, minimalist background, showcasing how to style the main item.`,
        directPrompt: true,
      });
      if (result.generatedOutfitImage) {
        setOutfitImage(result.generatedOutfitImage);
      }
    } catch (error) {
      console.error('Failed to generate outfit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-accent" /> С чем носить?
        </CardTitle>
        <CardDescription>
          Нажмите, чтобы AI-стилист подобрал полный образ с этим товаром.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        {outfitImage && (
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md">
            <Image src={outfitImage} alt="AI-generated look" fill className="object-cover" />
          </div>
        )}
        {!outfitImage && !isLoading && (
          <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
            <p className="text-sm text-muted-foreground">Здесь появится ваш образ</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Сгенерировать образ'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CampaignDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const params = use(paramsPromise);
  const [project, setProject] = useState<(typeof kickstarterProjects)[0] | undefined>();

  useEffect(() => {
    setProject(kickstarterProjects.find((p) => p.id === params.campaignId));
  }, [params.campaignId]);

  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUIState();
  const { addB2bOrderItem } = useB2BState();

  const isB2bUser = user?.roles?.includes('shop');
  const [b2bQuantity, setB2bQuantity] = useState(project?.moqWholesale || 1);

  useEffect(() => {
    if (project?.moqWholesale) {
      setB2bQuantity(project.moqWholesale);
    }
  }, [project]);

  if (!project) {
    return null;
  }

  const brand = brands.find((b) => b.id === project.brandId);
  const product = products.find((p) => p.id === project.productId);

  const progress = (project.currentQuantity / project.targetQuantity) * 100;
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(project.endAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );
  const updates = kickstarterUpdates.filter((u) => u.campaignId === project.id);

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://syntha.app/kickstarter/${project.id}?ref=user123`);
    toast({
      title: 'Ссылка скопирована',
      description: 'Поделитесь ей с друзьями, чтобы получить бонусы!',
    });
  };

  const handleAddToB2bOrder = () => {
    if (!product) return;

    // This is a simplified logic. A real app would need to handle variants.
    const size = product.sizes?.[0]?.name || 'One Size';
    addB2bOrderItem(product, size, b2bQuantity);

    toast({
      title: 'Добавлено в B2B-заказ',
      description: `${product.name} (${b2bQuantity} шт.) добавлен в ваш оптовый заказ.`,
    });
  };

  return (
    <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
      <RegistryPageHeader
        title={project.title}
        leadPlain={`${daysLeft} дн. до конца · ${progress.toFixed(0)}% от цели по количеству`}
        eyebrow={
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.brand.kickstarter} aria-label="Назад к кампаниям">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`${ROUTES.brand.kickstarter}/${project.id}/edit`}>Редактировать</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`${ROUTES.brand.kickstarter}/${project.id}/analytics`}>Аналитика</Link>
            </Button>
          </div>
        }
      />
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-4 lg:col-span-2">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
            <Image
              src={project.imageUrl || 'https://placehold.co/1200x750/f0f0f0/333333?text=Syntha'}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>

          <Tabs defaultValue="story">
            {/* cabinetSurface v1 */}
            <TabsList className={cn(cabinetSurface.tabsList, 'h-auto min-w-0')}>
              <TabsTrigger
                value="story"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                История проекта
              </TabsTrigger>
              <TabsTrigger
                value="updates"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                Обновления ({updates.length})
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className={cn(
                  cabinetSurface.tabsTrigger,
                  'text-xs font-semibold normal-case tracking-normal'
                )}
              >
                Комментарии ({mockComments.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="story"
              className={cn(
                cabinetSurface.cabinetProfileTabPanel,
                'prose dark:prose-invert mt-6 max-w-none'
              )}
            >
              <h2>Концепция: {project.title}</h2>
              <p>{project.description}</p>
              <p>
                Мы верим в создание вещей, которые служат долго и приносят радость. Эта модель —
                результат долгих исследований в области эргономики и новых материалов.
              </p>
              <h3>Материалы и посадка</h3>
              <p>
                Используется японский технологичный твил с водоотталкивающей пропиткой. Крой —
                свободный, но структурированный, идеально подходящий для городского жителя.
              </p>
            </TabsContent>
            <TabsContent
              value="updates"
              className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-6')}
            >
              {updates.map((update, index) => (
                <Card
                  key={index}
                  className={cn(update.forBackersOnly && 'border-primary/20 bg-primary/5')}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {update.forBackersOnly && <Lock className="h-4 w-4 text-primary" />}
                      {update.title}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(update.createdAt), 'd MMMM yyyy', { locale: ru })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{update.body}</p>
                    {update.media && update.media.length > 0 && (
                      <div className="relative mt-4 aspect-video w-full max-w-md overflow-hidden rounded-lg">
                        <Image
                          src={update.media[0].url}
                          alt={update.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent
              value="comments"
              className={cn(cabinetSurface.cabinetProfileTabPanel, 'mt-6')}
            >
              {mockComments.map((comment, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={comment.avatar} />
                    <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{comment.author}</p>
                    <p className="text-muted-foreground">{comment.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 border-t pt-6">
                <Avatar>
                  <AvatarFallback>В</AvatarFallback>
                </Avatar>
                <Textarea placeholder="Ваш комментарий..." />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>
                  от{' '}
                  {brand ? (
                    <Link href={`/b/${brand.slug}`} className="underline">
                      {brand.name}
                    </Link>
                  ) : (
                    project.creator
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="h-2" />
                <div>
                  <p className="text-sm font-bold text-primary">
                    {project.currentRevenue.toLocaleString('ru-RU')} ₽
                  </p>
                  <p className="text-sm text-muted-foreground">
                    собрано из {project.targetQuantity.toLocaleString('ru-RU')} шт. цели (
                    {progress.toFixed(0)}%)
                  </p>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <div className="text-center">
                    <p className="text-sm font-bold">{project.currentQuantity}</p>
                    <p className="text-sm text-muted-foreground">предзаказов</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold">{daysLeft}</p>
                    <p className="text-sm text-muted-foreground">дней осталось</p>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={handleCopyReferral}>
                  <Share2 className="mr-2 h-4 w-4" /> Пригласить друга и получить бонус
                </Button>
              </CardContent>
            </Card>

            {isB2bUser ? (
              <Card>
                <CardHeader>
                  <CardTitle>Оптовый предзаказ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Оптовая цена</Label>
                    <p className="text-sm font-bold">
                      {project.wholesalePrice?.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div>
                    <Label>MOQ</Label>
                    <p className="font-semibold">{project.moqWholesale} шт.</p>
                  </div>
                  <div>
                    <Label>Количество</Label>
                    <Input
                      type="number"
                      min={project.moqWholesale}
                      value={b2bQuantity}
                      onChange={(e) => setB2bQuantity(Number(e.target.value))}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleAddToB2bOrder}
                    disabled={b2bQuantity < (project.moqWholesale || 1)}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Добавить в B2B-заказ
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Уровни поддержки</h3>
                {project.tiers?.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  return (
                    <Card
                      key={tier.id}
                      className={cn(
                        'cursor-pointer hover:border-primary/50',
                        isSelected && 'border-primary ring-2 ring-primary/20'
                      )}
                      onClick={() => setSelectedTierId(tier.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold">{tier.name}</h4>
                          <p className="text-sm font-bold">
                            {tier.price.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
                        <ul className="mt-3 space-y-1 text-xs">
                          {(tier.rewards || []).map((reward: string) => (
                            <li key={reward} className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-500" /> {reward}
                            </li>
                          ))}
                        </ul>
                        {tier.limit && (
                          <Badge variant="outline" className="mt-3">
                            Осталось: {tier.limit - (project.backers || 0)}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                <Button size="lg" className="w-full" disabled={!selectedTierId}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Поддержать
                </Button>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Дополнительные цели</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.stretchGoals?.map((goal, index) => {
                  const goalProgress = Math.min(100, (project.currentQuantity / goal.target) * 100);
                  return (
                    <div key={index}>
                      <div className="mb-1 flex items-baseline justify-between">
                        <p className="text-sm font-semibold">
                          {goal.target.toLocaleString('ru-RU')} шт.
                        </p>
                        <p
                          className={cn(
                            'text-xs font-medium',
                            goal.achieved ? 'text-green-600' : 'text-muted-foreground'
                          )}
                        >
                          {goal.achieved ? 'Достигнуто!' : `${goalProgress.toFixed(0)}%`}
                        </p>
                      </div>
                      <Progress value={goalProgress} className="h-1" />
                      <p className="mt-1 text-xs text-muted-foreground">{goal.description}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {product && <OutfitRecommender productTitle={product.name} />}
            {brand && <BrandCard brand={brand} />}
          </div>
        </div>
      </div>
    </CabinetPageContent>
  );
}
