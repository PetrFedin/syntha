export type ActivityPeriod = '7d' | '30d' | { from: Date; to: Date };

export function formatActivityPeriod(period: ActivityPeriod): string {
  const today = new Date();
  const dd = (d: Date) =>
    d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  if (typeof period === 'object') {
    return `Период ${dd(period.from)}–${dd(period.to)}`;
  }
  const start = new Date(today);
  start.setDate(start.getDate() - (period === '7d' ? 6 : 29));
  return period === '7d' ? `Неделя ${dd(start)}–${dd(today)}` : `Месяц ${dd(start)}–${dd(today)}`;
}

export type RoleReport = 'CEO' | 'CFO' | 'COO' | 'CTO' | 'CMO' | 'CIO' | 'CHRO' | 'CSO' | 'CDO';

export const ROLE_REPORTS: { id: RoleReport; label: string; desc: string }[] = [
  { id: 'CEO', label: 'CEO', desc: 'Генеральный директор' },
  { id: 'CFO', label: 'CFO', desc: 'Финансовый директор' },
  { id: 'COO', label: 'COO', desc: 'Операционный директор' },
  { id: 'CTO', label: 'CTO', desc: 'Технический директор' },
  { id: 'CMO', label: 'CMO', desc: 'Директор по маркетингу' },
  { id: 'CIO', label: 'CIO', desc: 'IT-директор' },
  { id: 'CHRO', label: 'CHRO', desc: 'HR-директор' },
  { id: 'CSO', label: 'CSO', desc: 'Директор по стратегии' },
  { id: 'CDO', label: 'CDO', desc: 'Digital-директор' },
];
