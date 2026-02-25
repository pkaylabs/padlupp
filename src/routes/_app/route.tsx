import { navigation } from "@/constants";
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useMatchRoute,
} from "@tanstack/react-router";
import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import {
  Bars3Icon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import classNames from "@/utils/classnames";
import logo from "@/assets/images/logo.png";
import { MESSAGES, SETTINGS } from "@/constants/page-path";
import { TopNav } from "./-components/top-nav";
import { useAuthStore } from "@/features/auth/authStore";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({
        to: "/signin",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const matchRoute = useMatchRoute();
  return (
    <>
      <div className="bg-bg-gray dark:bg-bg-gray dark:text-gray-100">
        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className="relative z-50 lg:hidden"
        >
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
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="-m-2.5 p-2.5"
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </button>
                </div>
              </TransitionChild>
              {/* Sidebar component */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-900 px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <img alt="logo" src={logo} className="h-8 w-auto" />
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item, index) => (
                          <li key={index}>
                            <Link
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {({ isActive }) => {
                                return (
                                  <div
                                    className={classNames(
                                      isActive
                                        ? "bg-primary-500 text-white font-semibold"
                                        : "text-dark-blue-normal dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-slate-800 hover:text-dark-blue-normal dark:hover:text-slate-100 font-medium",
                                      "group mx-2 flex items-center gap-x-3 rounded-sm px-3 py-2 text-sm leading-6 capitalize transition-all duration-150 ease-in-out",
                                    )}
                                  >
                                    <item.icon
                                      aria-hidden="true"
                                      className={classNames(
                                        isActive
                                          ? "text-white"
                                          : "text-dark-blue-normal",
                                        "h-5 w-5 shrink-0 dark:text-slate-200",
                                      )}
                                    />
                                    {item.name}
                                  </div>
                                );
                              }}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>

                    <li className="mt-auto">
                      <Link to={SETTINGS} onClick={() => setSidebarOpen(false)}>
                        {({ isActive }) => {
                          return (
                            <div
                              className={classNames(
                                isActive
                                  ? "bg-primary-500 text-white font-semibold"
                                  : "text-dark-blue-normal dark:text-slate-300 hover:bg-primary-200 dark:hover:bg-slate-800 hover:text-dark-blue-normal dark:hover:text-slate-100 font-medium",
                                "group mx-2 flex items-center gap-x-3 rounded-md px-3 py-3 text-sm leading-6 capitalize transition-all duration-150 ease-in-out",
                              )}
                            >
                              <Cog6ToothIcon
                                aria-hidden="true"
                                className={classNames(
                                  isActive
                                    ? "text-white"
                                    : "text-dark-blue-normal",
                                  "h-5 w-5 shrink-0 dark:text-slate-200",
                                )}
                              />
                              Settings
                            </div>
                          );
                        }}
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="font-monts hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
          {/* Sidebar component*/}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-slate-900 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center mt-4 rounded-md">
              <img
                alt="Your Company"
                src={logo}
                className="h-auto w-28 object-contain"
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item, index) => (
                      <li key={index}>
                        <Link to={item.href}>
                          {({ isActive }) => {
                            return (
                              <div
                                className={classNames(
                                  isActive
                                    ? "bg-primary-500 text-white font-semibold"
                                    : "text-dark-blue-normal dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-slate-800 hover:text-dark-blue-normal dark:hover:text-slate-100 font-medium",
                                  "group mx-2 flex items-center gap-x-3 rounded-sm px-3 py-2 text-sm leading-6 capitalize transition-all duration-150 ease-in-out",
                                )}
                              >
                                <item.icon
                                  aria-hidden="true"
                                  className={classNames(
                                    isActive
                                      ? "text-white"
                                      : "text-dark-blue-normal",
                                    "h-5 w-5 shrink-0 dark:text-slate-200",
                                  )}
                                />
                                {item.name}
                              </div>
                            );
                          }}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className=" mt-auto">
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    <Link to={SETTINGS}>
                      {({ isActive }) => {
                        return (
                          <div
                            className={classNames(
                              isActive
                                ? "bg-primary-500 text-white font-semibold"
                                : "text-dark-blue-normal dark:text-slate-300 hover:bg-primary-200 dark:hover:bg-slate-800 hover:text-dark-blue-normal dark:hover:text-slate-100 font-medium",
                              "group mx-2 flex items-center gap-x-3 rounded-md px-3 py-3 text-sm leading-6 capitalize transition-all duration-150 ease-in-out",
                            )}
                          >
                            <Cog6ToothIcon
                              aria-hidden="true"
                              className={classNames(
                                isActive
                                  ? "text-white"
                                  : "text-dark-blue-normal",
                                "h-5 w-5 shrink-0 dark:text-slate-200",
                              )}
                            />
                            Settings
                          </div>
                        );
                      }}
                    </Link>
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-64 flex flex-col min-h-screen">
          <div className="sticky top-0 z-40 border-b border-gray-200 dark:border-slate-800 flex h-16 shrink-0 items-center gap-x-4 bg-white dark:bg-slate-900 sm:gap-x-6 ">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className=" p-2 text-dark-blue-normal lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>

            <TopNav />
          </div>

          <main className="flex-1 h-full bg-bg-gray dark:bg-slate-950">
            <div
              className={`h-full ${matchRoute({ to: MESSAGES }) || (matchRoute({ to: SETTINGS }) ? "p-0" : "p-4 sm:p-6")} `}
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
