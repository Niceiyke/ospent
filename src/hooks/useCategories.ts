import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Category } from '../types';

export const useCategories = () => {
  const { token, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) fetchCategories();
  }, [isAuthenticated, fetchCategories]);

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const payload = {
        ...category,
        budget_limit: category.budgetLimit
      };
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to add category');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete category');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const payload = {
        ...updates,
        budget_limit: updates.budgetLimit
      };
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update category');
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    categories,
    incomeCategories: categories.filter(c => c.type === 'income'),
    expenseCategories: categories.filter(c => c.type === 'expense'),
    loading,
    error,
    addCategory,
    deleteCategory,
    updateCategory,
    refresh: fetchCategories
  };
};
