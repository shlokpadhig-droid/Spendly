/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Target, Calendar } from 'lucide-react';
import { expenseService } from '../lib/expenseService';
import { auth } from '../lib/firebase';

interface EventFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function EventForm({ onSuccess, onCancel }: EventFormProps) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      await expenseService.addEvent({
        name,
        budget: parseFloat(budget),
        date: new Date(date),
        userId: auth.currentUser.uid,
      });
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200 relative z-10 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif text-[#3E2723] flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-stone-50 text-[#5D4037] rounded-xl shadow-sm border border-stone-200">
            <Target className="w-5 h-5" />
          </div>
          Create Event
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-stone-50 text-stone-400 hover:text-stone-700 rounded-lg transition-colors border border-transparent">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest font-medium text-stone-500 mb-2">Event Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Summer Trip, Wedding"
            className="w-full px-5 py-3.5 bg-white border border-stone-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-stone-100 focus:border-[#8D6E63] transition-all outline-none font-medium text-[#3E2723] shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-medium text-stone-500 mb-2">Event Budget</label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 font-medium">₹</span>
            <input
              type="number"
              required
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-stone-100 focus:border-[#8D6E63] transition-all outline-none font-medium text-[#3E2723] shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-medium text-stone-500 mb-2">Date</label>
          <div className="relative">
            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-stone-100 focus:border-[#8D6E63] transition-all outline-none font-medium text-[#3E2723] shadow-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-6 bg-[#4E342E] text-white rounded-xl font-medium hover:bg-[#3E2723] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Save Event'
          )}
        </button>
      </form>
    </motion.div>
  );
}
