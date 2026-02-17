import { useState } from "react";
import { mockAuth } from "../../api/mockApi";

type Props = { onRegister: () => void };

export default function Register({ onRegister }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        const res = await mockAuth.register(email, password);
        setLoading(false);
        if (res.success) {
            setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
            setEmail("");
            setPassword("");
            setTimeout(onRegister, 2000);
        } else setError(res.message || "Erreur inconnue");
    };

    return (
        <div className="auth-form">
            <h1>Inscription</h1>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" disabled={loading}>{loading ? "Inscription..." : "S'inscrire"}</button>
                {error && <p className="auth-error">{error}</p>}
                {success && <p className="auth-success">{success}</p>}
            </form>
            <p className="auth-message">
                Déjà un compte ? <span className="auth-link" onClick={onRegister}>Connectez-vous</span>
            </p>
        </div>
    );
}
