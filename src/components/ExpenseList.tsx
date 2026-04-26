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
  'Food & Dining': <Utensils className="w-5 h-5" />,
  'Transport': <Car className="w-5 h-5" />,
  'Entertainment': <Film className="w-5 h-5" />,
  'Shopping': <ShoppingBag className="w-5 h-5" />,
  'Utilities': <Zap className="w-5 h-5" />,
  'Health': <Heart className="w-5 h-5" />,
  'Travel': <Plane className="w-5 h-5" />,
  'Other': <MoreHorizontal className="w-5 h-5" />,
};

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  return (
    <div className="overflow-hidden transition-all bg-white rounded-2xl border border-stone-200 shadow-sm">
      <div className="p-8 flex justify-between items-center border-b border-stone-100 bg-white">
        <h3 className="font-serif flex items-center gap-2 text-[#3E2723] text-2xl tracking-tight">
          Recent Transactions
        </h3>
        <span className="text-xs font-medium text-[#4E342E] bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200">
          {expenses.length} entries
        </span>
      </div>
      
      <div className="divide-y divide-stone-100">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-5 px-8 flex items-center gap-5 transition-all group hover:bg-stone-50/50">
            <div className="w-12 h-12 flex items-center justify-center transition-all rounded-xl bg-stone-50 border border-stone-100 text-stone-500 shadow-sm group-hover:scale-105 group-hover:bg-[#EFEBE9] group-hover:text-[#5D4037]">
              {CATEGORY_ICONS[expense.category] || <MoreHorizontal className="w-5 h-5" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-stone-800 text-lg mb-0.5">
                {expense.description || expense.category}
              </p>
              <p className="text-[11px] uppercase tracking-widest font-medium text-stone-400">
                {expense.category} <span className="text-stone-300 mx-1">•</span> {format(ensureDate(expense.date), 'MMM d, yyyy')}
              </p>
            </div>
            
            <div className="text-right flex items-center gap-4">
              <span className="font-serif font-medium text-[#3E2723] text-xl">
                {CURRENCY_SYMBOL}{expense.amount.toLocaleString()}
              </span>
              <button
                onClick={() => expense.id && onDelete(expense.id)}
                className="p-2 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 md:opacity-100 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg border hover:border-transparent border-transparent"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        
        {expenses.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">
              No transactions found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
