import { Outlet, useNavigate } from "react-router-dom";

export default function DefaultLayout() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">SupTaskFlow</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/auth/login")}
              className="cursor-pointer px-4 py-2 text-sm text-red-600 hover:bg-red-100 bg-red-50 border shadow border-red-300 rounded-lg transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-0 m-0">
        <Outlet />
      </main>
    </div>
  );
}