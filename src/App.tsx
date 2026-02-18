import React from 'react';
import { 
  Bell, 
  ChevronRight, 
  CreditCard, 
  Home, 
  LayoutDashboard, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Settings, 
  TrendingDown, 
  TrendingUp, 
  User 
} from 'lucide-react';
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
import { cn } from './lib/utils';

const data = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 200 },
  { name: 'Thu', value: 278 },
  { name: 'Fri', value: 189 },
  { name: 'Sat', value: 239 },
  { name: 'Sun', value: 349 },
];

const transactions = [
  { id: 1, title: 'Groceries', amount: -120.50, category: 'Food', date: 'Today', icon: 'ShoppingBag' },
  { id: 2, title: 'Salary', amount: 4500.00, category: 'Income', date: 'Yesterday', icon: 'DollarSign' },
  { id: 3, title: 'Netflix', amount: -15.99, category: 'Subscription', date: '2 days ago', icon: 'Tv' },
  { id: 4, title: 'Gas Station', amount: -60.00, category: 'Transport', date: '3 days ago', icon: 'Zap' },
];

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Welcome back,</p>
            <h1 className="text-sm font-bold">Alex Johnson</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative rounded-full p-2 hover:bg-slate-100 transition-colors">
            <Bell className="h-6 w-6 text-slate-600" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
          </button>
          <button className="rounded-full p-2 hover:bg-slate-100 transition-colors">
            <Settings className="h-6 w-6 text-slate-600" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 lg:max-w-4xl">
        {/* Balance Card */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-100 relative">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative z-10">
            <p className="mb-1 text-sm font-medium opacity-80">Current Balance</p>
            <h2 className="mb-6 text-4xl font-extrabold tracking-tight">$4,500.00</h2>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-md">
                <TrendingUp className="h-4 w-4 text-emerald-300" />
                <span className="text-xs font-semibold">+$240.50</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-md">
                <TrendingDown className="h-4 w-4 text-rose-300" />
                <span className="text-xs font-semibold">-$45.20</span>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="mb-8 grid grid-cols-4 gap-4">
          {[
            { label: 'Send', icon: TrendingUp, color: 'bg-indigo-100 text-indigo-600' },
            { label: 'Receive', icon: TrendingDown, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Bills', icon: CreditCard, color: 'bg-amber-100 text-amber-600' },
            { label: 'More', icon: MoreHorizontal, color: 'bg-slate-100 text-slate-600' },
          ].map((action, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <button className={cn("flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform hover:scale-105 active:scale-95", action.color)}>
                <action.icon className="h-6 w-6" />
              </button>
              <span className="text-xs font-semibold text-slate-600">{action.label}</span>
            </div>
          ))}
        </section>

        {/* Charts Section */}
        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Expense Analysis</h3>
            <select className="rounded-lg border-none bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 outline-none ring-0">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="mb-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Transactions</h3>
            <button className="text-sm font-bold text-indigo-600">See All</button>
          </div>
          <div className="space-y-4">
            {transactions.map((t) => (
              <div key={t.id} className="group flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-slate-50 transition-all hover:shadow-md hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    t.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                  )}>
                    {t.amount > 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold group-hover:text-indigo-600 transition-colors">{t.title}</h4>
                    <p className="text-xs font-medium text-slate-500">{t.category} • {t.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-bold",
                    t.amount > 0 ? "text-emerald-600" : "text-slate-900"
                  )}>
                    {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)}
                  </p>
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-300 group-hover:text-indigo-400 transition-colors mt-1" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-28 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-200 transition-transform hover:scale-110 active:scale-95 z-20">
        <Plus className="h-8 w-8" />
      </button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 z-30 flex w-full items-center justify-around border-t border-slate-100 bg-white/80 backdrop-blur-lg px-6 py-4">
        {[
          { icon: Home, label: 'Home', active: true },
          { icon: LayoutDashboard, label: 'Budget', active: false },
          { icon: Search, label: 'Search', active: false },
          { icon: User, label: 'Profile', active: false },
        ].map((item, i) => (
          <button key={i} className="flex flex-col items-center gap-1 group">
            <item.icon className={cn(
              "h-6 w-6 transition-colors",
              item.active ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-400"
            )} />
            <span className={cn(
              "text-[10px] font-bold",
              item.active ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-400"
            )}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
