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
  LogIn,
  Target
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
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-2xl animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDFBF7] relative overflow-hidden">
        {/* Decorative background blurs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[#8D6E63]/10 rounded-full blur-[120px]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="p-12 text-center bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200 w-full max-w-lg z-10"
        >
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-8 bg-[#5D4037] border-0 rounded-2xl shadow-lg">
            <Wallet className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-serif mb-4 text-[#3E2723] tracking-tighter">
            Spendly
          </h1>
          <p className="text-[#8D6E63] mb-10 text-lg font-sans">Elegant financial tracking.</p>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={login}
            className="w-full py-5 text-white font-medium flex items-center justify-center gap-3 transition-all bg-[#4E342E] rounded-xl hover:bg-[#3E2723] shadow-md"
          >
            <LogIn className="w-6 h-6" />
            Continue with Google
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 overflow-x-hidden transition-colors duration-500 bg-[#FDFBF7]">
      {/* Header */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-5xl">
        <div className="h-20 bg-white/80 backdrop-blur-xl border border-stone-200 shadow-sm rounded-2xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div className="w-12 h-12 bg-[#5D4037] border-0 rounded-xl flex items-center justify-center shadow-md">
              <Wallet className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="leading-none text-[#3E2723] font-serif text-2xl tracking-tight">Spendly</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-stone-200">
            <button
              onClick={() => setShowBudgets(true)}
              className="p-3 transition-all text-[#8D6E63] hover:text-[#4E342E] hover:bg-stone-50 rounded-lg"
              title="Budget Settings"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-3 px-2 border-x border-stone-200">
              <span className="text-sm font-medium text-[#4E342E]">{user.displayName?.split(' ')[0]}</span>
            </div>
            <button
              onClick={logout}
              className="p-3 transition-all text-[#8D6E63] hover:text-red-700 hover:bg-red-50 rounded-lg"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-40">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-[#8D6E63] font-medium uppercase tracking-widest text-sm mb-2 opacity-80">Overview</p>
            <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-stone-200 shadow-sm">
              <button onClick={handlePrevMonth} className="transition-colors text-[#8D6E63] hover:text-[#4E342E] p-2 hover:bg-stone-50 rounded-lg">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xl min-w-[140px] text-center font-serif text-[#3E2723]">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button onClick={handleNextMonth} className="transition-colors text-[#8D6E63] hover:text-[#4E342E] p-2 hover:bg-stone-50 rounded-lg">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEventForm(true)}
              className="h-16 px-8 text-[#5D4037] opacity-90 font-medium flex items-center justify-center gap-3 transition-all bg-white border border-stone-200 rounded-xl hover:bg-stone-50 shadow-sm"
            >
              <Target className="w-5 h-5" />
              <span className="hidden sm:inline">New Event</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="h-16 px-8 text-white font-medium flex items-center justify-center gap-3 transition-all bg-[#4E342E] rounded-xl hover:bg-[#3E2723] shadow-md"
            >
              <Plus className="w-6 h-6" />
              <span className="hidden sm:inline">Add Expense</span>
            </motion.button>
          </div>
        </div>

        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Dashboard expenses={filteredExpenses} budgets={budgets} />
        </section>

        <section className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          <EventTracker 
            events={events} 
            expenses={expenses} 
            onDelete={async (id) => {
              await expenseService.deleteEvent(id);
              loadExpenses();
            }} 
          />
        </section>

        <section className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
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
      <div className="fixed bottom-8 right-6 md:hidden z-30">
        <button
          onClick={() => setShowForm(true)}
          className="w-16 h-16 bg-[#4E342E] text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
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
              className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-md"
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
              className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-md"
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
              className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-md"
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

