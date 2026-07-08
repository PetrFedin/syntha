import { NextResponse } from 'next/server';
import { calculateReplenishment, type ReplenishmentBomLine } from '@/lib/b2b/replenishment-service';

type SuggestRequestBody = {
  bomLines?: unknown;
  plannedQuantity?: unknown;
};

function isReplenishmentBomLine(line: unknown): line is ReplenishmentBomLine {
  if (!line || typeof line !== 'object') return false;
  const o = line as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.label === 'string';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SuggestRequestBody;
    const { bomLines, plannedQuantity } = body;

    if (!bomLines || !Array.isArray(bomLines)) {
      return NextResponse.json({ error: 'bomLines array is required' }, { status: 400 });
    }

    const qty = typeof plannedQuantity === 'number' && plannedQuantity > 0 ? plannedQuantity : 100;

    const validatedLines = bomLines
      .filter(isReplenishmentBomLine)
      .filter(
        (line) =>
          (line.qty === undefined || line.qty >= 0) &&
          (line.costPerUnit === undefined || line.costPerUnit >= 0)
      );

    const suggestions = calculateReplenishment(validatedLines, qty);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ error: 'Failed to calculate replenishment' }, { status: 500 });
  }
}
