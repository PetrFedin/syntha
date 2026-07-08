import { LEGACY_ROUTES } from '@/lib/platform-core-legacy-routes';
import Link from 'next/link';
import { Twitter, Instagram, Facebook } from 'lucide-react';
import Logo from '@/components/logo';
import { ROUTES } from '@/lib/routes';

const footerLinks = {
  Платформа: [
    { href: ROUTES.home, label: 'Главная' },
    { href: ROUTES.catalog, label: 'Каталог брендов' },
    { href: ROUTES.brand.home, label: 'Кабинет бренда' },
    { href: ROUTES.brand.controlCenter, label: 'Центр управления' },
    { href: ROUTES.shop.home, label: 'Кабинет магазина' },
    { href: LEGACY_ROUTES.shop.b2bDiscover, label: 'B2B закупки (Discover)' },
    { href: ROUTES.storeLocator, label: 'Карта магазинов' },
    { href: ROUTES.academyPlatform, label: 'Академия' },
  ],
  Компания: [
    { href: '/about', label: 'О нас' },
    { href: '/careers', label: 'Карьера' },
    { href: '/press', label: 'Пресса' },
    { href: '/blog', label: 'Блог' },
  ],
  Помощь: [
    { href: '/contact', label: 'Контакты' },
    { href: '/faq', label: 'FAQ' },
    { href: '/shipping', label: 'Доставка' },
  ],
  Сообщество: [
    { href: '/community', label: 'Образы' },
    { href: '/metaverse', label: 'Метавселенная' },
    { href: '/loyalty', label: 'Программа лояльности' },
  ],
  'Правовая информация': [
    { href: '/terms', label: 'Условия использования' },
    { href: '/privacy', label: 'Политика конфиденциальности' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <Logo className="mb-4 h-7 w-auto" />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Интеллект стиля. Экологично, стильно и создано для вас.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Syntha, Inc. Все права защищены.
          </p>
          <div className="mt-4 flex items-center space-x-4 sm:mt-0">
            <Link
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Twitter className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Facebook className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
