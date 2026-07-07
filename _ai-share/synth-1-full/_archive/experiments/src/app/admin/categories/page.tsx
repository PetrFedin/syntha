'use client';

import { CabinetPageContent } from '@/components/layout/cabinet-page-content';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, PlusCircle, Edit, History } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMemo, useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { AttributeManagerDialog } from '@/components/admin/attribute-manager-dialog';
import type { CategoryAttributes } from '@/lib/types';
import { allAttributeOptions } from '@/lib/product-attributes';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

interface FlatCategory {
  level1: string;
  level2?: string;
  level3?: string;
  audience: string[];
  attributes?: CategoryAttributes;
  status: 'active' | 'inactive';
  history: { date: string; user: string; change: string }[];
}

interface HistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  categoryName: string;
  history: FlatCategory['history'];
}

function HistoryDialog({ isOpen, onOpenChange, categoryName, history }: HistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>История изменений: {categoryName}</DialogTitle>
          <DialogDescription>
            Здесь отображаются все действия, совершенные с этой категорией.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Дата</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Изменение</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleString('ru-RU')}
                  </TableCell>
                  <TableCell>{entry.user}</TableCell>
                  <TableCell>{entry.change}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Categories exclusively for women
const womenOnlyCategories = [
  'Платья и сарафаны',
  'Юбки',
  'Бюстгальтеры',
  'Коктейльные',
  'Вечерние',
  'Балетки',
  'Ботфорты',
  'Кроп-топы',
  'Купальники',
  'Парео',
  'Пляжные платья',
  'Береты',
  'Клатч',
  'Вечерняя',
  'Bootcut',
  'Flare',
  'Повседневные',
  'Мини',
  'Миди',
  'Макси',
  'Карандаш',
  'А-силуэт',
  'Плиссе',
  'Босоножки',
  'Челси на каблуке',
];
// Categories exclusively for men
const menOnlyCategories = ['Фрак', 'Плавки'];
// Specific exceptions that should be unisex
const unisexExceptions = ['Шоппер'];

const kidsKeywords = ['детск', 'новорожденн', 'малыш', 'девочк', 'мальчик'];
const girlsKeywords = ['девочек', 'платье', 'юбка'];
const boysKeywords = ['мальчиков'];
const babyKeywords = ['новорожденных', 'младенцев', 'baby'];

const audienceOptions = [
  { value: 'Взрослые - Женщины', label: 'Взрослые - Женщины' },
  { value: 'Взрослые - Мужчины', label: 'Взрослые - Мужчины' },
  { value: 'Взрослые - Унисекс', label: 'Взрослые - Унисекс' },
  { value: 'Дети - Девочки', label: 'Дети - Девочки' },
  { value: 'Дети - Мальчики', label: 'Дети - Мальчики' },
  { value: 'Дети - Новорожденные', label: 'Дети - Новорожденные' },
  { value: 'Дети - Унисекс', label: 'Дети - Унисекс' },
  { value: 'Non-Fashion', label: 'Non-Fashion' },
];

function getAudienceForCategory(
  cat: Omit<FlatCategory, 'audience' | 'attributes' | 'status' | 'history'>
): string[] {
  const { level1, level2, level3 } = cat;
  const fullPath = [level1, level2, level3].filter(Boolean).join(' ');

  if (unisexExceptions.some((ex) => fullPath.includes(ex))) {
    return ['Взрослые - Унисекс', 'Дети - Унисекс'];
  }

  if (level1 === 'Beauty & Grooming' || level1 === 'Home & Lifestyle') {
    return ['Non-Fashion'];
  }

  if (kidsKeywords.some((kw) => fullPath.toLowerCase().includes(kw))) {
    if (babyKeywords.some((kw) => fullPath.toLowerCase().includes(kw)))
      return ['Дети - Новорожденные'];
    if (girlsKeywords.some((kw) => fullPath.toLowerCase().includes(kw))) return ['Дети - Девочки'];
    if (boysKeywords.some((kw) => fullPath.toLowerCase().includes(kw))) return ['Дети - Мальчики'];
    return ['Дети - Унисекс'];
  }

  if (womenOnlyCategories.some((wCat) => fullPath.includes(wCat))) {
    return ['Взрослые - Женщины', 'Дети - Девочки'];
  }
  if (menOnlyCategories.some((mCat) => fullPath.includes(mCat))) {
    return ['Взрослые - Мужчины', 'Дети - Мальчики'];
  }

  return ['Взрослые - Унисекс', 'Дети - Унисекс'];
}

function getDefaultAttributesForCategory(
  category: Omit<FlatCategory, 'audience' | 'attributes' | 'status' | 'history'>
): CategoryAttributes {
  const attributes: CategoryAttributes = {};
  const { level1, level2, level3 } = category;

  const getRelevantOptions = (
    optionsObject:
      | Readonly<Record<string, readonly string[]>>
      | Record<string, string[]>
      | { value: string; label: string }[]
      | undefined
  ): string[] => {
    if (!optionsObject) return [];
    if (Array.isArray(optionsObject) && typeof optionsObject[0] === 'object') {
      // This is for flat arrays of objects like pocketOptions
      return [];
    }

    if (Array.isArray(optionsObject)) {
      // This is for flat arrays of strings
      return [];
    }

    const pick = (key: string | undefined): readonly string[] | undefined =>
      key ? optionsObject[key] : undefined;

    if (level3 && pick(level3)) return [...pick(level3)!];
    if (level2 && pick(level2)) return [...pick(level2)!];
    if (level1 && pick(level1)) return [...pick(level1)!];

    // Fallback: If no specific category matches, don't select any options by default.
    return [];
  };

  const attributeConfig: { key: keyof CategoryAttributes; options: string[] }[] = [
    { key: 'fit', options: getRelevantOptions(allAttributeOptions.clothingFitOptions) },
    // lengthOptionsByCategory / fabricTextureOptionsByCategory пока не заданы в product-attributes (есть плоские шкалы)
    { key: 'length', options: getRelevantOptions({}) },
    {
      key: 'sleeveLength',
      options: getRelevantOptions(allAttributeOptions.sleeveOptionsByCategory),
    },
    { key: 'cuff', options: getRelevantOptions(allAttributeOptions.cuffOptionsByCategory) },
    { key: 'collar', options: getRelevantOptions(allAttributeOptions.collarOptionsByCategory) },
    {
      key: 'fastening',
      options: getRelevantOptions(allAttributeOptions.fasteningOptionsByCategory),
    },
    { key: 'waist', options: getRelevantOptions(allAttributeOptions.waistOptionsByCategory) },
    { key: 'pockets', options: getRelevantOptions(allAttributeOptions.pocketOptions) },
    { key: 'lining', options: getRelevantOptions(allAttributeOptions.liningOptionsByCategory) },
    {
      key: 'stitching',
      options: getRelevantOptions(allAttributeOptions.stitchingOptionsByCategory),
    },
    { key: 'decor', options: getRelevantOptions(allAttributeOptions.decorOptionsByCategory) },
    { key: 'hardware', options: getRelevantOptions(allAttributeOptions.hardwareOptionsByCategory) },
    { key: 'fabricTexture', options: getRelevantOptions({}) },
    {
      key: 'processingTech',
      options: getRelevantOptions(allAttributeOptions.processingTechOptionsByCategory),
    },
    { key: 'pattern', options: getRelevantOptions(allAttributeOptions.patternOptionsByCategory) },
    { key: 'shoulder', options: getRelevantOptions(allAttributeOptions.shoulderOptionsByCategory) },
    {
      key: 'backDetails',
      options: getRelevantOptions(allAttributeOptions.backDetailOptionsByCategory),
    },
    { key: 'hemType', options: getRelevantOptions(allAttributeOptions.hemTypeOptionsByCategory) },
    {
      key: 'waistband',
      options: getRelevantOptions(allAttributeOptions.waistbandOptionsByCategory),
    },
    {
      key: 'transformation',
      options: getRelevantOptions(allAttributeOptions.transformationOptionsByCategory),
    },
    {
      key: 'reinforcement',
      options: getRelevantOptions(allAttributeOptions.reinforcementOptionsByCategory),
    },
    { key: 'seam', options: getRelevantOptions(allAttributeOptions.seamOptionsByCategory) },
    {
      key: 'combination',
      options: getRelevantOptions(allAttributeOptions.combinationOptionsByCategory),
    },
    { key: 'drapery', options: getRelevantOptions(allAttributeOptions.draperyOptionsByCategory) },
    {
      key: 'hemFinish',
      options: getRelevantOptions(allAttributeOptions.hemFinishOptionsByCategory),
    },
  ];

  attributeConfig.forEach((attr) => {
    if (attr.options.length > 0) {
      attributes[attr.key] = attr.options;
    }
  });

  return attributes;
}

export default function CategoriesPage() {
  const [filterLevel1, setFilterLevel1] = useState<string | undefined>(undefined);
  const [filterLevel2, setFilterLevel2] = useState<string | undefined>(undefined);
  const [editingCategory, setEditingCategory] = useState<{
    index: number;
    category: FlatCategory;
  } | null>(null);
  const [viewingHistory, setViewingHistory] = useState<FlatCategory | null>(null);
  const [fullCategoryStructure, setFullCategoryStructure] = useState<Record<string, any> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/data/categories.json');
        const data = (await response.json()) as Record<string, unknown>;
        setFullCategoryStructure(data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const [categoriesData, setCategoriesData] = useState<FlatCategory[]>([]);

  useEffect(() => {
    if (!fullCategoryStructure) return;

    const result: Omit<FlatCategory, 'audience' | 'attributes' | 'status' | 'history'>[] = [];
    const structure = fullCategoryStructure as Record<string, any>;

    for (const level1 in structure) {
      const level2Obj = structure[level1];
      if (Object.keys(level2Obj).length === 0) {
        result.push({ level1 });
        continue;
      }
      for (const level2 in level2Obj) {
        const level3Obj = level2Obj[level2];
        if (!level3Obj || Object.keys(level3Obj).length === 0) {
          result.push({ level1, level2 });
          continue;
        }
        for (const level3 in level3Obj) {
          result.push({ level1, level2, level3 });
        }
      }
    }
    setCategoriesData(
      result.map((cat) => ({
        ...cat,
        audience: getAudienceForCategory(cat),
        attributes: getDefaultAttributesForCategory(cat),
        status: 'active',
        history: [{ date: new Date().toISOString(), user: 'system', change: 'Категория создана' }],
      }))
    );
  }, [fullCategoryStructure]);

  const filteredCategories = useMemo(() => {
    return categoriesData
      .map((cat, index) => ({ ...cat, originalIndex: index }))
      .filter((cat) => {
        const matchLevel1 = !filterLevel1 || cat.level1 === filterLevel1;
        const matchLevel2 = !filterLevel2 || cat.level2 === filterLevel2;
        return matchLevel1 && matchLevel2;
      });
  }, [categoriesData, filterLevel1, filterLevel2]);

  const level1Options = useMemo(
    () => [...new Set(categoriesData.map((c) => c.level1))],
    [categoriesData]
  );
  const level2Options = useMemo(() => {
    if (!filterLevel1) return [];
    return [
      ...new Set(
        categoriesData.filter((c) => c.level1 === filterLevel1 && c.level2).map((c) => c.level2!)
      ),
    ];
  }, [categoriesData, filterLevel1]);

  const handleLevel1FilterChange = (value: string) => {
    const newFilter = value === 'all' ? undefined : value;
    setFilterLevel1(newFilter);
    setFilterLevel2(undefined); // Reset level 2 filter
  };

  const handleAudienceChange = (index: number, newAudience: string[] | undefined) => {
    setCategoriesData((prev) =>
      prev.map((cat, i) => {
        if (i === index) {
          const oldAudience = cat.audience.join(', ');
          const newAudienceStr = (newAudience || []).join(', ');
          const newHistoryEntry = {
            date: new Date().toISOString(),
            user: 'admin', // Placeholder
            change: `Аудитория изменена с "${oldAudience}" на "${newAudienceStr}"`,
          };
          return {
            ...cat,
            audience: newAudience || [],
            history: [newHistoryEntry, ...cat.history],
          };
        }
        return cat;
      })
    );
  };

  const handleStatusChange = (index: number, newStatus: boolean) => {
    setCategoriesData((prev) =>
      prev.map((cat, i) => {
        if (i === index) {
          const statusText = newStatus ? 'активна' : 'неактивна';
          const newHistoryEntry = {
            date: new Date().toISOString(),
            user: 'admin', // Placeholder
            change: `Категория теперь ${statusText}`,
          };
          return {
            ...cat,
            status: newStatus ? 'active' : 'inactive',
            history: [newHistoryEntry, ...cat.history],
          };
        }
        return cat;
      })
    );
  };

  const handleAttributesSave = (index: number, newAttributes: CategoryAttributes) => {
    setCategoriesData((prev) =>
      prev.map((cat, i) => {
        if (i === index) {
          const oldAttributesCount = countSelectedAttributes(cat.attributes);
          const newAttributesCount = countSelectedAttributes(newAttributes);
          const newHistoryEntry = {
            date: new Date().toISOString(),
            user: 'admin', // Placeholder
            change: `Атрибуты обновлены (было ${oldAttributesCount} опций, стало ${newAttributesCount} опций)`,
          };
          return { ...cat, attributes: newAttributes, history: [newHistoryEntry, ...cat.history] };
        }
        return cat;
      })
    );
    setEditingCategory(null);
  };

  const countSelectedAttributes = (attributes?: CategoryAttributes) => {
    if (!attributes) return 0;
    return Object.values(attributes).reduce((acc, val) => acc + (val?.length || 0), 0);
  };

  const openHistoryDialog = (category: FlatCategory) => {
    setViewingHistory(category);
  };

  return (
    <CabinetPageContent maxWidth="full" className="space-y-4">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="font-headline text-base font-bold">Справочник категорий</h1>
          <p className="text-muted-foreground">
            Управление иерархией категорий товаров и их атрибутами.
          </p>
        </header>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить категорию
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Структура категорий</CardTitle>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <CardDescription>
              Всего записей: {isLoading ? '...' : filteredCategories.length}
            </CardDescription>
            <div className="flex gap-2">
              <Select onValueChange={handleLevel1FilterChange} disabled={isLoading}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Фильтр по Категории 1" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {level1Options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(v) => setFilterLevel2(v === 'all' ? undefined : v)}
                disabled={!filterLevel1 || isLoading}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Фильтр по Категории 2" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все подкатегории</SelectItem>
                  {level2Options.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Категория (Ур. 1)</TableHead>
                  <TableHead>Категория (Ур. 2)</TableHead>
                  <TableHead>Категория (Ур. 3)</TableHead>
                  <TableHead className="w-[250px]">Аудитория</TableHead>
                  <TableHead>Атрибуты</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={`${cat.level1}-${cat.level2}-${cat.level3}-${cat.originalIndex}`}>
                    <TableCell className="py-2 font-medium">{cat.level1}</TableCell>
                    <TableCell className="py-2">{cat.level2 || '—'}</TableCell>
                    <TableCell className="py-2">{cat.level3 || '—'}</TableCell>
                    <TableCell className="py-2">
                      <Combobox
                        options={audienceOptions}
                        value={cat.audience}
                        onChange={(val) =>
                          handleAudienceChange(cat.originalIndex, val as string[] | undefined)
                        }
                        multiple
                        placeholder="Выберите аудиторию..."
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingCategory({
                            index: cat.originalIndex,
                            category: categoriesData[cat.originalIndex],
                          })
                        }
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Настроить ({countSelectedAttributes(cat.attributes)})
                      </Button>
                    </TableCell>
                    <TableCell className="py-2">
                      <Switch
                        checked={cat.status === 'active'}
                        onCheckedChange={(checked) =>
                          handleStatusChange(cat.originalIndex, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <div className="flex items-center justify-end">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openHistoryDialog(categoriesData[cat.originalIndex])}
                              >
                                <History className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Посмотреть историю изменений</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Редактировать</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingCategory && (
        <AttributeManagerDialog
          isOpen={!!editingCategory}
          onOpenChange={(open) => {
            if (!open) setEditingCategory(null);
          }}
          category={editingCategory.category}
          onSave={(newAttributes) => handleAttributesSave(editingCategory.index, newAttributes)}
        />
      )}

      {viewingHistory && (
        <HistoryDialog
          isOpen={!!viewingHistory}
          onOpenChange={(open) => {
            if (!open) setViewingHistory(null);
          }}
          categoryName={viewingHistory.level3 || viewingHistory.level2 || viewingHistory.level1}
          history={viewingHistory.history}
        />
      )}
    </CabinetPageContent>
  );
}
