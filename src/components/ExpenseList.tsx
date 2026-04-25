/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { Trash2, ShoppingBag, Utensils, Car, Film, Zap, Heart, Plane, MoreHorizontal } from 'lucide-react';
import { Expense, CURRENCY_SYMBOL } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const ensureDate = (date: Date | Timestamp) => {
  if (date instanceof Date) return date;
  return date.toDate();
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Food & Dining': <Utensils className="w-4 h-4" />,
  'Transport': <Car className="w-4 h-4" />,
  'Entertainment': <Film className="w-4 h-4" />,
  'Shopping': <ShoppingBag className="w-4 h-4" />,
  'Utilities': <Zap className="w-4 h-4" />,
  'Health': <Heart className="w-4 h-4" />,
  'Travel': <Plane className="w-4 h-4" />,
  'Other': <MoreHorizontal className="w-4 h-4" />,
};

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-zinc-50 flex justify-between items-center">
        <h3 className="font-semibold text-zinc-900">Recent Transactions</h3>
        <span className="text-xs text-zinc-400 font-medium">{expenses.length} entries</span>
      </div>
      
      <div className="divide-y divide-zinc-50">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-4 flex items-center gap-4 hover:bg-zinc-50 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 group-hover:bg-white group-hover:shadow-sm transition-all">
              {CATEGORY_ICONS[expense.category] || <MoreHorizontal className="w-4 h-4" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zinc-900 truncate">
                {expense.description || expense.category}
              </p>
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mt-0.5">
                {expense.category} • {format(ensureDate(expense.date), 'MMM d, yyyy')}
              </p>
            </div>
            
            <div className="text-right flex items-center gap-3">
              <span className="font-bold text-zinc-900">
                {CURRENCY_SYMBOL}{expense.amount.toLocaleString()}
              </span>
              <button
                onClick={() => expense.id && onDelete(expense.id)}
                className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        
        {expenses.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-zinc-400 text-sm italic">No expenses recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
