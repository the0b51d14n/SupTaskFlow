import { apiClient } from "./apiClient";
import type { Board, Column, Card, User } from "../types";

interface LoginResponse {
  jwt: string;
  user: User;
}

// Types pour les données reçues depuis l'API Strapi

interface CardAPI {
  documentId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  labels?: string[] | null;
  order?: number;
}

interface ColumnAPI {
  documentId: string;
  name: string;
  order?: number;
  cards?: CardAPI[];
}

interface BoardAPI {
  documentId: string;
  name: string;
  columns?: ColumnAPI[];
}

// Fonctions qui convertissent les données de l'API en objets utilisés dans l'app

function toCard(data: CardAPI): Card {
  return {
    documentId: data.documentId,
    title: data.title,
    description: data.description ?? null,
    dueDate: data.dueDate ?? null,
    labels: Array.isArray(data.labels) ? data.labels : null,
    order: data.order ?? 0,
  };
}

function toColumn(data: ColumnAPI): Column {
  const cards = (data.cards ?? [])
    .map(toCard)
    .sort((a, b) => a.order - b.order);

  return {
    documentId: data.documentId,
    name: data.name,
    order: data.order ?? 0,
    cards,
  };
}

function toBoard(data: BoardAPI): Board {
  const columns = (data.columns ?? [])
    .map(toColumn)
    .sort((a, b) => a.order - b.order);

  return {
    documentId: data.documentId,
    name: data.name,
    columns,
  };
}

// Auth

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/local", {
    identifier: email,
    password,
  });

  return res.data;
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/auth/local/register", {
    username,
    email,
    password,
  });

  return res.data;
}

export function logout(): void {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("jwt");
}

// Boards

export async function getBoards(): Promise<Board[]> {
  const res = await apiClient.get<{ data: BoardAPI[] }>("/boards");

  return (res.data.data ?? []).map(toBoard);
}

export async function getBoardById(id: string): Promise<Board> {
  const res = await apiClient.get<{ data: BoardAPI }>(
    `/boards/${id}?populate[columns][populate]=cards`
  );

  return toBoard(res.data.data);
}

export async function createBoard(name: string): Promise<Board> {
  const res = await apiClient.post<{ data: BoardAPI }>("/boards", {
    data: { name },
  });

  return toBoard(res.data.data);
}

export async function deleteBoard(id: string): Promise<void> {
  await apiClient.delete(`/boards/${id}`);
}

// Columns

export async function createColumn(
  boardId: string,
  name: string,
  order: number
): Promise<Column> {
  const res = await apiClient.post<{ data: ColumnAPI }>("/columns", {
    data: { name, board: boardId, order },
  });

  return toColumn(res.data.data);
}

export async function updateColumn(
  id: string,
  fields: Partial<{ name: string; order: number }>
): Promise<Column> {
  const res = await apiClient.put<{ data: ColumnAPI }>(
    `/columns/${id}`,
    { data: fields }
  );

  return toColumn(res.data.data);
}

export async function deleteColumn(id: string): Promise<void> {
  await apiClient.delete(`/columns/${id}`);
}

// Cards

export async function createCard(
  columnId: string,
  fields: {
    title: string;
    description?: string;
    dueDate?: string;
    labels?: string[];
    order: number;
  }
): Promise<Card> {
  const res = await apiClient.post<{ data: CardAPI }>("/cards", {
    data: { ...fields, column: columnId },
  });

  return toCard(res.data.data);
}

export async function updateCard(
  id: string,
  fields: Partial<{
    title: string;
    description: string | null;
    dueDate: string | null;
    labels: string[] | null;
    order: number;
    column: string;
  }>
): Promise<Card> {
  const res = await apiClient.put<{ data: CardAPI }>(
    `/cards/${id}`,
    { data: fields }
  );

  return toCard(res.data.data);
}

export async function deleteCard(id: string): Promise<void> {
  await apiClient.delete(`/cards/${id}`);
}