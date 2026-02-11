import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";

import { useState } from "react";
import Modal from "../components/Modal";

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

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: card.id,
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className="card"
      style={{
        ...style,
        position: "relative",
        cursor: "default",
      }}
      onClick={() => onClick(card)}
    >

      <div
        {...listeners}
        {...attributes}
        onClick={(e) => e.stopPropagation()}
        className="drag-handle"
      >
        ⠿
      </div>

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
        <div style={{
          marginTop: "5px",
          display: "flex",
          gap: "5px",
          flexWrap: "wrap",
        }}>
          {card.labels.map((label, index) => (
            <span key={index}>
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

      {/* BOUTON UNIQUEMENT POUR "À faire" */}
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

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [editCard, setEditCard] = useState<Card | null>(null);

  function addCard(columnId: string, title: string) {

    const newCard: Card = {

      id: crypto.randomUUID(),
      title,
      description: "",
      dueDate: "",
      labels: [],

    };

    const newColumns = columns.map(column =>
      column.id === columnId
        ? { ...column, cards: [...column.cards, newCard] }
        : column
    );

    setColumns(newColumns);

  }

  function handleCardClick(card: Card) {

    setSelectedCard(card);
    setEditCard({ ...card });

  }

  function saveCard() {

    if (!editCard) return;

    const newColumns = columns.map(column => ({
      ...column,
      cards: column.cards.map(card =>
        card.id === editCard.id ? editCard : card
      ),
    }));

    setColumns(newColumns);

    setSelectedCard(null);
    setEditCard(null);

  }

  function deleteCard() {

    if (!editCard) return;

    const newColumns = columns.map(column => ({
      ...column,
      cards: column.cards.filter(
        card => card.id !== editCard.id
      ),
    }));

    setColumns(newColumns);

    setSelectedCard(null);
    setEditCard(null);

  }

  function addColumn() {

    const name = prompt("Nom de la colonne :");

    if (!name) return;

    const newColumn: Column = {

      id: crypto.randomUUID(),
      name,
      cards: [],

    };

    setColumns([...columns, newColumn]);

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
        card => card.id === activeId
      );

      if (cardIndex !== -1) {

        sourceColumnIndex = colIndex;
        sourceCardIndex = cardIndex;

      }

    });

    if (sourceColumnIndex === -1) return;

    const card = columns[sourceColumnIndex].cards[sourceCardIndex];

    const newColumns = [...columns];

    newColumns[sourceColumnIndex].cards =
      newColumns[sourceColumnIndex].cards.filter(
        c => c.id !== activeId
      );

    const destIndex =
      newColumns.findIndex(col => col.id === overColumnId);

    if (destIndex !== -1) {

      newColumns[destIndex].cards.push(card);

    }

    setColumns(newColumns);

  }

  return (
    <div style={{ padding: 20 }}>

      <button onClick={goBack}>
        ← Retour aux boards
      </button>

      <h1>{board.name}</h1>

      <button
        onClick={addColumn}
        style={{ marginBottom: "15px" }}
      >
        + Ajouter une colonne
      </button>

      <DndContext onDragEnd={handleDragEnd}>

        <div className="kanban-board">

          {columns.map(col => (
            <DroppableColumn
              key={col.id}
              column={col}
              onAddCard={addCard}
              onCardClick={handleCardClick}
            />
          ))}

        </div>

      </DndContext>

      <Modal
        isOpen={selectedCard !== null}
        onClose={() => {
          setSelectedCard(null);
          setEditCard(null);
        }}
      >

        {editCard && (

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>

            <label>Titre</label>

            <input
              value={editCard.title}
              onChange={(e) =>
                setEditCard({
                  ...editCard,
                  title: e.target.value,
                })
              }
            />

            <label>Description</label>

            <textarea
              value={editCard.description}
              onChange={(e) =>
                setEditCard({
                  ...editCard,
                  description: e.target.value,
                })
              }
            />

            <label>Date</label>

            <input
              type="date"
              value={editCard.dueDate}
              onChange={(e) =>
                setEditCard({
                  ...editCard,
                  dueDate: e.target.value,
                })
              }
            />

            <label>Labels</label>

            <input
              value={editCard.labels?.join(",") || ""}
              onChange={(e) =>
                setEditCard({
                  ...editCard,
                  labels: e.target.value
                    .split(",")
                    .map(l => l.trim()),
                })
              }
            />

            <div style={{ display: "flex", gap: "10px" }}>

              <button onClick={saveCard}>
                Sauvegarder
              </button>

              <button
                onClick={deleteCard}
                style={{ background: "#dc2626" }}
              >
                Supprimer
              </button>

            </div>

          </div>

        )}

      </Modal>

    </div>
  );
}