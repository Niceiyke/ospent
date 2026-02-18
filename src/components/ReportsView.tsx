import React, { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import { formatCurrency } from '../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend
} from 'recharts';
import { RefreshCcw, Landmark } from 'lucide-react';

type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export const ReportsView: React.FC = () => {
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('monthly');

  // Logic for analysis
  const analysisData = useMemo(() => {
    // Simple grouping logic for the chart
    // In a real app, this would be more complex date handling
    const expenseByCategory = categories
      .filter(c => c.type === 'expense')
      .map(cat => {
        const spent = transactions
          .filter(t => t.category_id === cat.id && t.type === 'expense')
          .reduce((acc, t) => acc + Math.abs(t.amount), 0);
        return { name: cat.name, value: spent, color: cat.color, limit: cat.budgetLimit };
      })
      .filter(d => d.value > 0 || d.limit > 0);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const totalBudget = categories
      .filter(c => c.type === 'expense')
      .reduce((acc, c) => acc + (c.budgetLimit || 0), 0);

    return { expenseByCategory, totalIncome, totalExpense, totalBudget };
  }, [transactions, categories]);

  const surplus = analysisData.totalIncome - analysisData.totalExpense;
  const budgetUtilization = analysisData.totalBudget > 0 
    ? (analysisData.totalExpense / analysisData.totalBudget) * 100 
    : 0;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">Intelligence Report</h2>
          <p className="text-sm font-medium text-ui-dim">Fiscal performance and budget audit</p>
        </div>
        <select 
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value as TimeFrame)}
          className="rounded-xl border-2 border-ui bg-ui-card px-4 py-2 text-xs font-black uppercase tracking-widest text-primary outline-none focus:border-primary"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </header>

      {/* High Level Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-[2rem] bg-ui-card p-6 border border-ui shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-ui-dim mb-2">Net Position</p>
          <h3 className={`text-2xl font-black ${surplus >= 0 ? 'text-primary' : 'text-rose-500'}`}>
            {formatCurrency(surplus)}
          </h3>
          <p className="text-[8px] font-bold text-ui-dim mt-1 uppercase tracking-tighter">
            {surplus >= 0 ? 'Surplus recorded' : 'Deficit detected'}
          </p>
        </div>
        <div className="rounded-[2rem] bg-ui-card p-6 border border-ui shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-ui-dim mb-2">Budget Utilization</p>
          <h3 className="text-2xl font-black text-ui-main">{budgetUtilization.toFixed(1)}%</h3>
          <div className="mt-2 h-1.5 w-full rounded-full bg-ui-main overflow-hidden">
            <div 
              className={`h-full rounded-full ${budgetUtilization > 100 ? 'bg-rose-500' : 'bg-primary'}`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="rounded-[2rem] bg-ui-card p-6 border border-ui shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-ui-dim mb-2">Capital Allocation</p>
          <h3 className="text-2xl font-black text-amber-500">
            {formatCurrency(transactions.filter(t => {
              const cat = categories.find(c => c.id === t.category_id);
              return cat?.isCapital;
            }).reduce((acc, t) => acc + Math.abs(t.amount), 0))}
          </h3>
          <p className="text-[8px] font-bold text-ui-dim mt-1 uppercase tracking-tighter">Long-term assets</p>
        </div>
      </div>

      {/* Expenses vs Budget Chart */}
      <section className="rounded-[2.5rem] bg-ui-card p-8 border border-ui shadow-2xl">
        <div className="mb-8">
          <h3 className="text-xl font-black tracking-tight text-ui-main">Budget Variance Audit</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-ui-dim">Actual Outbound vs. Planned Thresholds</p>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={analysisData.expenseByCategory} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                width={80}
              />
              <Tooltip 
                cursor={{ fill: '#0f172a', opacity: 0.2 }}
                contentStyle={{ borderRadius: '1rem', backgroundColor: '#1e293b', border: '1px solid #334155' }}
              />
              <Bar dataKey="value" name="Actual Spent" radius={[0, 4, 4, 0]} barSize={20}>
                {analysisData.expenseByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.value > entry.limit && entry.limit > 0 ? '#f43f5e' : '#10b981'} />
                ))}
              </Bar>
              <Bar dataKey="limit" name="Budget Limit" fill="#334155" radius={[0, 4, 4, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Composition Pie Chart */}
      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-[2.5rem] bg-ui-card p-8 border border-ui shadow-2xl">
          <h3 className="text-xl font-black tracking-tight text-ui-main mb-6">Sector Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analysisData.expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analysisData.expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[2.5rem] bg-ui-card p-8 border border-ui shadow-2xl space-y-6">
          <h3 className="text-xl font-black tracking-tight text-ui-main">Ledger Classification</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-ui-main/50 border border-ui">
              <div className="flex items-center gap-3">
                <RefreshCcw className="h-5 w-5 text-blue-500" />
                <span className="text-xs font-black uppercase tracking-widest text-ui-main">Recurring Expenses</span>
              </div>
              <span className="font-black text-ui-main">
                {formatCurrency(transactions.filter(t => categories.find(c => c.id === t.category_id)?.isRecurring).reduce((acc, t) => acc + Math.abs(t.amount), 0))}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-ui-main/50 border border-ui">
              <div className="flex items-center gap-3">
                <Landmark className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-black uppercase tracking-widest text-ui-main">Capital Outlay</span>
              </div>
              <span className="font-black text-ui-main">
                {formatCurrency(transactions.filter(t => categories.find(c => c.id === t.category_id)?.isCapital).reduce((acc, t) => acc + Math.abs(t.amount), 0))}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
