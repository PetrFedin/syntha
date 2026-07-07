/**
 * Агрегация голосов «посадка» только из localStorage (без API).
 * Ключи: synth.fitFeedback.v1.{productId}, значение: { vote, sku, ts }.
 */

import type { FitFeedbackVote } from '@/components/product/product-fit-feedback-block';

const KEY_PREFIX = 'synth.fitFeedback.v1.';

export type FitVoteCounts = { runs_small: number; true_fit: number; runs_large: number };

export function readFitVoteCountsForSku(sku: string): FitVoteCounts {
  const c: FitVoteCounts = { runs_small: 0, true_fit: 0, runs_large: 0 };
  if (typeof window === 'undefined') return c;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith(KEY_PREFIX)) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const p = JSON.parse(raw) as { sku?: string; vote?: FitFeedbackVote };
      if (p.sku !== sku || !p.vote) continue;
      if (p.vote === 'runs_small') c.runs_small += 1;
      else if (p.vote === 'true_fit') c.true_fit += 1;
      else if (p.vote === 'runs_large') c.runs_large += 1;
    }
  } catch {
    /* noop */
  }
  return c;
}

export function totalFitVotes(c: FitVoteCounts): number {
  return c.runs_small + c.true_fit + c.runs_large;
}
