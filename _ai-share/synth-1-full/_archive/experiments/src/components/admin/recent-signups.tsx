'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mockSignups = [
  {
    name: 'Анна К.',
    email: 'anna.k@example.com',
    date: '2 дня назад',
    avatar: 'https://picsum.photos/seed/signup1/40/40',
    fallback: 'АК',
  },
  {
    name: 'Михаил П.',
    email: 'mikhail.p@example.com',
    date: '3 дня назад',
    avatar: 'https://picsum.photos/seed/signup2/40/40',
    fallback: 'МП',
  },
  {
    name: 'Елена В.',
    email: 'elena.v@example.com',
    date: '5 дней назад',
    avatar: 'https://picsum.photos/seed/signup3/40/40',
    fallback: 'ЕВ',
  },
  {
    name: 'Иван С.',
    email: 'ivan.s@example.com',
    date: '1 неделю назад',
    avatar: 'https://picsum.photos/seed/signup4/40/40',
    fallback: 'ИС',
  },
  {
    name: 'Ольга М.',
    email: 'olga.m@example.com',
    date: '2 недели назад',
    avatar: 'https://picsum.photos/seed/signup5/40/40',
    fallback: 'ОМ',
  },
];

export function RecentSignups() {
  return (
    <div className="space-y-4">
      {mockSignups.map((signup, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9" data-ai-hint="person face">
            <AvatarImage src={signup.avatar} alt="Avatar" />
            <AvatarFallback>{signup.fallback}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{signup.name}</p>
            <p className="text-sm text-muted-foreground">{signup.email}</p>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">{signup.date}</div>
        </div>
      ))}
    </div>
  );
}
