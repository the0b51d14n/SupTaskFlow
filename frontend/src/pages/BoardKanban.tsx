type Card = { id: string; title: string };
type Column = { id: string; name: string; cards: Card[] };
type Board = { id: string; name: string; columns: Column[] };

export default function BoardKanban({ board, goBack }: { board: Board; goBack: () => void }) {
    return (
        <div style={{ padding: 20 }}>
            <button onClick={goBack} style={{ marginBottom: 15 }}>← Retour aux boards</button>
            <h1>{board.name}</h1>
            <div className="kanban-board">
                {board.columns.map(col => (
                    <div className="column" key={col.id}>
                        <h3>{col.name}</h3>
                        {col.cards.map(card => (
                            <div className="card" key={card.id}>{card.title}</div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}