'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSignature, Factory, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import {
  workshop2EdoStatusLabelRu,
  type Workshop2EdoSignoffMirror,
} from '@/lib/production/workshop2-edo-signoff';
import { resolveWorkshop2EdoAssignmentCta } from '@/lib/production/workshop2-edo-assignment-cta';

type Props = {
  collectionId: string;
  articleId: string;
  dossier: Workshop2DossierPhase1;
  onDossierChange: (next: Workshop2DossierPhase1) => void;
  onScrollToHandoffChecklist: () => void;
  onPersistHandoffMirror: () => Promise<void>;
};

/**
 * Wave 24: ЭДО CTA на «Задание» — mock «Подписать (демо)»; kontur/sbis «Отправить в ЭДО» + poll.
 */
export function Workshop2RuEdoHandoffSequentialCta({
  collectionId,
  articleId,
  dossier,
  onDossierChange,
  onScrollToHandoffChecklist,
  onPersistHandoffMirror,
}: Props) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const edo = dossier.edoSignoffMirror;
  const edoSigned = edo?.edoStatus === 'signed';

  const cta = useMemo(() => resolveWorkshop2EdoAssignmentCta(), []);

  const pollEdoStatus = async (requestId: string | null | undefined) => {
    const q = requestId ? `?requestId=${encodeURIComponent(requestId)}` : '';
    const res = await fetch(
      `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/signoff/edo-status${q}`,
      { headers: buildWorkshop2ApiRequestHeaders() }
    );
    const json = (await res.json()) as {
      ok?: boolean;
      mirror?: Workshop2EdoSignoffMirror;
      messageRu?: string;
      error?: string;
    };
    if (json.mirror) {
      onDossierChange({ ...dossier, edoSignoffMirror: json.mirror });
    }
    return json;
  };

  const runSequence = async () => {
    if (cta.mode === 'disabled') {
      toast({
        title: 'ЭДО недоступен',
        description: cta.hintRu,
        variant: 'destructive',
      });
      return;
    }

    setBusy(true);
    try {
      if (!edoSigned) {
        const res = await fetch(
          `/api/workshop2/articles/${encodeURIComponent(collectionId)}/${encodeURIComponent(articleId)}/signoff/edo-request`,
          { method: 'POST', headers: buildWorkshop2ApiRequestHeaders() }
        );
        const json = (await res.json()) as {
          ok?: boolean;
          mirror?: Workshop2EdoSignoffMirror;
          messageRu?: string;
          error?: string;
        };

        let mirror = json.mirror;
        if (mirror) {
          onDossierChange({ ...dossier, edoSignoffMirror: mirror });
        }

        if (cta.pollAfterSend && mirror?.requestId && mirror.edoStatus === 'pending') {
          const polled = await pollEdoStatus(mirror.requestId);
          mirror = polled.mirror ?? mirror;
        }

        if (!res.ok || !json.ok) {
          toast({
            title: 'ЭДО не подписано',
            description:
              json.messageRu ??
              polledErrorRu(json.error) ??
              'Проверьте WORKSHOP2_EDO_PROVIDER и URL провайдера.',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: cta.mode === 'mock_demo' ? 'ЭП Gold Sample (демо)' : 'Запрос в ЭДО',
          description:
            json.messageRu ??
            `Статус: ${workshop2EdoStatusLabelRu(mirror?.edoStatus ?? 'pending')}`,
        });
      }

      onScrollToHandoffChecklist();
      await onPersistHandoffMirror();
      toast({
        title: 'Передача',
        description: 'Чеклист передачи обновлён — проверьте gate и отправку в цех.',
      });
    } catch {
      toast({
        title: 'Ошибка последовательности',
        description: 'Сеть или API недоступны.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const handlePollOnly = async () => {
    if (!edo?.requestId) return;
    setBusy(true);
    try {
      const json = await pollEdoStatus(edo.requestId);
      toast({
        title: 'Статус ЭДО',
        description:
          json.messageRu ??
          `Статус: ${workshop2EdoStatusLabelRu(json.mirror?.edoStatus ?? edo.edoStatus)}`,
        variant: json.ok ? 'default' : 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="space-y-2 rounded-lg border border-violet-200 bg-violet-50/60 px-3 py-2"
      data-testid="workshop2-ru-edo-handoff-sequential-cta"
    >
      <p className="text-[11px] text-violet-950">
        РФ · {cta.providerLabelRu}: {cta.hintRu}
      </p>
      <p className="text-[10px] text-violet-800" data-testid="workshop2-edo-status-label">
        ЭДО: {edo ? workshop2EdoStatusLabelRu(edo.edoStatus) : 'не запрошено'}
      </p>
      {cta.cabinetUrl ? (
        <p className="text-[10px]">
          <a
            href={cta.cabinetUrl}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-600 underline"
          >
            Тестовый кабинет {cta.providerLabelRu}
          </a>
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="h-8 gap-1.5 text-[11px]"
          disabled={busy || cta.mode === 'disabled'}
          onClick={() => void runSequence()}
          data-testid="workshop2-edo-primary-cta"
        >
          <FileSignature className="h-3.5 w-3.5" />
          <Factory className="h-3.5 w-3.5" />
          {busy ? 'Выполняется…' : cta.primaryLabelRu}
        </Button>
        {cta.pollAfterSend && edo?.requestId && edo.edoStatus === 'pending' ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-[11px]"
            disabled={busy}
            onClick={() => void handlePollOnly()}
            data-testid="workshop2-edo-poll-cta"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Обновить статус
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function polledErrorRu(code?: string): string | undefined {
  if (!code) return undefined;
  if (code.startsWith('edo_http_')) return `Ошибка API ЭДО (${code.replace('edo_http_', 'HTTP ')})`;
  if (code === 'kontur_diadoc_unreachable') return 'Контур Diadoc недоступен (fail-closed).';
  return undefined;
}
