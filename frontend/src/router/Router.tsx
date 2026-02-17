import { createBrowserRouter, Navigate } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DefaultLayout from "../layouts/DefaultLayout";

import LoginPage from "../pages/auth/Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "boards",
        element: <div>Boards List</div>,
      },
      {
        path: "board/:id",
        element: <div>Board Detail</div>,
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
        element: <div>Register Page</div>,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/boards" replace />,
  }
]);

export default router;