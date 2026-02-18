import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Transaction } from '../types';

export const useTransactions = () => {
  const { token, isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) fetchTransactions();
  }, [isAuthenticated, fetchTransactions]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transaction),
      });
      if (!res.ok) throw new Error('Failed to add transaction');
      fetchTransactions();
    } catch (err: any) {
      setError(err.message);
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
    addTransaction,
    stats: {
      balance: getBalance(),
      income: getIncome(),
      expense: getExpense(),
    },
    refresh: fetchTransactions
  };
};
