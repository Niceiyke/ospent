import React, { useState } from 'react';
import { useBudgets } from '../../hooks/useBudgets';
import { useTransactions } from '../../hooks/useTransactions';
import { BudgetCard } from './BudgetCard';
import { X, Sliders, Target } from 'lucide-react';

export const BudgetView: React.FC = () => {
  const { budgets, updateBudget } = useBudgets();
  const { transactions } = useTransactions();
  const [editingBudget, setEditingBudget] = useState<{ id: string; limit: number; name: string } | null>(null);

  const getSpent = (categoryName: string) => {
    return transactions
      .filter((t) => t.type === 'expense' && t.category_name === categoryName)
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  };

  const handleUpdate = () => {
    if (editingBudget) {
      updateBudget(editingBudget.id, editingBudget.limit);
      setEditingBudget(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-primary">Budget Strategy</h2>
        <p className="text-sm font-medium text-ui-dim">Allocate your capital across sectors</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {budgets.length > 0 ? budgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            category={budget.name}
            spent={getSpent(budget.name)}
            limit={budget.budgetLimit}
            color={budget.color}
            onEdit={() => setEditingBudget({ id: budget.id, limit: budget.budgetLimit, name: budget.name })}
          />
        )) : (
          <div className="col-span-full py-20 text-center space-y-4 rounded-[3rem] border-2 border-dashed border-ui bg-ui-card/30">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-ui-main flex items-center justify-center border border-ui">
              <Target className="h-8 w-8 text-ui-dim" />
            </div>
            <div>
              <h3 className="text-xl font-black text-ui-main">No Budget Strategies</h3>
              <p className="text-sm text-ui-dim">Define expense categories in 'Configure' to start tracking.</p>
            </div>
          </div>
        )}
      </div>

      {editingBudget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ui-main/90 p-4 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-sm animate-in zoom-in-95 duration-300 rounded-[3rem] bg-ui-card p-10 shadow-2xl border border-ui">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-ui-main">{editingBudget.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ui-dim">Allocation Threshold</p>
              </div>
              <button onClick={() => setEditingBudget(null)} className="rounded-2xl bg-ui-main p-4 text-ui-dim hover:text-rose-500 transition-colors">
                <X className="h-5 v-5 stroke-[3]" />
              </button>
            </div>
            
            <div className="mb-8 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-dim">Monthly Limit (₦)</label>
              <div className="relative">
                <Sliders className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                <input
                  type="number"
                  value={editingBudget.limit}
                  onChange={(e) => setEditingBudget({ ...editingBudget, limit: parseFloat(e.target.value) || 0 })}
                  className="w-full rounded-2xl border-2 border-ui bg-ui-main/50 py-6 pl-12 pr-6 text-3xl font-black tracking-tighter text-ui-main outline-none focus:border-primary transition-all"
                  autoFocus
                />
              </div>
            </div>

            <button
              onClick={handleUpdate}
              className="w-full rounded-[2rem] bg-primary py-5 text-lg font-black uppercase tracking-widest text-ui-card shadow-2xl shadow-primary/10 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Set Allocation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
