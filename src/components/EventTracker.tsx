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
      <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-500" /> 
        Tracked Events
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => {
          const eventExpenses = expenses.filter(e => e.eventId === event.id);
          const spent = eventExpenses.reduce((sum, e) => sum + e.amount, 0);
          const percentage = (spent / event.budget) * 100;
          const isOver = percentage > 100;

          return (
            <div key={event.id} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm relative group">
              <button
                onClick={() => event.id && onDelete(event.id)}
                className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <h4 className="font-bold text-zinc-900 text-lg pr-8">{event.name}</h4>
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1 mb-4">
                <Calendar className="w-3 h-3" />
                {format(ensureDate(event.date), 'MMM d, yyyy')}
              </p>

              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Budget</p>
                  <p className="font-semibold text-zinc-700">{CURRENCY_SYMBOL}{event.budget.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Spent</p>
                  <p className={`font-bold ${isOver ? 'text-red-500' : 'text-indigo-600'}`}>
                    {CURRENCY_SYMBOL}{spent.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-indigo-500'}`} 
                  style={{ width: `${Math.min(100, percentage)}%` }} 
                />
              </div>

              <p className="text-xs font-medium text-zinc-500">
                {isOver 
                  ? <span className="text-red-500">Over budget by {CURRENCY_SYMBOL}{(spent - event.budget).toLocaleString()}</span>
                  : <span>{CURRENCY_SYMBOL}{(event.budget - spent).toLocaleString()} remaining</span>
                }
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
