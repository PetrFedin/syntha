'use client';

import { ROUTES as EXTENDED_ROUTES } from '@/lib/platform-core-extended-routes';

import { startTransition, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut,
  Settings as SettingsIcon,
  User as UserIcon,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { organizations } from '@/components/team/_fixtures/team-data';
import { ROUTES } from '@/lib/routes';
import { SYNTH_MOCK_KNOWN_PASSWORD } from '@/lib/auth/dev-auth-bootstrap';

export default function UserNav() {
  const { user, profile, loading, signOut, updateProfile, signIn } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  const activeOrg = (profile?.user as any)?.organization_id || user?.activeOrganizationId;
  const partnerName = (profile?.user as any)?.full_name || user?.displayName;

  const isB2B =
    ((profile?.navigation as any[])?.length || 0) > 0 ||
    user?.roles?.some((r) =>
      ['admin', 'brand', 'distributor', 'supplier', 'manufacturer', 'shop'].includes(r)
    ) ||
    user?.email?.endsWith('@syntha.ai');

  const currentRole = ((profile?.user as any)?.role as string) || (user?.roles?.[0] as string);

  /** Главная страница кабинета по роли (не только brand). */
  const hubPathForRole = (role?: string): string => {
    switch (role) {
      case 'admin':
        return ROUTES.admin.home;
      case 'brand':
        return ROUTES.brand.home;
      case 'shop':
        return ROUTES.shop.home;
      case 'distributor':
        return ROUTES.distributor.home;
      case 'manufacturer':
        return EXTENDED_ROUTES.factory.production;
      case 'supplier':
        return EXTENDED_ROUTES.factory.supplier;
      default:
        return ROUTES.client.profileWithTab('profile');
    }
  };

  const settingsPathForRole = (role?: string): string => {
    if (role === 'brand') return ROUTES.brand.settings;
    if (!role || role === 'client') return '/client/me?tab=settings';
    return hubPathForRole(role);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор Syntha HQ';
      case 'brand':
        return 'Бренд';
      case 'shop':
        return 'Магазин';
      case 'distributor':
        return 'Дистрибьютор';
      case 'supplier':
        return 'Поставщик';
      case 'manufacturer':
        return 'Производство';
      default:
        return 'Клиент';
    }
  };

  const handleSwitchOrg = async (orgId: string) => {
    try {
      const org = organizations[orgId];
      await updateProfile({
        activeOrganizationId: orgId,
        partnerName: org?.name,
      });
      toast({
        title: 'Профиль переключен',
        description: `Вы перешли в ${org?.name}`,
      });
    } catch (err) {
      toast({ title: 'Ошибка переключения', variant: 'destructive' });
    }
  };

  const teamLead = user?.team?.[0];
  const teamLeadDisplay = teamLead ? `${teamLead.firstName} ${teamLead.lastName}`.trim() : '';
  const isOwner =
    (isB2B &&
      (user?.team?.[0]?.nickname === user?.nickname ||
        teamLeadDisplay === user?.displayName ||
        (teamLead as { name?: string } | undefined)?.name === user?.displayName)) ||
    (!isB2B && user?.roles?.includes('client'));

  const handleKickMember = async (member: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOwner) return;

    toast({
      title: 'Доступ аннулирован',
      description: `Участник ${`${member.firstName} ${member.lastName}`.trim() || member.nickname} исключен. Пароль сброшен.`,
      variant: 'destructive',
    });
  };

  const handleSwitchTeamMember = async (member: any) => {
    if (!user) return;
    try {
      console.log('Switching to team member:', member.email, member.nickname);

      const isSwitchingUser = member.email && member.email !== user.email;
      let newProfile: any;

      if (isSwitchingUser) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('syntha_profile_avatar');
        }
        newProfile = await signIn(member.email, SYNTH_MOCK_KNOWN_PASSWORD);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('syntha_profile_avatar');
          setProfileAvatar(null);
        }
        newProfile = await updateProfile({
          displayName: `${member.firstName} ${member.lastName}`.trim() || member.nickname,
          photoURL: member.avatar,
          nickname: member.nickname || member.role,
        });
      }

      // Determine where to redirect after switch
      const primaryRole = newProfile.roles?.[0] || 'client';
      const targetUrl =
        primaryRole === 'admin'
          ? ROUTES.admin.home
          : primaryRole === 'brand'
            ? ROUTES.brand.home
            : primaryRole === 'shop'
              ? ROUTES.shop.home
              : primaryRole === 'manufacturer'
                ? EXTENDED_ROUTES.factory.production
                : primaryRole === 'supplier'
                  ? EXTENDED_ROUTES.factory.supplier
                  : primaryRole === 'distributor'
                    ? ROUTES.distributor.home
                    : ROUTES.client.profile;

      toast({
        title: 'Переключение выполнено',
        description: `Вы вошли как ${`${member.firstName} ${member.lastName}`.trim() || member.nickname} (${member.role})`,
      });

      startTransition(() => router.push(targetUrl));
    } catch (err) {
      toast({ title: 'Ошибка переключения', variant: 'destructive' });
    }
  };

  const handleSwitchBrand = async (brandEmail: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('syntha_profile_avatar');
        setProfileAvatar(null);
      }

      await signIn(brandEmail, SYNTH_MOCK_KNOWN_PASSWORD);
      const brandParam = brandEmail === 'nordic@syntha.ai' ? 'nordic' : 'syntha';
      window.location.href = `/brand?brand=${brandParam}`;

      toast({
        title: 'Бренд переключен',
        description: `Вы перешли в кабинет другого бренда`,
      });
    } catch (err) {
      toast({ title: 'Ошибка переключения бренда', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const readAvatar = () => {
      try {
        setProfileAvatar(localStorage.getItem('syntha_profile_avatar'));
      } catch {
        setProfileAvatar(null);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'syntha_profile_avatar') readAvatar();
    };

    readAvatar();
    window.addEventListener('syntha_profile_avatar_updated', readAvatar as EventListener);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('syntha_profile_avatar_updated', readAvatar as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: 'Вы успешно вышли.' });
    } catch (error) {
      toast({
        title: 'Ошибка при выходе',
        variant: 'destructive',
      });
    }
  };

  const goAccountHome = () => {
    const path = isB2B ? hubPathForRole(currentRole) : '/client/me?tab=profile';
    startTransition(() => router.push(path));
  };

  const goAccountSettings = () => {
    const path = isB2B ? settingsPathForRole(currentRole) : '/client/me?tab=settings';
    startTransition(() => router.push(path));
  };

  const handleSignInGuest = async () => {
    try {
      await signIn('elena.petrova@example.com', SYNTH_MOCK_KNOWN_PASSWORD);
      startTransition(() => router.push('/client/me'));
      toast({ title: 'Вы вошли', description: 'Открыт личный кабинет' });
    } catch {
      toast({ title: 'Не удалось войти', variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />;
  }

  if (user) {
    return (
      <div className="border-border-subtle bg-bg-surface flex h-9 min-w-0 max-w-[200px] items-stretch rounded-[2px] border sm:max-w-[240px]">
        <Button
          type="button"
          variant="ghost"
          className="hover:bg-bg-surface2 h-9 min-w-0 flex-1 shrink rounded-r-none px-2"
          onClick={() => goAccountHome()}
          title={isB2B ? 'Кабинет' : 'Мой профиль'}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="relative shrink-0">
              <Avatar className="ring-border-subtle h-7 w-7 rounded-[2px] border border-white shadow-sm ring-1">
                <AvatarImage
                  src={profileAvatar ?? user.photoURL ?? ''}
                  alt={user.displayName ?? 'User'}
                />
                <AvatarFallback className="bg-bg-surface2 text-text-secondary rounded-[2px] text-[9px] font-black">
                  {user.displayName?.[0].toUpperCase() ?? user.email?.[0].toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              {isB2B && (
                <div className="bg-accent-primary absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-white" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <span className="text-text-muted mb-0.5 block truncate text-[7px] font-black uppercase leading-none tracking-[0.05em]">
                {activeOrg || user?.partnerName || getRoleLabel(currentRole)}
              </span>
              <span className="text-text-primary block truncate text-[10px] font-black uppercase leading-none">
                {partnerName || user?.displayName}
              </span>
            </div>
          </div>
        </Button>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="border-border-subtle hover:bg-bg-surface2 h-9 w-8 shrink-0 rounded-l-none border-l"
              aria-label="Меню профиля"
            >
              <ChevronDown className="text-text-muted h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="border-border-subtle bg-bg-surface z-[600] w-60 overflow-hidden rounded-[2px] border p-0 shadow-xl"
            align="end"
            sideOffset={4}
          >
            {isB2B && user.organizations && user.organizations.length > 1 && (
              <div className="border-border-subtle bg-text-primary border-b p-2">
                <p className="mb-2 flex items-center gap-2 px-1 text-[7px] font-black uppercase tracking-[0.2em] text-white/40">
                  <Sparkles className="text-accent-primary h-2.5 w-2.5" />
                  ВЫБОР УЗЛА
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {user.organizations.map((org: any) => (
                    <DropdownMenuItem
                      key={org.organizationId}
                      onSelect={() => void handleSwitchOrg(org.organizationId)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-[1px] border p-2 transition-all',
                        user.activeOrganizationId === org.organizationId
                          ? 'text-text-inverse border-white/20 bg-white/10 shadow-sm'
                          : 'hover:text-text-inverse border-transparent bg-transparent text-white/50 hover:bg-white/10'
                      )}
                    >
                      <span className="text-[9px] font-black uppercase tracking-tight">
                        {organizations[org.organizationId]?.name || org.organizationId}
                      </span>
                      {user.activeOrganizationId === org.organizationId && (
                        <Check className="text-accent-primary h-3 w-3 stroke-[3]" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            )}

            {((profile?.navigation as any[])?.length || 0) > 0 && (
              <div className="border-border-subtle border-b p-1">
                <p className="text-text-muted mb-1 px-2 py-1 text-[7px] font-black uppercase tracking-widest">
                  БЫСТРЫЙ ПЕРЕХОД
                </p>
                <div className="grid grid-cols-2 gap-0.5">
                  {(profile?.navigation as any[])?.slice(0, 4).map((nav: any) => (
                    <DropdownMenuItem
                      key={nav.path}
                      className="hover:bg-bg-surface2 cursor-pointer rounded-[1px] py-1.5"
                      onSelect={() => router.push(nav.path)}
                    >
                      <span className="text-text-secondary text-[8px] font-black uppercase tracking-tight">
                        {nav.title}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            )}

            <div className="border-border-subtle bg-bg-surface2 border-b px-4 py-3">
              <div className="flex flex-col space-y-0.5">
                <p className="text-text-muted text-[7px] font-black uppercase tracking-widest">
                  {isB2B ? 'АКТИВНЫЙ ПРОФИЛЬ' : 'АККАУНТ B2C'}
                </p>
                <p className="text-text-primary text-xs font-black uppercase leading-none tracking-tight">
                  {user.displayName}
                </p>
                <p className="text-text-secondary mt-1 text-[9px] font-medium leading-none">
                  {user.email}
                </p>
              </div>
            </div>

            {isB2B && user.team && user.team.length > 0 && (
              <div className="p-1">
                <p className="text-text-muted mb-1 px-2 py-1 text-[7px] font-black uppercase tracking-widest">
                  КОМАНДА ДОСТУПА
                </p>
                <div className="space-y-0.5">
                  {user.team
                    .filter((m) => m.invitationStatus !== 'pending')
                    .map((member) => {
                      const memberDisplay =
                        `${member.firstName} ${member.lastName}`.trim() || member.nickname;
                      const isCurrent =
                        user.nickname === member.nickname ||
                        (!user.nickname && user.displayName === memberDisplay);

                      return (
                        <DropdownMenuItem
                          key={member.id}
                          onSelect={() => void handleSwitchTeamMember(member)}
                          className={cn(
                            'flex cursor-pointer items-center justify-between rounded-[1px] border p-1.5 outline-none transition-all',
                            isCurrent
                              ? 'border-border-subtle bg-bg-surface2 text-text-primary'
                              : 'bg-bg-surface text-text-secondary hover:bg-bg-surface2 border-transparent'
                          )}
                        >
                          <div className="flex flex-1 items-center gap-2 overflow-hidden">
                            <Avatar className="ring-border-subtle h-6 w-6 flex-shrink-0 rounded-[2px] border border-white ring-1">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="rounded-[2px] text-[8px] font-black">
                                {(memberDisplay[0] || member.firstName[0] || '?').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex min-w-0 flex-col">
                              <span className="text-text-primary truncate text-[9px] font-black uppercase leading-tight">
                                {memberDisplay}
                              </span>
                              <span className="text-text-muted mt-0.5 truncate text-[7px] font-bold uppercase leading-tight tracking-widest">
                                {member.role}
                              </span>
                            </div>
                          </div>
                          {isCurrent && (
                            <Check className="text-accent-primary ml-2 h-2.5 w-2.5 stroke-[3]" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                </div>
              </div>
            )}

            <DropdownMenuSeparator className="bg-border-subtle m-0" />
            <div className="p-1">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="hover:bg-bg-surface2 cursor-pointer rounded-[1px] py-2"
                  onSelect={() => goAccountHome()}
                >
                  <UserIcon className="text-text-muted mr-2.5 h-3 w-3" />
                  <span className="text-text-primary text-[10px] font-black uppercase tracking-tight">
                    {isB2B ? 'КАБИНЕТ БРЕНДА' : 'МОЙ ПРОФИЛЬ'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="hover:bg-bg-surface2 cursor-pointer rounded-[1px] py-2"
                  onSelect={() => goAccountSettings()}
                >
                  <SettingsIcon className="text-text-muted mr-2.5 h-3 w-3" />
                  <span className="text-text-primary text-[10px] font-black uppercase tracking-tight">
                    {isB2B ? 'НАСТРОЙКИ КАБИНЕТА' : 'НАСТРОЙКИ ПРОФИЛЯ'}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-border-subtle my-1" />
              <DropdownMenuItem
                onSelect={() => void handleSignOut()}
                className="cursor-pointer rounded-[1px] px-2 py-2 text-rose-600 focus:bg-rose-50 focus:text-rose-600"
              >
                <LogOut className="mr-2.5 h-3 w-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">ВЫЙТИ</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8 text-[10px] font-black uppercase"
      onClick={() => void handleSignInGuest()}
    >
      Войти
    </Button>
  );
}
