import axios from 'axios';
import { Transaction, Category, Summary } from '../types';

const API_URL = 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const transactionAPI = {
  getAll: () => api.get<Transaction[]>('/transactions'),
  getById: (id: string) => api.get<Transaction>(`/transactions/${id}`),
  create: (data: Omit<Transaction, 'id' | 'createdAt'>) =>
    api.post<Transaction>('/transactions', data),
  update: (id: string, data: Partial<Transaction>) =>
    api.put<Transaction>(`/transactions/${id}`, data),
  delete: (id: string) => api.delete(`/transactions/${id}`),
  getSummary: () => api.get<Summary>('/transactions/summary/stats')
};

export const categoryAPI = {
  getAll: () => api.get<Category[]>('/categories'),
  getByType: (type: 'income' | 'expense') =>
    api.get<Category[]>(`/categories/type/${type}`),
  create: (data: Omit<Category, 'id'>) =>
    api.post<Category>('/categories', data)
};

export const dataAPI = {
  exportData: () => api.get('/data/export'),
  importData: (data: { transactions: Transaction[]; categories: Category[]; replaceExisting: boolean }) =>
    api.post('/data/import', data)
};
