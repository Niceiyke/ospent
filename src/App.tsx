import React, { useState } from 'react';
import { 
  Bell, 
  Home, 
  LayoutDashboard, 
  Plus, 
  User,
  LogOut,
  SlidersHorizontal,
  BarChart3,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from './lib/utils';
import { BalanceCard } from './components/dashboard/BalanceCard';
import { TransactionList } from './components/dashboard/TransactionList';
import { ExpenseChart } from './components/dashboard/ExpenseChart';
import { TransactionForm } from './components/dashboard/TransactionForm';
import { BudgetView } from './components/budget/BudgetView';
import { ManageCategories } from './components/ManageCategories';
import { ReportsView } from './components/ReportsView';
import { useTransactions } from './hooks/useTransactions';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';

const MainApp: React.FC = () => {
  const { isAuthenticated, logout, user, theme, toggleTheme } = useAuth();
  const { transactions, addTransaction, stats, loading } = useTransactions();
  const [activeTab, setActiveTab] = useState('home');
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  if (!isAuthenticated) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-ui-main pb-24 font-sans text-ui-main selection:bg-primary/30">
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ui bg-ui-main/80 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-ui-card shadow-lg shadow-primary/20">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ui-dim">Master</p>
            <h1 className="text-sm font-black tracking-tight">{user?.username}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="rounded-2xl p-2.5 text-ui-dim transition-colors hover:bg-ui-card hover:text-primary"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button className="rounded-2xl p-2.5 text-ui-dim transition-colors hover:bg-ui-card hover:text-primary">
            <Bell className="h-5 w-5" />
          </button>
          <button 
            onClick={logout}
            className="rounded-2xl p-2.5 text-ui-dim transition-colors hover:bg-rose-500/10 hover:text-rose-500"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 lg:max-w-4xl">
        {loading && <div className="animate-pulse py-8 text-center text-sm font-bold text-primary">Syncing with Ledger...</div>}
        
        {activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BalanceCard balance={stats.balance} income={stats.income} expense={stats.expense} />
            <ExpenseChart transactions={transactions} />
            <section className="mb-4">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tight text-ui-main">Recent Ledger</h3>
                <button className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Full Audit</button>
              </div>
              {transactions.length > 0 ? (
                <TransactionList transactions={transactions} limit={10} />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ui py-16 text-ui-dim">
                  <p className="text-sm font-bold">No transactions found.</p>
                  <p className="text-xs">Start building your financial history.</p>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'budget' && <BudgetView />}
        {activeTab === 'manage' && <ManageCategories />}
        {activeTab === 'reports' && <ReportsView />}
      </main>

      {/* Modern Floating Action Button */}
      <button 
        onClick={() => setShowAddTransaction(true)}
        className="fixed bottom-28 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-ui-card shadow-2xl shadow-primary/30 transition-all hover:scale-110 active:scale-95 active:rotate-90 sm:bottom-10"
      >
        <Plus className="h-8 w-8 stroke-[3]" />
      </button>

      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <TransactionForm 
          onClose={() => setShowAddTransaction(false)} 
          onSubmit={addTransaction}
        />
      )}

      {/* Bottom Navigation with Mobile Focus */}
      <nav className="fixed bottom-0 left-0 z-30 flex w-full items-center justify-around border-t border-ui bg-ui-main/95 px-6 py-4 backdrop-blur-md sm:py-6">
        {[
          { id: 'home', icon: Home, label: 'Ledger' },
          { id: 'budget', icon: LayoutDashboard, label: 'Strategy' },
          { id: 'reports', icon: BarChart3, label: 'Analysis' },
          { id: 'manage', icon: SlidersHorizontal, label: 'Configure' },
        ].map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)}
            className="group relative flex flex-col items-center gap-1.5 outline-none"
          >
            <div className={cn(
              "absolute -top-4 h-1 w-8 rounded-full transition-all duration-300",
              activeTab === item.id ? "bg-primary shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "bg-transparent"
            )}></div>
            <item.icon className={cn(
              "h-6 w-6 transition-all duration-300",
              activeTab === item.id ? "scale-110 text-primary" : "text-ui-dim group-hover:text-ui-main"
            )} />
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-all duration-300",
              activeTab === item.id ? "text-primary" : "text-ui-dim group-hover:text-ui-main"
            )}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
