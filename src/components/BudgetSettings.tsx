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

  if (loading) return <div className="p-10 text-center">Loading budgets...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg border border-zinc-100"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          Budget Settings
        </h2>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          {format(new Date(), 'MMMM yyyy')}
        </span>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
        {CATEGORIES.map(category => (
          <div key={category} className="flex items-center gap-4">
            <span className="flex-1 text-sm font-medium text-zinc-700">{category}</span>
            <div className="relative w-32">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">{CURRENCY_SYMBOL}</span>
              <input
                type="number"
                value={budgets[category] || ''}
                onChange={(e) => setBudgets(prev => ({ ...prev, [category]: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="w-full pl-7 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 bg-zinc-100 text-zinc-600 rounded-xl font-medium hover:bg-zinc-200 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Budgets
        </button>
      </div>
    </motion.div>
  );
}
