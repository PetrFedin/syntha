import { NextResponse } from 'next/server';
import { isPlatformCoreMode } from '@/lib/cabinet-core-mode';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (isPlatformCoreMode()) {
    return NextResponse.json(
      { ok: false as const, error: 'archived_client_b2c', zone: 'client-b2c' },
      { status: 410 }
    );
  }
  const mod = await import(
    '../../../../../_archive/client-b2c/src/app/api/client/sewing-pattern-preview/route'
  );
  return mod.POST(request);
}
