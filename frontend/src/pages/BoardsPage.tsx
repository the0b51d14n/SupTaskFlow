import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Plus, Trash2, CalendarDays } from 'lucide-react';
import { getBoards, createBoard, deleteBoard } from '../api/strapiApi';
import { useToast } from '../components/Toast';
import type { Board } from '../types';

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadBoards();
  }, []);

  async function loadBoards() {
    setLoading(true);
    try {
      const data = await getBoards();
      setBoards(data);
    } catch {
      addToast('error', 'Impossible de charger les tableaux.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    setCreating(true);
    try {
      const board = await createBoard(newBoardName.trim());
      setBoards((prev) => [...prev, board]);
      setNewBoardName('');
      setShowCreateForm(false);
      addToast('success', 'Tableau créé avec succès.');
    } catch {
      addToast('error', 'Impossible de créer le tableau.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteBoard() {
    if (!boardToDelete) return;
    setDeleting(true);
    try {
      await deleteBoard(boardToDelete.documentId);
      setBoards((prev) => prev.filter((b) => b.documentId !== boardToDelete.documentId));
      setBoardToDelete(null);
      addToast('success', 'Tableau supprimé.');
    } catch {
      addToast('error', 'Impossible de supprimer le tableau.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="w-8 h-8 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const totalCards = boards.reduce(
    (sum, b) => sum + b.columns.reduce((s, c) => s + c.cards.length, 0),
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Mes tableaux</h2>
          <p className="text-gray-500 mt-1 text-sm">
            {boards.length} tableau{boards.length !== 1 ? 'x' : ''} &middot; {totalCards} carte{totalCards !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm cursor-pointer flex-shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Nouveau tableau</span>
          <span className="sm:hidden">Nouveau</span>
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full mb-4">
            <LayoutGrid size={28} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun tableau</h3>
          <p className="text-gray-500 mb-6">
            Créez votre premier tableau Kanban pour organiser vos tâches.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus size={18} />
            Créer un tableau
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map((board) => {
            const cardCount = board.columns.reduce((s, c) => s + c.cards.length, 0);
            return (
              <Link
                key={board.documentId}
                to={`/board/${board.documentId}`}
                className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all block group"
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {board.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setBoardToDelete(board);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-500 mt-auto pt-3 border-t border-gray-100">
                    <span>
                      <strong className="text-gray-800">{board.columns.length}</strong> colonne{board.columns.length !== 1 ? 's' : ''}
                    </span>
                    <span>
                      <strong className="text-gray-800">{cardCount}</strong> carte{cardCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Nouveau tableau</h2>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Nom du tableau"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setNewBoardName(''); }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {creating ? (
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

      {boardToDelete && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Supprimer le tableau</h2>
            <p className="text-sm text-gray-600 mb-6">
              Voulez-vous vraiment supprimer{' '}
              <strong>"{boardToDelete.name}"</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setBoardToDelete(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteBoard}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Suppression...
                  </>
                ) : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
