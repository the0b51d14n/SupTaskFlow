import { createBrowserRouter, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DefaultLayout from "../layouts/DefaultLayout";

import BoardsPage from "../pages/BoardsPage";
import BoardPage from "../pages/BoardPage";

import LoginPage from "../pages/auth/Login";
import RegisterPage from "../pages/auth/Register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "boards",
        element: <BoardsPage />,
      },
      {
        path: "board/:id",
        element: <BoardPage />,
      },
    ]
  },
  {
    index: true,
    element: <Navigate to="/boards" replace />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/boards" replace />,
  }
]);

export default router;