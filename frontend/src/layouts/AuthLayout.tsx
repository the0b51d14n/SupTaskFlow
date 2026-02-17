import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="h-dvh bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}