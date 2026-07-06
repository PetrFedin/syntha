'use client';

import { useCallback, useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Workshop2SignoffStageDef } from '@/lib/production/workshop2-signoff-stages-config';
import { WORKSHOP2_DEFAULT_SIGNOFF_STAGES } from '@/lib/production/workshop2-signoff-stages-config';

type Props = {
  defaultCollectionId?: string;
};

/** Wave 7 P1 #18: настройка signoffStages[] per collection на setup page. */
export function Workshop2SignoffStagesSetupPanel({ defaultCollectionId = 'SS27' }: Props) {
  const { toast } = useToast();
  const [collectionId, setCollectionId] = useState(defaultCollectionId);
  const [stages, setStages] = useState<Workshop2SignoffStageDef[]>(
    WORKSHOP2_DEFAULT_SIGNOFF_STAGES
  );
  const [loading, setLoading] = useState(false);

  const loadStages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/workshop2/setup/signoff-stages?collectionId=${encodeURIComponent(collectionId)}`,
        { cache: 'no-store' }
      );
      const json = (await res.json()) as { ok?: boolean; stages?: Workshop2SignoffStageDef[] };
      if (json.stages?.length) setStages(json.stages);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    void loadStages();
  }, [loadStages]);

  const save = async () => {
    const res = await fetch('/api/workshop2/setup/signoff-stages', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionId, stages }),
    });
    const json = (await res.json()) as { ok?: boolean; messageRu?: string };
    toast({
      title: json.ok ? 'Этапы signoff сохранены' : 'Ошибка сохранения',
      description: json.messageRu,
      variant: json.ok ? 'default' : 'destructive',
    });
  };

  return (
    <div
      className="space-y-3 rounded-lg border bg-slate-50/80 p-4"
      data-testid="workshop2-signoff-stages-setup"
    >
      <div className="flex items-center gap-2">
        <LucideIcons.ListChecks className="h-4 w-4 text-indigo-600" />
        <h3 className="text-sm font-semibold">Этапы signoff (multi-level)</h3>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div>
          <label className="text-[10px] text-slate-500">collectionId</label>
          <Input
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="h-8 w-32 text-[11px]"
          />
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() => void loadStages()}
        >
          {loading ? '…' : 'Обновить'}
        </Button>
        <Button type="button" size="sm" className="h-8" onClick={() => void save()}>
          Сохранить в PG
        </Button>
      </div>
      <ul className="space-y-2">
        {stages.map((s) => (
          <li
            key={s.stageId}
            className="flex items-center gap-2 rounded border bg-white px-2 py-1.5 text-[11px]"
          >
            <Badge variant="outline">{s.order}</Badge>
            <span className="font-medium">{s.labelRu}</span>
            <span className="text-slate-500">({s.sectionKeys.join(', ')})</span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-slate-500">
        Гейт передачи читает этапы из setup PG/file-store — не фиксированные 4 секции.
      </p>
    </div>
  );
}
