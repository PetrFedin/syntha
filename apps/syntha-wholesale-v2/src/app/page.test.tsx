import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the independent Syntha Wholesale foundation', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { level: 1, name: /wholesale work/i })).toBeInTheDocument();
    expect(screen.getByText(/new syntha is isolated from legacy/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /one commercial flow/i })).toBeInTheDocument();
  });
});
