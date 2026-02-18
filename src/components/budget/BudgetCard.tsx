import React from 'react';
import { cn, formatCurrency } from '../../lib/utils';
import { SlidersHorizontal, Activity } from 'lucide-react';

interface BudgetCardProps {
  category: string;
  spent: number;
  limit: number;
  color: string;
  onEdit: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ category, spent, limit, color, onEdit }) => {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const isOverBudget = spent > limit;
  const isWarning = percentage > 80 && !isOverBudget;
  const remaining = limit - spent;

  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] bg-ui-card p-8 shadow-2xl border border-ui transition-all hover:scale-[1.02] hover:bg-ui-main/50 active:scale-95">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-4 w-4 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)]" style={{ backgroundColor: color }}></div>
          <div>
            <h4 className="text-xl font-black tracking-tight text-ui-main">{category}</h4>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ui-dim">
              Sector Management
            </p>
          </div>
        </div>
        <button 
          onClick={onEdit}
          className="rounded-2xl bg-ui-main/50 p-4 text-ui-dim opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all backdrop-blur-md border border-ui"
        >
          <SlidersHorizontal className="h-5 w-5 stroke-[2.5]" />
        </button>
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <span className={cn(
            "text-2xl font-black tracking-tighter sm:text-3xl",
            isOverBudget ? "text-rose-500" : "text-ui-main"
          )}>
            {formatCurrency(spent)}
          </span>
          <div className="mt-1 h-1 w-12 rounded-full bg-ui-main transition-all group-hover:bg-primary/30"></div>
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-ui-dim">
          MAX {formatCurrency(limit)}
        </span>
      </div>

      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-ui-main border border-ui shadow-inner">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-[0_0_12px_rgba(0,0,0,0.5)]",
            isOverBudget ? "bg-rose-500 shadow-rose-500/20" : isWarning ? "bg-amber-400 shadow-amber-400/20" : "bg-primary shadow-primary/20"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Activity className={cn("h-4 w-4", isOverBudget ? "text-rose-500" : "text-primary")} />
           <span className="text-[10px] font-black uppercase tracking-widest text-ui-dim">Ledger Analysis</span>
        </div>
        {isOverBudget ? (
          <p className="text-xs font-black text-rose-500 uppercase tracking-widest animate-pulse">Alert: Over by {formatCurrency(Math.abs(spent - limit))}</p>
        ) : (
          <p className="text-xs font-black text-ui-dim uppercase tracking-widest">{formatCurrency(remaining)} remaining</p>
        )}
      </div>
    </div>
  );
};
