export interface Card {
  documentId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  labels: string[] | null;
  order: number;
}

export interface Column {
  documentId: string;
  name: string;
  order: number;
  cards: Card[];
}

export interface Board {
  documentId: string;
  name: string;
  columns: Column[];
}

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}