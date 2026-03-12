import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DefaultLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-indigo-700 text-white shadow-md shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <Link
            to="/boards"
            className="text-xl font-bold tracking-tight hover:text-indigo-200 transition-colors whitespace-nowrap"
          >
            SupTaskFlow
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            {user && (
              <span className="text-sm text-indigo-200 truncate hidden sm:block">
                {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}