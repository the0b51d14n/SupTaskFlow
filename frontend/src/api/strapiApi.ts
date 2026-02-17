const API_URL = "http://localhost:1337/api";

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

async function safeFetch(
  url: string,
  options?: RequestInit,
  retries = 5
): Promise<Response> {

  try {

    const res =
      await fetch(url, options);

    if (!res.ok)
      throw new Error(
        `HTTP ${res.status}`
      );

    return res;

  } catch {

    if (retries > 0) {

      await new Promise(
        r => setTimeout(r, 500)
      );

      return safeFetch(
        url,
        options,
        retries - 1
      );

    }

    throw new Error(
      "Strapi unavailable"
    );

  }

}

function mapCard(card: StrapiCard): Card {
  return {
    id: String(card.id),
    title: card.title,
    description:
      card.description ?? "",
    dueDate:
      card.dueDate ?? "",
    labels:
      card.labels ?? [],
  };
}

function mapColumn(
  column: StrapiColumn
): Column {

  return {
    id: String(column.id),
    name: column.name,
    cards:
      column.cards?.map(
        mapCard
      ) ?? [],
  };

}

function mapBoard(
  board: StrapiBoard
): Board {

  return {
    id: String(board.id),
    name: board.name,
    columns:
      board.columns?.map(
        mapColumn
      ) ?? [],
  };

}

export const strapiApi = {

  async getBoards(): Promise<Board[]> {

    const res =
      await safeFetch(
        `${API_URL}/boards?populate=columns.cards`
      );

    const json:
      StrapiResponse<
        StrapiBoard[]
      > =
      await res.json();

    return json.data.map(
      mapBoard
    );

  },

  async createBoard(
    name: string
  ): Promise<Board> {

    const res =
      await safeFetch(
        `${API_URL}/boards`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            data: { name },
          }),
        }
      );

    const json:
      StrapiResponse<
        StrapiBoard
      > =
      await res.json();

    return mapBoard(
      json.data
    );

  },

  async createColumn(
    boardId: string,
    name: string
  ): Promise<Column> {

    const res =
      await safeFetch(
        `${API_URL}/columns`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            data: {
              name,
              board:
                Number(boardId),
            },
          }),
        }
      );

    const json:
      StrapiResponse<
        StrapiColumn
      > =
      await res.json();

    return mapColumn(
      json.data
    );

  },

  async createCard(
    columnId: string,
    title: string
  ): Promise<Card> {

    const res =
      await safeFetch(
        `${API_URL}/cards`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            data: {
              title,
              column:
                Number(columnId),
            },
          }),
        }
      );

    const json:
      StrapiResponse<
        StrapiCard
      > =
      await res.json();

    return mapCard(
      json.data
    );

  },

  async updateCard(
    card: Card
  ): Promise<Card> {

    const res =
      await safeFetch(
        `${API_URL}/cards/${card.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            data: {
              title:
                card.title,
              description:
                card.description,
              dueDate:
                card.dueDate,
              labels:
                card.labels,
            },
          }),
        }
      );

    const json:
      StrapiResponse<
        StrapiCard
      > =
      await res.json();

    return mapCard(
      json.data
    );

  },

  async deleteCard(
    cardId: string
  ): Promise<void> {

    await safeFetch(
      `${API_URL}/cards/${cardId}`,
      {
        method: "DELETE",
      }
    );

  },

};