import { apiClient } from "./apiClient";
import type { Board, Column, Card, User } from "../types";

interface StrapiAuthResponse {
  jwt: string;
  user: User;
}

/* ---------- Types des données brutes Strapi ---------- */

interface RawCard {
  documentId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  labels?: string[] | null;
  order?: number;
}

interface RawColumn {
  documentId: string;
  name: string;
  order?: number;
  cards?: RawCard[];
}

interface RawBoard {
  documentId: string;
  name: string;
  columns?: RawColumn[];
}

/* ---------- Mappers ---------- */

function mapCard(raw: RawCard): Card {
  return {
    documentId: raw.documentId,
    title: raw.title,
    description: raw.description ?? null,
    dueDate: raw.dueDate ?? null,
    labels: Array.isArray(raw.labels) ? raw.labels : null,
    order: raw.order ?? 0,
  };
}

function mapColumn(raw: RawColumn): Column {
  const cards = (raw.cards ?? [])
    .map(mapCard)
    .sort((a, b) => a.order - b.order);

  return {
    documentId: raw.documentId,
    name: raw.name,
    order: raw.order ?? 0,
    cards,
  };
}

function mapBoard(raw: RawBoard): Board {
  const columns = (raw.columns ?? [])
    .map(mapColumn)
    .sort((a, b) => a.order - b.order);

  return {
    documentId: raw.documentId,
    name: raw.name,
    columns,
  };
}

/* ---------- Auth ---------- */

export async function login(
  email: string,
  password: string
): Promise<StrapiAuthResponse> {
  const res = await apiClient.post<StrapiAuthResponse>("/auth/local", {
    identifier: email,
    password,
  });

  return res.data;
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<StrapiAuthResponse> {
  const res = await apiClient.post<StrapiAuthResponse>("/auth/local/register", {
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

/* ---------- Boards ---------- */

export async function getBoards(): Promise<Board[]> {
  const res = await apiClient.get<{ data: RawBoard[] }>(
    "/boards?populate[columns][populate][cards]=*"
  );

  return (res.data.data ?? []).map(mapBoard);
}

export async function getBoardById(documentId: string): Promise<Board> {
  const res = await apiClient.get<{ data: RawBoard }>(
    `/boards/${documentId}?populate[columns][populate][cards]=*`
  );

  return mapBoard(res.data.data);
}

export async function createBoard(name: string): Promise<Board> {
  const res = await apiClient.post<{ data: RawBoard }>("/boards", {
    data: { name },
  });

  return mapBoard(res.data.data);
}

export async function deleteBoard(documentId: string): Promise<void> {
  await apiClient.delete(`/boards/${documentId}`);
}

/* ---------- Columns ---------- */

export async function createColumn(
  boardDocumentId: string,
  name: string,
  order: number
): Promise<Column> {
  const res = await apiClient.post<{ data: RawColumn }>("/columns", {
    data: { name, board: boardDocumentId, order },
  });

  return mapColumn(res.data.data);
}

export async function updateColumn(
  documentId: string,
  data: Partial<{ name: string; order: number }>
): Promise<Column> {
  const res = await apiClient.put<{ data: RawColumn }>(
    `/columns/${documentId}`,
    { data }
  );

  return mapColumn(res.data.data);
}

export async function deleteColumn(documentId: string): Promise<void> {
  await apiClient.delete(`/columns/${documentId}`);
}

/* ---------- Cards ---------- */

export async function createCard(
  columnDocumentId: string,
  data: {
    title: string;
    description?: string;
    dueDate?: string;
    labels?: string[];
    order: number;
  }
): Promise<Card> {
  const res = await apiClient.post<{ data: RawCard }>("/cards", {
    data: { ...data, column: columnDocumentId },
  });

  return mapCard(res.data.data);
}

export async function updateCard(
  documentId: string,
  data: Partial<{
    title: string;
    description: string | null;
    dueDate: string | null;
    labels: string[] | null;
    order: number;
    column: string;
  }>
): Promise<Card> {
  const res = await apiClient.put<{ data: RawCard }>(
    `/cards/${documentId}`,
    { data }
  );

  return mapCard(res.data.data);
}

export async function deleteCard(documentId: string): Promise<void> {
  await apiClient.delete(`/cards/${documentId}`);
}