import ConcaveShape from "@/components/shapes/concave";
import { AuthLeftPanel } from "@/pages/auth/components/left-panel";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import logo from "@/assets/images/logo.png";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100">
      <div className="flex-1 hidden md:flex">
        <AuthLeftPanel />
      </div>

      <div className="relative w-full md:flex-2 flex flex-col sm:flex-row items-center justify-center bg-white dark:bg-slate-900">
        <img
          src={logo}
          alt="logo"
          className="w-auto sm:hidden h-14 object-contain"
        />
        <Outlet />
        <div className="absolute bottom-0 w-full">
          <ConcaveShape />
        </div>
      </div>
    </div>
  );
}
