import { apiClient } from "./apiClient";

export type Card = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  labels?: string[];
};

export type Column = {
  id: string;
  name: string;
  cards: Card[];
};

export type Board = {
  id: string;
  name: string;
  columns: Column[];
};

type StrapiCard = {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  labels?: string[];
};

type StrapiColumn = {
  id: number;
  name: string;
  cards?: StrapiCard[];
};

type StrapiBoard = {
  id: number;
  name: string;
  columns?: StrapiColumn[];
};

type StrapiResponse<T> = {
  data: T;
};

type StrapiAuthResponse = {
  jwt: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
};

function mapCard(card: StrapiCard): Card {
  return {
    id: String(card.id),
    title: card.title,
    description: card.description ?? "",
    dueDate: card.dueDate ?? "",
    labels: card.labels ?? [],
  };
}

function mapColumn(column: StrapiColumn): Column {
  return {
    id: String(column.id),
    name: column.name,
    cards: column.cards?.map(mapCard) ?? [],
  };
}

function mapBoard(board: StrapiBoard): Board {
  return {
    id: String(board.id),
    name: board.name,
    columns: board.columns?.map(mapColumn) ?? [],
  };
}

export const strapiApi = {

  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; email?: string; message?: string }> {
    try {
      const res = await apiClient.post<StrapiAuthResponse>("/auth/local", {
        identifier: email,
        password,
      });
      localStorage.setItem("jwt", res.data.jwt);
      return { success: true, email: res.data.user.email };
    } catch {
      return { success: false, message: "Email ou mot de passe incorrect" };
    }
  },

  async register(email: string, password: string): Promise<{ success: boolean; email?: string; message?: string }> {
    try {
      const res = await apiClient.post<StrapiAuthResponse>("/auth/local/register", {
        username: email,
        email,
        password,
      });
      localStorage.setItem("jwt", res.data.jwt);
      return { success: true, email: res.data.user.email };
    } catch {
      return { success: false, message: "Veuillez remplir tous les champs" };
    }
  },

  logout() {
    localStorage.removeItem("jwt");
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("jwt");
  },

  // Boards
  async getBoards(): Promise<Board[]> {
    const res = await apiClient.get<StrapiResponse<StrapiBoard[]>>(
      "/boards?populate=columns.cards"
    );
    return res.data.data.map(mapBoard);
  },

  async createBoard(name: string): Promise<Board> {
    const res = await apiClient.post<StrapiResponse<StrapiBoard>>("/boards", {
      data: { name },
    });
    return mapBoard(res.data.data);
  },

  async deleteBoard(boardId: string): Promise<void> {
    await apiClient.delete(`/boards/${boardId}`);
  },

  // Columns
  async createColumn(boardId: string, name: string): Promise<Column> {
    const res = await apiClient.post<StrapiResponse<StrapiColumn>>("/columns", {
      data: { name, board: Number(boardId) },
    });
    return mapColumn(res.data.data);
  },

  async deleteColumn(columnId: string): Promise<void> {
    await apiClient.delete(`/columns/${columnId}`);
  },

  // Cards
  async createCard(columnId: string, title: string): Promise<Card> {
    const res = await apiClient.post<StrapiResponse<StrapiCard>>("/cards", {
      data: { title, column: Number(columnId) },
    });
    return mapCard(res.data.data);
  },

  async updateCard(card: Card): Promise<Card> {
    const res = await apiClient.put<StrapiResponse<StrapiCard>>(`/cards/${card.id}`, {
      data: {
        title: card.title,
        description: card.description,
        dueDate: card.dueDate,
        labels: card.labels,
      },
    });
    return mapCard(res.data.data);
  },

  async deleteCard(cardId: string): Promise<void> {
    await apiClient.delete(`/cards/${cardId}`);
  },
};