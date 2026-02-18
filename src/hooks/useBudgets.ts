import { useCategories } from './useCategories';

export const useBudgets = () => {
  const { expenseCategories, updateCategory } = useCategories();

  const updateBudget = (id: string, limit: number) => {
    updateCategory(id, { budgetLimit: limit });
  };

  const getTotalBudget = () => {
    return expenseCategories.reduce((acc, b) => acc + (b.budgetLimit || 0), 0);
  };

  return {
    budgets: expenseCategories,
    updateBudget,
    stats: {
      totalBudget: getTotalBudget()
    }
  };
};
