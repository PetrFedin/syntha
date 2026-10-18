import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { commercialLifecycle } from '@/shared/navigation';
import HomePage from './page';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe('HomePage', () => {
  it('renders dashboard content without a duplicate workspace shell', () => {
    const { container } = render(<HomePage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /коммерческая работа — в одном контуре/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /один коммерческий поток/i }))
      .toBeInTheDocument();
    expect(screen.queryByTestId('desktop-navigation')).not.toBeInTheDocument();
    expect(container.querySelectorAll('a[href^="#"]')).toHaveLength(0);
  });

  it('links every lifecycle stage to its real route', () => {
    render(<HomePage />);

    for (const section of commercialLifecycle) {
      expect(
        screen.getAllByRole('link', { name: section.lifecycleStage })
          .some((link) => link.getAttribute('href') === section.href),
      ).toBe(true);
    }
  });
});
