import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	closestCenter,
	DndContext,
	DragOverlay,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors,
	type DragEndEvent,
	type DragStartEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, CalendarDays, Pencil, Plus } from "lucide-react";

interface Card {
	id: string;
	title: string;
	description?: string;
	dueDate?: string;
	priority?: "low" | "medium" | "high";
}

interface Column {
	id: string;
	name: string;
	cards: Card[];
}

interface CardFormData {
	title: string;
	description: string;
	dueDate: string;
	priority: "" | "low" | "medium" | "high";
}

const MOCK_BOARD: { id: string; name: string; columns: Column[] } = {
	id: "1",
	name: "Sprint 1 - Développement",
	columns: [
		{
			id: "col-1",
			name: "À faire",
			cards: [
				{
					id: "card-1",
					title: "Implémenter authentification",
					description: "Ajouter le système de login",
					priority: "high",
				},
				{
					id: "card-2",
					title: "Design de la page d'accueil",
					description: "Créer les maquettes",
					dueDate: "2026-02-18",
					priority: "medium",
				},
				{
					id: "card-7",
					title: "Lister les besoins du client",
				},
				{
					id: "card-8",
					title: "Préparer la réunion d'équipe",
				},
			],
		},
		{
			id: "col-2",
			name: "En cours",
			cards: [
				{
					id: "card-3",
					title: "API REST - GET /boards",
					description: "Endpoint pour récupérer les boards",
					dueDate: "2026-02-19",
					priority: "high",
				},
				{
					id: "card-4",
					title: "Base de données - Schéma",
					description: "Créer les tables",
					dueDate: "2026-02-17",
					priority: "medium",
				},
				{
					id: "card-9",
					title: "Corriger les retours du prof",
				},
			],
		},
		{
			id: "col-3",
			name: "Fait",
			cards: [
				{
					id: "card-5",
					title: "Setup du projet",
					description: "Project initialization",
					dueDate: "2026-02-01",
					priority: "high",
				},
				{
					id: "card-6",
					title: "Configuration Tailwind CSS",
					description: "Intégrer Tailwind au projet",
					dueDate: "2026-02-02",
					priority: "low",
				},
				{
					id: "card-10",
					title: "Démo validée en classe",
				},
			],
		},
	],
};

function CardBody({ card, onEdit }: { card: Card; onEdit?: (card: Card) => void }) {
	const priorityConfig = {
		high: "bg-red-50 border-red-200",
		medium: "bg-yellow-50 border-yellow-200",
		low: "bg-green-50 border-green-200"
	};

	const config = card.priority
		? priorityConfig[card.priority]
		: "bg-white border-gray-200";

	return (
		<div className={`p-4 rounded-lg border ${config}`}>
			<div className={`relative ${(card.description || card.dueDate) ? "mb-2" : "mb-0"}`}>
				<h4 className="font-semibold text-sm text-gray-900 line-clamp-2 pr-8">
					{card.title}
				</h4>
				{onEdit && (
					<button
						type="button"
						onPointerDown={event => event.stopPropagation()}
						onClick={event => {
							event.stopPropagation();
							onEdit(card);
						}}
						className="absolute top-0 right-0 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
						title="Modifier"
					>
						<Pencil size={14} />
					</button>
				)}
			</div>
			{card.description && (
				<p className={`text-xs text-gray-600 ${card.dueDate ? "mb-3" : "mb-0"} line-clamp-2`}>
					{card.description}
				</p>
			)}
			{card.dueDate && (
				<div className="flex items-center">
					<span className="text-xs text-gray-500 font-medium inline-flex items-center gap-1.5">
						<CalendarDays size={13} />
						{card.dueDate}
					</span>
				</div>
			)}
		</div>
	);
}

function SortableCard({ card, onEditCard }: { card: Card; onEditCard: (card: Card) => void }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: card.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="group cursor-grab active:cursor-grabbing transition-transform"
		>
			<div className="hover:shadow-lg hover:-translate-y-0.5 transition-all">
				<CardBody card={card} onEdit={onEditCard} />
			</div>
		</div>
	);
}

function DroppableColumn({ column, onAddCard, onEditCard }: { column: Column; onAddCard: (columnId: string) => void; onEditCard: (card: Card) => void }) {
	const { setNodeRef, isOver } = useDroppable({
		id: column.id,
	});

	return (
		<div
			className={`bg-white rounded-lg p-4 min-w-72 max-w-72 h-fit shrink-0 border transition-colors ${
				isOver ? "border-indigo-300 bg-indigo-50" : "border-gray-200"
			}`}
		>
			<div className="mb-3 pb-3 border-b border-gray-200">
				<h3 className="font-bold text-gray-900 text-base mb-1">{column.name}</h3>
				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full border border-gray-200">
						{column.cards.length}
					</span>
					<span className="text-xs text-gray-600">
						tâche{column.cards.length > 1 ? "s" : ""}
					</span>
				</div>
			</div>

			<div ref={setNodeRef} className="space-y-3 min-h-16 mb-3">
				<SortableContext
					items={column.cards.map(card => card.id)}
					strategy={verticalListSortingStrategy}
				>
					{column.cards.map(card => (
						<SortableCard key={card.id} card={card} onEditCard={onEditCard} />
					))}
				</SortableContext>
			</div>

			<button 
				onClick={() => onAddCard(column.id)}
				className="w-full py-2.5 px-3 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold transition-colors border border-dashed border-indigo-300 cursor-pointer inline-flex items-center justify-center gap-1.5">
				<Plus size={15} />
				Ajouter une carte
			</button>
		</div>
	);
}

export default function BoardPage() {
	const navigate = useNavigate();
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	);
	const [columns, setColumns] = useState<Column[]>(MOCK_BOARD.columns);
	const [activeCard, setActiveCard] = useState<Card | null>(null);
	const [newCardColumnId, setNewCardColumnId] = useState<string | null>(null);
	const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
	const [cardForm, setCardForm] = useState<CardFormData>({
		title: "",
		description: "",
		dueDate: "",
		priority: "",
	});
	const [showNewColumnForm, setShowNewColumnForm] = useState(false);
	const [newColumnName, setNewColumnName] = useState("");

	function closeCardModal() {
		setCardForm({
			title: "",
			description: "",
			dueDate: "",
			priority: "",
		});
		setCardToEdit(null);
		setNewCardColumnId(null);
	}

	function startAddCard(columnId: string) {
		setCardToEdit(null);
		setCardForm({
			title: "",
			description: "",
			dueDate: "",
			priority: "",
		});
		setNewCardColumnId(columnId);
	}

	function startEditCard(card: Card) {
		setNewCardColumnId(null);
		setCardToEdit(card);
		setCardForm({
			title: card.title,
			description: card.description ?? "",
			dueDate: card.dueDate ?? "",
			priority: card.priority ?? "",
		});
	}

	function saveCard() {
		if (!cardForm.title.trim()) return;

		if (cardToEdit) {
			setColumns(cols =>
				cols.map(col => ({
					...col,
					cards: col.cards.map(card =>
						card.id === cardToEdit.id
							? {
								...card,
								title: cardForm.title.trim(),
								description: cardForm.description.trim() || undefined,
								dueDate: cardForm.dueDate || undefined,
								priority: cardForm.priority || undefined,
							}
							: card
					),
				}))
			);
			closeCardModal();
			return;
		}

		if (!newCardColumnId) return;

		const newCard: Card = {
			id: `card-${Date.now()}`,
			title: cardForm.title.trim(),
			description: cardForm.description.trim() || undefined,
			dueDate: cardForm.dueDate || undefined,
			priority: cardForm.priority || undefined,
		};

		setColumns(cols =>
			cols.map(col =>
				col.id === newCardColumnId
					? { ...col, cards: [...col.cards, newCard] }
					: col
			)
		);

		closeCardModal();
	}

	function addColumn() {
		if (!newColumnName.trim()) return;

		const newColumn: Column = {
			id: `col-${Date.now()}`,
			name: newColumnName,
			cards: [],
		};

		setColumns([...columns, newColumn]);
		setNewColumnName("");
		setShowNewColumnForm(false);
	}

	function startDrag(event: DragStartEvent) {
		const activeId = event.active.id as string;
		const card = columns
			.flatMap(col => col.cards)
			.find(item => item.id === activeId);
		setActiveCard(card ?? null);
	}

	function endDrag(event: DragEndEvent) {
		const { active, over } = event;

		if (!over) {
			setActiveCard(null);
			return;
		}

		const activeId = active.id as string;
		const overId = over.id as string;

		setColumns(prevColumns => {
			if (activeId === overId) return prevColumns;

			const sourceColumnIndex = prevColumns.findIndex(col =>
				col.cards.some(card => card.id === activeId)
			);

			const targetColumnIndex = prevColumns.findIndex(
				col => col.id === overId || col.cards.some(card => card.id === overId)
			);

			if (sourceColumnIndex === -1 || targetColumnIndex === -1) {
				return prevColumns;
			}

			const sourceCardIndex = prevColumns[sourceColumnIndex].cards.findIndex(
				card => card.id === activeId
			);
			if (sourceCardIndex === -1) return prevColumns;

			const updatedColumns = prevColumns.map(col => ({
				...col,
				cards: [...col.cards],
			}));

			if (sourceColumnIndex === targetColumnIndex) {
				if (overId === updatedColumns[targetColumnIndex].id) {
					if (sourceCardIndex === updatedColumns[targetColumnIndex].cards.length - 1) {
						return prevColumns;
					}
					const [movingCard] = updatedColumns[targetColumnIndex].cards.splice(sourceCardIndex, 1);
					updatedColumns[targetColumnIndex].cards.push(movingCard);
					return updatedColumns;
				}

				const overCardIndex = updatedColumns[targetColumnIndex].cards.findIndex(
					card => card.id === overId
				);

				if (overCardIndex === -1 || sourceCardIndex === overCardIndex) {
					return prevColumns;
				}

				updatedColumns[targetColumnIndex].cards = arrayMove(
					updatedColumns[targetColumnIndex].cards,
					sourceCardIndex,
					overCardIndex
				);
				return updatedColumns;
			}

			const [movingCard] = updatedColumns[sourceColumnIndex].cards.splice(sourceCardIndex, 1);

			const overCardIndex = updatedColumns[targetColumnIndex].cards.findIndex(
				card => card.id === overId
			);

			const destinationIndex =
				overCardIndex === -1
					? updatedColumns[targetColumnIndex].cards.length
					: overCardIndex;

			updatedColumns[targetColumnIndex].cards.splice(destinationIndex, 0, movingCard);

			return updatedColumns;
		});

		setActiveCard(null);
	}

	return (
		<div className="px-0 py-0">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<button
					onClick={() => navigate("/boards")}
					className="text-gray-600 hover:text-indigo-600 font-semibold mb-3 inline-flex items-center gap-2 transition-colors cursor-pointer"
				>
					<ArrowLeft size={16} />
					Retour aux boards
				</button>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-gray-900 mb-1">{MOCK_BOARD.name}</h1>
						<p className="text-gray-600 text-sm">Sprint de développement - Février 2026</p>
					</div>
					<div className="text-right">
						<div className="text-2xl font-bold text-gray-900">
							{columns.reduce((acc, col) => acc + col.cards.length, 0)}
						</div>
						<div className="text-xs text-gray-600">tâches totales</div>
					</div>
				</div>
        </div>
		

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragStart={startDrag}
					onDragEnd={endDrag}
					onDragCancel={() => setActiveCard(null)}
				>
					<div className="flex gap-4 overflow-x-auto pb-5 min-h-80">
						{columns.map(column => (
							<DroppableColumn key={column.id} column={column} onAddCard={startAddCard} onEditCard={startEditCard} />
						))}

						<div className="shrink-0">
							<button 
								onClick={() => setShowNewColumnForm(true)}
								className="w-72 h-28 py-4 px-4 bg-white rounded-lg font-semibold text-indigo-700 transition-colors border border-dashed border-indigo-300 hover:bg-indigo-50 flex items-center justify-center gap-2 cursor-pointer">
								<Plus size={18} />
								<span className="text-sm">Ajouter une colonne</span>
							</button>
						</div>
					</div>

					{showNewColumnForm && (
						<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
							<div className="bg-white rounded-lg p-6 shadow-xl w-96 max-w-full mx-4">
								<h2 className="text-lg font-bold text-gray-900 mb-4">Créer une nouvelle colonne</h2>
								<input
									type="text"
									placeholder="Nom de la colonne"
									value={newColumnName}
									onChange={e => setNewColumnName(e.target.value)}
									onKeyPress={e => e.key === "Enter" && addColumn()}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
									autoFocus
								/>
								<div className="flex gap-3 justify-end">
									<button
										onClick={() => {
											setShowNewColumnForm(false);
											setNewColumnName("");
										}}
										className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer"
									>
										Annuler
									</button>
									<button
										onClick={addColumn}
										className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer font-semibold"
									>
										Créer
									</button>
								</div>
							</div>
						</div>
					)}

					{(newCardColumnId || cardToEdit) && (
						<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
							<div className="bg-white rounded-lg p-6 shadow-xl w-120 max-w-full mx-4">
								<h2 className="text-lg font-bold text-gray-900 mb-4">
									{cardToEdit ? "Modifier la tâche" : "Créer une nouvelle tâche"}
								</h2>
								<input
									type="text"
									placeholder="Titre de la tâche *"
									value={cardForm.title}
									onChange={e => setCardForm(prev => ({ ...prev, title: e.target.value }))}
									onKeyPress={e => e.key === "Enter" && saveCard()}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
									autoFocus
								/>
								<textarea
									placeholder="Description (optionnelle)"
									value={cardForm.description}
									onChange={e => setCardForm(prev => ({ ...prev, description: e.target.value }))}
									rows={3}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4 resize-none"
								/>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
									<div>
										<label className="text-xs font-semibold text-gray-600 mb-1 block">Date limite (optionnelle)</label>
										<input
											type="date"
											value={cardForm.dueDate}
											onChange={e => setCardForm(prev => ({ ...prev, dueDate: e.target.value }))}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										/>
									</div>
									<div>
										<label className="text-xs font-semibold text-gray-600 mb-1 block">Priorité (optionnelle)</label>
										<select
											value={cardForm.priority}
											onChange={e => setCardForm(prev => ({ ...prev, priority: e.target.value as CardFormData["priority"] }))}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
										>
											<option value="">Aucune</option>
											<option value="low">Faible</option>
											<option value="medium">Moyenne</option>
											<option value="high">Élevée</option>
										</select>
									</div>
								</div>
								<div className="flex gap-3 justify-end">
									<button
										onClick={() => {
											closeCardModal();
										}}
										className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors cursor-pointer"
									>
										Annuler
									</button>
									<button
										onClick={saveCard}
										className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer font-semibold"
									>
										{cardToEdit ? "Enregistrer" : "Créer"}
									</button>
								</div>
							</div>
						</div>
					)}

					<DragOverlay>
						{activeCard ? (
							<div className="shadow-lg">
								<CardBody card={activeCard} />
							</div>
						) : null}
					</DragOverlay>
				</DndContext>
			</div>
		</div>
	);
}