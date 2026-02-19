import React, { useState } from 'react';
import { X, Calendar, DollarSign, Tag, FileText, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { Transaction, TransactionType } from '../../types';

interface TransactionFormProps {
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onSubmit, initialData }) => {
  const { incomeCategories, expenseCategories } = useCategories();
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount ? Math.abs(initialData.amount).toString() : '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category_id, setCategoryId] = useState(initialData?.category_id || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category_id) return;

    onSubmit({
      description: description || (type === 'income' ? 'Income' : 'Expense'),
      amount: parseFloat(amount),
      category_id,
      date,
      type,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ui-main/90 p-4 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-[3rem] bg-ui-card p-10 shadow-2xl border border-ui animate-in zoom-in-95 duration-300">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-ui-main">{initialData ? 'Edit Entry' : 'Add Entry'}</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-ui-dim">{initialData ? 'Update the ledger record' : 'Record to the ledger'}</p>
          </div>
          <button onClick={onClose} className="rounded-2xl bg-ui-main p-4 text-ui-dim hover:text-rose-500 transition-colors">
            <X className="h-6 w-6 stroke-[3]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type Toggle */}
          <div className="flex rounded-3xl bg-ui-main p-2 border border-ui">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategoryId(''); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black tracking-widest uppercase transition-all ${
                type === 'expense' ? 'bg-ui-card text-ui-main shadow-xl' : 'text-ui-dim hover:text-ui-main'
              }`}
            >
              <ArrowDownCircle className="h-4 w-4" /> Outbound
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategoryId(''); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black tracking-widest uppercase transition-all ${
                type === 'income' ? 'bg-primary text-ui-main shadow-xl' : 'text-ui-dim hover:text-ui-main'
              }`}
            >
              <ArrowUpCircle className="h-4 w-4" /> Inbound
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-dim">Transaction Value (₦)</label>
            <div className="relative group">
              <DollarSign className="absolute left-6 top-1/2 h-8 w-8 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" />
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-[2rem] border-2 border-ui bg-ui-main/50 py-6 pl-16 pr-8 text-4xl font-black tracking-tighter text-ui-main outline-none focus:border-primary transition-all placeholder:text-ui-dim/30"
                autoFocus
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-dim">Classification</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ui-dim" />
                <select
                  value={category_id}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-2xl border-2 border-ui bg-ui-main/50 px-12 py-4 font-bold text-ui-main outline-none focus:border-primary transition-all appearance-none"
                >
                  <option value="" className="bg-ui-card">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-ui-card">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-dim">Timestamp</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ui-dim" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-2xl border-2 border-ui bg-ui-main/50 px-12 py-4 font-bold text-ui-main outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-dim">Brief Note</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ui-dim" />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Server hosting cost"
                className="w-full rounded-2xl border-2 border-ui bg-ui-main/50 px-12 py-4 font-bold text-ui-main outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-[2rem] bg-primary py-6 text-xl font-black uppercase tracking-widest text-ui-card shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-primary/40"
          >
            {initialData ? 'Update Entry' : 'Confirm Entry'}
          </button>
        </form>
      </div>
    </div>
  );
};
