import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DefaultLayout from '../layouts/DefaultLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import BoardsPage from '../pages/BoardsPage';
import BoardPage from '../pages/BoardPage';
import LoginPage from '../pages/auth/Login';
import RegisterPage from '../pages/auth/Register';

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DefaultLayout />,
        children: [
          { path: '/boards', element: <BoardsPage /> },
          { path: '/board/:id', element: <BoardPage /> },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  { path: '/', element: <Navigate to="/boards" replace /> },
  { path: '*', element: <Navigate to="/boards" replace /> },
]);

export default router;
