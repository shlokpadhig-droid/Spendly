/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Timestamp } from 'firebase/firestore';

export interface Expense {
  id?: string;
  amount: number;
  category: string;
  date: Date | Timestamp;
  description: string;
  userId: string;
}

export interface Budget {
  id?: string;
  category: string;
  limit: number;
  period: string; // YYYY-MM
  userId: string;
}

export const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Health",
  "Travel",
  "Other"
];

export const CURRENCY_SYMBOL = "₹";
