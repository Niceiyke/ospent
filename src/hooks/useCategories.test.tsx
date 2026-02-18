import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCategories } from '../hooks/useCategories';
import { AuthProvider } from '../hooks/useAuth';
import React from 'react';

global.fetch = vi.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should fetch categories on authenticated init', async () => {
    const mockCategories = [
      { id: '1', name: 'Food', color: 'red', type: 'expense', budgetLimit: 100 }
    ];
    
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCategories),
    });

    localStorage.setItem('ospent_token', 'fake-token');
    localStorage.setItem('ospent_user', JSON.stringify({ id: 1, username: 'test' }));

    const { result } = renderHook(() => useCategories(), { wrapper });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.expenseCategories).toHaveLength(1);
  });
});
