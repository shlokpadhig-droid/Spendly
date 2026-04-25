/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Expense, Budget } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const expenseService = {
  async addExpense(expense: Omit<Expense, 'id'>) {
    const path = 'expenses';
    try {
      return await addDoc(collection(db, path), {
        ...expense,
        date: Timestamp.fromDate(expense.date as Date)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateExpense(id: string, data: Partial<Expense>) {
    const path = `expenses/${id}`;
    try {
      const docRef = doc(db, 'expenses', id);
      const updateData = { ...data };
      if (data.date instanceof Date) {
        updateData.date = Timestamp.fromDate(data.date);
      }
      return await updateDoc(docRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteExpense(id: string) {
    const path = `expenses/${id}`;
    try {
      return await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async getUserExpenses(userId: string) {
    const path = 'expenses';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: (doc.data().date as Timestamp).toDate()
      } as Expense));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async setBudget(budget: Omit<Budget, 'id'>) {
    const path = 'budgets';
    const budgetId = `${budget.userId}_${budget.category}_${budget.period}`;
    try {
      return await setDoc(doc(db, path, budgetId), budget);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getBudgets(userId: string, period: string) {
    const path = 'budgets';
    try {
      const q = query(
        collection(db, path),
        where('userId', '==', userId),
        where('period', '==', period)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
};
