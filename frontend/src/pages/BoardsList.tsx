import { useState } from "react";
import { mockBoards } from "../api/mockApi";
import BoardKanban from "./BoardKanban";

type Card = {
  id: string;
  title: string;
};

type Column = {
  id: string;
  name: string;
  cards: Card[];
};

type Board = {
  id: string;
  name: string;
  columns: Column[];
};

export default function BoardsList() {
  const [boards] = useState<Board[]>(mockBoards);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);

  if (selectedBoard)
    return (
      <BoardKanban
        board={selectedBoard}
        goBack={() => setSelectedBoard(null)}
      />
    );

  return (
    <div style={{ padding: 20 }}>
      <h1>Mes Boards</h1>

      <button style={{ marginBottom: 15 }}>
        + Créer un board
      </button>

      {boards.length === 0 ? (
        <p>Aucun board pour l'instant</p>
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {boards.map((b) => (
            <li key={b.id} onClick={() => setSelectedBoard(b)}>
              {b.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}