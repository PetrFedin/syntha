/**
 * Wave 22 #42: зеркало smart routing в досье + gate handoff-commit.
 */
import type { Workshop2DossierPhase1 } from '@/lib/production/workshop2-dossier-phase1.types';
import type { Workshop2HandoffReadinessCheck } from '@/lib/production/workshop2-handoff-readiness';
import { buildWorkshop2RoutingStepsFromDossier } from '@/lib/production/workshop2-routing-steps';
import { isWorkshop2SmartRoutingDemoAllowed } from '@/lib/production/workshop2-smart-routing-demo';
import { resolveWorkshop2SmartRoutingRulesUrl } from '@/lib/production/workshop2-smart-routing-rules-url';
import { workshop2PgMirrorStr } from '@/lib/production/workshop2-dossier-pg-mirror-utils';

export function buildWorkshop2SmartRoutingMirror(
  dossier: Workshop2DossierPhase1
): NonNullable<Workshop2DossierPhase1['smartRoutingMirror']> {
  const steps = buildWorkshop2RoutingStepsFromDossier(dossier);
  const source = dossier.smartRoutingSequence?.length
    ? 'smart_routing'
    : dossier.routingSteps?.length
      ? 'routing_steps'
      : dossier.productionModel?.operations?.length
        ? 'production_model'
        : 'empty';

  const hasSewingPlan = Boolean(dossier.sewingPlan?.partnerId?.trim());
  const demoTemplateUsed = Boolean(dossier.smartRoutingFromDemo);
  const demoBlockedInProd = demoTemplateUsed && !isWorkshop2SmartRoutingDemoAllowed();
  const engineKind: NonNullable<Workshop2DossierPhase1['smartRoutingMirror']>['engineKind'] =
    demoTemplateUsed
      ? 'demo_template'
      : resolveWorkshop2SmartRoutingRulesUrl() && steps.length > 0
        ? 'rules_url'
        : steps.length === 0
          ? 'empty'
          : source === 'smart_routing' || source === 'routing_steps'
            ? 'manual'
            : 'heuristic';
  const rulesUrlConfigured = Boolean(resolveWorkshop2SmartRoutingRulesUrl());
  const engineTier =
    rulesUrlConfigured && steps.length > 0
      ? ('rules_url' as const)
      : engineKind === 'demo_template'
        ? ('demo_template' as const)
        : engineKind === 'empty'
          ? ('empty' as const)
          : engineKind === 'manual'
            ? ('manual' as const)
            : ('heuristic' as const);
  const blockerHandoff = (hasSewingPlan && steps.length === 0) || demoBlockedInProd;
  const blockerSampleOrder = demoBlockedInProd;

  let hintRu: string | undefined;
  if (demoBlockedInProd) {
    hintRu =
      'Маршрут из DEMO-шаблона в production — соберите шаги вручную или задайте WORKSHOP2_SMART_ROUTING_DEMO=1.';
  } else if (blockerHandoff && hasSewingPlan && steps.length === 0) {
    hintRu = 'Швейный план задан, но routingSteps пуст — заполните умную маршрутизацию.';
  } else if (steps.length === 0) {
    hintRu = 'Маршрутизация не рассчитана — опционально до handoff.';
  }

  return {
    mirroredAt: new Date().toISOString(),
    stepCount: steps.length,
    source,
    engineKind,
    engineTier,
    rulesUrlConfigured,
    totalSashMin: steps.reduce((acc, s) => acc + Number(s.sashMin ?? 0), 0),
    demoTemplateUsed,
    demoBlockedInProd,
    blockerSampleOrder,
    blockerHandoff,
    hintRu,
  };
}

export function evaluateWorkshop2SmartRoutingSampleGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.smartRoutingMirror;
  if (!mirror) return null;
  if (
    mirror.blockerSampleOrder === true ||
    workshop2PgMirrorStr(mirror, 'blockerSampleOrder') === 'true'
  ) {
    return {
      id: 'routing.demo_blocked',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'DEMO-маршрутизация в production — заказ образца заблокирован.',
    };
  }
  return null;
}

export function persistWorkshop2SmartRoutingMirrorToDossier(
  dossier: Workshop2DossierPhase1
): Workshop2DossierPhase1 {
  return {
    ...dossier,
    smartRoutingMirror: buildWorkshop2SmartRoutingMirror(dossier),
  };
}

export function evaluateWorkshop2SmartRoutingHandoffGate(
  dossier: Workshop2DossierPhase1
): Workshop2HandoffReadinessCheck | null {
  const mirror = dossier.smartRoutingMirror;
  if (!mirror) {
    return {
      id: 'routing.mirror_missing',
      severity: 'warning',
      messageRu: 'Снимок маршрутизации не в досье — сохраните «Маршрут → PG» на конструкции.',
    };
  }
  if (mirror.blockerHandoff === true || workshop2PgMirrorStr(mirror, 'blockerHandoff') === 'true') {
    return {
      id: 'routing.steps.empty',
      severity: 'blocker',
      messageRu:
        workshop2PgMirrorStr(mirror, 'hintRu') ||
        'Нет шагов техпроцесса — handoff commit заблокирован.',
    };
  }
  return null;
}
