import ConcaveShape from "@/components/shapes/concave";
import { AuthLeftPanel } from "@/pages/auth/components/left-panel";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen w-full flex bg-white">
      <div className="flex-1 hidden md:flex">
        <AuthLeftPanel />
      </div>

      <div className="relative w-full md:flex-2 flex items-center justify-center">
        <Outlet />

        <div className="absolute bottom-0 w-full">
          <ConcaveShape />
        </div>
      </div>
    </div>
  );
}
