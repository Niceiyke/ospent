import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, income, expense }) => {
  return (
    <section className="relative mb-10 overflow-hidden rounded-[3rem] bg-ui-card p-10 text-ui-main shadow-2xl border border-ui transition-all hover:scale-[1.01] hover:shadow-primary/10">
      <div className="absolute right-0 top-0 h-48 w-48 -translate-y-8 translate-x-8 rounded-full bg-primary/5 blur-3xl"></div>
      <div className="relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-2xl bg-ui-main px-4 py-2 text-xs font-black uppercase tracking-widest text-primary border border-ui shadow-inner">
            <Wallet className="h-4 w-4" /> Available Balance
          </div>
          <div className="text-right text-[10px] font-bold uppercase tracking-widest text-ui-dim">Live Ledger</div>
        </div>
        
        <h2 className="text-5xl font-black tracking-tighter sm:text-6xl">
          {formatCurrency(balance)}
        </h2>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 rounded-[2rem] bg-ui-main px-6 py-4 border border-ui shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ui-dim">Inbound</p>
              <p className="text-lg font-black text-ui-main">+{formatCurrency(income)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 rounded-[2rem] bg-ui-main px-6 py-4 border border-ui shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ui-dim">Outbound</p>
              <p className="text-lg font-black text-ui-main">-{formatCurrency(expense)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
