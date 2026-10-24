import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { queryClient } from "@/lib/query-client";

interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string | null;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_founder?: boolean;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  sessionId: string | null;
  bioPromptDismissed: boolean;
  login: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  dismissBioPrompt: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      sessionId: null,
      bioPromptDismissed: false,

      login: (token, user) => {
        queryClient.clear();
        set({
          token,
          user,
          isAuthenticated: true,
          sessionId: crypto.randomUUID(),
          bioPromptDismissed: false,
        });
      },

      updateUser: (user) => {
        if (get().user?.id === user.id) set({ user });
      },

      dismissBioPrompt: () => set({ bioPromptDismissed: true }),

      logout: () => {
        queryClient.clear();
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          sessionId: null,
          bioPromptDismissed: false,
        });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
