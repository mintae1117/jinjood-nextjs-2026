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
export const selectIsAdmin = (state: AuthStore) => state.user?.role === "admin";

// 하이드레이션 가드용. user는 sessionStorage에 persist되어 클라이언트 첫 렌더에 이미 들어 있지만
// 서버에는 없다. isInitialized는 partialize에서 빠져 서버·클라이언트 첫 렌더 모두 false이므로,
// user에 의존해 화면이 갈리는 곳은 이 값으로 함께 막아야 불일치가 생기지 않는다.
export const selectIsAuthReady = (state: AuthStore) => state.isInitialized;
