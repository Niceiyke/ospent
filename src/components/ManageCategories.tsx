import React, { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { Plus, Trash2, Tag, ArrowUpCircle, ArrowDownCircle, Pencil, X, RefreshCcw, Landmark, Palette } from 'lucide-react';
import { Category, TransactionType } from '../types';
import { formatCurrency } from '../lib/utils';

export const ManageCategories: React.FC = () => {
  const { categories, addCategory, deleteCategory, updateCategory } = useCategories();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10b981');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetInterval, setBudgetInterval] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [type, setType] = useState<TransactionType>('expense');
  const [isCapital, setIsCapital] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editBudgetLimit, setEditBudgetLimit] = useState('');
  const [editBudgetInterval, setEditBudgetInterval] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [editIsCapital, setEditIsCapital] = useState(false);
  const [editIsRecurring, setEditIsRecurring] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addCategory({ 
      name, 
      color, 
      type, 
      budgetLimit: parseFloat(budgetLimit) || 0, 
      budgetInterval,
      isCapital, 
      isRecurring 
    });
    setName('');
    setBudgetLimit('');
    setBudgetInterval('monthly');
    setColor('#10b981');
    setIsCapital(false);
    setIsRecurring(false);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setEditBudgetLimit(cat.budgetLimit?.toString() || '0');
    setEditBudgetInterval(cat.budgetInterval || 'monthly');
    setEditIsCapital(cat.isCapital || false);
    setEditIsRecurring(cat.isRecurring || false);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: string) => {
    if (!editName) return;
    await updateCategory(id, { 
      name: editName, 
      color: editColor, 
      budgetLimit: parseFloat(editBudgetLimit) || 0,
      budgetInterval: editBudgetInterval,
      isCapital: editIsCapital, 
      isRecurring: editIsRecurring 
    });
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? All transactions in this category will be affected.`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-primary">Manage Categories</h2>
        <p className="text-sm font-medium text-ui-dim">Personalize your tracking classification</p>
      </header>

      {/* Add Category Form */}
      <form onSubmit={handleAdd} className="rounded-3xl bg-ui-card p-6 shadow-xl border border-ui">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-ui-dim">Category Name</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ui-dim" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Groceries"
                  className="w-full rounded-2xl border-2 border-ui bg-ui-main/50 py-4 pl-12 pr-4 font-bold text-ui-main outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            {type === 'expense' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-ui-dim">Monthly Budget (₦)</label>
                  <div className="relative">
                    <Landmark className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ui-dim" />
                    <input
                      type="number"
                      value={budgetLimit}
                      onChange={(e) => setBudgetLimit(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-2xl border-2 border-ui bg-ui-main/50 py-4 pl-12 pr-4 font-bold text-ui-main outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-ui-dim">Interval</label>
                  <select
                    value={budgetInterval}
                    onChange={(e) => setBudgetInterval(e.target.value as any)}
                    className="w-full rounded-2xl border-2 border-ui bg-ui-main/50 py-4 px-4 font-bold text-ui-main outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 rounded-2xl bg-ui-main/50 p-1 border border-ui">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase transition-all ${
                  type === 'expense' ? 'bg-ui-card text-ui-main shadow-lg border border-ui' : 'text-ui-dim hover:text-ui-main'
                }`}
              >
                <ArrowDownCircle className="h-4 w-4" /> Outbound
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase transition-all ${
                  type === 'income' ? 'bg-primary text-ui-card shadow-lg' : 'text-ui-dim hover:text-ui-main'
                }`}
              >
                <ArrowUpCircle className="h-4 w-4" /> Inbound
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-ui-dim">Color</label>
                <div className="relative">
                  <Palette className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ui-dim pointer-events-none" />
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-12 w-full cursor-pointer rounded-2xl border-2 border-ui bg-ui-main/50 p-1 outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-ui-dim text-center">Capital</label>
                  <button
                    type="button"
                    onClick={() => setIsCapital(!isCapital)}
                    className={`flex w-full items-center justify-center rounded-2xl border-2 py-3 transition-all ${
                      isCapital ? 'border-primary bg-primary/10 text-primary' : 'border-ui bg-ui-main/50 text-ui-dim'
                    }`}
                  >
                    <Landmark className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-ui-dim text-center">Recur</label>
                  <button
                    type="button"
                    onClick={() => setIsRecurring(!isRecurring)}
                    className={`flex w-full items-center justify-center rounded-2xl border-2 py-3 transition-all ${
                      isRecurring ? 'border-primary bg-primary/10 text-primary' : 'border-ui bg-ui-main/50 text-ui-dim'
                    }`}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-black uppercase tracking-widest text-ui-card shadow-lg shadow-primary/10 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-6 w-6" /> Create Category
            </button>
          </div>
        </div>
      </form>

      {/* List Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        {['expense', 'income'].map((t) => (
          <div key={t} className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-ui-dim px-2">
              {t === 'expense' ? <ArrowDownCircle className="h-4 w-4 text-rose-500" /> : <ArrowUpCircle className="h-4 w-4 text-primary" />}
              {t} Ledger Classifications
            </h3>
            <div className="space-y-3">
              {categories.filter((c: Category) => c.type === t).map((cat: Category) => (
                <div key={cat.id} className="group relative flex flex-col rounded-3xl bg-ui-card p-5 border border-ui transition-all hover:border-primary/30">
                  {editingId === cat.id ? (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={editColor} 
                            onChange={(e) => setEditColor(e.target.value)}
                            className="h-10 w-10 cursor-pointer rounded-lg border-none bg-transparent"
                          />
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 rounded-xl border border-ui bg-ui-main/50 px-3 py-2 font-bold text-ui-main outline-none focus:border-primary"
                            autoFocus
                          />
                        </div>
                        {cat.type === 'expense' && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                              <Landmark className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ui-dim" />
                              <input
                                type="number"
                                value={editBudgetLimit}
                                onChange={(e) => setEditBudgetLimit(e.target.value)}
                                placeholder="Budget"
                                className="w-full rounded-xl border border-ui bg-ui-main/50 py-2 pl-9 pr-3 text-xs font-bold text-ui-main outline-none focus:border-primary"
                              />
                            </div>
                            <select
                              value={editBudgetInterval}
                              onChange={(e) => setEditBudgetInterval(e.target.value as any)}
                              className="w-full rounded-xl border border-ui bg-ui-main/50 py-2 px-3 text-xs font-bold text-ui-main outline-none focus:border-primary appearance-none"
                            >
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditIsCapital(!editIsCapital)}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                            editIsCapital ? 'border-primary bg-primary/10 text-primary' : 'border-ui bg-ui-main text-ui-dim'
                          }`}
                        >
                          <Landmark className="h-3 w-3" /> Capital
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditIsRecurring(!editIsRecurring)}
                          className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                            editIsRecurring ? 'border-primary bg-primary/10 text-primary' : 'border-ui bg-ui-main text-ui-dim'
                          }`}
                        >
                          <RefreshCcw className="h-3 w-3" /> Recurring
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleUpdate(cat.id)}
                          className="flex-1 rounded-xl bg-primary py-2 text-[10px] font-black uppercase tracking-widest text-ui-card hover:bg-primary-dark transition-colors"
                        >
                          Save Changes
                        </button>
                        <button 
                          onClick={cancelEdit}
                          className="rounded-xl bg-ui-main p-2 text-ui-dim hover:text-ui-main transition-colors border border-ui"
                        >
                          <X className="h-4 w-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl shadow-inner border border-ui" style={{ backgroundColor: cat.color }}></div>
                          <div>
                            <span className="font-black text-ui-main tracking-tight">{cat.name}</span>
                            {cat.type === 'expense' && (
                              <p className="text-[10px] font-bold text-primary mt-0.5">Budget: {formatCurrency(cat.budgetLimit || 0)} / {cat.budgetInterval}</p>
                            )}
                            <div className="flex gap-2 mt-1">
                              {cat.isCapital && (
                                <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                                  <Landmark className="h-2 w-2" /> Capital
                                </span>
                              )}
                              {cat.isRecurring && (
                                <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full border border-blue-500/20">
                                  <RefreshCcw className="h-2 w-2" /> Recurring
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(cat)}
                            className="rounded-xl p-2 text-ui-dim transition-all hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="rounded-xl p-2 text-ui-dim transition-all hover:bg-rose-500/10 hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
