import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { WorkspaceShell } from '@/shared/workspace/workspace-shell';
import { WorkspaceContextProvider } from '@/shared/workspace/workspace-context';
import './globals.css';
import './workspace-pages.css';
import './lifecycle-workspace.css';

export const metadata: Metadata = {
  title: {
    default: 'Syntha Wholesale',
    template: '%s · Syntha Wholesale',
  },
  description: 'Единая B2B-среда для коллекций, выборов, заказов и взаимодействия брендов с магазинами.',
  applicationName: 'Syntha Wholesale',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0b0d',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <WorkspaceContextProvider>
          <WorkspaceShell>{children}</WorkspaceShell>
        </WorkspaceContextProvider>
      </body>
    </html>
  );
}
