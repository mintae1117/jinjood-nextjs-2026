import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";

interface AuthStore {
  // 상태
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;

  // 액션
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isLoading: true,
  isInitialized: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) => set({ user, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      setInitialized: (isInitialized) => set({ isInitialized, isLoading: false }),

      reset: () => set(initialState),
    }),
    {
      name: "jinjood-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // 세션 스토리지에 저장할 상태
        user: state.user,
      }),
    }
  )
);

// 파생 상태 셀렉터
export const selectIsAuthenticated = (state: AuthStore) => !!state.user;
export const selectUserName = (state: AuthStore) => state.user?.name || state.user?.email || "";
