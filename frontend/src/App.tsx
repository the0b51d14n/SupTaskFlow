import { useState } from "react";

import Login from "./auth/Login";
import BoardsList from "./pages/BoardsList";

import ThemeToggle from "./components/ThemeToggle"; // ← AJOUT

export default function App() {

  const [user, setUser] = useState<string | null>(null);

  return (

    <>
      {/* Toggle visible sur tout le site */}
      <ThemeToggle />

      {user ? (

        <BoardsList />

      ) : (

        <Login
          onLogin={(email) => setUser(email)}
        />

      )}

    </>

  );

}
