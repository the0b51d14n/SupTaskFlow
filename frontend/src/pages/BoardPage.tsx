import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, CalendarDays, Pencil, Plus, Trash2, Check, X } from 'lucide-react';
import {
  getBoardById,
  createColumn,
  updateColumn,
  deleteColumn,
  createCard,
  updateCard,
  deleteCard,
} from '../api/strapiApi';
import { useToast } from '../components/Toast';
import type { Board, Column, Card } from '../types';

const LABEL_COLORS: Record<string, string> = {
  bug: 'bg-red-100 text-red-800',
  feature: 'bg-blue-100 text-blue-800',
  urgent: 'bg-orange-100 text-orange-800',
  design: 'bg-purple-100 text-purple-800',
  backend: 'bg-green-100 text-green-800',
  frontend: 'bg-cyan-100 text-cyan-800',
  test: 'bg-yellow-100 text-yellow-800',
};

function labelColor(label: string): string {
  return LABEL_COLORS[label.toLowerCase()] ?? 'bg-indigo-100 text-indigo-800';
}

function dueBadge(dueDate: string): { text: string; cls: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { text: `${Math.abs(diff)}j retard`, cls: 'bg-red-100 text-red-700' };
  if (diff === 0) return { text: "Aujourd'hui", cls: 'bg-orange-100 text-orange-700' };
  if (diff === 1) return { text: 'Demain', cls: 'bg-yellow-100 text-yellow-700' };
  return {
    text: due.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    cls: 'bg-green-100 text-green-700',
  };
}

interface CardBodyProps {
  card: Card;
  onEdit?: () => void;
}

function CardBody({ card, onEdit }: CardBodyProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">{card.title}</p>
        {onEdit && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>
      {card.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{card.description}</p>
      )}
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label) => (
            <span
              key={label}
              className={`text-xs px-1.5 py-0.5 rounded font-medium ${labelColor(label)}`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
      {card.dueDate && (
        <div className="flex items-center gap-1">
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1 ${dueBadge(card.dueDate).cls}`}
          >
            <CalendarDays size={11} />
            {dueBadge(card.dueDate).text}
          </span>
        </div>
      )}
    </div>
  );
}

interface SortableCardProps {
  card: Card;
  onEdit: () => void;
}

function SortableCard({ card, onEdit }: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.documentId });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
      className="group cursor-grab active:cursor-grabbing"
    >
      <CardBody card={card} onEdit={onEdit} />
    </div>
  );
}

interface DroppableColumnProps {
  column: Column;
  onAddCard: () => void;
  onEditCard: (card: Card) => void;
  onRenameStart: () => void;
  onDeleteColumn: () => void;
  isRenaming: boolean;
  renameValue: string;
  onRenameChange: (v: string) => void;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
}

function DroppableColumn({
  column,
  onAddCard,
  onEditCard,
  onRenameStart,
  onDeleteColumn,
  isRenaming,
  renameValue,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${column.documentId}` });

  return (
    <div
      className={`bg-gray-100 rounded-xl p-3 min-w-70 max-w-70 sm:min-w-75 sm:max-w-75 flex flex-col gap-2 shrink-0 border transition-colors ${
        isOver ? 'border-indigo-400 bg-indigo-50' : 'border-transparent'
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        {isRenaming ? (
          <form
            onSubmit={(e) => { e.preventDefault(); onRenameSubmit(); }}
            className="flex items-center gap-1 flex-1"
          >
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              className="flex-1 text-sm font-bold border border-indigo-400 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button type="submit" className="text-green-600 hover:text-green-700 cursor-pointer">
              <Check size={14} />
            </button>
            <button type="button" onClick={onRenameCancel} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={14} />
            </button>
          </form>
        ) : (
          <>
            <button
              onDoubleClick={onRenameStart}
              title="Double-cliquer pour renommer"
              className="text-sm font-bold text-gray-800 truncate flex-1 text-left cursor-default select-none"
            >
              {column.name}
            </button>
            <span className="text-xs text-gray-500 font-medium bg-white border border-gray-200 px-1.5 py-0.5 rounded-full shrink-0">
              {column.cards.length}
            </span>
            <button
              onClick={onRenameStart}
              title="Renommer"
              className="text-gray-400 hover:text-indigo-500 transition-colors cursor-pointer shrink-0"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onDeleteColumn}
              title="Supprimer la colonne"
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>

      <div ref={setNodeRef} className="flex flex-col gap-2 min-h-10">
        <SortableContext
          items={column.cards.map((c) => c.documentId)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <SortableCard key={card.documentId} card={card} onEdit={() => onEditCard(card)} />
          ))}
        </SortableContext>
      </div>

      <button
        onClick={onAddCard}
        className="flex items-center justify-center gap-1.5 text-xs text-indigo-600 hover:bg-indigo-100 rounded-lg py-2 px-3 font-semibold transition-colors border border-dashed border-indigo-300 cursor-pointer mt-1"
      >
        <Plus size={14} />
        Ajouter une carte
      </button>
    </div>
  );
}

interface CardForm {
  title: string;
  description: string;
  dueDate: string;
  labelsInput: string;
}

const EMPTY_FORM: CardForm = { title: '', description: '', dueDate: '', labelsInput: '' };

export default function BoardPage() {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);

  const colsRef = useRef<Column[]>([]);
  colsRef.current = columns;
  const prevCols = useRef<Column[]>([]);
  const fromColRef = useRef<string | null>(null);

  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const [showColForm, setShowColForm] = useState(false);
  const [colName, setColName] = useState('');
  const [addingCol, setAddingCol] = useState(false);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const [colToDelete, setColToDelete] = useState<string | null>(null);

  const [cardModal, setCardModal] = useState<{
    mode: 'create' | 'edit';
    columnId: string;
    card?: Card;
  } | null>(null);
  const [cardForm, setCardForm] = useState<CardForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingCard, setDeletingCard] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    if (boardId) loadBoard();
  }, [boardId]);

  async function loadBoard() {
    setLoading(true);
    try {
      const data = await getBoardById(boardId!);
      setBoard(data);
      setColumns(data.columns);
    } catch {
      addToast('error', 'Impossible de charger le tableau.');
    } finally {
      setLoading(false);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    const card = colsRef.current.flatMap((c) => c.cards).find((c) => c.documentId === id);
    if (!card) return;
    setActiveCard(card);
    prevCols.current = colsRef.current.map((c) => ({ ...c, cards: [...c.cards] }));
    const srcCol = colsRef.current.find((c) => c.cards.some((cd) => cd.documentId === id));
    fromColRef.current = srcCol?.documentId ?? null;
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    setColumns((prev) => {
      const cols = prev.map((c) => ({ ...c, cards: [...c.cards] }));
      const srcIdx = cols.findIndex((c) => c.cards.some((cd) => cd.documentId === activeId));
      if (srcIdx === -1) return prev;

      const isOverCol = overId.startsWith('col-');
      const tgtColDocId = isOverCol
        ? overId.slice(4)
        : cols.find((c) => c.cards.some((cd) => cd.documentId === overId))?.documentId;

      if (!tgtColDocId) return prev;
      const tgtIdx = cols.findIndex((c) => c.documentId === tgtColDocId);
      if (tgtIdx === -1) return prev;

      const srcCardIdx = cols[srcIdx].cards.findIndex((cd) => cd.documentId === activeId);

      if (srcIdx === tgtIdx) {
        if (isOverCol) return prev;
        const overCardIdx = cols[tgtIdx].cards.findIndex((cd) => cd.documentId === overId);
        if (overCardIdx === -1 || srcCardIdx === overCardIdx) return prev;
        cols[tgtIdx].cards = arrayMove(cols[tgtIdx].cards, srcCardIdx, overCardIdx);
        return cols;
      }

      const [movedCard] = cols[srcIdx].cards.splice(srcCardIdx, 1);
      const overCardIdx = isOverCol
        ? cols[tgtIdx].cards.length
        : cols[tgtIdx].cards.findIndex((cd) => cd.documentId === overId);
      cols[tgtIdx].cards.splice(overCardIdx >= 0 ? overCardIdx : cols[tgtIdx].cards.length, 0, movedCard);
      return cols;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const activeId = event.active.id as string;
    const srcColId = fromColRef.current;
    setActiveCard(null);
    fromColRef.current = null;

    if (!srcColId) return;

    const currentCols = colsRef.current;
    const newCol = currentCols.find((c) => c.cards.some((cd) => cd.documentId === activeId));
    if (!newCol) return;

    const columnChanged = newCol.documentId !== srcColId;
    const affectedIds = new Set([srcColId, newCol.documentId]);

    try {
      const updates: Promise<any>[] = [];
      for (const col of currentCols) {
        if (!affectedIds.has(col.documentId)) continue;
        col.cards.forEach((card, index) => {
          updates.push(
            updateCard(card.documentId, {
              order: index * 1000,
              ...(card.documentId === activeId && columnChanged ? { column: col.documentId } : {}),
            })
          );
        });
      }
      await Promise.all(updates);
      setColumns((prev) =>
        prev.map((col) => {
          if (!affectedIds.has(col.documentId)) return col;
          return { ...col, cards: col.cards.map((card, i) => ({ ...card, order: i * 1000 })) };
        })
      );
    } catch {
      setColumns(prevCols.current);
      addToast('error', 'Impossible de déplacer la carte. Position restaurée.');
    }
  }

  async function addColumn(e: FormEvent) {
    e.preventDefault();
    if (!colName.trim() || !boardId) return;
    setAddingCol(true);
    try {
      const col = await createColumn(boardId, colName.trim(), columns.length * 1000);
      setColumns((prev) => [...prev, { ...col, cards: [] }]);
      setColName('');
      setShowColForm(false);
      addToast('success', 'Colonne créée.');
    } catch {
      addToast('error', 'Impossible de créer la colonne.');
    } finally {
      setAddingCol(false);
    }
  }

  function startRename(col: Column) {
    setRenamingId(col.documentId);
    setRenameValue(col.name);
  }

  async function saveRename() {
    if (!renamingId || !renameValue.trim()) { setRenamingId(null); return; }
    const original = columns.find((c) => c.documentId === renamingId)?.name;
    if (renameValue.trim() === original) { setRenamingId(null); return; }
    setColumns((prev) =>
      prev.map((c) => (c.documentId === renamingId ? { ...c, name: renameValue.trim() } : c))
    );
    setRenamingId(null);
    try {
      await updateColumn(renamingId, { name: renameValue.trim() });
      addToast('success', 'Colonne renommée.');
    } catch {
      setColumns((prev) =>
        prev.map((c) => (c.documentId === renamingId ? { ...c, name: original ?? c.name } : c))
      );
      addToast('error', 'Impossible de renommer la colonne.');
    }
  }

  async function removeColumn(colId: string) {
    setColumns((prev) => prev.filter((c) => c.documentId !== colId));
    setColToDelete(null);
    try {
      await deleteColumn(colId);
      addToast('success', 'Colonne supprimée.');
    } catch {
      addToast('error', 'Impossible de supprimer la colonne.');
      loadBoard();
    }
  }

  function openNewCard(columnId: string) {
    setCardModal({ mode: 'create', columnId });
    setCardForm(EMPTY_FORM);
  }

  function openCard(card: Card, columnId: string) {
    setCardModal({ mode: 'edit', columnId, card });
    setCardForm({
      title: card.title,
      description: card.description ?? '',
      dueDate: card.dueDate ?? '',
      labelsInput: card.labels?.join(', ') ?? '',
    });
  }

  function closeCard() {
    setCardModal(null);
    setCardForm(EMPTY_FORM);
  }

  function parseLabels(input: string): string[] {
    return input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  async function saveCard(e: FormEvent) {
    e.preventDefault();
    if (!cardForm.title.trim() || !cardModal) return;
    setSaving(true);
    const labels = parseLabels(cardForm.labelsInput);
    try {
      if (cardModal.mode === 'create') {
        const col = columns.find((c) => c.documentId === cardModal.columnId);
        const order = (col?.cards.length ?? 0) * 1000;
        const card = await createCard(cardModal.columnId, {
          title: cardForm.title.trim(),
          description: cardForm.description.trim() || undefined,
          dueDate: cardForm.dueDate || undefined,
          labels: labels.length > 0 ? labels : undefined,
          order,
        });
        setColumns((prev) =>
          prev.map((c) =>
            c.documentId === cardModal.columnId ? { ...c, cards: [...c.cards, card] } : c
          )
        );
        addToast('success', 'Carte créée.');
      } else if (cardModal.card) {
        const updated = await updateCard(cardModal.card.documentId, {
          title: cardForm.title.trim(),
          description: cardForm.description.trim() || null,
          dueDate: cardForm.dueDate || null,
          labels: labels.length > 0 ? labels : null,
        });
        setColumns((prev) =>
          prev.map((c) => ({
            ...c,
            cards: c.cards.map((cd) => (cd.documentId === updated.documentId ? updated : cd)),
          }))
        );
        addToast('success', 'Carte mise à jour.');
      }
      closeCard();
    } catch {
      addToast('error', 'Impossible de sauvegarder la carte.');
    } finally {
      setSaving(false);
    }
  }

  async function removeCard() {
    if (!cardModal?.card) return;
    const { documentId } = cardModal.card;
    setDeletingCard(documentId);
    try {
      await deleteCard(documentId);
      setColumns((prev) =>
        prev.map((c) => ({ ...c, cards: c.cards.filter((cd) => cd.documentId !== documentId) }))
      );
      closeCard();
      addToast('success', 'Carte supprimée.');
    } catch {
      addToast('error', 'Impossible de supprimer la carte.');
    } finally {
      setDeletingCard(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="w-8 h-8 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
        <p className="text-gray-500">Tableau introuvable.</p>
        <button onClick={() => navigate('/boards')} className="text-indigo-600 hover:underline text-sm cursor-pointer">
          Retour aux tableaux
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-5 border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={() => navigate('/boards')}
          className="text-gray-500 hover:text-indigo-600 font-medium mb-3 inline-flex items-center gap-1.5 transition-colors text-sm cursor-pointer"
        >
          <ArrowLeft size={15} />
          Retour aux tableaux
        </button>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 truncate">{board.name}</h1>
          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-gray-900">
              {columns.reduce((acc, c) => acc + c.cards.length, 0)}
            </div>
            <div className="text-xs text-gray-500">tâches</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => { setActiveCard(null); fromColRef.current = null; }}
        >
          <div className="flex gap-4 min-h-full pb-4 items-start">
            {columns.map((col) => (
              <DroppableColumn
                key={col.documentId}
                column={col}
              onAddCard={() => openNewCard(col.documentId)}
              onEditCard={(card) => openCard(card, col.documentId)}
              onRenameStart={() => startRename(col)}
              onDeleteColumn={() => setColToDelete(col.documentId)}
              isRenaming={renamingId === col.documentId}
              renameValue={renameValue}
              onRenameChange={setRenameValue}
              onRenameSubmit={saveRename}
              onRenameCancel={() => setRenamingId(null)}
              />
            ))}

            <div className="shrink-0">
              <button
                onClick={() => setShowColForm(true)}
                className="min-w-70 sm:min-w-75 h-24 bg-gray-100/80 hover:bg-white border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                Ajouter une colonne
              </button>
            </div>
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="shadow-2xl rotate-1 scale-105">
                <CardBody card={activeCard} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {showColForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Nouvelle colonne</h2>
            <form onSubmit={addColumn} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={colName}
                onChange={(e) => setColName(e.target.value)}
                placeholder="Nom de la colonne"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowColForm(false); setColName(''); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addingCol}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {addingCol ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Création...
                    </>
                  ) : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {colToDelete && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Supprimer la colonne</h2>
            <p className="text-sm text-gray-600 mb-6">
              Toutes les cartes de cette colonne seront supprimées. Cette action est irréversible.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setColToDelete(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => removeColumn(colToDelete)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {cardModal && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {cardModal.mode === 'create' ? 'Nouvelle carte' : 'Modifier la carte'}
            </h2>
            <form onSubmit={saveCard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  autoFocus
                  value={cardForm.title}
                  onChange={(e) => setCardForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  placeholder="Titre de la carte"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  value={cardForm.description}
                  onChange={(e) => setCardForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Description (optionnelle)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Date limite
                  </label>
                  <input
                    type="date"
                    value={cardForm.dueDate}
                    onChange={(e) => setCardForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Labels <span className="font-normal text-gray-400">(virgule)</span>
                  </label>
                  <input
                    type="text"
                    value={cardForm.labelsInput}
                    onChange={(e) => setCardForm((f) => ({ ...f, labelsInput: e.target.value }))}
                    placeholder="bug, feature, urgent..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {cardForm.labelsInput.trim() && (
                <div className="flex flex-wrap gap-1">
                  {parseLabels(cardForm.labelsInput).map((label) => (
                    <span
                      key={label}
                      className={`text-xs px-2 py-0.5 rounded font-medium ${labelColor(label)}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-2">
                {cardModal.mode === 'edit' && cardModal.card ? (
                  <button
                    type="button"
                    onClick={removeCard}
                    disabled={deletingCard === cardModal.card.documentId}
                    className="text-red-600 hover:bg-red-50 text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeCard}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Enregistrement...
                      </>
                    ) : cardModal.mode === 'create' ? 'Créer' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}