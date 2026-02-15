import { useState, useEffect } from "react";
import { strapiApi } from "../api/strapiApi";
import type { Board } from "../api/strapiApi";
import BoardKanban from "./BoardKanban";

export default function BoardsList() {

  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] =
    useState<Board | null>(null);

  useEffect(() => {

    async function loadBoards() {

      try {

        const data = await strapiApi.getBoards();

        setBoards(data);

      } catch (error) {

        console.error(error);

      }

    }

    loadBoards();

  }, []);

  async function handleCreateBoard() {

    const name = prompt("Nom du board");

    if (!name) return;

    try {

      const newBoard =
        await strapiApi.createBoard(name);

      setBoards(prev => [...prev, newBoard]);

    } catch (error) {

      console.error(error);

    }

  }

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

      <button
        type="button"
        style={{ marginBottom: 15 }}
        onClick={handleCreateBoard}
      >
        + Créer un board
      </button>

      {boards.length === 0 ? (

        <p>Aucun board pour l'instant</p>

      ) : (

        <ul style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          listStyle: "none",
          padding: 0
        }}>

          {boards.map(board => (

            <li
              key={board.id}
              style={{
                cursor: "pointer",
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 6,
              }}
              onClick={(e) => {

                e.preventDefault();
                e.stopPropagation();

                setSelectedBoard(board);

              }}
            >
              {board.name}
            </li>

          ))}

        </ul>

      )}

    </div>
  );

}