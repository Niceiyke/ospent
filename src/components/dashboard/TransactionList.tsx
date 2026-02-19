import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Pencil, Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Transaction } from '../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { TransactionForm } from './TransactionForm';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, limit }) => {
  const { updateTransaction, deleteTransaction } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const handleDelete = (id: string, description: string) => {
    if (window.confirm(`Delete "${description}" from the ledger?`)) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-4">
      {displayTransactions.map((t) => (
        <div 
          key={t.id} 
          className="group relative flex items-center justify-between overflow-hidden rounded-[2rem] bg-ui-card p-5 sm:p-6 shadow-xl border border-ui transition-all hover:bg-ui-main/50"
        >
          <div className="flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
            <div className={cn(
              "flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-[1.2rem] sm:rounded-[1.5rem] shadow-inner border border-ui backdrop-blur-md",
              t.type === 'income' ? "bg-primary/10 text-primary" : "bg-rose-500/10 text-rose-500"
            )}>
              {t.type === 'income' ? <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3]" /> : <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3]" />}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-base sm:text-lg font-black tracking-tight text-ui-main truncate group-hover:text-primary transition-colors">
                {t.description}
              </h4>
              <p className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-ui-dim truncate">
                <Activity className="h-3 w-3 shrink-0" /> {t.category_name} • {t.date}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-right shrink-0 ml-4">
            <div className="flex items-center gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-all focus-within:opacity-100 sm:mr-2">
              <button 
                onClick={() => setEditingTransaction(t)}
                className="p-1.5 sm:p-2 rounded-xl bg-ui-main text-ui-dim hover:text-primary transition-colors"
              >
                <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              <button 
                onClick={() => handleDelete(t.id, t.description)}
                className="p-1.5 sm:p-2 rounded-xl bg-ui-main text-ui-dim hover:text-rose-500 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
            <div className="min-w-[80px]">
              <p className={cn(
                "text-lg sm:text-xl font-black tracking-tighter whitespace-nowrap",
                t.type === 'income' ? "text-primary" : "text-ui-main"
              )}>
                {t.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(t.amount))}
              </p>
              <div className="ml-auto h-1 w-8 rounded-full bg-ui-main transition-all group-hover:bg-primary/30"></div>
            </div>
          </div>
        </div>
      ))}

      {editingTransaction && (
        <TransactionForm 
          initialData={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSubmit={(updates) => {
            updateTransaction(editingTransaction.id, updates);
            setEditingTransaction(null);
          }}
        />
      )}
    </div>
  );
};
