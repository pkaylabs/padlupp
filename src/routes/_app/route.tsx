import {
  Outlet,
  createFileRoute,
  redirect,
  useMatchRoute,
  useLocation,
} from "@tanstack/react-router";
import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import classNames from "@/utils/classnames";
import logo from "@/assets/images/logo.png";
import { MESSAGES, SETTINGS } from "@/constants/page-path";
import { TopNav } from "./-components/top-nav";
import { useAuthStore } from "@/features/auth/authStore";
import { useAppPresence } from "@/hooks/useAppPresence";
import "./-components/community-shell.css";
import { AppNavigation } from "./-components/app-navigation";
import { BioPrompt } from "./-components/bio-prompt";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({
        to: "/signin",
        search: { redirect: location.href },
      });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  useAppPresence();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const matchRoute = useMatchRoute();
  const pathname = useLocation({ select: (location) => location.pathname });
  const isCommunityLayout = pathname.startsWith("/community") || /^\/pods\/.+/.test(pathname);
  const usesFullWidthLayout = Boolean(
    matchRoute({ to: MESSAGES }) || matchRoute({ to: SETTINGS }) || isCommunityLayout,
  );
  return (
    <>
      <BioPrompt />
      <div className={classNames("app-shell bg-bg-gray dark:bg-bg-gray dark:text-gray-100", isCommunityLayout ? "community-shell" : "")}>
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} aria-label="Navigation menu" className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-black/50 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />
          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                  </button>
                </div>
              </TransitionChild>
              <div className="font-monts flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-900 px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <img alt="logo" src={logo} className="h-8 w-auto" />
                </div>
                <AppNavigation onNavigate={() => setSidebarOpen(false)} />
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        <div className="app-sidebar font-monts hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-900 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center mt-4 rounded-md">
              <img alt="Your Company" src={logo} className="h-auto w-28 object-contain" />
            </div>
            <AppNavigation />
          </div>
        </div>

        <div className="app-workspace lg:pl-64 flex flex-col min-h-screen">
          <div className="app-topbar sticky top-0 z-40 border-b border-gray-200 dark:border-slate-800 flex h-16 shrink-0 items-center gap-x-2 bg-white dark:bg-slate-900 sm:gap-x-6">
            <button type="button" onClick={() => setSidebarOpen(true)} className="p-2 lg:hidden">
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
            <TopNav />
          </div>
          <main className="flex-1 h-full bg-bg-gray dark:bg-slate-950">
            <div className={`h-full ${usesFullWidthLayout ? "p-0" : "p-4 sm:p-6"}`}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
