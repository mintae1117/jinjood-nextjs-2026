import { createBrowserClient } from "@/lib/supabase";
import type { LoginFormData, RegisterFormData, User } from "@/types";

// Supabase Auth 사용자를 앱 User 타입으로 변환
function mapSupabaseUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: (supabaseUser.user_metadata?.name as string) || (supabaseUser.user_metadata?.full_name as string) || "",
    phone: (supabaseUser.user_metadata?.phone as string) || "",
    avatar_url: (supabaseUser.user_metadata?.avatar_url as string) || "",
  };
}

export const authService = {
  // 이메일/비밀번호 회원가입
  async signUp(data: RegisterFormData) {
    const supabase = createBrowserClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone || "",
        },
      },
    });

    if (error) throw error;

    return authData.user ? mapSupabaseUser(authData.user) : null;
  },

  // 이메일/비밀번호 로그인
  async signIn(data: LoginFormData) {
    const supabase = createBrowserClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    return authData.user ? mapSupabaseUser(authData.user) : null;
  },

  // 카카오 OAuth 로그인
  async signInWithKakao() {
    const supabase = createBrowserClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    return data;
  },

  // 로그아웃
  async signOut() {
    const supabase = createBrowserClient();

    const { error } = await supabase.auth.signOut();

    if (error) throw error;
  },

  // 현재 사용자 정보 가져오기
  async getCurrentUser(): Promise<User | null> {
    const supabase = createBrowserClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    return mapSupabaseUser(user);
  },

  // 세션 가져오기
  async getSession() {
    const supabase = createBrowserClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;

    return session;
  },

  // 비밀번호 재설정 이메일 발송
  async resetPassword(email: string) {
    const supabase = createBrowserClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  },

  // 비밀번호 업데이트
  async updatePassword(newPassword: string) {
    const supabase = createBrowserClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  // 사용자 프로필 업데이트
  async updateProfile(data: Partial<Pick<User, "name" | "phone" | "avatar_url">>) {
    const supabase = createBrowserClient();

    const { data: { user }, error } = await supabase.auth.updateUser({
      data: data,
    });

    if (error) throw error;

    return user ? mapSupabaseUser(user) : null;
  },

  // Auth 상태 변경 구독
  onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = createBrowserClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          callback(mapSupabaseUser(session.user));
        } else {
          callback(null);
        }
      }
    );

    return subscription;
  },
};
