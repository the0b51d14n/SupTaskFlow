type Props = { children: React.ReactNode; onClick?: () => void };
export default function Button({ children, onClick }: Props) {
    return (
        <button onClick={onClick} style={{ padding: 10, cursor: "pointer", margin: 5 }}>
            {children}
        </button>
    );
}