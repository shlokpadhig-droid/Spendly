/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { CATEGORIES, CURRENCY_SYMBOL, Budget } from '../types';
import { expenseService } from '../lib/expenseService';
import { auth } from '../lib/firebase';
import { format } from 'date-fns';

interface BudgetSettingsProps {
  onSaved: () => void;
  onCancel: () => void;
}

export function BudgetSettings({ onSaved, onCancel }: BudgetSettingsProps) {
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    if (!auth.currentUser) return;
    const period = format(new Date(), 'yyyy-MM');
    const existing = await expenseService.getBudgets(auth.currentUser.uid, period) as Budget[];
    const map: Record<string, number> = {};
    existing?.forEach(b => {
      map[b.category] = b.limit;
    });
    setBudgets(map);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    const period = format(new Date(), 'yyyy-MM');
    try {
      await Promise.all(
        (Object.entries(budgets) as [string, number][]).map(([category, limit]) => 
          expenseService.setBudget({
            category,
            limit,
            period,
            userId: auth.currentUser!.uid
          })
        )
      );
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-500 font-medium">Loading budgets...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-stone-200 relative z-10 flex flex-col max-h-[90vh]"
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif text-[#3E2723] flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-stone-50 text-[#5D4037] rounded-xl border border-stone-200 shadow-sm">
            <Settings className="w-5 h-5" />
          </div>
          Budget Settings
        </h2>
        <span className="text-xs font-medium text-stone-500 uppercase tracking-widest bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg">
          {format(new Date(), 'MMMM yyyy')}
        </span>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
        {CATEGORIES.map(category => (
          <div key={category} className="flex items-center gap-4 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <span className="flex-1 text-sm font-medium text-stone-700">{category}</span>
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-medium text-xs">{CURRENCY_SYMBOL}</span>
              <input
                type="number"
                value={budgets[category] || ''}
                onChange={(e) => setBudgets(prev => ({ ...prev, [category]: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-sm font-medium text-[#3E2723] focus:ring-4 focus:ring-stone-100 focus:border-[#8D6E63] outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 py-4 bg-stone-50 text-stone-600 rounded-xl font-medium hover:bg-stone-100 border border-stone-200 transition-all active:scale-[0.98]"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-4 bg-[#4E342E] text-white rounded-xl font-medium hover:bg-[#3E2723] transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          Save Budgets
        </button>
      </div>
    </motion.div>
  );
}
