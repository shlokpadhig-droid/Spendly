/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, subMonths, isSameDay } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { Expense, CURRENCY_SYMBOL, Budget } from '../types';

interface DashboardProps {
  expenses: Expense[];
  budgets: Budget[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#71717a'];

const ensureDate = (date: Date | Timestamp) => {
  if (date instanceof Date) return date;
  return date.toDate();
};

export function Dashboard({ expenses, budgets }: DashboardProps) {
  const montlyData = useMemo(() => {
    const now = new Date();
    const interval = eachDayOfInterval({
      start: startOfMonth(now),
      end: endOfMonth(now)
    });

    return interval.map(day => {
      const amount = expenses
        .filter(e => isSameDay(ensureDate(e.date), day))
        .reduce((sum, e) => sum + e.amount, 0);
      
      return {
        name: format(day, 'd'),
        amount
      };
    });
  }, [expenses]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    const currentMonth = new Date();
    
    expenses
      .filter(e => isSameMonth(ensureDate(e.date), currentMonth))
      .forEach(e => {
        data[e.category] = (data[e.category] || 0) + e.amount;
      });

    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const totalThisMonth = useMemo(() => {
    const currentMonth = new Date();
    return expenses
      .filter(e => isSameMonth(ensureDate(e.date), currentMonth))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const lastMonthTotal = useMemo(() => {
    const lastMonth = subMonths(new Date(), 1);
    return expenses
      .filter(e => isSameMonth(ensureDate(e.date), lastMonth))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const yearlyData = useMemo(() => {
    const data: Record<string, number> = {};
    const currentYear = new Date().getFullYear();
    
    expenses
      .filter(e => ensureDate(e.date).getFullYear() === currentYear)
      .forEach(e => {
        const month = format(ensureDate(e.date), 'MMM');
        data[month] = (data[month] || 0) + e.amount;
      });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(name => ({
      name,
      amount: data[name] || 0
    }));
  }, [expenses]);

  const diff = lastMonthTotal > 0 ? ((totalThisMonth - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 mb-1">Spent this month</p>
          <h3 className="text-3xl font-bold text-zinc-900">
            {CURRENCY_SYMBOL}{totalThisMonth.toLocaleString()}
          </h3>
          <p className={`text-xs mt-2 font-medium ${diff > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            {diff > 0 ? '+' : ''}{diff.toFixed(1)}% vs last month
          </p>
        </div>

        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm h-64">
          <p className="text-sm font-medium text-zinc-500 mb-4">Daily Spending (Current Month)</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={montlyData}>
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                stroke="#a1a1aa" 
              />
              <Tooltip 
                cursor={{ fill: '#f4f4f5' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm h-80">
          <p className="text-sm font-medium text-zinc-500 mb-4">By Category</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-3 justify-center">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] text-zinc-600 font-medium">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
          <p className="text-sm font-medium text-zinc-500 mb-4">Budget Overview</p>
          <div className="space-y-4">
            {budgets.length > 0 ? (
              budgets.map((budget, i) => {
                const spent = categoryData.find(c => c.name === budget.category)?.value || 0;
                const percentage = (spent / budget.limit) * 100;
                const isOver = percentage > 100;
                
                return (
                  <div key={budget.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-700">{budget.category}</span>
                      <span className={`text-[10px] font-bold ${isOver ? 'text-red-500' : 'text-zinc-400'}`}>
                        {CURRENCY_SYMBOL}{spent.toLocaleString()} / {CURRENCY_SYMBOL}{budget.limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${Math.min(100, percentage)}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <p className="text-xs text-zinc-400 italic mb-2">No budgets set for this month.</p>
              </div>
            )}
            {categoryData.length === 0 && budgets.length === 0 && (
              <p className="text-center text-zinc-400 py-10 text-sm italic">No data this month</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm h-64">
        <p className="text-sm font-medium text-zinc-500 mb-4">Yearly Summary ({new Date().getFullYear()})</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={yearlyData}>
            <XAxis 
              dataKey="name" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              stroke="#a1a1aa" 
            />
            <Tooltip 
              cursor={{ fill: '#f4f4f5' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
