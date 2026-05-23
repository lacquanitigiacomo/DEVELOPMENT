export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Audit {
  id: string;
  userId: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  createdAt: string;
}

export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface ReceiptScan {
  merchant: string;
  date: string;
  items: ReceiptItem[];
  total: number;
  currency: string;
  category: string;
  confidence: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { page: number; limit: number; total: number };
}
