'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import { useAuth } from '@/providers/auth-provider';
import { organizations } from '@/components/team/_fixtures/team-data';
import { useUIStateOptional } from '@/providers/ui-state';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/routes';
import { getCoreRoleLandingHref } from '@/lib/cabinet-core-mode';
import { getUnknownErrorMessage } from '@/lib/unknown-error-message';
import { SYNTH_MOCK_KNOWN_PASSWORD } from '@/lib/auth/dev-auth-bootstrap';

export function useIdentitySwitch() {
  const { signIn, updateProfile } = useAuth();
  const ui = useUIStateOptional();
  const setViewRole = ui?.setViewRole ?? (() => {});
  const setIsFlowMapOpen = ui?.setIsFlowMapOpen ?? (() => {});
  const setIsCalendarOpen = ui?.setIsCalendarOpen ?? (() => {});
  const setIsMediaRadarOpen = ui?.setIsMediaRadarOpen ?? (() => {});
  const setIsConstellationOpen = ui?.setIsConstellationOpen ?? (() => {});
  const { toast } = useToast();
  const handleIdentitySwitch = async (email: string, roleKey: string, organizationId?: string) => {
    try {
      /** Снять полноэкранные оверлеи главной — иначе панель ролей могла остаться «мёртвой». */
      setIsFlowMapOpen(null);
      setIsCalendarOpen(false);
      setIsMediaRadarOpen(false);
      setIsConstellationOpen(false);

      console.log('--- GLOBAL IDENTITY SWITCH START ---');
      console.log('Switching to:', { email, roleKey, organizationId });

      toast({
        title: 'Переключение роли...',
        description: `Вход как ${email}`,
      });

      if (!email) {
        throw new Error('Email пользователя не указан');
      }

      // 1. Sign in
      let newProfile;
      try {
        console.log('Attempting sign in for:', email);
        newProfile = await signIn(email, SYNTH_MOCK_KNOWN_PASSWORD);
        if (!newProfile) throw new Error('SignIn returned empty profile');
        console.log('Sign in SUCCESS:', newProfile.displayName, newProfile.uid);
      } catch (signInErr: unknown) {
        console.error('Sign in FAILED:', signInErr);
        throw new Error(
          `Ошибка входа для ${email}: ${getUnknownErrorMessage(signInErr, 'Неверный пароль или пользователь не найден')}`
        );
      }

      // 2. Organization context - only if explicitly provided and different
      if (organizationId && newProfile.activeOrganizationId !== organizationId) {
        const org = organizations[organizationId];
        if (org) {
          console.log('Updating organization to:', org.name);
          try {
            newProfile = await updateProfile({
              activeOrganizationId: organizationId,
              partnerName: org.name,
            });
          } catch (updateErr: unknown) {
            console.warn('Update profile failed, continuing with base profile:', updateErr);
          }
        } else {
          console.warn(`Организация ${organizationId} не найдена в базе.`);
        }
      }

      // 3. Update view mode (B2B vs B2C)
      const b2bRoles = ['admin', 'brand', 'shop', 'manufacturer', 'supplier', 'distributor'];
      const isB2B = b2bRoles.includes(roleKey);
      console.log('Setting view role to:', isB2B ? 'b2b' : 'client');
      setViewRole(isB2B ? 'b2b' : 'client');

      // 4. Куда вести после входа — строго по выбранной на панели роли (`roleKey`).
      // Нельзя подменять типом организации из профиля: после бренда/шопа в `activeOrganizationId`
      // остаётся B2B-орг, `organizations[id].type` станет `brand` и клиент улетит не в `/client/me`.
      const roleMap: Record<string, string> = {
        admin: ROUTES.admin.home,
        /** Каноничный экран профиля бренда + query, чтобы сразу открылась вкладка «Профиль → Бренд». */
        brand: `${ROUTES.brand.profile}?group=profile&tab=brand`,
        shop: ROUTES.shop.home,
        manufacturer: EXTENDED_ROUTES.factory.production,
        supplier: EXTENDED_ROUTES.factory.supplier,
        distributor: ROUTES.distributor.home,
        client: ROUTES.client.profile,
      };

      const targetUrl =
        getCoreRoleLandingHref(roleKey) ?? roleMap[roleKey] ?? ROUTES.client.profile;

      console.log('Identity switch SUCCESS. Final target:', targetUrl, '(roleKey:', roleKey, ')');

      toast({
        title: 'Личность изменена',
        description: `Вы вошли как ${newProfile.displayName}`,
      });

      /**
       * Полная перезагрузка по целевому URL — надёжно для демо-панели ролей: клиентский `router.push`
       * иногда не срабатывает из-за кэша маршрута / порядка эффектов RouteGuard после смены сессии.
       */
      if (typeof window !== 'undefined') {
        window.location.assign(targetUrl);
      }
    } catch (err: unknown) {
      console.error('Identity switch CRITICAL ERROR:', err);
      toast({
        title: 'Ошибка переключения',
        description: getUnknownErrorMessage(err, 'Неизвестная ошибка'),
        variant: 'destructive',
      });
    }
  };

  return { handleIdentitySwitch };
}
