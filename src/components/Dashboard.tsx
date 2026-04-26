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

const COLORS = ['#5D4037', '#795548', '#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8', '#EFEBE9'];

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
        <div className="p-8 bg-[#4E342E] rounded-2xl border border-transparent text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700" />
          <p className="text-sm font-medium mb-2 text-[#D7CCC8] relative z-10">Spent this month</p>
          <h3 className="text-5xl font-serif text-white tracking-tighter relative z-10 mb-4">
            {CURRENCY_SYMBOL}{totalThisMonth.toLocaleString()}
          </h3>
          <p className={`text-sm mt-3 font-medium bg-white/10 px-4 py-1.5 rounded-full relative z-10 inline-block backdrop-blur-md`}>
            {diff > 0 ? '+' : ''}{diff.toFixed(1)}% vs last month
          </p>
        </div>

        <div className="md:col-span-2 p-8 bg-white rounded-2xl border border-stone-200 shadow-sm h-64">
          <p className="text-xs font-medium mb-6 text-stone-500 uppercase tracking-widest">Daily Spending</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={montlyData}>
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                stroke="#A1887F" 
                tick={{ fill: '#8D6E63' }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(93,64,55,0.05)' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', backgroundColor: '#ffffff', color: '#4E342E', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="amount" fill="#795548" radius={[4, 4, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-white rounded-2xl border border-stone-200 shadow-sm h-80 flex flex-col">
          <p className="text-xs font-medium mb-2 text-stone-500 uppercase tracking-widest">By Category</p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  cornerRadius={12}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#4E342E' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-100">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="font-medium text-[10px] text-stone-600 tracking-wider uppercase">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs font-medium mb-6 text-stone-500 uppercase tracking-widest">Budget Overview</p>
          <div className="space-y-5">
            {budgets.length > 0 ? (
              budgets.map((budget, i) => {
                const spent = categoryData.find(c => c.name === budget.category)?.value || 0;
                const percentage = (spent / budget.limit) * 100;
                const isOver = percentage > 100;
                
                return (
                  <div key={budget.category} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-stone-700 group-hover:text-[#4E342E] transition-colors">{budget.category}</span>
                      <span className={`text-[10px] font-medium tracking-wide ${isOver ? 'text-red-700' : 'text-stone-700'}`}>
                        {CURRENCY_SYMBOL}{spent.toLocaleString()} <span className="text-stone-400">/ {CURRENCY_SYMBOL}{budget.limit.toLocaleString()}</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-red-600' : 'bg-[#795548]'}`} 
                        style={{ width: `${Math.min(100, percentage)}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <p className="text-xs text-stone-500 font-medium">No budgets set for this month.</p>
              </div>
            )}
            {categoryData.length === 0 && budgets.length === 0 && (
               <div className="py-10 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <p className="text-xs text-stone-500 font-medium">No data this month.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 bg-white rounded-2xl border border-stone-200 shadow-sm h-72">
        <p className="text-xs font-medium mb-6 text-stone-500 uppercase tracking-widest">Yearly Summary ({new Date().getFullYear()})</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={yearlyData}>
            <XAxis 
              dataKey="name" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              stroke="#A1887F" 
              tick={{ fill: '#8D6E63' }}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(93,64,55,0.05)' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', backgroundColor: '#ffffff', color: '#4E342E', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="amount" fill="#795548" radius={[4, 4, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

