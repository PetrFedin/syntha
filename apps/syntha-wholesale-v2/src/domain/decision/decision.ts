export type DecisionSeverity = "info" | "low" | "medium" | "high" | "critical";

export type DecisionActionType =
  | "none"
  | "review"
  | "stop_replenishment"
  | "create_replenishment"
  | "create_purchase_order"
  | "defer_purchase"
  | "split_order"
  | "select_supplier"
  | "supplier_review"
  | "budget_review"
  | "transfer_stock"
  | "markdown_review"
  | "promote"
  | "liquidate";

export interface DecisionReason {
  code: string;
  message: string;
  metric?: string;
  actual?: number;
  threshold?: number;
  unit?: string;
}

export interface DecisionImpact {
  metric: string;
  value: number;
  unit: string;
  direction: "increase" | "decrease" | "neutral";
}

export interface RecommendedAction {
  type: DecisionActionType;
  priority: DecisionSeverity;
  title: string;
  description: string;
  quantity?: number;
  dueAt?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface CommercialDecision {
  id: string;
  entityType: "sku" | "product" | "warehouse" | "supplier" | "order";
  entityId: string;
  decisionType: string;
  severity: DecisionSeverity;
  confidence: number;
  reasons: DecisionReason[];
  impacts: DecisionImpact[];
  actions: RecommendedAction[];
  createdAt: string;
  source: string;
  version: number;
}

export function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
