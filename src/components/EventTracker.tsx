/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, Target, Calendar } from 'lucide-react';
import { EventItem, Expense, CURRENCY_SYMBOL } from '../types';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

interface EventTrackerProps {
  events: EventItem[];
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const ensureDate = (date: Date | Timestamp) => {
  if (date instanceof Date) return date;
  return date.toDate();
};

export function EventTracker({ events, expenses, onDelete }: EventTrackerProps) {
  if (events.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="font-serif flex items-center gap-3 text-[#3E2723] text-2xl">
        <Target className="w-8 h-8 text-white bg-[#5D4037] p-1.5 rounded-xl shadow-sm border border-stone-200" /> 
        Tracked Events
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => {
          const eventExpenses = expenses.filter(e => e.eventId === event.id);
          const spent = eventExpenses.reduce((sum, e) => sum + e.amount, 0);
          const percentage = (spent / event.budget) * 100;
          const isOver = percentage > 100;

          return (
            <div key={event.id} className="p-8 relative group transition-all bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1">
              <button
                onClick={() => event.id && onDelete(event.id)}
                className="absolute top-6 right-6 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 text-stone-400 hover:text-red-600 hover:bg-red-50 border border-transparent"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <h4 className="text-xl pr-10 font-medium text-stone-800 truncate mb-1">{event.name}</h4>
              <p className="text-sm flex items-center gap-1.5 mb-6 text-stone-500 tracking-wide">
                <Calendar className="w-4 h-4" />
                {format(ensureDate(event.date), 'MMMM d, yyyy')}
              </p>

              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-1 font-medium text-stone-500">Budget</p>
                  <p className="font-medium text-stone-700 bg-stone-50 px-2 py-0.5 rounded-lg border border-stone-200">{CURRENCY_SYMBOL}{event.budget.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest mb-1 font-medium text-stone-500">Spent</p>
                  <p className={`font-serif text-3xl tracking-tight ${isOver ? 'text-red-600' : 'text-[#795548]'}`}>
                    {CURRENCY_SYMBOL}{spent.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="w-full overflow-hidden mb-5 h-3 rounded-full bg-stone-100 border border-stone-200">
                <div 
                  className={`h-full rounded-full transition-all duration-700 shadow-sm ${isOver ? 'bg-red-500' : 'bg-[#A1887F]'}`} 
                  style={{ width: `${Math.min(100, percentage)}%` }} 
                />
              </div>

              <p className="text-[11px] font-medium uppercase tracking-widest px-3 py-1.5 rounded-xl inline-block bg-white border border-stone-200">
                {isOver 
                  ? <span className="text-red-500">Over budget by {CURRENCY_SYMBOL}{(spent - event.budget).toLocaleString()}</span>
                  : <span className="text-stone-500">{CURRENCY_SYMBOL}{(event.budget - spent).toLocaleString()} remaining</span>
                }
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
