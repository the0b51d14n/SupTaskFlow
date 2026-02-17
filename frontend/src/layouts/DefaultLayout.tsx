import { Outlet } from "react-router";

export default function DefaultLayout() {
  return (
    <div>
      <h1>Default Layout</h1>
      <Outlet />
    </div>
  );
}