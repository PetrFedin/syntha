import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
