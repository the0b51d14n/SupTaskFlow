import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";

import { arrayMove } from "@dnd-kit/sortable";
import { useState } from "react";
import Modal from "../components/Modal";
import { strapiApi } from "../api/strapiApi";
import "../styles/kanban.css";

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
      style={style}
      onClick={() => onClick(card)}
    >

      <div
        {...listeners}
        {...attributes}
        className="drag-handle"
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </div>

      <strong>{card.title}</strong>

      {card.description && (
        <div className="card-description">
          {card.description}
        </div>
      )}

      {card.dueDate && (
        <div className="card-date">
          📅 {card.dueDate}
        </div>
      )}

      {card.labels && card.labels.length > 0 && (
        <div className="card-labels">
          {card.labels.map((label, i) => (
            <span key={i} className="card-label">
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
  onRenameColumn,
  onDeleteColumn,
}: {
  column: Column;
  onAddCard: (columnId: string, title: string) => void;
  onCardClick: (card: Card) => void;
  onRenameColumn: (columnId: string, name: string) => void;
  onDeleteColumn: (columnId: string) => void;
}) {

  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  function handleRename() {

    const name = prompt(
      "Nouveau nom",
      column.name
    );

    if (name)
      onRenameColumn(
        column.id,
        name
      );

  }

  function handleDelete() {

    if (
      confirm(
        "Supprimer cette colonne ?"
      )
    )
      onDeleteColumn(
        column.id
      );

  }

  function handleAddCard() {

    const title = prompt(
      "Nom de la tâche"
    );

    if (title)
      onAddCard(
        column.id,
        title
      );

  }

  return (

    <div
      ref={setNodeRef}
      className="column"
    >

      <div className="column-header">

        <h3
          className="column-title"
          onClick={handleRename}
        >
          {column.name}
        </h3>

        <button
          type="button"
          className="column-delete-btn"
          onClick={handleDelete}
        >
          ✕
        </button>

      </div>

      <button
        type="button"
        className="add-card-btn"
        onClick={handleAddCard}
      >
        + Ajouter une carte
      </button>

      {(column.cards ?? []).map(card => (

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

  const [columns, setColumns] =
    useState(
      board.columns.map(col => ({
        ...col,
        cards: col.cards ?? [],
      }))
    );

  const [selectedCard, setSelectedCard] =
    useState<Card | null>(null);

  const [editCard, setEditCard] =
    useState<Card | null>(null);

  async function addCard(
    columnId: string,
    title: string
  ) {

    try {

      const newCard =
        await strapiApi.createCard(
          columnId,
          title
        );

      setColumns(cols =>
        cols.map(col =>
          col.id === columnId
            ? {
                ...col,
                cards: [
                  ...col.cards,
                  newCard,
                ],
              }
            : col
        )
      );

    } catch (error) {

      console.error(error);

    }

  }

  async function saveCard() {

    if (!editCard)
      return;

    try {

      const updated =
        await strapiApi.updateCard(
          editCard
        );

      setColumns(cols =>
        cols.map(col => ({
          ...col,
          cards:
            col.cards.map(
              card =>
                card.id ===
                updated.id
                  ? updated
                  : card
            ),
        }))
      );

      closeModal();

    } catch (error) {

      console.error(error);

    }

  }

  async function deleteCard() {

    if (!editCard)
      return;

    try {

      await strapiApi.deleteCard(
        editCard.id
      );

      setColumns(cols =>
        cols.map(col => ({
          ...col,
          cards:
            col.cards.filter(
              card =>
                card.id !==
                editCard.id
            ),
        }))
      );

      closeModal();

    } catch (error) {

      console.error(error);

    }

  }

  function handleCardClick(card: Card) {

    setSelectedCard(card);

    setEditCard({
      ...card,
    });

  }

  function closeModal() {

    setSelectedCard(null);

    setEditCard(null);

  }

  async function addColumn() {

    const name = prompt(
      "Nom de la colonne"
    );

    if (!name)
      return;

    try {

      const newColumn =
        await strapiApi.createColumn(
          board.id,
          name
        );

      setColumns(cols => [
        ...cols,
        {
          id: newColumn.id,
          name: newColumn.name,
          cards:
            newColumn.cards ?? [],
        },
      ]);

    } catch (error) {

      console.error(error);

    }

  }

  function handleDragEnd(
    event: DragEndEvent
  ) {

    const {
      active,
      over,
    } = event;

    if (!over)
      return;

    const activeId =
      active.id as string;

    const overId =
      over.id as string;

    let sourceColumnIndex =
      -1;

    let destinationColumnIndex =
      -1;

    let sourceCardIndex =
      -1;

    let destinationCardIndex =
      -1;

    columns.forEach(
      (col, colIndex) => {

        const activeIndex =
          col.cards.findIndex(
            card =>
              card.id ===
              activeId
          );

        if (activeIndex !== -1) {

          sourceColumnIndex =
            colIndex;

          sourceCardIndex =
            activeIndex;

        }

        const overIndex =
          col.cards.findIndex(
            card =>
              card.id ===
              overId
          );

        if (overIndex !== -1) {

          destinationColumnIndex =
            colIndex;

          destinationCardIndex =
            overIndex;

        }

        if (col.id === overId) {

          destinationColumnIndex =
            colIndex;

          destinationCardIndex =
            col.cards.length;

        }

      }
    );

    if (sourceColumnIndex === -1)
      return;

    const newColumns =
      [...columns];

    if (
      sourceColumnIndex ===
      destinationColumnIndex
    ) {

      newColumns[
        sourceColumnIndex
      ].cards =
        arrayMove(
          newColumns[
            sourceColumnIndex
          ].cards,
          sourceCardIndex,
          destinationCardIndex
        );

    } else {

      const movingCard =
        newColumns[
          sourceColumnIndex
        ].cards[
          sourceCardIndex
        ];

      newColumns[
        sourceColumnIndex
      ].cards.splice(
        sourceCardIndex,
        1
      );

      newColumns[
        destinationColumnIndex
      ].cards.splice(
        destinationCardIndex,
        0,
        movingCard
      );

    }

    setColumns(
      newColumns
    );

  }

  return (

    <div className="board-container">

      <div className="board-header">

        <button
          type="button"
          className="back-btn"
          onClick={goBack}
        >
          ← Retour
        </button>

        <h1 className="board-title">
          {board.name}
        </h1>

      </div>

      <div className="board-actions">

        <button
          type="button"
          className="add-column-btn"
          onClick={addColumn}
        >
          + Ajouter une colonne
        </button>

      </div>

      <DndContext
        onDragEnd={
          handleDragEnd
        }
      >

        <div className="kanban-board">

          {columns.map(
            col => (

              <DroppableColumn
                key={col.id}
                column={col}
                onAddCard={addCard}
                onCardClick={
                  handleCardClick
                }
                onRenameColumn={() => {}}
                onDeleteColumn={() => {}}
              />

            )
          )}

        </div>

      </DndContext>

      <Modal
        isOpen={
          selectedCard !== null
        }
        onClose={closeModal}
      >

        {editCard && (

          <div className="modal-content">

            <div className="modal-header">

              <h2>
                Modifier la carte
              </h2>

              <button
                type="button"
                className="modal-x-btn"
                onClick={
                  closeModal
                }
              >
                ✕
              </button>

            </div>

            <input
              value={
                editCard.title
              }
              onChange={e =>
                setEditCard({
                  ...editCard,
                  title:
                    e.target.value,
                })
              }
            />

            <textarea
              value={
                editCard.description
              }
              onChange={e =>
                setEditCard({
                  ...editCard,
                  description:
                    e.target.value,
                })
              }
            />

            <input
              type="date"
              value={
                editCard.dueDate
              }
              onChange={e =>
                setEditCard({
                  ...editCard,
                  dueDate:
                    e.target.value,
                })
              }
            />

            <input
              value={
                editCard.labels?.join(",") || ""
              }
              onChange={e =>
                setEditCard({
                  ...editCard,
                  labels:
                    e.target.value
                      .split(",")
                      .map(l =>
                        l.trim()
                      ),
                })
              }
            />

            <div className="modal-actions">

              <button
                type="button"
                onClick={
                  saveCard
                }
              >
                Sauvegarder
              </button>

              <button
                type="button"
                className="delete-btn"
                onClick={
                  deleteCard
                }
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
