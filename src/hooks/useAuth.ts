"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, selectIsAuthenticated } from "@/stores";
import { authService } from "@/services";
import type { LoginFormData, RegisterFormData, User } from "@/types";

export function useAuth() {
  const router = useRouter();
  const { user, isLoading, isInitialized, setUser, setLoading, setInitialized } = useAuthStore();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  // 초기화 및 세션 구독
  useEffect(() => {
    if (isInitialized) return;

    // 초기 사용자 정보 로드
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setUser(null);
      } finally {
        setInitialized(true);
      }
    };

    initAuth();

    // 세션 변경 구독
    const subscription = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isInitialized, setUser, setInitialized]);

  // 이메일 로그인
  const signIn = useCallback(
    async (data: LoginFormData) => {
      setLoading(true);
      try {
        const user = await authService.signIn(data);
        setUser(user);
        return { success: true, user };
      } catch (error) {
        console.error("Sign in error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "로그인에 실패했습니다.",
        };
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading]
  );

  // 회원가입
  const signUp = useCallback(
    async (data: RegisterFormData) => {
      setLoading(true);
      try {
        const user = await authService.signUp(data);
        return {
          success: true,
          user,
          message: "회원가입이 완료되었습니다. 이메일을 확인해주세요.",
        };
      } catch (error) {
        console.error("Sign up error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "회원가입에 실패했습니다.",
        };
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  // 카카오 로그인
  const signInWithKakao = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signInWithKakao();
      return { success: true };
    } catch (error) {
      console.error("Kakao sign in error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "카카오 로그인에 실패했습니다.",
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // 구글 로그인
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      return { success: true };
    } catch (error) {
      console.error("Google sign in error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "구글 로그인에 실패했습니다.",
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // 로그아웃
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      router.push("/");
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "로그아웃에 실패했습니다.",
      };
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, router]);

  // 비밀번호 재설정 이메일 발송
  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    try {
      await authService.resetPassword(email);
      return {
        success: true,
        message: "비밀번호 재설정 이메일을 발송했습니다.",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "이메일 발송에 실패했습니다.",
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // 프로필 업데이트
  const updateProfile = useCallback(
    async (data: Partial<Pick<User, "name" | "phone" | "avatar_url">>) => {
      try {
        const updatedUser = await authService.updateProfile(data);
        if (updatedUser) {
          setUser(updatedUser);
        }
        return { success: true, user: updatedUser };
      } catch (error) {
        console.error("Update profile error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "프로필 업데이트에 실패했습니다.",
        };
      }
    },
    [setUser]
  );

  // 프로필 이미지 업로드
  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) return { success: false, error: "로그인이 필요합니다." };
      try {
        const updatedUser = await authService.uploadAvatar(user.id, file);
        if (updatedUser) {
          setUser(updatedUser);
        }
        return { success: true, user: updatedUser };
      } catch (error) {
        console.error("Upload avatar error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "이미지 업로드에 실패했습니다.",
        };
      }
    },
    [user, setUser]
  );

  return {
    user,
    isLoading,
    isAuthenticated,
    isInitialized,
    signIn,
    signUp,
    signInWithKakao,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    uploadAvatar,
  };
}
