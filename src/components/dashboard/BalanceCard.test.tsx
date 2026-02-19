import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BalanceCard } from './BalanceCard';

describe('BalanceCard', () => {
  it('should render balance correctly', () => {
    render(<BalanceCard balance={5000} income={1000} expense={500} />);
    // Checking for formatted text (Naira symbol)
    expect(screen.getAllByText(/₦/)).toBeDefined();
    expect(screen.getByText(/5,000\.00/)).toBeDefined();
  });

  it('should render income and expense', () => {
    render(<BalanceCard balance={5000} income={1000} expense={500} />);
    expect(screen.getByText(/\+₦1,000\.00/)).toBeDefined();
    expect(screen.getByText(/-₦500\.00/)).toBeDefined();
  });
});
