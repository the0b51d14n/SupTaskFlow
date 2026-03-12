type Props = { title: string };
export default function BoardCard({ title }: Props) {
  return (
    <div className="p-2.5 my-1 bg-gray-100 rounded">
      {title}
    </div>
  );
}