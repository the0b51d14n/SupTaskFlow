import { useState } from "react";
import { Link } from "react-router-dom";
import { mockAuth } from "../../api/mockApi";

export default function RegisterPage() {
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
		} else setError(res.message || "Erreur inconnue");
	};

	return (
		<div className="bg-white rounded-lg shadow-lg p-8">
			<h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Inscription</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					type="email"
					placeholder="Email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					required
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
				/>
				<input
					type="password"
					placeholder="Mot de passe"
					value={password}
					onChange={e => setPassword(e.target.value)}
					required
					className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
				/>
				<button
					type="submit"
					disabled={loading}
					className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg transition-colors"
				>
					{loading ? "Inscription..." : "S'inscrire"}
				</button>
				{error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
				{success && <p className="text-green-500 text-sm text-center font-medium">{success}</p>}
			</form>
			<p className="text-center text-gray-600 text-sm mt-6">
				Déjà un compte ?{" "}
				<Link to="/auth/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
					Connectez-vous
				</Link>
			</p>
		</div>
	);
}
