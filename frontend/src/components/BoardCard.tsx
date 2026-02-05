type Props = { title: string };
export default function BoardCard({ title }: Props) {
    return (
        <div style={{ padding: 10, margin: "5px 0", background: "#eee", borderRadius: 4 }}>
            {title}
        </div>
    );
}