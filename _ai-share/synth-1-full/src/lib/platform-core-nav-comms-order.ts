/** Единый порядок в столпе «Связь»: сообщения → RFQ (supplier) → календарь. */
export function sortCommsNavLinksMessagesFirst<T extends { value: string }>(
  links: readonly T[]
): T[] {
  const messages = links.find((l) => l.value === 'messages');
  const rfqInbox = links.find((l) => l.value === 'rfq-inbox-core');
  const calendar = links.find((l) => l.value === 'calendar');
  const rest = links.filter(
    (l) => l.value !== 'messages' && l.value !== 'rfq-inbox-core' && l.value !== 'calendar'
  );
  return [
    ...(messages ? [messages] : []),
    ...(rfqInbox ? [rfqInbox] : []),
    ...(calendar ? [calendar] : []),
    ...rest,
  ];
}
