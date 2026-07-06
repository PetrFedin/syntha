/** Единое оформление hub-гаджетов Platform Core (кабинет роли, insight cards). */
import { pillarInsight } from '@/lib/platform-core-cabinet-chrome';

export const hubGadget = {
  root: pillarInsight.root,
  goldenPath: pillarInsight.goldenPath,
  goldenSep: pillarInsight.goldenSep,
  goldenLink: pillarInsight.goldenLink,
  card: pillarInsight.card,
  cardBody: pillarInsight.body,
  statRow: pillarInsight.statRow,
  stat: pillarInsight.stat,
  muted: pillarInsight.muted,
  ctaRow: pillarInsight.ctaRow,
  ctaLink: pillarInsight.ctaLink,
  pillarCard: pillarInsight.card,
  pillarBody: pillarInsight.body,
  chip: 'h-5 shrink-0 border-border-subtle px-1.5 text-[11px] font-medium',
  metaBadge: pillarInsight.metaBadge,
} as const;
