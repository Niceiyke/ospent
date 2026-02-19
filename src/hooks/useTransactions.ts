import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Transaction } from '../types';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResponse {
  data: Transaction[];
  pagination: Pagination;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });

  const fetchTransactions = useCallback(async (page = 1) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?page=${page}&limit=50`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data: PaginatedResponse = await res.json();
      setTransactions(data.data);
      setPagination(data.pagination);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user, fetchTransactions]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(transaction),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add transaction');
      }
      await fetchTransactions(pagination.page);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Omit<Transaction, 'id'>) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update transaction');
      }
      await fetchTransactions(pagination.page);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete transaction');
      }
      await fetchTransactions(pagination.page);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    }
  };

  const getBalance = () => {
    return transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  };

  const getIncome = () => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getExpense = () => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  };

  return {
    transactions,
    loading,
    error,
    pagination,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: fetchTransactions,
    stats: {
      balance: getBalance(),
      income: getIncome(),
      expense: getExpense(),
    }
  };
};
