/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Calendar, Tag, MessageSquare, ScanLine } from 'lucide-react';
import { CATEGORIES, EventItem } from '../types';
import { expenseService } from '../lib/expenseService';
import { auth } from '../lib/firebase';

interface ExpenseFormProps {
  events: EventItem[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ExpenseForm({ events, onSuccess, onCancel }: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [eventId, setEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result?.toString().split(',')[1];
        if (!base64Data) throw new Error('Failed to read file');

        const response = await fetch('/api/scan-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to scan receipt');
        }

        const data = await response.json();
        
        // Populate form with AI extracted data
        if (data.total_amount) setAmount(data.total_amount.toString());
        if (data.date) setDate(data.date);
        if (data.merchant_name) setDescription(data.merchant_name);
        
        // Map predicted category if it exists in our categories list
        if (data.predicted_category) {
          const matchedCategory = CATEGORIES.find(c => 
            c.toLowerCase() === data.predicted_category.toLowerCase()
          );
          if (matchedCategory) setCategory(matchedCategory);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error scanning receipt:', error);
      alert('Failed to extract data from receipt. ' + (error as Error).message);
    } finally {
      setScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      await expenseService.addExpense({
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        description,
        userId: auth.currentUser.uid,
        ...(eventId ? { eventId } : {})
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
            <Plus className="w-5 h-5" />
          </div>
          Add Expense
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-stone-50 text-stone-400 hover:text-stone-700 rounded-lg transition-colors border border-transparent" disabled={scanning}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-6">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleScanReceipt} 
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanning || loading}
          className="w-full py-3 bg-stone-50 text-[#5D4037] rounded-xl font-medium hover:bg-stone-100 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-stone-200 shadow-sm"
        >
          {scanning ? (
             <>
               <div className="w-5 h-5 border-2 border-[#8D6E63]/30 border-t-[#8D6E63] rounded-full animate-spin" />
               Extracting receipt data...
             </>
          ) : (
            <>
              <ScanLine className="w-5 h-5" />
              Scan Receipt with AI
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest font-medium text-stone-500 mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">₹</span>
            <input
              type="number"
              required
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-9 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-stone-100 focus:border-[#8D6E63] transition-all outline-none font-medium text-[#3E2723] shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-medium text-stone-500 mb-2">Category</label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-stone-100 focus:border-[#8D6E63] transition-all outline-none appearance-none font-medium text-[#3E2723] shadow-sm"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-medium text-stone-500 mb-2">Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-stone-100 focus:border-[#8D6E63] transition-all outline-none font-medium text-[#3E2723] shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest font-medium text-stone-500 mb-2">Description (Optional)</label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-stone-400" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you spend on?"
              rows={3}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-stone-100 focus:border-[#8D6E63] transition-all outline-none resize-none font-medium text-[#3E2723] shadow-sm"
            />
          </div>
        </div>

        {events.length > 0 && (
          <div>
            <label className="block text-xs uppercase tracking-widest font-medium text-stone-500 mb-2">Link to Event (Optional)</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-stone-100 focus:border-[#8D6E63] transition-all outline-none appearance-none font-medium text-[#3E2723] shadow-sm"
              >
                <option value="">None</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || scanning}
          className="w-full py-4 mt-4 bg-[#4E342E] text-white rounded-xl font-medium hover:bg-[#3E2723] active:scale-[0.98] transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Save Expense'
          )}
        </button>
      </form>
    </motion.div>
  );
}
