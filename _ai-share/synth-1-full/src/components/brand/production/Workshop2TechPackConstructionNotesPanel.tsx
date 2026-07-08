'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  W2_TECHPACK_CONSTRUCTION_NOTE_PRESETS,
  resolveWorkshop2TechPackConstructionNotes,
} from '@/lib/production/workshop2-techpack-export-sheets';
import { cn } from '@/lib/utils';

export function Workshop2TechPackConstructionNotesPanel({
  dossier,
  setDossier,
  readOnly = false,
}: {
  dossier: Workshop2DossierPhase1;
  setDossier?: Dispatch<SetStateAction<Workshop2DossierPhase1>>;
  readOnly?: boolean;
}) {
  const resolved = resolveWorkshop2TechPackConstructionNotes(dossier);

  const togglePreset = (presetId: string) => {
    if (readOnly || !setDossier) return;
    setDossier((prev) => {
      const base =
        prev.techPackConstructionNotePresetIds ?? resolved.filter((r) => r.active).map((r) => r.id);
      const cur = new Set(base);
      if (cur.has(presetId)) cur.delete(presetId);
      else cur.add(presetId);
      return { ...prev, techPackConstructionNotePresetIds: [...cur] };
    });
  };

  return (
    <Card data-testid="workshop2-techpack-construction-notes">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Additional notes · construction presets</CardTitle>
        <CardDescription className="text-xs leading-snug">
          Fully lined / shoulder pads / seam allowance — на sketch-листах factory pack (RU/EN в
          export).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {W2_TECHPACK_CONSTRUCTION_NOTE_PRESETS.map((preset) => {
            const active = resolved.find((r) => r.id === preset.id)?.active === true;
            return (
              <Button
                key={preset.id}
                type="button"
                size="sm"
                variant={active ? 'default' : 'outline'}
                disabled={readOnly || !setDossier}
                className={cn('h-8 gap-1.5 text-[11px]', !active && 'opacity-80')}
                data-testid={`techpack-construction-preset-${preset.id}`}
                onClick={() => togglePreset(preset.id)}
              >
                <span aria-hidden>{preset.icon}</span>
                {preset.labelRu}
                <span className="text-[10px] opacity-70">/ {preset.labelEn}</span>
              </Button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {resolved
            .filter((n) => n.active)
            .map((n) => (
              <Badge key={n.id} variant="secondary" className="text-[10px]">
                {n.labelRu}
              </Badge>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
