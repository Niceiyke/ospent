import React from 'react';
import { TrendingUp, TrendingDown, ChevronRight, Activity } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Transaction } from '../../types';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, limit }) => {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="space-y-4">
      {displayTransactions.map((t) => (
        <div 
          key={t.id} 
          className="group relative flex items-center justify-between overflow-hidden rounded-[2rem] bg-ui-card p-6 shadow-xl border border-ui transition-all hover:scale-[1.02] hover:bg-ui-main/50 active:scale-95"
        >
          <div className="flex items-center gap-5">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-[1.5rem] shadow-inner border border-ui backdrop-blur-md",
              t.type === 'income' ? "bg-primary/10 text-primary" : "bg-rose-500/10 text-rose-500"
            )}>
              {t.type === 'income' ? <TrendingUp className="h-6 w-6 stroke-[3]" /> : <TrendingDown className="h-6 w-6 stroke-[3]" />}
            </div>
            <div>
              <h4 className="text-lg font-black tracking-tight text-ui-main group-hover:text-primary transition-colors">{t.description}</h4>
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ui-dim">
                <Activity className="h-3 w-3" /> {t.category_name} • {t.date}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className={cn(
                "text-xl font-black tracking-tighter",
                t.type === 'income' ? "text-primary" : "text-ui-main"
              )}>
                {t.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(t.amount))}
              </p>
              <div className="ml-auto h-1 w-8 rounded-full bg-ui-main transition-all group-hover:bg-primary/30"></div>
            </div>
            <ChevronRight className="h-5 w-5 text-ui-dim transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </div>
      ))}
    </div>
  );
};
