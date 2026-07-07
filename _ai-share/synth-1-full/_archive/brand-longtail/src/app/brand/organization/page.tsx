import { redirect } from 'next/navigation';

/** Обзор организации перенесён в Стратегия → Обзор. Редирект для обратной совместимости. */
export default function OrganizationRedirectPage() {
  redirect('/brand?group=strategy&tab=overview');
}
