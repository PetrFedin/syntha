import 'server-only';

import type { NextRequest } from 'next/server';

/** Канонический fallback — не «Current User». */
export const WORKSHOP2_CONTEXTUAL_DEFAULT_SENDER = 'Участник';

export const WORKSHOP2_CONTEXTUAL_SYSTEM_SENDER = 'Система';

export function resolveContextualMessageSenderFromHeaders(
  headers: Headers | { get(name: string): string | null }
): string {
  const fromHeader =
    headers.get('x-w2-actor-label')?.trim() ||
    headers.get('x-w2-actor-name')?.trim() ||
    headers.get('x-w2-updated-by')?.trim() ||
    headers.get('x-synth-actor-name')?.trim() ||
    headers.get('x-user-name')?.trim();
  if (fromHeader) return fromHeader;

  const email = headers.get('x-w2-actor-email')?.trim() || headers.get('x-user-email')?.trim();
  if (email) return email.split('@')[0] ?? email;

  return WORKSHOP2_CONTEXTUAL_DEFAULT_SENDER;
}

export function resolveContextualMessageSenderFromRequest(req: NextRequest): string {
  return resolveContextualMessageSenderFromHeaders(req.headers);
}

export function resolveContextualMessageSender(input?: {
  sender?: string | null;
  headers?: Headers | { get(name: string): string | null };
}): string {
  const explicit = input?.sender?.trim();
  if (explicit) return explicit;
  if (input?.headers) return resolveContextualMessageSenderFromHeaders(input.headers);
  return WORKSHOP2_CONTEXTUAL_DEFAULT_SENDER;
}
