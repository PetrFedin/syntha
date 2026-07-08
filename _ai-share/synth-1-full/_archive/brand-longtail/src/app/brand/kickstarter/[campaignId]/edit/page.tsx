'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import { Suspense, useEffect, useState, useMemo, use } from 'react';
import { notFound, useRouter, useParams, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { kickstarterProjects } from '@/lib/kickstarter';
import {
  Save,
  ChevronLeft,
  PlusCircle,
  Trash2,
  Wand2,
  Loader2,
  Bot,
  Film,
  Newspaper,
  Send,
  Lock,
  Beaker,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { products } from '@/lib/products';
import { Combobox } from '@/components/ui/combobox';
import type { KickstarterProject, KickstarterUpdate, KickstarterFaq } from '@/lib/types';
import { campaignCreativeClient, suggestPriceClient } from '@/lib/ai-client/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { ABTestDialog } from '@/components/brand/ab-test-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PromotionDialog } from '@/components/brand/promotion-dialog';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/routes';
import { RegistryPageHeader } from '@/components/design-system';

const KICKSTARTER_CREATIVE_PLACEHOLDER_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const tierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Название обязательно'),
  price: z.number().min(0),
  description: z.string().optional(),
  rewards: z.string().optional(),
  limit: z.preprocess(
    (val) => (val === '' ? null : Number(val)),
    z.number().min(1).nullable().optional()
  ),
});

const stretchGoalSchema = z.object({
  id: z.string().optional(),
  target: z.number().min(1, 'Цель должна быть больше 0'),
  description: z.string().min(1, 'Описание обязательно'),
  achieved: z.boolean().default(false),
});

const updateSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Название обязательно'),
  body: z.string().min(1, 'Текст обязателен'),
  forBackersOnly: z.boolean().default(false),
});

const faqSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, 'Вопрос обязателен'),
  answer: z.string().min(1, 'Ответ обязателен'),
});

const campaignEditSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  productId: z.string().min(1, 'Выберите продукт'),
  goal: z.number().min(1, 'Цель должна быть больше 0').optional(),
  targetQuantity: z.number().min(1, 'Цель должна быть больше 0'),
  retailPrice: z.number().min(0),
  preorderPrice: z.number().min(0, 'Цена предзаказа обязательна'),
  wholesalePrice: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  moqWholesale: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(1).optional()
  ),
  startAt: z.date(),
  endAt: z.date(),
  tiers: z.array(tierSchema).optional(),
  stretchGoals: z.array(stretchGoalSchema).optional(),
  updates: z.array(updateSchema).optional(),
  faqs: z.array(faqSchema).optional(),
  fundingModel: z.enum(['quantity', 'monetary']).default('quantity'),
});

type CampaignEditFormValues = z.infer<typeof campaignEditSchema>;

function EditCampaignPageContent({
  params: paramsPromise,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const params = use(paramsPromise);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const campaignId = params.campaignId as string;
  const isNew = campaignId === 'new';

  const [project, setProject] = useState<KickstarterProject | Partial<KickstarterProject> | null>(
    null
  );
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingMarketing, setIsGeneratingMarketing] = useState(false);
  const [marketingContent, setMarketingContent] = useState<Record<string, string>>({});
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);

  const form = useForm<CampaignEditFormValues>({
    resolver: zodResolver(campaignEditSchema),
  });

  const { control, setValue, getValues, reset, watch } = form;

  const {
    fields: tiers,
    append: appendTier,
    remove: removeTier,
  } = useFieldArray({
    control,
    name: 'tiers',
  });
  const {
    fields: stretchGoals,
    append: appendStretchGoal,
    remove: removeStretchGoal,
  } = useFieldArray({
    control,
    name: 'stretchGoals',
  });
  const {
    fields: updates,
    append: appendUpdate,
    remove: removeUpdate,
  } = useFieldArray({
    control,
    name: 'updates',
  });
  const {
    fields: faqs,
    append: appendFaq,
    remove: removeFaq,
  } = useFieldArray({
    control,
    name: 'faqs',
  });

  useEffect(() => {
    if (isNew) {
      const productId = searchParams.get('productId');
      const name = searchParams.get('name');
      const product = products.find((p) => p.id === productId);

      const newProjectData: Partial<KickstarterProject> = {
        title: name || '',
        productId: productId || '',
        description: product?.description || '',
        retailPrice: product?.price || 0,
        preorderPrice: (product?.price || 0) * 0.8,
        productionCost: product?.productionCost,
        status: 'draft',
        media: product?.images?.map((img) => ({ type: 'image', url: img.url })) || [],
        imageUrl: product?.images?.[0]?.url,
      };
      setProject(newProjectData);
      reset({
        title: newProjectData.title,
        productId: newProjectData.productId,
        description: newProjectData.description,
        retailPrice: newProjectData.retailPrice,
        preorderPrice: newProjectData.preorderPrice,
        startAt: new Date(),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        targetQuantity: 100,
        goal: 250000,
        tiers: [
          {
            name: 'Standard Preorder',
            price: newProjectData.preorderPrice || 0,
            description: 'Стандартный предзаказ',
            rewards: '1x Товар',
            limit: null,
          },
        ],
        stretchGoals: [],
        updates: [],
        faqs: [],
        fundingModel: 'quantity',
      });
    } else {
      const foundProject = kickstarterProjects.find((p) => p.id === campaignId);
      if (foundProject) {
        setProject(foundProject);
        reset({
          ...foundProject,
          targetQuantity: foundProject.targetQuantity || 0,
          retailPrice: foundProject.retailPrice || 0,
          preorderPrice: foundProject.preorderPrice || 0,
          wholesalePrice: foundProject.wholesalePrice || undefined,
          moqWholesale: foundProject.moqWholesale || undefined,
          startAt: new Date(foundProject.startAt),
          endAt: new Date(foundProject.endAt),
          tiers: foundProject.tiers?.map((t) => ({ ...t, rewards: t.rewards.join('\n') })) || [],
          stretchGoals:
            foundProject.stretchGoals?.map((g) => ({ ...g, achieved: g.achieved ?? false })) || [],
          updates: foundProject.updates || [],
          faqs: foundProject.faqs || [],
          fundingModel: foundProject.fundingModel || 'quantity',
        });
      }
    }
  }, [campaignId, isNew, searchParams, reset]);

  const watchedProductId = watch('productId');
  const fundingModel = watch('fundingModel');
  const currentProduct = useMemo(
    () => products.find((p) => p.id === watchedProductId),
    [watchedProductId]
  );

  if (!project) {
    return null; // or a loading state
  }

  const onSubmit = (data: CampaignEditFormValues) => {
    console.log(data);
    toast({
      title: 'Кампания сохранена',
      description: 'Все изменения были успешно обновлены.',
    });
    if (isNew) {
      router.push('/brand/kickstarter'); // Redirect after creation
    }
  };

  const handleGenerateDescription = async () => {
    setIsGeneratingDesc(true);
    const product = products.find((p) => p.id === getValues('productId'));
    if (!product) {
      toast({ variant: 'destructive', title: 'Товар не выбран' });
      setIsGeneratingDesc(false);
      return;
    }

    try {
      // This is a simplified call, in a real scenario you might build a more specific prompt
      const result = await campaignCreativeClient({
        productName: product.name,
        productPrice: (project.preorderPrice || 0).toLocaleString('ru-RU') + ' ₽',
        productImageDataUri: KICKSTARTER_CREATIVE_PLACEHOLDER_IMAGE,
        prompt: `Напиши вдохновляющее описание для Kickstarter-кампании по предзаказу товара "${product.name}". Сделай акцент на качестве, уникальности и возможности быть одним из первых обладателей.`,
      });

      // This is a mock response, as the flow is designed for images
      const mockDescription = `Присоединяйтесь к запуску нашей новой модели: ${product.name}. Это не просто одежда, это заявление. Созданная из лучших материалов с вниманием к каждой детали, эта вещь станет жемчужиной вашего гардероба. Оформите предзаказ и станьте одним из первых, кто прикоснется к будущему моды.`;
      setValue('description', mockDescription);
    } catch (error) {
      console.error('AI description generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Ошибка AI',
        description: 'Не удалось сгенерировать описание.',
      });
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleGenerateMarketing = async (type: 'posts' | 'email' | 'video') => {
    setIsGeneratingMarketing(true);
    setMarketingContent({});
    try {
      // Mock AI calls
      await new Promise((res) => setTimeout(res, 1500));
      if (type === 'posts') {
        setMarketingContent({
          title: 'Идеи для постов',
          content: `1. Анонс: "Представляем Urban Shell Parka! Будьте первыми."\n2. Детали: "Технологии в каждой нити. Водонепроницаемость и стиль."\n3. Срочность: "Осталось 5 дней! Успейте сделать предзаказ."`,
        });
      } else if (type === 'email') {
        setMarketingContent({
          title: 'Текст для email-рассылки',
          content: `Тема: Эксклюзивный предзаказ: Urban Shell Parka\n\nПривет, [Имя]!\n\nГотовы к будущему? Мы запускаем предзаказ на нашу новую Urban Shell Parka...`,
        });
      } else {
        setMarketingContent({
          title: 'Сценарий для видео (Reels/Shorts)',
          content: `1. Кадр: Крупный план ткани под дождем (капли стекают).\n2. Кадр: Модель в парке, вид сзади.\n3. Кадр: Резкий поворот, улыбка.\n4. Текст: "Urban Shell Parka. Предзаказ открыт."`,
        });
      }
    } finally {
      setIsGeneratingMarketing(false);
    }
  };

  const productOptions = products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }));

  const handleSuggestPrice = async () => {
    const product = products.find((p) => p.id === watchedProductId);
    if (!product) return;

    setIsSuggestingPrice(true);
    try {
      const result = await suggestPriceClient({
        productName: product.name,
        productionCost: product.productionCost || product.price * 0.4,
        category: product.category,
        brandSegment: project.segment || 'Contemporary',
      });
      setValue('preorderPrice', result.suggestedRrp * 0.8, { shouldDirty: true });
      setValue('retailPrice', result.suggestedRrp, { shouldDirty: true });
      toast({ title: 'AI предложил цены', description: result.reasoning });
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Ошибка AI',
        description: 'Не удалось получить рекомендацию по цене.',
      });
    } finally {
      setIsSuggestingPrice(false);
    }
  };

  return (
    <Form {...form}>
      <CabinetPageContent maxWidth="full" className="w-full space-y-6 pb-16">
        <RegistryPageHeader
          title={isNew ? 'Новая кампания' : 'Редактор кампании'}
          leadPlain={project.title}
          eyebrow={
            <Button variant="outline" size="icon" asChild>
              <Link href={ROUTES.brand.kickstarter} aria-label="Назад к кампаниям">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          }
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPromotionDialogOpen(true)}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Продвигать
              </Button>
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Отменить
              </Button>
              <Button type="submit" form="brand-kickstarter-campaign-edit-form">
                <Save className="mr-2 h-4 w-4" />
                {isNew ? 'Создать и сохранить' : 'Сохранить'}
              </Button>
            </div>
          }
        />
        <form
          id="brand-kickstarter-campaign-edit-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название кампании</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Textarea {...field} rows={5} />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8"
                            onClick={handleGenerateDescription}
                            disabled={isGeneratingDesc}
                          >
                            {isGeneratingDesc ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Wand2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Продукт</FormLabel>
                        <Combobox
                          options={productOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Выберите продукт..."
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Главное изображение</CardTitle>
                      <CardDescription>Загрузите варианты для A/B тестирования.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsTestDialogOpen(true)}
                        >
                          <Beaker className="mr-2 h-4 w-4" /> Запустить A/B тест
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Уровни поддержки (Tiers)</CardTitle>
                  <CardDescription>Создайте разные варианты для ваших спонсоров.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tiers.map((tier, index) => (
                    <Card key={tier.id || index} className="p-4">
                      <div className="mb-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeTier(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`tiers.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Название уровня</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`tiers.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Цена (₽)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`tiers.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Описание</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`tiers.${index}.rewards`}
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Награды (каждая с новой строки)</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`tiers.${index}.limit`}
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Лимит (шт.)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                value={field.value ?? ''}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === '' ? null : Number(e.target.value)
                                  )
                                }
                                placeholder="Неограниченно"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendTier({ name: '', price: 0, rewards: '', limit: null })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Добавить уровень
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Дополнительные цели (Stretch Goals)</CardTitle>
                  <CardDescription>Мотивируйте сообщество достигать большего.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stretchGoals.map((goal, index) => (
                    <div key={goal.id} className="flex items-end gap-2 rounded-md border p-2">
                      <FormField
                        control={form.control}
                        name={`stretchGoals.${index}.target`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Цель (в ед. или ₽)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`stretchGoals.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="flex-[3]">
                            <FormLabel>Описание награды</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => removeStretchGoal(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendStretchGoal({
                        id: `sg-${Date.now()}`,
                        target: 0,
                        description: '',
                        achieved: false,
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Добавить цель
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Обновления кампании</CardTitle>
                  <CardDescription>Держите ваших спонсоров в курсе прогресса.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {updates.map((update, index) => (
                    <Card key={update.id} className="p-4">
                      <div className="mb-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeUpdate(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`updates.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Заголовок</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`updates.${index}.body`}
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Текст</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="mt-4 flex items-center space-x-2">
                        <FormField
                          control={form.control}
                          name={`updates.${index}.forBackersOnly`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  id={`backers-only-${index}`}
                                />
                              </FormControl>
                              <Label
                                htmlFor={`backers-only-${index}`}
                                className="flex items-center gap-1.5"
                              >
                                <Lock className="h-3 w-3" />
                                Только для спонсоров
                              </Label>
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendUpdate({
                        id: `upd-${Date.now()}`,
                        title: '',
                        body: '',
                        forBackersOnly: false,
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Добавить обновление
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" /> FAQ (Частые вопросы)
                  </CardTitle>
                  <CardDescription>
                    Ответьте на возможные вопросы спонсоров заранее.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqs.map((faq, index) => (
                    <Card key={faq.id} className="p-4">
                      <div className="mb-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeFaq(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`faqs.${index}.question`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Вопрос</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`faqs.${index}.answer`}
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Ответ</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={3} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendFaq({ id: `faq-${Date.now()}`, question: '', answer: '' })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Добавить вопрос
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Цели и сроки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fundingModel"
                    render={({ field }) => (
                      <FormItem className="space-y-3 pt-2">
                        <FormLabel>Модель сбора</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex gap-3"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="quantity" />
                              </FormControl>
                              <FormLabel className="font-normal">По количеству</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="monetary" />
                              </FormControl>
                              <FormLabel className="font-normal">По сумме</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {fundingModel === 'quantity' ? (
                    <FormField
                      control={form.control}
                      name="targetQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Цель (шт.)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Цель (₽)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="startAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Дата начала</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: ru })
                                ) : (
                                  <span>Выберите дату</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Дата окончания</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: ru })
                                ) : (
                                  <span>Выберите дату</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Ценообразование и Финансы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="retailPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Розничная цена (после кампании)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preorderPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цена предзаказа (для всех)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="wholesalePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Оптовая цена (B2B)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === '' ? undefined : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="moqWholesale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MOQ (B2B)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === '' ? undefined : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fundingModel"
                    render={({ field }) => (
                      <FormItem className="space-y-3 pt-2">
                        <FormLabel>Модель финансирования</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="authorize_capture" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Холд средств (Authorize & Capture)
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="direct_charge" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Мгновенное списание (Direct Charge)
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleSuggestPrice}
                    disabled={!watchedProductId || isSuggestingPrice}
                  >
                    {isSuggestingPrice ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    AI-подсказка по цене
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" /> AI-Инструменты
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Bot className="h-4 w-4" />
                    <AlertTitle className="flex items-center gap-2">
                      AI-Анализ <Badge variant="outline">78% шанс на успех</Badge>
                    </AlertTitle>
                    <AlertDescription>
                      Наша модель прогнозирует высокий интерес к кампании. Рекомендация: добавьте
                      "Early Bird" уровень со скидкой 15-20% для первых 50 участников, чтобы
                      ускорить сбор на старте.
                    </AlertDescription>
                  </Alert>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">Маркетинговый "автопилот"</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 p-4 pt-0">
                      <p className="text-xs text-muted-foreground">
                        Сгенерируйте контент для продвижения кампании.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleGenerateMarketing('posts')}
                          disabled={isGeneratingMarketing}
                        >
                          <Newspaper className="mr-2 h-4 w-4" />
                          Посты
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleGenerateMarketing('email')}
                          disabled={isGeneratingMarketing}
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Email
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleGenerateMarketing('video')}
                          disabled={isGeneratingMarketing}
                        >
                          <Film className="mr-2 h-4 w-4" />
                          Видео
                        </Button>
                      </div>
                      {isGeneratingMarketing && <Loader2 className="mt-2 h-4 w-4 animate-spin" />}
                      {marketingContent?.content && (
                        <div className="mt-2 rounded-md border bg-background/50 p-3">
                          <h5 className="mb-1 text-sm font-semibold">{marketingContent.title}</h5>
                          <p className="whitespace-pre-wrap text-xs">{marketingContent.content}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
        {currentProduct && (
          <ABTestDialog
            product={currentProduct}
            isOpen={isTestDialogOpen}
            onOpenChange={setIsTestDialogOpen}
          />
        )}
        <PromotionDialog
          isOpen={isPromotionDialogOpen}
          onOpenChange={setIsPromotionDialogOpen}
          product={currentProduct}
          initialType="kickstarter_boost"
        />
      </CabinetPageContent>
    </Form>
  );
}

export default function EditCampaignPageWrapper({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  return (
    <Suspense fallback={<div>Загрузка редактора...</div>}>
      <EditCampaignPageContent params={params} />
    </Suspense>
  );
}
