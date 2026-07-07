import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

/** Сегменты без своей папки на первом уровне — ведём в кабинет `/client/me`. */
const CABINET_ALIASES: Record<string, string> = {
  collections: ROUTES.client.profileCollections,
  payments: ROUTES.client.profilePayments,
  offers: ROUTES.client.profileOffersRenewal,
};

type Props = { params: Promise<{ clientId: string }> };

/**
 * Профиль клиента по идентификатору в URL: `/client/{id}`.
 * Личный кабинет текущего пользователя: `/client/me`.
 */
export default async function ClientPublicProfilePage({ params }: Props) {
  const { clientId } = await params;
  const decoded = decodeURIComponent(clientId).trim();
  if (!decoded) {
    redirect(ROUTES.client.profile);
  }

  const alias = CABINET_ALIASES[decoded.toLowerCase()];
  if (alias) {
    redirect(alias);
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col gap-6 px-4 py-12">
      <div>
        <p className="text-sm text-muted-foreground">Клиент</p>
        <h1 className="text-2xl font-semibold tracking-tight">{decoded}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Демо-страница профиля по адресу в URL. Личный кабинет —{' '}
          <Link
            href={ROUTES.client.profile}
            className="text-accent-primary underline-offset-4 hover:underline"
          >
            /client/me
          </Link>
          .
        </p>
      </div>
      <Button variant="outline" size="sm" className="w-fit" asChild>
        <Link href="/">На главную</Link>
      </Button>
    </div>
  );
}
