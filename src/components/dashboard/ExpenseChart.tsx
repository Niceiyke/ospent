import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Transaction } from '../../types';

interface ExpenseChartProps {
  transactions?: Transaction[];
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ transactions = [] }) => {
  const data = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return last7Days.map((date) => {
      const dayName = days[date.getDay()];
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const value = transactions
        .filter((t) => t.type === 'expense' && t.date === dateStr)
        .reduce((acc, t) => acc + Math.abs(t.amount), 0);

      return { name: dayName, value };
    });
  }, [transactions]);

  return (
    <section className="mb-10 rounded-[3rem] bg-[#1e293b] p-8 shadow-2xl border border-slate-800 transition-all hover:scale-[1.01] hover:shadow-[#10b981]/10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black tracking-tighter text-white">Expense Analysis</h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Outbound Velocity (7 Days)</p>
        </div>
        <select className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#10b981] outline-none shadow-xl transition-all hover:border-[#10b981] cursor-pointer">
          <option>Weekly View</option>
        </select>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
            />
            <Tooltip 
              cursor={{ fill: '#0f172a', opacity: 0.2 }}
              contentStyle={{ 
                borderRadius: '1.5rem', 
                backgroundColor: '#1e293b',
                border: '2px solid #334155',
                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
                color: '#fff',
                fontWeight: 900
              }}
              itemStyle={{ color: '#10b981' }}
            />
            <Bar dataKey="value" radius={[12, 12, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={index === 6 ? '#10b981' : '#334155'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
