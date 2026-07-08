import type { ReactNode } from 'react';

/**
 * Сегмент `/client/me/*` уже обёрнут родительским `app/client/layout.tsx` (`ClientCabinetShell`).
 * Здесь только пропуск `children` — без второго слоя хаба.
 */
export default function ClientMeSegmentLayout({ children }: { children: ReactNode }) {
  return children;
}
