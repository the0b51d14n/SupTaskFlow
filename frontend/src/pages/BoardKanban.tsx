import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";

import { useState } from "react";

type Card = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  labels?: string[];
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

function DraggableCard({
  card,
  onClick,
}: {
  card: Card;
  onClick: (card: Card) => void;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.id,
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="card"
      style={style}
      onClick={() => onClick(card)}
    >
      <strong>{card.title}</strong>

      {card.description && (
        <div style={{ fontSize: "12px", opacity: 0.8 }}>
          {card.description}
        </div>
      )}

      {card.dueDate && (
        <div style={{ fontSize: "11px", marginTop: "4px" }}>
          📅 {card.dueDate}
        </div>
      )}

      {card.labels && card.labels.length > 0 && (
        <div
          style={{
            marginTop: "5px",
            display: "flex",
            gap: "5px",
            flexWrap: "wrap",
          }}
        >
          {card.labels.map((label, index) => (
            <span
              key={index}
              style={{
                background: "#3b82f6",
                color: "white",
                padding: "2px 6px",
                borderRadius: "6px",
                fontSize: "10px",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DroppableColumn({
  column,
  onAddCard,
  onCardClick,
}: {
  column: Column;
  onAddCard: (columnId: string, title: string) => void;
  onCardClick: (card: Card) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div className="column" ref={setNodeRef}>
      <h3>{column.name}</h3>

      {column.name === "À faire" && (
        <button
          onClick={() => {
            const title = prompt("Nom de la tâche :");
            if (!title) return;
            onAddCard(column.id, title);
          }}
          style={{ marginBottom: "10px" }}
        >
          + Ajouter une carte
        </button>
      )}

      {column.cards.map((card) => (
        <DraggableCard
          key={card.id}
          card={card}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}

export default function BoardKanban({
  board,
  goBack,
}: {
  board: Board;
  goBack: () => void;
}) {
  const [columns, setColumns] = useState(board.columns);

  function addCard(columnId: string, title: string) {
    const description = prompt("Description :") || "";

    const dueDate =
      prompt("Date d'échéance (YYYY-MM-DD) :") || "";

    const labelsInput =
      prompt("Labels (séparés par virgule) :") || "";

    const labels = labelsInput
      ? labelsInput.split(",").map((l) => l.trim())
      : [];

    const newCard: Card = {
      id: crypto.randomUUID(),
      title,
      description,
      dueDate,
      labels,
    };

    const newColumns = columns.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          cards: [...column.cards, newCard],
        };
      }

      return column;
    });

    setColumns(newColumns);
  }

  function handleCardClick(card: Card) {
    console.log("Carte cliquée :", card);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overColumnId = over.id as string;

    let sourceColumnIndex = -1;
    let sourceCardIndex = -1;

    columns.forEach((column, colIndex) => {
      const cardIndex = column.cards.findIndex(
        (card) => card.id === activeId
      );

      if (cardIndex !== -1) {
        sourceColumnIndex = colIndex;
        sourceCardIndex = cardIndex;
      }
    });

    if (sourceColumnIndex === -1) return;

    const sourceColumn = columns[sourceColumnIndex];
    const card = sourceColumn.cards[sourceCardIndex];

    const newColumns = [...columns];

    newColumns[sourceColumnIndex] = {
      ...sourceColumn,
      cards: sourceColumn.cards.filter(
        (c) => c.id !== activeId
      ),
    };

    const destinationColumnIndex =
      newColumns.findIndex(
        (col) => col.id === overColumnId
      );

    if (destinationColumnIndex !== -1) {
      newColumns[destinationColumnIndex] = {
        ...newColumns[destinationColumnIndex],
        cards: [
          ...newColumns[destinationColumnIndex].cards,
          card,
        ],
      };
    }

    setColumns(newColumns);
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={goBack}>
        ← Retour aux boards
      </button>

      <h1>{board.name}</h1>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {columns.map((col) => (
            <DroppableColumn
              key={col.id}
              column={col}
              onAddCard={addCard}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
