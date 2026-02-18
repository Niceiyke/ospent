import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Cell: () => <div>Cell</div>,
}));

describe('App', () => {
  it('renders the dashboard with the correct user name', () => {
    render(<App />);
    expect(screen.getByText(/Alex Johnson/i)).toBeInTheDocument();
  });

  it('renders the current balance', () => {
    render(<App />);
    expect(screen.getByText(/\$4,500.00/i)).toBeInTheDocument();
  });

  it('renders recent transactions', () => {
    render(<App />);
    expect(screen.getByText(/Recent Transactions/i)).toBeInTheDocument();
    expect(screen.getByText(/Groceries/i)).toBeInTheDocument();
  });
});
