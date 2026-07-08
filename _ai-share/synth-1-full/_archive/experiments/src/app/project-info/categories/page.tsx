'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCategoryCatalogChecks } from '@/components/project-info/CategoryCatalogCheckContext';
import { ProjectInfoCategoryHandbookFlatTable } from '@/components/project-info/ProjectInfoCategoryHandbookFlatTable';

export default function ProjectInfoCategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div className="space-y-1">
        <p className="text-text-muted text-[11px] font-medium uppercase tracking-wide">
          Project info
        </p>
        <h1 className="text-text-primary text-2xl font-bold tracking-tight">
          Категории · справочник
        </h1>
        <p className="text-text-secondary max-w-3xl text-[13px]">
          Три уровня категории слева; аудитории (галочки в браузере); две колонки осей подборки —
          обязательные (материал, стиль/повод, цвет/состав/уход/страна для ТЗ, плюс оси типа/класса
          по ветке) и общие (сертификаты, вес, ТН ВЭД, крой, фактура и пр.). Порядок — как в
          оптимизированном справочнике. «Дом › Текстиль» и «Дом › Питомцы» учитывают категорию 3;
          новорождённые — свои оси по L3.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/project-info" className="text-accent-primary text-[12px] hover:underline">
            ← К project-info
          </Link>
          <ResetDefaultsButton />
        </div>
      </div>

      <ProjectInfoCategoryHandbookFlatTable />
    </div>
  );
}

function ResetDefaultsButton() {
  const { resetAllToHandbookDefaults } = useCategoryCatalogChecks();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 text-xs"
      onClick={resetAllToHandbookDefaults}
    >
      Сбросить по справочнику
    </Button>
  );
}
