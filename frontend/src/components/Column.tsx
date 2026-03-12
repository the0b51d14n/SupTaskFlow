import BoardCard from "./BoardCard";

type Card = { id: number; title: string };
type Props = { title: string; cards: Card[] };

export default function Column({ title, cards }: Props) {
  return (
    <div className="min-w-[200px] bg-white p-2.5 rounded-lg">
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      {cards.map(card => <BoardCard key={card.id} title={card.title} />)}
    </div>
  );
}