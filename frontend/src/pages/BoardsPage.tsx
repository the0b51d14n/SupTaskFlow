import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  LayoutGrid,
  Plus,
  Trash2,
} from "lucide-react";

interface Board {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  cardCount: number;
  columnCount: number;
}

const MOCK_BOARDS: Board[] = [
  {
    id: "1",
    name: "Sprint 1",
    description: "First sprint tasks",
    createdAt: "2026-02-01",
    cardCount: 12,
    columnCount: 3,
  },
  {
    id: "2",
    name: "Website Redesign",
    description: "UI/UX improvements",
    createdAt: "2026-01-15",
    cardCount: 8,
    columnCount: 4,
  },
  {
    id: "3",
    name: "Backend API",
    description: "REST API development",
    createdAt: "2026-01-20",
    cardCount: 15,
    columnCount: 3,
  },
  {
    id: "4",
    name: "Marketing Campaign",
    description: "Q1 marketing initiatives",
    createdAt: "2026-02-05",
    cardCount: 6,
    columnCount: 2,
  },
];

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>(MOCK_BOARDS);
  const [newBoardName, setNewBoardName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

  const handleCreateBoard = () => {
    if (!newBoardName.trim()) return;

    const newBoard: Board = {
      id: Math.random().toString(),
      name: newBoardName,
      description: "",
      createdAt: new Date().toISOString().split("T")[0],
      cardCount: 0,
      columnCount: 0,
    };

    setBoards([...boards, newBoard]);
    setNewBoardName("");
    setShowCreateForm(false);
  };

  const handleDeleteBoard = (id: string) => {
    setBoards(boards.filter(board => board.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mes boards</h2>
          <p className="text-gray-600 mt-1">{boards.length} board{boards.length > 1 ? "s" : ""} à gérer</p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          Nouveau board
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer un nouveau board</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nom du board"
              value={newBoardName}
              onChange={e => setNewBoardName(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleCreateBoard()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
            <button
              onClick={handleCreateBoard}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer"
            >
              Créer
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {boards.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full mb-4">
            <LayoutGrid size={28} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun board</h3>
          <p className="text-gray-600 mb-6">Créez votre premier board pour commencer à organiser vos tâches</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Créer un board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map(board => (
            <Link
              key={board.id}
              to={`/board/${board.id}`}
              className="bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer group no-underline text-inherit block"
            >
              <div className="px-4 py-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-1">
                  {board.name}
                </h3>

                {board.description && (
                  <p className="text-sm text-gray-600 mb-3">{board.description}</p>
                )}

                <div className="flex gap-4 mb-4 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold text-gray-900">{board.cardCount}</span>
                    <span> tâches</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">{board.columnCount}</span>
                    <span> colonnes</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    {formatDate(board.createdAt)}
                  </p>
                  <button
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      setBoardToDelete(board);
                    }}
                    className="p-1.5 cursor-pointer hover:bg-red-50 hover:text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {boardToDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-sm rounded-lg border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-gray-600 mb-5">
              Supprimer le board <span className="font-semibold text-gray-800">{boardToDelete.name}</span> ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBoardToDelete(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  handleDeleteBoard(boardToDelete.id);
                  setBoardToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}