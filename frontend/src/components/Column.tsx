import BoardCard from "./BoardCard";

type Card = { id: number; title: string };
type Props = { title: string; cards: Card[] };

export default function Column({ title, cards }: Props) {
    return (
        <div style={{ minWidth: 200, background: "#fff", padding: 10, borderRadius: 8 }}>
            <h3>{title}</h3>
            {cards.map(card => <BoardCard key={card.id} title={card.title} />)}
        </div>
    );
}