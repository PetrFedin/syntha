import { NextResponse } from 'next/server';
import { analyzeDfm } from '@/ai/flows/analyze-dfm-flow';
import { z } from 'zod';
import { getUnknownErrorMessage } from '@/lib/unknown-error-message';
import { isWorkshop2AiConfigured } from '@/lib/server/workshop2-genkit-health';

const RequestSchema = z.object({
  articleDescription: z.string(),
  photoUrl: z.string().optional(),
});

export async function POST(request: Request) {
  if (!isWorkshop2AiConfigured()) {
    return NextResponse.json({ error: 'Workshop2 AI (Genkit) is not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const result = await analyzeDfm({
      articleDescription: parsed.data.articleDescription,
      photoUrl: parsed.data.photoUrl,
      userId: 'system',
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('DFM check error:', error);
    return NextResponse.json(
      { error: getUnknownErrorMessage(error, 'Failed to run DFM check') },
      { status: 500 }
    );
  }
}
