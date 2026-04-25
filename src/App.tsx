/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  Plus, 
  LogOut, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LogIn
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, login, logout } from './lib/firebase';
import { expenseService } from './lib/expenseService';
import { Expense, Budget, EventItem } from './types';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import { BudgetSettings } from './components/BudgetSettings';
import { EventTracker } from './components/EventTracker';
import { EventForm } from './components/EventForm';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showBudgets, setShowBudgets] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadExpenses();
    } else {
      setExpenses([]);
      setBudgets([]);
    }
  }, [user, currentMonth]);

  const loadExpenses = async () => {
    if (!user) return;
    try {
      const data = await expenseService.getUserExpenses(user.uid);
      setExpenses(data || []);
      
      const period = format(currentMonth, 'yyyy-MM');
      const bData = await expenseService.getBudgets(user.uid, period);
      setBudgets((bData || []) as Budget[]);

      const eData = await expenseService.getUserEvents(user.uid);
      setEvents(eData || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const filteredExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d >= startOfMonth(currentMonth) && d <= endOfMonth(currentMonth);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-zinc-100"
        >
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Welcome to Spendly</h1>
          <p className="text-zinc-500 mb-8">Track your expenses, set budgets, and take control of your personal finances.</p>
          <button
            onClick={login}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <LogIn className="w-5 h-5" />
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-zinc-900 leading-none">Spendly</h1>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1 block">Expense Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowBudgets(true)}
              className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-50 rounded-xl transition-all"
              title="Budget Settings"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-full border border-zinc-100">
              {user.photoURL && <img src={user.photoURL} className="w-5 h-5 rounded-full" alt="avatar" />}
              <span className="text-xs font-semibold text-zinc-600 truncate max-w-[100px]">{user.displayName}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900 mb-1">Financial Overview</h2>
            <div className="flex items-center gap-2 text-zinc-500">
              <CalendarIcon className="w-4 h-4" />
              <div className="flex items-center gap-4">
                <button onClick={handlePrevMonth} className="hover:text-zinc-900 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold min-w-[100px] text-center">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button onClick={handleNextMonth} className="hover:text-zinc-900 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="h-14 px-8 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Expense</span>
          </button>
          
          <button
            onClick={() => setShowEventForm(true)}
            className="h-14 px-8 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 shadow-xl shadow-zinc-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98] ml-3"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Event</span>
          </button>
        </div>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Dashboard expenses={filteredExpenses} budgets={budgets} />
        </section>

        <section className="mt-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <EventTracker 
            events={events} 
            expenses={expenses} 
            onDelete={async (id) => {
              await expenseService.deleteEvent(id);
              loadExpenses();
            }} 
          />
        </section>

        <section className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <ExpenseList 
            expenses={filteredExpenses} 
            onDelete={async (id) => {
              await expenseService.deleteExpense(id);
              loadExpenses();
            }} 
          />
        </section>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-8 right-8 md:hidden">
        <button
          onClick={() => setShowForm(true)}
          className="w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-[0.9] transition-transform"
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Modal for Expense Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <ExpenseForm 
              events={events}
              onSuccess={() => {
                setShowForm(false);
                loadExpenses();
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Budget Settings */}
      <AnimatePresence>
        {showBudgets && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBudgets(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <BudgetSettings 
              onSaved={() => {
                setShowBudgets(false);
                loadExpenses();
              }}
              onCancel={() => setShowBudgets(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Event Form */}
      <AnimatePresence>
        {showEventForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEventForm(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <EventForm 
              onSuccess={() => {
                setShowEventForm(false);
                loadExpenses();
              }}
              onCancel={() => setShowEventForm(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
