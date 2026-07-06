import 'server-only';

import { getWorkshop2B2bOrder } from '@/lib/platform-core-ports/b2b-orders';
import {
  getWorkshop2ServerDossierRecord,
  getWorkshop2ServerDossierStoreMode,
} from '@/lib/platform-core-ports/dossier-store';

export type PlatformCoreCapacityGatewaySource =
  | 'workshop2_b2b_order'
  | 'workshop2_dossier_mirror';

export type PlatformCoreAdapterIssue = {
  id: string;
  severity: 'blocker' | 'warning';
  message: string;
};

export type PlatformCoreCapacityRoutingStep = {
  id: string;
  stepNo: number;
  name: string;
  category?: string;
  equipment?: string;
  sashMin?: number;
  source: string;
};

export type PlatformCoreCapacityMirrorSnapshot = {
  factoryId?: string;
  lineId?: string;
  startDate?: string;
  availableQty?: number;
  availableMinutes?: number;
  bookedMinutes?: number;
  status?: string;
  hintRu?: string;
  updatedAt?: string;
};

export type PlatformCoreCapacitySnapshot = {
  orderId: string;
  collectionId?: string;
  articleId?: string;
  factoryId?: string;
  lineId?: string;
  version?: number;
  updatedAt: string;
  source: PlatformCoreCapacityGatewaySource;
  requiredQty: number;
  availableQty?: number;
  availableMinutes?: number;
  bookedMinutes?: number;
  requiredMinutes?: number;
  routingMinutesPerUnit?: number;
  startDate?: string;
  requestedDeliveryDate?: string;
  orderLineCount: number;
  coveredLineCount: number;
  uncoveredLineCount: number;
  routingSteps: PlatformCoreCapacityRoutingStep[];
  mirror?: PlatformCoreCapacityMirrorSnapshot;
  capacitySource: 'minutes' | 'quantity' | 'missing';
  utilizationPct: number;
  canReserve: boolean;
  remainingMinutes?: number;
};

export type PlatformCoreCapacityEvaluation = {
  status: 'core_ready' | 'warning' | 'blocked';
  eventCreated: string;
  nextOwnerLabel: string;
  issues: PlatformCoreAdapterIssue[];
  productionStartBlocked: boolean;
  completenessPct: number;
};

export type PlatformCoreCapacityOrderResult =
  | {
      ok: true;
      orderId: string;
      collectionId?: string;
      articleId?: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
      version?: number;
      updatedAt: string;
      capacity: PlatformCoreCapacitySnapshot;
      evaluation: PlatformCoreCapacityEvaluation;
    }
  | {
      ok: false;
      reason: 'invalid_path' | 'not_found';
      orderId?: string;
      storeMode: ReturnType<typeof getWorkshop2ServerDossierStoreMode>;
    };

type OrderLine = { articleId?: string; collectionId?: string; qty?: number; deliveryDate?: string };
type OrderShape = {
  id: string;
  collectionId?: string;
  articleId?: string;
  requestedDeliveryDate?: string;
  lines: readonly OrderLine[];
  updatedAt: string;
};

type DossierCapacityShape = {
  factoryId?: string;
  sewingPlan?: { partnerId?: string; operationsNote?: string };
  routingSteps?: readonly {
    id?: string;
    stepNo?: number;
    name?: string;
    category?: string;
    equipment?: string;
    sashMin?: number;
    sash?: number;
    source?: string;
  }[];
  smartRoutingSequence?: readonly {
    id?: string;
    name?: string;
    category?: string;
    equipment?: string;
    sash?: number;
  }[];
  productionModel?: {
    operations?: readonly {
      id?: string;
      name?: string;
      operationType?: string;
      machineType?: string;
      sash?: number;
    }[];
  };
  taMilestones?: readonly { title?: string; targetDate?: string }[];
  capacityPlanningMirror?: MirrorRaw;
  factoryCapacityMirror?: MirrorRaw;
  productionCapacityMirror?: MirrorRaw;
};

type MirrorRaw = PlatformCoreCapacityMirrorSnapshot & {
  availableCapacityMinutes?: number;
  freeMinutes?: number;
  reservedMinutes?: number;
  availableSlotsQty?: number;
  capacityQty?: number;
};

function cleanString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t || undefined;
}

function firstFiniteNumber(...values: unknown[]): number | undefined {
  for (const v of values) {
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function positiveNumber(...values: unknown[]): number | undefined {
  for (const v of values) {
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}

function adapterStatus(issues: PlatformCoreAdapterIssue[]): PlatformCoreCapacityEvaluation['status'] {
  if (issues.some((i) => i.severity === 'blocker')) return 'blocked';
  if (issues.some((i) => i.severity === 'warning')) return 'warning';
  return 'core_ready';
}

function firstLineArticle(order: OrderShape): { collectionId?: string; articleId?: string } {
  const line = order.lines.find((item) => item.articleId || item.collectionId);
  return {
    collectionId: cleanString(order.collectionId) ?? cleanString(line?.collectionId),
    articleId: cleanString(order.articleId) ?? cleanString(line?.articleId),
  };
}

function lineMatchesEntity(line: OrderLine, entity: { collectionId?: string; articleId?: string }): boolean {
  if (entity.articleId && cleanString(line.articleId) && line.articleId !== entity.articleId) return false;
  if (entity.collectionId && cleanString(line.collectionId) && line.collectionId !== entity.collectionId) {
    return false;
  }
  return Boolean(entity.articleId || entity.collectionId);
}

function orderLinesForEntity(order: OrderShape, entity: { collectionId?: string; articleId?: string }) {
  const scoped = order.lines.filter((line) => lineMatchesEntity(line, entity));
  return scoped.length ? scoped : order.lines;
}

function sumQty(lines: readonly OrderLine[]): number {
  return lines.reduce((sum, line) => sum + (positiveNumber(line.qty) ?? 0), 0);
}

function routeStepsFromDossier(dossier?: DossierCapacityShape): PlatformCoreCapacityRoutingStep[] {
  if (!dossier) return [];
  if (dossier.routingSteps?.length) {
    return dossier.routingSteps.map((step, index) => ({
      id: cleanString(step.id) ?? `routing-${index + 1}`,
      stepNo: step.stepNo ?? index + 1,
      name: cleanString(step.name) ?? `Операция ${index + 1}`,
      category: cleanString(step.category),
      equipment: cleanString(step.equipment),
      sashMin: firstFiniteNumber(step.sashMin, step.sash),
      source: cleanString(step.source) ?? 'routing_steps',
    }));
  }
  if (dossier.smartRoutingSequence?.length) {
    return dossier.smartRoutingSequence.map((step, index) => ({
      id: cleanString(step.id) ?? `smart-routing-${index + 1}`,
      stepNo: index + 1,
      name: cleanString(step.name) ?? `Операция ${index + 1}`,
      category: cleanString(step.category),
      equipment: cleanString(step.equipment),
      sashMin: firstFiniteNumber(step.sash),
      source: 'smart_routing',
    }));
  }
  if (dossier.productionModel?.operations?.length) {
    return dossier.productionModel.operations.map((op, index) => ({
      id: cleanString(op.id) ?? `operation-${index + 1}`,
      stepNo: index + 1,
      name: cleanString(op.name) ?? cleanString(op.operationType) ?? `Операция ${index + 1}`,
      category: cleanString(op.operationType),
      equipment: cleanString(op.machineType),
      sashMin: firstFiniteNumber(op.sash),
      source: 'production_model',
    }));
  }
  if (cleanString(dossier.sewingPlan?.operationsNote)) {
    return [
      {
        id: 'sewing-plan-note',
        stepNo: 1,
        name: dossier.sewingPlan!.operationsNote!,
        source: 'sewing_plan',
      },
    ];
  }
  return [];
}

function capacityMirror(dossier?: DossierCapacityShape): PlatformCoreCapacityMirrorSnapshot | undefined {
  const raw =
    dossier?.capacityPlanningMirror ??
    dossier?.factoryCapacityMirror ??
    dossier?.productionCapacityMirror;
  if (!raw) return undefined;
  return {
    factoryId: cleanString(raw.factoryId),
    lineId: cleanString(raw.lineId),
    startDate: cleanString(raw.startDate),
    availableQty: firstFiniteNumber(raw.availableQty, raw.availableSlotsQty, raw.capacityQty),
    availableMinutes: firstFiniteNumber(raw.availableMinutes, raw.availableCapacityMinutes, raw.freeMinutes),
    bookedMinutes: firstFiniteNumber(raw.bookedMinutes, raw.reservedMinutes),
    status: cleanString(raw.status),
    hintRu: cleanString(raw.hintRu),
    updatedAt: cleanString(raw.updatedAt),
  };
}

function startDateFromMilestones(milestones: DossierCapacityShape['taMilestones']): string | undefined {
  const candidates = (milestones ?? []).filter((m) => {
    const title = cleanString(m.title)?.toLowerCase() ?? '';
    return (
      Boolean(cleanString(m.targetDate)) &&
      (title.includes('старт') || title.includes('запуск') || title.includes('производ') || title.includes('пошив'))
    );
  });
  return cleanString(candidates[0]?.targetDate);
}

function routingMinutesPerUnit(steps: readonly PlatformCoreCapacityRoutingStep[]): number | undefined {
  const total = steps.reduce((sum, step) => sum + (positiveNumber(step.sashMin) ?? 0), 0);
  return total > 0 ? Math.round(total * 100) / 100 : undefined;
}

function resolveRequiredMinutes(requiredQty: number, perUnit?: number): number | undefined {
  if (perUnit === undefined || requiredQty <= 0) return undefined;
  return Math.round(perUnit * requiredQty * 100) / 100;
}

function resolveUtilizationPct(input: {
  requiredQty: number;
  availableQty?: number;
  requiredMinutes?: number;
  availableMinutes?: number;
  bookedMinutes?: number;
}): number {
  if (input.requiredMinutes !== undefined && input.availableMinutes !== undefined) {
    const totalMinutes =
      input.bookedMinutes !== undefined && input.bookedMinutes > 0
        ? input.bookedMinutes + input.availableMinutes
        : input.availableMinutes;
    if (totalMinutes <= 0) return 0;
    const projectedBooked = (input.bookedMinutes ?? 0) + input.requiredMinutes;
    return Math.round(Math.max(0, (projectedBooked / totalMinutes) * 100));
  }
  if (input.availableQty !== undefined && input.availableQty > 0) {
    return Math.round(Math.max(0, (input.requiredQty / input.availableQty) * 100));
  }
  return 0;
}

function buildSnapshot(input: {
  order: OrderShape;
  collectionId?: string;
  articleId?: string;
  version?: number;
  updatedAt?: string;
  dossier?: DossierCapacityShape;
  factoryId?: string;
  startDate?: string;
}): PlatformCoreCapacitySnapshot {
  const entity = {
    collectionId: cleanString(input.collectionId) ?? cleanString(input.order.collectionId),
    articleId: cleanString(input.articleId) ?? cleanString(input.order.articleId),
  };
  const coveredLines = orderLinesForEntity(input.order, entity);
  const mirror = capacityMirror(input.dossier);
  const routingSteps = routeStepsFromDossier(input.dossier);
  const perUnit = routingMinutesPerUnit(routingSteps);
  const requiredQty = sumQty(coveredLines);
  const availableQty = firstFiniteNumber(mirror?.availableQty);
  const availableMinutes = firstFiniteNumber(mirror?.availableMinutes);
  const bookedMinutes = firstFiniteNumber(mirror?.bookedMinutes);
  const requiredMinutes = resolveRequiredMinutes(requiredQty, perUnit);
  const factoryId =
    cleanString(input.factoryId) ??
    cleanString(mirror?.factoryId) ??
    cleanString(input.dossier?.factoryId) ??
    cleanString(input.dossier?.sewingPlan?.partnerId);
  const startDate =
    cleanString(input.startDate) ??
    cleanString(mirror?.startDate) ??
    startDateFromMilestones(input.dossier?.taMilestones);
  const hasMinuteCapacity = availableMinutes !== undefined;
  const hasQuantityCapacity = availableQty !== undefined;
  const capacitySource = hasMinuteCapacity ? 'minutes' : hasQuantityCapacity ? 'quantity' : 'missing';

  return {
    orderId: input.order.id,
    collectionId: entity.collectionId,
    articleId: entity.articleId,
    factoryId,
    lineId: cleanString(mirror?.lineId),
    version: input.version,
    updatedAt: input.updatedAt ?? input.order.updatedAt,
    source: input.dossier ? 'workshop2_dossier_mirror' : 'workshop2_b2b_order',
    requiredQty,
    availableQty,
    availableMinutes,
    bookedMinutes,
    requiredMinutes,
    routingMinutesPerUnit: perUnit,
    startDate,
    requestedDeliveryDate:
      cleanString(input.order.requestedDeliveryDate) ??
      cleanString(coveredLines.find((line) => line.deliveryDate)?.deliveryDate),
    orderLineCount: input.order.lines.length,
    coveredLineCount: coveredLines.length,
    uncoveredLineCount: Math.max(0, input.order.lines.length - coveredLines.length),
    routingSteps,
    mirror,
    capacitySource,
    utilizationPct: resolveUtilizationPct({
      requiredQty,
      availableQty,
      requiredMinutes,
      availableMinutes,
      bookedMinutes,
    }),
    canReserve: false,
    remainingMinutes:
      availableMinutes !== undefined && requiredMinutes !== undefined
        ? Math.round((availableMinutes - requiredMinutes) * 100) / 100
        : undefined,
  };
}

function evaluateCapacity(snapshot: PlatformCoreCapacitySnapshot): PlatformCoreCapacityEvaluation {
  const issues: PlatformCoreAdapterIssue[] = [];

  if (!snapshot.factoryId) {
    issues.push({
      id: 'capacity.factory.missing',
      severity: 'blocker',
      message: 'Производство/линия не выбраны: нельзя честно резервировать мощность.',
    });
  }
  if (snapshot.requiredQty <= 0) {
    issues.push({
      id: 'capacity.qty.invalid',
      severity: 'blocker',
      message: 'Количество заказа не задано.',
    });
  }
  if (snapshot.capacitySource === 'missing') {
    issues.push({
      id: 'capacity.source.missing',
      severity: 'blocker',
      message: 'Нет доступной мощности линии: нужен календарь производства или остаток минут.',
    });
  }
  if (
    snapshot.availableMinutes !== undefined &&
    snapshot.requiredMinutes !== undefined &&
    snapshot.availableMinutes < snapshot.requiredMinutes
  ) {
    issues.push({
      id: 'capacity.minutes.overbooked',
      severity: 'blocker',
      message: 'Доступных минут линии не хватает под заказ.',
    });
  } else if (
    snapshot.availableQty !== undefined &&
    snapshot.availableQty < snapshot.requiredQty
  ) {
    issues.push({
      id: 'capacity.qty.overbooked',
      severity: 'blocker',
      message: 'Доступного количественного слота не хватает под заказ.',
    });
  }
  if (snapshot.routingMinutesPerUnit === undefined) {
    issues.push({
      id: 'capacity.routing_minutes.missing',
      severity: 'warning',
      message: 'Маршрутные минуты не заданы: capacity без реальной трудоёмкости.',
    });
  }
  if (!snapshot.startDate) {
    issues.push({
      id: 'capacity.start_date.missing',
      severity: 'warning',
      message: 'Дата старта не задана.',
    });
  }
  if (snapshot.uncoveredLineCount > 0) {
    issues.push({
      id: 'capacity.order.multiple_articles',
      severity: 'warning',
      message: 'Заказ содержит строки вне текущего артикула: нужен per-article capacity split.',
    });
  }
  if (snapshot.mirror?.status === 'blocked') {
    issues.push({
      id: 'capacity.mirror.blocked',
      severity: 'blocker',
      message: snapshot.mirror.hintRu ?? 'Capacity mirror заблокировал старт производства.',
    });
  }
  if (!snapshot.routingSteps.length) {
    issues.push({
      id: 'capacity.routing.empty',
      severity: 'warning',
      message: 'Нет техпроцесса: заполните routingSteps или операции карты.',
    });
  }

  const canReserve = !issues.some((i) => i.severity === 'blocker');
  snapshot.canReserve = canReserve;

  const checks = [
    Boolean(snapshot.factoryId),
    snapshot.requiredQty > 0,
    snapshot.routingMinutesPerUnit !== undefined,
    snapshot.availableMinutes !== undefined || snapshot.availableQty !== undefined,
    Boolean(snapshot.startDate),
    snapshot.uncoveredLineCount === 0,
  ];
  const completenessPct = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    status: adapterStatus(issues),
    eventCreated: 'production.capacity_reserved',
    nextOwnerLabel: 'Производство',
    issues,
    productionStartBlocked: !canReserve,
    completenessPct,
  };
}

export async function getPlatformCoreCapacityForOrder(input: {
  orderId: string;
  factoryId?: string;
  startDate?: string;
}): Promise<PlatformCoreCapacityOrderResult> {
  const orderId = input.orderId?.trim();
  const storeMode = getWorkshop2ServerDossierStoreMode();

  if (!orderId) {
    return { ok: false, reason: 'invalid_path', orderId, storeMode };
  }

  const order = (await getWorkshop2B2bOrder(orderId)) as OrderShape | null;
  if (!order) {
    return { ok: false, reason: 'not_found', orderId, storeMode };
  }

  const entity = firstLineArticle(order);
  const record =
    entity.collectionId && entity.articleId
      ? await getWorkshop2ServerDossierRecord(entity.collectionId, entity.articleId)
      : null;

  const capacity = buildSnapshot({
    order,
    collectionId: entity.collectionId,
    articleId: entity.articleId,
    version: record?.version,
    updatedAt: record?.updatedAt,
    dossier: record?.dossier as DossierCapacityShape | undefined,
    factoryId: input.factoryId,
    startDate: input.startDate,
  });

  return {
    ok: true,
    orderId,
    collectionId: entity.collectionId,
    articleId: entity.articleId,
    storeMode,
    version: record?.version,
    updatedAt: record?.updatedAt ?? order.updatedAt,
    capacity,
    evaluation: evaluateCapacity(capacity),
  };
}
