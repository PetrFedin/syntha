'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mockB2BOrders = [
  {
    name: 'Podium (Москва)',
    id: 'B2B-0012',
    amount: '+750 000 ₽',
    avatar: 'https://picsum.photos/seed/podium-logo/40/40',
    fallback: 'P',
  },
  {
    name: 'ЦУМ (Москва)',
    id: 'B2B-0011',
    amount: '+1 200 000 ₽',
    avatar: 'https://i.imgur.com/JMgcWwL.png',
    fallback: 'Ц',
  },
  {
    name: 'Boutique No.7 (СПб)',
    id: 'B2B-0010',
    amount: '+450 000 ₽',
    avatar: 'https://picsum.photos/seed/boutique7-logo/40/40',
    fallback: 'B',
  },
  {
    name: 'Leform (Москва)',
    id: 'B2B-0009',
    amount: '+820 000 ₽',
    avatar: 'https://picsum.photos/seed/leform-logo/40/40',
    fallback: 'L',
  },
  {
    name: 'KM20 (Москва)',
    id: 'B2B-0008',
    amount: '+1 500 000 ₽',
    avatar: 'https://picsum.photos/seed/km20-logo/40/40',
    fallback: 'K',
  },
];

export function RecentB2BOrders() {
  return (
    <div className="space-y-4">
      {mockB2BOrders.map((order, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={order.avatar} alt="Avatar" />
            <AvatarFallback>{order.fallback}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{order.name}</p>
            <p className="text-sm text-muted-foreground">Заказ {order.id}</p>
          </div>
          <div className="ml-auto font-medium">{order.amount}</div>
        </div>
      ))}
    </div>
  );
}
