'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { allAttributeOptions } from '@/lib/product-attributes';
import type { CategoryAttributes } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Combobox, ComboboxOptions } from '@/components/ui/combobox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AttributeManagerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  category: { level1: string; level2?: string; level3?: string; attributes?: CategoryAttributes };
  onSave: (attributes: CategoryAttributes) => void;
}

export function AttributeManagerDialog({
  isOpen,
  onOpenChange,
  category,
  onSave,
}: AttributeManagerDialogProps) {
  const [currentAttributes, setCurrentAttributes] = useState<CategoryAttributes>({});

  useEffect(() => {
    if (isOpen) {
      setCurrentAttributes(category.attributes || {});
    }
  }, [isOpen, category.attributes]);

  const handleAttributeChange = (
    attributeKey: keyof CategoryAttributes,
    value: string | string[] | undefined
  ) => {
    setCurrentAttributes((prev) => {
      const newAttributes = { ...prev };
      if (value === undefined || (Array.isArray(value) && value.length === 0)) {
        delete newAttributes[attributeKey];
      } else {
        newAttributes[attributeKey] = Array.isArray(value) ? value : [value];
      }
      return newAttributes;
    });
  };

  const getFullOptionsList = (
    optionsObject:
      | Readonly<Record<string, readonly string[]>>
      | Record<string, string[]>
      | string[]
      | ComboboxOptions
  ): ComboboxOptions => {
    if (Array.isArray(optionsObject)) {
      if (optionsObject.length === 0) return [];
      const first = optionsObject[0];
      if (typeof first === 'string') {
        return (optionsObject as string[]).map((opt) => ({ value: opt, label: opt }));
      }
      if (first && typeof first === 'object' && 'value' in first && 'label' in first) {
        return optionsObject as ComboboxOptions;
      }
      return [];
    }
    const allOptions = new Set<string>();
    for (const arr of Object.values(optionsObject)) {
      for (const opt of arr) allOptions.add(opt);
    }
    return Array.from(allOptions)
      .sort()
      .map((opt) => ({ value: opt, label: opt }));
  };

  const attributeConfig: {
    key: keyof CategoryAttributes;
    label: string;
    options: ComboboxOptions;
  }[] = useMemo(
    () => [
      {
        key: 'fit',
        label: 'Посадка / Силуэт',
        options: getFullOptionsList(allAttributeOptions.clothingFitOptions),
      },
      {
        key: 'length',
        label: 'Длина',
        options: getFullOptionsList(allAttributeOptions.garmentLengthApparelOptions),
      },
      {
        key: 'sleeveLength',
        label: 'Длина рукава',
        options: getFullOptionsList(allAttributeOptions.sleeveOptionsByCategory),
      },
      {
        key: 'cuff',
        label: 'Манжеты',
        options: getFullOptionsList(allAttributeOptions.cuffOptionsByCategory),
      },
      {
        key: 'collar',
        label: 'Воротник / Вырез',
        options: getFullOptionsList(allAttributeOptions.collarOptionsByCategory),
      },
      {
        key: 'fastening',
        label: 'Застёжка',
        options: getFullOptionsList(allAttributeOptions.fasteningOptionsByCategory),
      },
      {
        key: 'waist',
        label: 'Талия',
        options: getFullOptionsList(allAttributeOptions.waistOptionsByCategory),
      },
      {
        key: 'pockets',
        label: 'Карманы',
        options: getFullOptionsList(allAttributeOptions.pocketOptions),
      },
      {
        key: 'lining',
        label: 'Подкладка',
        options: getFullOptionsList(allAttributeOptions.liningOptionsByCategory),
      },
      {
        key: 'stitching',
        label: 'Стёжка',
        options: getFullOptionsList(allAttributeOptions.stitchingOptionsByCategory),
      },
      {
        key: 'decor',
        label: 'Декор',
        options: getFullOptionsList(allAttributeOptions.decorOptionsByCategory),
      },
      {
        key: 'hardware',
        label: 'Фурнитура',
        options: getFullOptionsList(allAttributeOptions.hardwareOptionsByCategory),
      },
      {
        key: 'fabricTexture',
        label: 'Фактура ткани',
        options: getFullOptionsList(allAttributeOptions.fabricTextureOptions),
      },
      {
        key: 'processingTech',
        label: 'Технология обработки',
        options: getFullOptionsList(allAttributeOptions.processingTechOptionsByCategory),
      },
      {
        key: 'pattern',
        label: 'Узор',
        options: getFullOptionsList(allAttributeOptions.patternOptionsByCategory),
      },
      {
        key: 'shoulder',
        label: 'Плечо',
        options: getFullOptionsList(allAttributeOptions.shoulderOptionsByCategory),
      },
      {
        key: 'backDetails',
        label: 'Детали спинки',
        options: getFullOptionsList(allAttributeOptions.backDetailOptionsByCategory),
      },
      {
        key: 'hemType',
        label: 'Тип подола',
        options: getFullOptionsList(allAttributeOptions.hemTypeOptionsByCategory),
      },
      {
        key: 'waistband',
        label: 'Пояс',
        options: getFullOptionsList(allAttributeOptions.waistbandOptionsByCategory),
      },
      {
        key: 'transformation',
        label: 'Трансформация',
        options: getFullOptionsList(allAttributeOptions.transformationOptionsByCategory),
      },
      {
        key: 'reinforcement',
        label: 'Усиление',
        options: getFullOptionsList(allAttributeOptions.reinforcementOptionsByCategory),
      },
      {
        key: 'seam',
        label: 'Шов',
        options: getFullOptionsList(allAttributeOptions.seamOptionsByCategory),
      },
      {
        key: 'combination',
        label: 'Комбинация материалов',
        options: getFullOptionsList(allAttributeOptions.combinationOptionsByCategory),
      },
      {
        key: 'drapery',
        label: 'Драпировка / Складки',
        options: getFullOptionsList(allAttributeOptions.draperyOptionsByCategory),
      },
      {
        key: 'hemFinish',
        label: 'Обработка края',
        options: getFullOptionsList(allAttributeOptions.hemFinishOptionsByCategory),
      },
    ],
    [category]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle>
            Управление атрибутами для "{category.level3 || category.level2 || category.level1}"
          </DialogTitle>
          <DialogDescription>
            Выберите, какие опции фильтров будут доступны для товаров в этой категории.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="-mx-6 flex-1">
          <div className="space-y-4 px-6">
            <Accordion type="multiple" className="w-full">
              {attributeConfig
                .filter((attr) => attr.options.length > 0)
                .map((attr) => (
                  <AccordionItem key={attr.key} value={attr.key}>
                    <AccordionTrigger>
                      {attr.label} ({currentAttributes[attr.key]?.length || 0})
                    </AccordionTrigger>
                    <AccordionContent>
                      <Combobox
                        options={attr.options}
                        value={currentAttributes[attr.key]}
                        onChange={(value) => handleAttributeChange(attr.key, value)}
                        multiple
                        placeholder={`Выберите ${attr.label.toLowerCase()}...`}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={() => onSave(currentAttributes)}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
