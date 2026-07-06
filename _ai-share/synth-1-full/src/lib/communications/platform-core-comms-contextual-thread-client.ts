import { buildWorkshop2ApiRequestHeaders } from '@/lib/production/workshop2-api-client-headers';

export async function postPlatformCoreCommsContextualThread(input: {
  orderId?: string;
  collectionId?: string;
  articleId?: string;
  pillarId?: string;
  sectionId?: string;
  initialMessage?: string;
}): Promise<{ ok: boolean; chatId?: string; messageRu?: string }> {
  const res = await fetch('/api/platform-core/comms/contextual-thread', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildWorkshop2ApiRequestHeaders(),
    },
    body: JSON.stringify({ ...input, source: 'api' }),
  });
  if (!res.ok) {
    return { ok: false, messageRu: 'Не удалось открыть contextual thread.' };
  }
  const json = (await res.json()) as { ok?: boolean; chatId?: string };
  return { ok: json.ok === true, chatId: json.chatId };
}
