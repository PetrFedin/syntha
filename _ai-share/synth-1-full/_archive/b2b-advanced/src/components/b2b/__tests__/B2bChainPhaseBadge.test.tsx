import { render, screen } from '@testing-library/react';
import { B2bChainPhaseBadge } from '@/components/b2b/B2bChainPhaseBadge';

describe('B2bChainPhaseBadge', () => {
  it('показывает приёмку цеха для pending_erp в очереди', () => {
    render(
      <B2bChainPhaseBadge
        orderStatusLabel="Подтверждён"
        poQueueStatus="pending_erp"
        chain={{ orderId: 'ORD-1', handedOff: true, poStatusLabelRu: 'В очереди цеха' }}
      />
    );
    expect(screen.getByText('Ожидает приёмки цеха')).toBeInTheDocument();
  });

  it('показывает резерв когда inventoryReserved без handoff', () => {
    render(
      <B2bChainPhaseBadge
        orderStatusLabel="Зарезервировано"
        chain={{ orderId: 'ORD-2', handedOff: false, inventoryReserved: true }}
      />
    );
    expect(screen.getByTestId('b2b-chain-reserve-ORD-2')).toHaveTextContent('Резерв на складе');
  });
});
