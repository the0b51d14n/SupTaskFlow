import { useState } from "react";
import Login from "./auth/Login";
import BoardsList from "./pages/BoardsList";

export default function App() {
    const [user, setUser] = useState<string | null>(null);

    return (
        <>
            {user ? (
                <BoardsList />
            ) : (
                <Login onLogin={(email) => setUser(email)} />
            )}
        </>
    );
}